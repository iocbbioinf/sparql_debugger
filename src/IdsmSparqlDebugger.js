import React, { useState, useEffect, useRef } from 'react';
import CustomContentTreeView from "./debug/SparqlDebugger"; 
import { Button, Container, Box, Typography, AppBar, Toolbar, CssBaseline, Paper } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles'; 

import BugReportIcon from '@mui/icons-material/BugReport';
import CancelIcon from '@mui/icons-material/Cancel';
import SparqlDebugger from './debug/SparqlDebugger';


export default function IdsmSparqlDebugger({ yasgui}) {

  const theme = createTheme({
    palette: {
      primary: {
        main: '#1976d2', // A cool blue color
      },
      secondary: {
        main: '#ff4081', // A contrasting pink color
      },
      background: {
        default: '#f5f5f5', // Light grey background
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

  useEffect(() => {
    updateQueryInfo();
  }, [yasgui]);

  return (
    <SparqlDebugger theme={theme} query={query} endpoint={endpoint} updateQueryInfo={updateQueryInfo}/>
  );
}
