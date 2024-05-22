import React, { useState, useEffect, useRef } from 'react';
import CustomContentTreeView from "./debug/DebugTreeViewNew"; 
import { Button, Container, Box, Typography, AppBar, Toolbar, CssBaseline, Paper } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles'; 

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
  }, [yasgui]);

  const handleDebugClick = () => {
    updateQueryInfo();
    setTimeout(() => {
      if (debugTreeViewRef.current) {
        debugTreeViewRef.current.handleExecuteQuery();
      }
    }, 0);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="md">
        <Box my={4} textAlign="center">
          <Button variant="contained" color="primary" onClick={handleDebugClick}>
            Debug
          </Button>
        </Box>
        <Paper elevation={3} sx={{ padding: 2, marginTop: 2 }}>          
          <CustomContentTreeView/>
        </Paper>
      </Container>
    </ThemeProvider>
  );
}
