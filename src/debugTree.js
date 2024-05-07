import * as React from 'react';
import axios from 'axios';
import { styled, useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';

import { TreeView } from '@mui/x-tree-view/TreeView';
import { TreeItem, treeItemClasses } from '@mui/x-tree-view/TreeItem';

import loading from 'react-useanimations/lib/loading';

import DoneRoundedIcon from '@mui/icons-material/DoneRounded';
import ErrorIcon from '@mui/icons-material/Error';
import InputIcon from '@mui/icons-material/Input';
import OutputIcon from '@mui/icons-material/Output';
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip';
import Link from '@mui/material/Link';
import Modal from '@mui/material/Modal';
import JSONPretty from 'react-json-pretty';
import CircularProgress from '@mui/material/CircularProgress';

import Button from '@mui/material/Button';

import { yasgui } from './sparql/Yasgui.js'


const PENDING_STATE = "IN_PROGRESS"
const SUCCESS_STATE = "SUCCESS"
const FAILURE_STATE = "ERROR"

const StyledDoneRoundedIcon = styled(DoneRoundedIcon)({
  backgroundColor: '#007800',
  color: '#ffffff',
  borderRadius: '50%'   
});

const StyledErrorIcon = styled(ErrorIcon)({
  color: '#aa0000'  
});


const StyledLoadingIcon = styled(loading)({
  color: "blue"
})

function AnimLoadingComponent() {
  return <CircularProgress style={{ width: '20px', height: '20px'}} />;
} 


const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 'auto',
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
  overflow: 'auto',  
  maxHeight: '90vh', 
  maxWidth: '90vw' 
};


const StyledTreeItemRoot = styled(TreeItem)(({ theme }) => ({
  color: theme.palette.text.secondary,
  [`& .${treeItemClasses.content}`]: {
    color: theme.palette.text.secondary,
    borderTopRightRadius: theme.spacing(2),
    borderBottomRightRadius: theme.spacing(2),
    paddingRight: theme.spacing(1),
    fontWeight: theme.typography.fontWeightMedium,
    '&.Mui-expanded': {
      fontWeight: theme.typography.fontWeightRegular,
    },
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
    },
    '&.Mui-focused, &.Mui-selected, &.Mui-selected.Mui-focused': {
      backgroundColor: `var(--tree-view-bg-color, ${theme.palette.action.selected})`,
      color: 'var(--tree-view-color)',
    },
    [`& .${treeItemClasses.label}`]: {
      fontWeight: 'inherit',
      color: 'inherit',
    },
  },
  [`& .${treeItemClasses.group}`]: {
    marginLeft: 0,
    [`& .${treeItemClasses.content}`]: {
      paddingLeft: theme.spacing(2),
    },
  },
}));

const ReqRespIconButon = ({ queryId, callId, isRequest }) => {

  const [open, setOpen] = React.useState(false);
  const [fileContent, setFileContent] = React.useState('');

  const baseUrl = "http://idsm-debugger-test6.dyn.cloud.e-infra.cz"


  const handleOpen = async () => {
    try {
        let reqResp = isRequest ? "request" : "response"
        let fullUrl = `${baseUrl}/query/${queryId}/call/${callId}/${reqResp}`
        const response = await axios.get(fullUrl);
        setFileContent(response.data);
        setOpen(true);
    } catch (error) {
        console.error('Error fetching file content:', error);
        setFileContent('File not found or could not be loaded.');
        setOpen(true);
    }
  };

  const handleClose = () => {
      setOpen(false);
  };

  const iconTitle = (isRequest === true) ? "request" : "response"
  const icon = (isRequest === true) ? <InputIcon/> : <OutputIcon/>
  
  const jsonPrettyStyle = {
    width: '100%',    // Ensures JSONPretty takes full width of modal
    overflowX: 'auto' // Horizontal scrollbar for JSON content if it's too wide
  };

  return(
    <div>      
      <Tooltip title={iconTitle}>
        <IconButton onClick={handleOpen} hover={iconTitle} aria-label={iconTitle}>
          {icon}
        </IconButton>
      </Tooltip>    
      <Modal
          open={open}
          onClose={handleClose}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
        <Box sx={modalStyle}>
          <JSONPretty id="json-pretty" data={fileContent} theme={JSONPretty.monikai} style={jsonPrettyStyle}></JSONPretty>
        </Box>
      </Modal>
    </div>
  )
}

function durationToString({ durationInMillis }) {

  if(durationInMillis) {
    const seconds = Math.floor((durationInMillis / 1000) % 60);
    const minutes = Math.floor((durationInMillis / (1000 * 60)) % 60);
    const hours = Math.floor(durationInMillis / (1000 * 60 * 60));
  
    let formattedDuration = `${seconds}s`; 
    if (minutes > 0 || hours > 0) {
      formattedDuration = `${minutes}m ` + formattedDuration; 
    }
    if (hours > 0) {
      formattedDuration = `${hours}h ` + formattedDuration; 
    }
  
    return formattedDuration;  
  } 

  return ""
  
}

const StyledTreeItem = React.forwardRef(function StyledTreeItem(props, ref) {
  const theme = useTheme();
  const {
    bgColor,
    color,
    colorForDarkMode,
    bgColorForDarkMode,
    queryId,
    callId,
    state,
    url,
    duration,
    responseItemCount,
    httpStatus,
    ...other
  } = props;

  const styleProps = {
    '--tree-view-color': theme.palette.mode !== 'dark' ? color : colorForDarkMode,
    '--tree-view-bg-color':
      theme.palette.mode !== 'dark' ? bgColor : bgColorForDarkMode,
  };

  if(state===PENDING_STATE) {
    return(
      <TreeItem
      label={
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            p: 0.5,
            pr: 0,
          }}
        >
          <Box sx={{ paddingRight: '10px' }}>
            <AnimLoadingComponent/>
          </Box>          
          <Typography variant="body2" sx={{ fontWeight: 'inherit', flexGrow: 0.1 }}>
            <Link href={url} target="_blank" rel="noopener noreferrer">
              {url}
            </Link>                          
          </Typography> 
          <Box color="inherit" sx={{ mr: 1 }} >
            <ReqRespIconButon queryId={queryId} callId={callId} isRequest={true}/>
          </Box>
        </Box>
      }
      style={styleProps}
      {...other}
      ref={ref}
    />
    )
  } else if(state === SUCCESS_STATE) {
    return (    
      <TreeItem
        label={
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              p: 0.5,
              pr: 0,
            }}
          >
            <Box sx={{ mr: 1 }}>
              <StyledDoneRoundedIcon style={{ backgroundColor: '#007800', color: '#ffffff', borderRadius: '50%' }} />
            </Box>

            <Tooltip title='HTTP status'>
              <Typography variant="body2" color="inherit" sx={{ fontWeight: 'inherit', flexGrow: 0.1 }}>
                {httpStatus}
              </Typography>
            </Tooltip>


            <Typography variant="body2" sx={{ fontWeight: 'inherit', flexGrow: 0.1 }}>
                <Link href={url} target="_blank" rel="noopener noreferrer">
                {url}
                </Link>                          
            </Typography> 

            <Tooltip title='Duration'>
                <Typography variant="body2" color="inherit" sx={{ fontWeight: 'inherit', flexGrow: 0.1 }}>
                  {duration}
                </Typography>
              </Tooltip>

            {responseItemCount && (
              <Tooltip title='Response Item Count'>
                <Typography variant="body2" color="inherit" sx={{ fontWeight: 'inherit', flexGrow: 0.1 }}>
                  {responseItemCount}
                </Typography>
              </Tooltip>
            )}


            <Box color="inherit" sx={{ mr: 1 }} >
              <ReqRespIconButon queryId={queryId} callId={callId} isRequest={true}/>
            </Box>
            <Box color="inherit" sx={{ mr: 1 }} >
              <ReqRespIconButon queryId={queryId} callId={callId} isRequest={false}/>
            </Box>


          </Box>
        }
        style={styleProps}
        {...other}
        ref={ref}
      />    
    )
  } else if(state === FAILURE_STATE) {
    return (    
      <TreeItem
        label={
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              p: 0.5,
              pr: 0,
            }}
          >
            <Box sx={{ mr: 1 }}>
              <StyledErrorIcon style={{ color: '#aa0000'}}/>
            </Box>

            <Tooltip title='HTTP status'>
              <Typography variant="body2" color="inherit" sx={{ fontWeight: 'inherit', flexGrow: 0.1 }}>
                {httpStatus}
              </Typography>
            </Tooltip>

            <Typography variant="body2" sx={{ fontWeight: 'inherit', flexGrow: 0.1 }}>
              <Link href={url} target="_blank" rel="noopener noreferrer">
                {url}
              </Link>                          
            </Typography> 
            
            <Tooltip title='Duration'>
                <Typography variant="body2" color="inherit" sx={{ fontWeight: 'inherit', flexGrow: 0.1 }}>
                  {duration}
                </Typography>
            </Tooltip>
            
            <Box color="inherit" sx={{ mr: 1 }} >
              <ReqRespIconButon queryId={queryId} callId={callId} isRequest={true}/>
            </Box>
            
            <Box color="inherit" sx={{ mr: 1 }} >
              <ReqRespIconButon queryId={queryId} callId={callId} isRequest={false} isErr={true}/>
            </Box>
          </Box>
        } 
        style={styleProps}
        {...other}
        ref={ref}
      />    
    )
  } else {
    return (<h1> Wrong state argument value</h1>)
  }

});


export default function DebugTreeView({ yasgui }) {

  /*
  const [treeData, setTreeData] = React.useState({
    root: { 
      data: {
        queryId: 1,
        nodeId: 0,
        seqId: 1,
        startTime: 1713974230006,
        httpState: 200,
        state: "SUCCESS",
        parentNodeId: null
      },
      children: [
        { data: {
          queryId: 1,
          nodeId: 1,
          seqId: 1,
          startTime: 1713974230006,
          httpState: 200,
          state: "SUCCESS",
          parentNodeId: 0
        }},
        { data: {
          queryId: 2,
          nodeId: 2,
          seqId: 1,
          startTime: 1713974230006,
          httpState: 400,
          state: "ERROR",
          parentNodeId: 0
        }},
      ]
    }
  })
  */

  const [treeData, setTreeData] = React.useState({});
  const [expandedItems, setExpandedItems] = React.useState([]);
  const [eventSource, setEventSource] = React.useState(null);
  const [debugActive, setDebugActive] = React.useState(false);


  function refreshTree(treeData, newNode) {
    var updated = false

    function refreshTreeRek(node) {
        if (node.data.nodeId === newNode.nodeId) {
            updated = true
            return { ...node, data: newNode};
        }

        var result
        if (node.children) {
            result = {
                data: {...node.data},
                children: node.children.map(child => refreshTreeRek(child))
            };
        }

        if (updated === false && node.data.nodeId === newNode.parentNodeId) {
          setExpandedItems(oldState => [...oldState, newNode.nodeId.toString()]);
          result = {
            data: {...node.data},
            children: [...(node.children ? node.children : []), {data: newNode}]
          }
        }

        result = result || node
        
        return result;
    }

    if(treeData.root) {
      var result = { root: refreshTreeRek(treeData.root) }; 
      return result;
    } else {
      setExpandedItems(oldState => [...oldState, newNode.nodeId.toString()]) 
      return {root: {data: newNode}};
    }

  } 

  function handleExecuteQuery() {
    if(!debugActive) {
      const baseUrl = "http://idsm-debugger-test6.dyn.cloud.e-infra.cz/query"
      const params = {
        endpoint: `${yasgui.current.getCurrentEndpoint()}`,
        query: `${yasgui.current.getCurrentQuery()}`
      }
  
      const encodedParams = Object.keys(params).map(key => {
        return `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`;
      }).join('&');    
  
      const fullUrl = `${baseUrl}?${encodedParams}`;
  
      console.log(fullUrl);
  
      const eventSource = new EventSource(fullUrl);
  
      eventSource.onmessage = function(event) {
          console.log('New event from server:', event.data);
  
          setTreeData(prevState => (refreshTree(prevState, JSON.parse(event.data))));
      };
  
      eventSource.onerror = function(err) {
          console.error('EventSource failed:', err);
          eventSource.close();
      };
  
      setEventSource(eventSource);  
      setDebugActive(true);

    } else {
        if (eventSource) {
            eventSource.close();
            setEventSource(null);
        }

        setTreeData({});
        setDebugActive(false);      
        setExpandedItems([]);
    }


  }

  const renderTree = (node) => (
    (!node || !node.data || node.data.nodeId === undefined) ? null :
      <StyledTreeItem nodeId={node.data.nodeId.toString()} itemID={node.data.nodeId.toString()} key={node.data.nodeId.toString()} queryId={node.data.queryId.toString()} 
        callId={node.data.nodeId.toString()} state={node.data.state} url={node.data.endpoint} duration={durationToString(node.data.duration)} httpStatus={node.data.httpStatus}>
          {Array.isArray(node.children) ? node.children.map((child) => renderTree(child)) : null}
      </StyledTreeItem>
  );


  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
        <Button variant="contained" onClick={handleExecuteQuery}>
          {debugActive ? 'Stop Debugging' : 'Start Debugging'}        
        </Button>
      </div>
      <TreeView
      aria-label="idsmDebug"
      expanded={expandedItems}
//      defaultExpanded={expandedItems}
      defaultCollapseIcon={<ArrowDropDownIcon />}
      defaultExpandIcon={<ArrowRightIcon />}
      defaultEndIcon={<div style={{ width: 24 }} />}
      sx={{ width: '100%', maxWidth: 800, overflowX: 'auto' }}
    >
      {renderTree(treeData.root)}
    </TreeView>
    </div>
  );
}