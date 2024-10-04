import React, { useState, useEffect, useRef } from 'react';
import { createTheme } from '@mui/material/styles'; 

//import { SparqlDebugger } from 'sparqldebugtree';
import SparqlDebugger from './debug/SparqlDebugger';

import Link from '@mui/material/Link';



export default function IdsmSparqlDebugger({ yasgui, currentTabKey}) {

  const [tabsDebugMap, setTabsDebugMap] = useState({});

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
    
  const [endpoint, setEndpoint] = useState('');
  const [query, setQuery] = useState('');

  const updateQueryInfo = () => {
    setEndpoint(yasgui.current.getCurrentEndpoint());
    setQuery(yasgui.current.getCurrentQuery());
  };

  const processResponse = async(response) => {
    const respStr = await response;

    yasgui.current.setResponse(respStr);    
  }

  useEffect(() => {
    updateQueryInfo();
  }, [yasgui]);

  useEffect(() => {
    if (currentTabKey && !tabsDebugMap[currentTabKey]) {
      // Initialize state for each tab when it is first opened
//      const { endpoint, query } = updateQueryInfo();

      const newTabState = {
        treeData: {},
        treeRenderData: [],
        expandedItems: [],
        queryIsRunning: false,
        component: (
          <SparqlDebugger
            key={currentTabKey}
            theme={theme}
            query={query}
            endpoint={endpoint}
            updateQueryInfo={updateQueryInfo}
            processResponse={async (response) => yasgui.current.setResponse(await response)}
            setTreeData={(data) => {
              console.log("mmo:" + data.toString())
              
              setTabsDebugMap((prevMap) => ({
                ...prevMap,
                [currentTabKey]: {  
                  ...prevMap[currentTabKey],
                  treeData: data,
                },
              }))}
            }
            setTreeRenderData={(data) => {
              console.log("mmo:" + data.toString())
              setTabsDebugMap((prevMap) => ({
                ...prevMap,
                [currentTabKey]: {
                  ...prevMap[currentTabKey],
                  treeRenderData: data,
                },
              }))}
            }
            setExpandedItems={(items) => {
              console.log("mmo:" + items.toString())
              setTabsDebugMap((prevMap) => ({
                ...prevMap,
                [currentTabKey]: {
                  ...prevMap[currentTabKey],
                  expandedItems: items,
                },
              }))}
            }
            setQueryIsRunning={(queryIsRunning) => {
              setTabsDebugMap((prevMap) => ({
                ...prevMap,
                [currentTabKey]: {
                  ...prevMap[currentTabKey],
                  queryIsRunning: queryIsRunning,
                },
              }))}
            }
            getTreeData={ () => {
              const tmp = tabsDebugMap[currentTabKey]?.treeData || {}
              return tmp
            }
            }
            getTreeRenderData={ () => tabsDebugMap[currentTabKey]?.treeRenderData || {}}  
            getExpandedItems={ () => tabsDebugMap[currentTabKey]?.expandedItems || []}
            queryIsRunning={tabsDebugMap[currentTabKey]?.queryIsRunning || false}
          />
        ),
      };

      // Add the initialized state to the tabsDebugMap
      setTabsDebugMap((prevMap) => ({
        ...prevMap,
        [currentTabKey]: newTabState,
      }));
    }
  }, [currentTabKey, yasgui]);


  return (

    <div>      
          <Link href="https://gitlab.elixir-czech.cz/moos/idsm_debug_server/-/issues" target="_blank" rel="noopener noreferrer" style={{ marginLeft: 16 }}>
          Report Debugging Issue
          </Link>

      {tabsDebugMap[currentTabKey]?.component}
    </div>
    
  );
}
