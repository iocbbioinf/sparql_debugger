import axios from "axios";
import {PENDING_STATE, SUCCESS_STATE, FAILURE_STATE, baseUrl, HTML_SUFFIX, XML_SUFFIX, JSON_SUFFIX, TEXT_SUFFIX, BULK_MAX_TYPE_SIZE, ETC_STATE} from "./constants"
import { v4 as uuidv4 } from "uuid";

export const subscribeToUpdates = (params, tabKey, updateDebugTab, setDebugTab, processResponse, requestConfig) => {


  let eventSource = null;
  let queryId = null;
  
  const encodedParams = Object.keys(params)
    .map((key) => {
      return `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`;
    })
    .join("&");

    
  const fullUrl = `${baseUrl}/query?${encodedParams}`;

  axios.post(fullUrl, null, {
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
//        'Accept': 'application/sparql-results+xml,*/*;q=0.9'
//        'test1': 'value1'
    },
    withCredentials: true
  }).then((response) => {

    queryId = response.data;  

    const sseUrl = `${baseUrl}/query/${queryId}/sse`;
    eventSource = new EventSource(sseUrl, { withCredentials: true });
  
    eventSource.onmessage = function (event) {

      console.log("New event from server:", event.data);
  
      const eventData = JSON.parse(event.data);
      queryId = eventData.queryId;
  
      const handleUpdateDebugTab = (newQueryData) => {

        refreshTree(eventData, newQueryData)
  
        if(newQueryData.treeData.root.data.state !== PENDING_STATE) {
  
          newQueryData["queryDebugIsRunning"] = false;
        }  

        newQueryData.renderData = [refreshRenderTree(addBulkNodes(newQueryData.treeData))]    
        newQueryData.eventSource = eventSource
        newQueryData.queryId = queryId
        
        setDebugTab(newQueryData);
  
        if(eventData.nodeId === newQueryData.treeData.root.data.nodeId && eventData.queryId === newQueryData.treeData.root.data.queryId && 
          (eventData.state === SUCCESS_STATE || eventData.state === FAILURE_STATE)) {
  
          const response = {
            tabKey: newQueryData.tabKey,
            contentType: newQueryData.treeData.root.data.contentType[0],
            status: newQueryData.treeData.root.data.httpStatus,
            executionTime: newQueryData.treeData.root.data.endTime - newQueryData.treeData.root.data.startTime
          }
          
          const fullUrl = `${baseUrl}/query/${newQueryData.treeData.root.data.queryId}/call/${newQueryData.treeData.root.data.nodeId}/response`;
  
          fetch(fullUrl, {
            headers: {
              'Accept-Encoding': 'gzip,deflate'
            },
            'credentials': 'include'
          }).then(fetchResp => {
            response.data = fetchResp.text()
            .then(text => {
              response.data=text;
              processResponse(response)
            })
          })
        }  
      }

      updateDebugTab(tabKey, handleUpdateDebugTab);
    }
  
    eventSource.onerror = function (err) {
      console.error("EventSource failed:", err);
      eventSource.close();
    };  
  })
};

export const unsubscribe = (eventSource) => {
  if (eventSource) {
    eventSource.close();
    eventSource = null;
  }
};


export const durationToString = (durationInMillis) => {
  if (durationInMillis) {
    const seconds = Math.floor((durationInMillis / 1000) % 60);
    const minutes = Math.floor((durationInMillis / (1000 * 60)) % 60);
    const hours = Math.floor(durationInMillis / (1000 * 60 * 60));

    let formattedDuration = '';

    if(seconds > 0 || minutes > 0 || hours > 0) {
      formattedDuration = `${seconds}s`;
    } else {
      formattedDuration = `${durationInMillis}ms`;
    }    


    if (minutes > 0 || hours > 0) {
      formattedDuration = `${minutes}m ` + formattedDuration;
    }
    if (hours > 0) {
      formattedDuration = `${hours}h ` + formattedDuration;
    }        

    return formattedDuration;
  }

  return "";
};

function refreshTree(newNode, queryData) {
  var updated = false;

  function refreshTreeRek(node) {
    if (node.data.nodeId === newNode.nodeId) {
      updated = true;
      return { ...node, data: newNode };
    }

    var result;
    if (node.children) {
      result = {
        data: { ...node.data },
        children: node.children.map((child) => refreshTreeRek(child)),
      };
    }

    if (updated === false && node.data.nodeId === newNode.parentNodeId) {
      queryData.expandedItems = [...queryData.expandedItems, newNode.nodeId.toString()];
      result = {
        data: { ...node.data },
        children: [...(node.children ? node.children : []), { data: newNode }],
      };
    }

    result = result || node;

    return result;
  }

  if (queryData.treeData.root) {
    queryData.treeData = { root: refreshTreeRek(queryData.treeData.root) };
  } else {
    queryData.expandedItems = [...queryData.expandedItems, newNode.nodeId.toString()]
    queryData.treeData = { root: { data: newNode } };
  }
}

var groupBy = function(xs, key) {
  return xs.reduce(function(rv, x) {

    (rv[(x["data"])[key]] = rv[(x["data"])[key]] || []).push(x);
    return rv;
  }, {});
};


function addBulkNodes(treeData) {
  if (!treeData || !Object.keys(treeData).length ) return [];

  if (treeData.root) {
    return { root: addBulkNodes(treeData.root) };
  }

  if(treeData.children) {
    const childGroup = groupBy(treeData.children, "serviceCallId");

    const childMultiGroup = Object.values(childGroup).filter(x => x.length > 1);

    const bulkChildrenNodes = Object.values(childMultiGroup).map(x => {

      var errChildren = x.filter(node => node.data.state === FAILURE_STATE)

      var isCut = false
      if(errChildren.length > BULK_MAX_TYPE_SIZE) {
        isCut = true
        errChildren = errChildren.slice(0,BULK_MAX_TYPE_SIZE)
      }
      
      var okChildren = x.filter(node => node.data.state === SUCCESS_STATE)
      if(okChildren.length > BULK_MAX_TYPE_SIZE) {
        isCut = true
        okChildren = okChildren.slice(0,BULK_MAX_TYPE_SIZE)
      }

      var pendingChildren = x.filter(node => node.data.state === PENDING_STATE)
      if(pendingChildren.length > BULK_MAX_TYPE_SIZE) {
        isCut = true
        pendingChildren = pendingChildren.slice(0,BULK_MAX_TYPE_SIZE)
      }

      var filteredChildren = x
      if(isCut) {
        filteredChildren = errChildren.sort((a, b) => a.data.startTime - b.data.startTime)
          .concat(okChildren.sort((a, b) => a.data.startTime - b.data.startTime))
          .concat(pendingChildren.sort((a, b) => a.data.startTime - b.data.startTime))
        filteredChildren.push({data: {nodeId: "etc_" + x[0].data.nodeId, state: ETC_STATE}})
      }

      var bulkState;
      if(treeData.data.state !== PENDING_STATE) {
        if(x.every((child) => child.data.state === SUCCESS_STATE)) {
          bulkState = SUCCESS_STATE;
        } else {
          bulkState = FAILURE_STATE;
        }
      } else {
        bulkState = PENDING_STATE
      }

      const duration = Math.max(...x.map(child => child.data.endTime).filter(time => time != null)) - Math.min(...x.map(child => child.data.startTime).filter(time => time != null));
            
      return {
        data: {nodeId: "bulk_" + x[0].data.nodeId, isBulk: true, bulkSize: x.length, endpoint: x[0].data.endpoint, state: bulkState, duration: duration}, 
        children: filteredChildren.map((child) => addBulkNodes(child))
      }
  })  
  
    const childSingleGroup = Object.values(childGroup).filter(x => x.length === 1).flat();
    const singleChildrenNodes = Object.values(childSingleGroup).map((child) => addBulkNodes(child));
  
    const result = { 
      data: { ...treeData.data },
      children: bulkChildrenNodes.concat(singleChildrenNodes)
    }  
    return result;

  } else {
    return treeData;
  }

}

function refreshRenderTree(bulkTreeData) {
  if (!bulkTreeData || !Object.keys(bulkTreeData).length ) return [];

  if (bulkTreeData.root) {
    return refreshRenderTree(bulkTreeData.root)
  }

  const result = {
    id: bulkTreeData.data.nodeId.toString(),
    label: JSON.stringify(bulkTreeData.data),
    children: bulkTreeData.children ? bulkTreeData.children.map((child) => refreshRenderTree(child)) : []
  }

  return result;
}

export const deleteQuery = (queryId) => {
  if(queryId) {
    const fullUrl = `${baseUrl}/query/${queryId}/delete`;  

    axios.post(fullUrl, null, {
       withCredentials: true
    })

  }
}
