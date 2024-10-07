import React, { useState, useEffect, useRef } from 'react';
import { createTheme } from '@mui/material/styles'; 

//import { SparqlDebugger } from 'sparqldebugtree';
import SparqlDebugger from './debug/SparqlDebugger';

import Link from '@mui/material/Link';



export default function IdsmSparqlDebugger({ yasgui, currentTabKey}) {

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
            borderRadius: 8, // Rounded buttons
          },
        },
      },
    },
  });
    
  const processResponse = async(response) => {
    const respStr = await response;

    yasgui.current.setResponse(respStr);    
  }

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
          processResponse={async (response) => yasgui.current.setResponse(await response)}
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
        queryIsRunning: false
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
            processResponse={async (response) => yasgui.current.setResponse(await response)}
          />
        )
        ]])))

    }
  }, [currentTabKey]);


  return (

    <div>      
      { tabsDebugComponentMap.forEach((value, key) => {
        console.log("MMO-Key: " + key);
        })}

      {console.log("MMO-currentTabKey:" + currentTabKey)}
      
      {tabsDebugComponentMap.get(currentTabKey)}
    </div>
    
  );
}
