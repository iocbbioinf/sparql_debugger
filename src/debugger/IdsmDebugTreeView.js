import React, { useState, useEffect, useRef } from 'react';
import DebugTreeView from './DebugTreeView'; 
import Button from '@mui/material/Button';
import { yasgui } from '../sparql/Yasgui.js'


export default function IdsmDebugTreeView({ yasgui }) {
  const [endpoint, setEndpoint] = useState('');
  const [query, setQuery] = useState('');
  const debugTreeViewRef = useRef(null);

  const updateQueryInfo = () => {
    setEndpoint(yasgui.current.getCurrentEndpoint());
    setQuery(yasgui.current.getCurrentQuery());
  };

  useEffect(() => {
    updateQueryInfo();
  });

  const handleDebugClick = () => {
    updateQueryInfo();
    setTimeout(() => {
      if (debugTreeViewRef.current) {
        debugTreeViewRef.current.handleExecuteQuery();
      }
    }, 0);
  };

  return (
    <div>
      <Button variant="contained" onClick={handleDebugClick}>
        {'Debug'}
      </Button>
      <DebugTreeView
        ref={debugTreeViewRef}        
        endpoint={endpoint}
        query={query}
        treeStyles={{ width: '100%', maxWidth: 800 }}
      />
    </div>
  );
}

