import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { RichTreeView } from '@mui/x-tree-view/RichTreeView';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import StyledTreeItem from './StyledTreeItem';
import { subscribeToUpdates, unsubscribe, durationToString } from './utils/api';

import { createTheme, ThemeProvider } from '@mui/material/styles';


const DebugTreeView = forwardRef(({ endpoint, query, treeStyles }, ref) => {
  const [treeData, setTreeData] = useState({});
  const [expandedItems, setExpandedItems] = useState([]);


  useImperativeHandle(ref, () => ({
    handleDebugQuery
  }));

  const handleExpandedItemsChange = (
    event,
    itemIds
  ) => {
    setExpandedItems(itemIds);
  };

  const handleDebugQuery = async () => {
      unsubscribe();
      setTreeData({});

      const params = {
        endpoint: `${endpoint}`,
        query: `${query}`
      }

      subscribeToUpdates(params, setTreeData, setExpandedItems);

  };

  const renderTree = (node) => (
    (!node || !node.data || node.data.nodeId === undefined) ? null :
      <StyledTreeItem nodeId={node.data.nodeId.toString()} itemID={node.data.nodeId.toString()} key={node.data.nodeId.toString()} queryId={node.data.queryId.toString()} 
        callId={node.data.nodeId.toString()} state={node.data.state} url={node.data.endpoint} duration={durationToString(node.data.duration)} httpStatus={node.data.httpStatus}>
          {Array.isArray(node.children) ? node.children.map((child) => renderTree(child)) : null} isBulk={bulkSize ? true : false}
      </StyledTreeItem>
  );

  useEffect(() => {
    const params = { endpoint, query };

    return () => {
      unsubscribe();
    };
  }, [endpoint, query]);

  return (
    
    <div>
      <RichTreeView
        aria-label="debug-tree"
        defaultCollapseIcon={<ArrowDropDownIcon />}
        defaultExpandIcon={<ArrowRightIcon />}
        slots={{ item: StyledTreeItem }}
        sx={{ ...treeStyles, overflowY: 'auto' }}
      >
        {treeData.root && renderTree(treeData.root)}
      </RichTreeView>
    </div>
  );
});

export default DebugTreeView;
