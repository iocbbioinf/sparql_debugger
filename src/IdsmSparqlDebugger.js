import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { createTheme } from '@mui/material/styles'; 

//import { SparqlDebugger } from 'sparqldebugtree';
import SparqlDebugger from './debug/SparqlDebugger';

const IdsmSparqlDebugger = forwardRef(({ yasgui, currentTabKey}, ref) => {

  const [tabsDebugMap, setTabsDebugMap] = useState(new Map());
  const [tabsDebugComponentMap, setTabsDebugComponentMap] = useState(new Map());

  const theme = createTheme({
    palette: {
      primary: {
        main: '#1976d2', 
      },
      secondary: {
        main: '#ff4081', 
      },
      background: {
        default: '#f5f5f5', 
      },
    },
    typography: {
      fontFamily: 'Roboto, Arial, sans-serif',
      h4: {
        fontWeight: 700,
        color: '#333',
      },
      button: {
        textTransform: 'none',
        fontWeight: 600,
      },
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8, 
          },
        },
      },
    },
  });

  const processResponse = async(response) => {
    const respStr = await response;

    if(yasgui.current.getTab(respStr.tabKey)) {
      yasgui.current.getTab(respStr.tabKey).yasr.setResponse(respStr);    
    }
  }

  const executeQuery = async() => {
    yasgui.current.getTab().yasqe.query();
  }

  const abortQuery = async() => {
    yasgui.current.getTab().yasqe.abortQuery();
  }

  useImperativeHandle(ref, () => ({
    handleDebugClick: (debuggerId) => {
      console.log("MMO + IdsmSparqlDebugger");
//      tabsDebugComponentMap.get(debuggerId)?.handleDebugClick();
      sparqlDebuggerRef.current?.handleDebugClick();
    },

    handleQueryResponse: (tab) => {            
      const queryData = {...tabsDebugMap.get(tab.persistentJson.id), queryExecIsRunning: false};
      setDebugTab(queryData);
    }
  }));

  const sparqlDebuggerRef = useRef(null);

  const getQuery = () => {
    return yasgui.current.getCurrentQuery()
  }

  const getEndpoint = () => {
    return yasgui.current.getCurrentEndpoint()
  }

  const setDebugTab = (queryData) => {
    setTabsDebugMap((preMap) => new Map([
      ...preMap.entries(),
      [queryData.tabKey, queryData]
    ]))        

    setTabsDebugComponentMap((prevMap) => (new Map([
      ...prevMap.entries(),
      [queryData.tabKey, (
        <SparqlDebugger
          key={queryData.tabKey}
          theme={theme}
          query={getQuery}
          endpoint={getEndpoint}
          queryData={queryData}
          setDebugTab={setDebugTab}
          processResponse={processResponse}        
          executeQuery={executeQuery}  
          abortQuery={abortQuery}
          ref={sparqlDebuggerRef}
        />
      )
      ]])))
  }

  useEffect(() => {
    if (currentTabKey && !tabsDebugMap.get(currentTabKey)) {

      const newTabState = {
        tabKey: currentTabKey,
        treeData: {},
        renderData: [],
        expandedItems: [],
        queryDebugIsRunning: false,
        queryExecIsRunning: false        
      };

      setTabsDebugMap((prevMap) => (new Map([
        ...prevMap.entries(),
        [currentTabKey, newTabState]
      ])));

      
      setTabsDebugComponentMap((prevMap) => (new Map([
        ...prevMap.entries(),
        [currentTabKey, (
          <SparqlDebugger
            key={currentTabKey}
            theme={theme}
            query={getQuery}
            endpoint={getEndpoint}            
            queryData={newTabState}
            setDebugTab={setDebugTab}
            processResponse={processResponse}
            executeQuery={executeQuery}  
            abortQuery={abortQuery}  
            ref={sparqlDebuggerRef}
          />
        )
        ]])))

    }
  }, [currentTabKey]);


  return (

    <div>            
      {tabsDebugComponentMap.get(currentTabKey)}
    </div>
    
  );
});

export default IdsmSparqlDebugger;
