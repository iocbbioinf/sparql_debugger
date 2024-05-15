import React, { useState, useEffect } from 'react';
import { TreeView } from '@mui/x-tree-view/TreeView';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import Button from '@mui/material/Button';
import StyledTreeItem from './StyledTreeItem';
import { subscribeToUpdates, unsubscribe, durationToString } from './utils/api';

import { yasgui } from '../sparql/Yasgui.js'


export default function DebugTreeView({ yasgui }) {
  const [treeData, setTreeData] = useState({});
  const [expandedItems, setExpandedItems] = useState([]);

  const handleExecuteQuery = async () => {
      unsubscribe();
      setTreeData({});

      const baseUrl = "http://idsm-debugger-test6.dyn.cloud.e-infra.cz/query"
      const params = {
        endpoint: `${yasgui.current.getCurrentEndpoint()}`,
        query: `${yasgui.current.getCurrentQuery()}`
      }

      subscribeToUpdates(params, setTreeData, setExpandedItems);
  };

  const renderTree = (node) => (
    (!node || !node.data || node.data.nodeId === undefined) ? null :
      <StyledTreeItem nodeId={node.data.nodeId.toString()} itemID={node.data.nodeId.toString()} key={node.data.nodeId.toString()} queryId={node.data.queryId.toString()} 
        callId={node.data.nodeId.toString()} state={node.data.state} url={node.data.endpoint} duration={durationToString(node.data.duration)} httpStatus={node.data.httpStatus}>
          {Array.isArray(node.children) ? node.children.map((child) => renderTree(child)) : null}
      </StyledTreeItem>
  );

  useEffect(() => {
    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <div>
      <Button variant="contained" onClick={handleExecuteQuery}>
        {'Debug'}
      </Button>
      <TreeView
        aria-label="debug-tree"
        expanded={expandedItems}
        defaultCollapseIcon={<ArrowDropDownIcon />}
        defaultExpandIcon={<ArrowRightIcon />}
        sx={{ width: '100%', maxWidth: 800, overflowY: 'auto' }}
      >
        {treeData.root && renderTree(treeData.root)}
      </TreeView>
    </div>
  );
}
