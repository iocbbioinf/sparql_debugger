import React, { useState, useEffect, forwardRef, useImperativeHandle, useRef } from 'react';
import { styled } from '@mui/material/styles';
import Avatar from '@mui/material/Avatar';
import { RichTreeView } from '@mui/x-tree-view/RichTreeView';

import Link from '@mui/material/Link';
import DoneRoundedIcon from '@mui/icons-material/DoneRounded';
import ErrorIcon from '@mui/icons-material/Error';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import AnimLoadingComponent from './AnimLoadingComponent';
import ReqRespIconButton from './ReqRespIconButton';
import { PENDING_STATE, SUCCESS_STATE, FAILURE_STATE, baseUrl, ETC_STATE } from './utils/constants';
import {
  TreeItem2Content,
  TreeItem2IconContainer,
  TreeItem2GroupTransition,
  TreeItem2Root,
} from '@mui/x-tree-view/TreeItem2';
import { TreeItem2Icon } from '@mui/x-tree-view/TreeItem2Icon';
import { TreeItem2Provider } from '@mui/x-tree-view/TreeItem2Provider';
import { unstable_useTreeItem2 as useTreeItem2 } from '@mui/x-tree-view/useTreeItem2';
import { subscribeToUpdates, unsubscribe, durationToString, deleteQuery } from './utils/api';

import { Button, Container, Box, Typography, Tooltip, CssBaseline } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles'; 

import BugReportIcon from '@mui/icons-material/BugReport';
import PlayCircleIcon from '@mui/icons-material/PlayCircle';
import CancelIcon from '@mui/icons-material/Cancel';

  

const ITEMS = [
  {
    id: '1',
    label: JSON.stringify({
        queryId: 1,
        callId: 1,
        state: 'SUCCESS',
        url: 'http://test1.org',
        duration: 125,
        responseItemCount: 4,
        httpStatus: 200,    
    }),
    children: [{ id: '2', 
                label: JSON.stringify({
                    queryId: 1,
                    callId: 2,
                    state: 'SUCCESS',
                    url: 'http://test1.org',
                    duration: 125,
                    responseItemCount: 4,
                    httpStatus: 200
                })
               }],
  }
];


const StyledDoneRoundedIcon = styled(DoneRoundedIcon)({
    backgroundColor: '#007800',
    color: '#ffffff',
    borderRadius: '50%'   
  });
  
  const StyledErrorIcon = styled(ErrorIcon)({
    color: '#aa0000'  
  });      

  const CustomTreeItemContent = styled(TreeItem2Content)(({ theme }) => ({
    padding: theme.spacing(0.5, 1),
  }));
  
  const CustomTreeItem = React.forwardRef(function CustomTreeItem(props, ref) {
    const { id, itemId, label, disabled, children, ...other } = props;
  
    const {
      getRootProps,
      getContentProps,
      getIconContainerProps,
      getCheckboxProps,
      getLabelProps,
      getGroupTransitionProps,
      status,
    } = useTreeItem2({ id, itemId, children, label, disabled, rootRef: ref });

    const nodeContent = JSON.parse(label)

    const getIconComponent = () => {
      switch (nodeContent.state) {
        case PENDING_STATE:
          return <AnimLoadingComponent />;
        case SUCCESS_STATE:
          return <StyledDoneRoundedIcon />;
        case FAILURE_STATE:
          return <StyledErrorIcon />;
        case ETC_STATE:
          return <MoreVertIcon />
        default:
          return null;
      }
    };  

  
    return (

      <TreeItem2Provider itemId={itemId}>
        <TreeItem2Root {...getRootProps(other)}>
          <CustomTreeItemContent {...getContentProps()}>
            <TreeItem2IconContainer {...getIconContainerProps()}>
              <TreeItem2Icon status={status} />
            </TreeItem2IconContainer>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                p: 0.5,
                pr: 0,
                backgroundColor: nodeContent.isBulk ? 'rgba(255, 165, 0, 0.2)' : 'transparent',
                borderRadius: '8px'
              }}
            >
              {getIconComponent()}
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  ml: 1,
                  width: '100%',
                }}
              >

                {nodeContent.state && nodeContent.state !== ETC_STATE && (
                <>
                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                  <Tooltip title="Service endpoint URL">
                    <Typography variant="body2" sx={{ flexGrow: 1, ml: 1 }}>
                      <Link href={nodeContent.endpoint} target="_blank" rel="noopener noreferrer">{nodeContent.endpoint}</Link>
                    </Typography>
                  </Tooltip>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                  <Tooltip title="Http status" arrow>
                    <Typography variant="body2" sx={{ ml: 2 }}>{nodeContent.httpStatus}</Typography>
                  </Tooltip>
                  {nodeContent.isBulk && (
                    <Tooltip title="Number of endpoint calls" arrow>
                      <Typography variant="body2" color="inherit" sx={{ fontWeight: 'inherit', pr: 4 }}>
                        {nodeContent.bulkSize}x
                      </Typography>
                    </Tooltip>
                  )}
                  {nodeContent.isBulk && (
                    <Tooltip title="Duration" arrow>
                      <Typography variant="body2" color="inherit" sx={{ fontWeight: 'inherit', pr: 4 }}>
                        {durationToString(nodeContent.duration)}
                      </Typography>
                    </Tooltip>
                  )}
                  {!nodeContent.isBulk && <ReqRespIconButton queryId={nodeContent.queryId} nodeId={nodeContent.nodeId} isRequest={true}/>}
                  {!nodeContent.isBulk && nodeContent.state !== PENDING_STATE && <ReqRespIconButton queryId={nodeContent.queryId} nodeId={nodeContent.nodeId} isRequest={false} resultType={nodeContent.resultType}/>}
                  {nodeContent.endTime && (
                    <Tooltip title="Duration" arrow>
                      <Typography variant="body2" color="inherit" sx={{ fontWeight: 'inherit', pr: 1 }}>
                        {durationToString(nodeContent.endTime - nodeContent.startTime)}
                      </Typography>
                    </Tooltip>
                  )}

                  {nodeContent.resultsCount && (
                    <Tooltip title="Number of results" arrow>
                      <Typography variant="body2" color="inherit" sx={{ fontWeight: 'inherit', pr: 1 }}>
                        {nodeContent.resultsCount}
                      </Typography>
                    </Tooltip>
                  )}

                </Box>
                </>
              )}
            </Box>
          </Box>

          </CustomTreeItemContent>
          {children && <TreeItem2GroupTransition {...getGroupTransitionProps()} />}
        </TreeItem2Root>
      </TreeItem2Provider>
    );
  });
  

  const DebugTreeView = forwardRef(({ disabled, endpoint, query, requestConfig, queryData, updateDebugTab, setDebugTab, processResponse}, ref) => {

    useImperativeHandle(ref, () => ({
      handleDebugQuery,
      handleStopQuery,

    }));


    const handleExpandedItemsChange = (event, itemIds) => {
      setDebugTab({...queryData, 
        expandedItems: itemIds});
    };  
    
    const handleDebugQuery = async () => {
      const params = {
        endpoint: `${endpoint()}`,
        query: `${query()}`,
        requestcontext: `${JSON.stringify(requestConfig())}`
      }
    
      if(queryData.queryId) { 
        deleteQuery(queryData.queryId);
      }
      if(queryData.eventSource) {
        unsubscribe(queryData.eventSource);
      }

      var emptyData = {...queryData,           
        treeData: {}, expandedItems: [], renderData: []}

      setDebugTab(emptyData)

      subscribeToUpdates(params, queryData.tabKey, updateDebugTab, setDebugTab, processResponse)

    }
    
    const handleStopQuery = async () => {
      deleteQuery(queryData.queryId);
      unsubscribe(queryData.eventSource);
      setDebugTab({...queryData,           
        treeData: {}, expandedItems: [], treeRenderData: [], queryDebugIsRunning: false})
    };

    return (
      !queryData.queryDebugIsCanceled &&
      <Box sx={{ minHeight: 90, flexGrow: 1, maxWidth: 400 }}>
        <RichTreeView
          aria-label="icon expansion"
          sx={{ position: 'relative' }}
          expandedItems={queryData.expandedItems}
          onExpandedItemsChange={handleExpandedItemsChange}          
          items={queryData.renderData}
          slots={{ item: CustomTreeItem }}
        />
      </Box>
    );
});

const SparqlDebugger = forwardRef(({ theme, query, endpoint, requestConfig, queryData, updateDebugTab, setDebugTab, processResponse, executeQuery, abortQuery}, ref) => {
  const debugTreeViewRef = useRef(null);

  const handleDebugClick = () => {
    if(queryData.queryDebugIsRunning) {
      debugTreeViewRef.current.handleStopQuery()
      setDebugTab({...queryData,           
        queryDebugIsRunning: false,
        queryDebugIsCanceled: true
      })
    } else {      
      setTimeout(() => {
        if (debugTreeViewRef.current) {
          debugTreeViewRef.current.handleDebugQuery();
        }
      }, 0);  
      setDebugTab({...queryData,           
        queryDebugIsRunning: true,
        queryDebugIsCanceled: false}
        )
    }
  };

  const handleExecClick = () => {
    if(queryData.queryExecIsRunning) {
      abortQuery();
      setDebugTab({...queryData,           
        queryExecIsRunning: false})
    } else {      
        executeQuery();
        setDebugTab({...queryData,           
          queryExecIsRunning: true})  
    }    
  };

  useImperativeHandle(ref, () => ({
    handleDebugClick: handleDebugClick
  }));

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="md">
        <Box my={2} textAlign="center">
          <Button variant="contained" onClick={handleDebugClick}
              color={queryData.queryDebugIsRunning ?  'error' : 'success'}
              startIcon={queryData.queryDebugIsRunning ?  <AnimLoadingComponent /> : <BugReportIcon />}
              disabled={queryData.queryExecIsRunning}
            >
            {queryData.queryDebugIsRunning ? 'Cancel' : 'Debug'}
          </Button>          
          <Button variant="contained" onClick={handleExecClick} style={{ marginLeft: 16 }}
              color={queryData.queryExecIsRunning ?  'error' : 'success'}
              startIcon={queryData.queryExecIsRunning ?  <AnimLoadingComponent /> : <PlayCircleIcon />}
              disabled={queryData.queryDebugIsRunning}
            >
            {queryData.queryExecIsRunning ? 'Cancel' : 'Run'}
          </Button>          

          <Link href="https://gitlab.elixir-czech.cz/moos/idsm_debug_server/-/issues" target="_blank" rel="noopener noreferrer" style={{ marginLeft: 16 }}>
          Report Debugging Issue
          </Link>
        </Box>
        <DebugTreeView endpoint={endpoint} query={query} requestConfig={requestConfig} queryData={queryData} updateDebugTab={updateDebugTab} setDebugTab={setDebugTab} processResponse={processResponse} 
           ref={debugTreeViewRef}/>
      </Container>
    </ThemeProvider>
  );
})

export default SparqlDebugger