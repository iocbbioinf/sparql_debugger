import * as React from 'react';
import { styled, useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import MailIcon from '@mui/icons-material/Mail';
import DeleteIcon from '@mui/icons-material/Delete';
import Label from '@mui/icons-material/Label';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import InfoIcon from '@mui/icons-material/Info';
import ForumIcon from '@mui/icons-material/Forum';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';

import { TreeView } from '@mui/x-tree-view/TreeView';
import { TreeItem, treeItemClasses } from '@mui/x-tree-view/TreeItem';

import UseAnimations from 'react-useanimations';
import loading from 'react-useanimations/lib/loading';

import DoneOutlineIcon from '@mui/icons-material/DoneOutline';
import ErrorIcon from '@mui/icons-material/Error';
import PendingIcon from '@mui/icons-material/Pending';
import InputIcon from '@mui/icons-material/Input';
import OutputIcon from '@mui/icons-material/Output';


const PENDING_STATE = "pending"
const SUCCESS_STATE = "success"
const FAILURE_STATE = "failure"

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

const StyledTreeItem = React.forwardRef(function StyledTreeItem(props, ref) {
  const theme = useTheme();
  const {
    bgColor,
    color,
    colorForDarkMode,
    bgColorForDarkMode,
    state,
    url,
    time,
    responseItemCount,
    ...other
  } = props;

  const styleProps = {
    '--tree-view-color': theme.palette.mode !== 'dark' ? color : colorForDarkMode,
    '--tree-view-bg-color':
      theme.palette.mode !== 'dark' ? bgColor : bgColorForDarkMode,
  };

  if(state==PENDING_STATE) {
    return(
      <StyledTreeItemRoot
      label={
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            p: 0.5,
            pr: 0,
          }}
        >
          <UseAnimations animation={loading}/>          
          <Typography variant="body2" sx={{ fontWeight: 'inherit', flexGrow: 0.1 }}>
            {url}
          </Typography>
          <Box component={InputIcon} color="inherit" sx={{ mr: 1 }} />
        </Box>
      }
      style={styleProps}
      {...other}
      ref={ref}
    />
    )
  } else if(state == SUCCESS_STATE) {
    return (    
      <StyledTreeItemRoot
        label={
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              p: 0.5,
              pr: 0,
            }}
          >
            <Box component={DoneOutlineIcon} color="inherit" sx={{ mr: 1 }} />
            <Typography variant="body2" sx={{ fontWeight: 'inherit', flexGrow: 0.1 }}>
              {url}
            </Typography>            
            <Typography variant="body2" color="inherit" sx={{ fontWeight: 'inherit', flexGrow: 0.1 }}>
              {time}
            </Typography>
            <Typography variant="body2" color="inherit" sx={{ fontWeight: 'inherit', flexGrow: 0.1 }}>
              {responseItemCount}
            </Typography>
            <Box component={InputIcon} color="inherit" sx={{ mr: 1 }} />
            <Box component={OutputIcon} color="inherit" sx={{ mr: 1 }} />  
          </Box>
        }
        style={styleProps}
        {...other}
        ref={ref}
      />    
    )
  } else if(state == FAILURE_STATE) {
    return (    
      <StyledTreeItemRoot
        label={
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              p: 0.5,
              pr: 0,
            }}
          >
            <Box component={ErrorIcon} color="inherit" sx={{ mr: 1 }} />
            <Typography variant="body2" sx={{ fontWeight: 'inherit', flexGrow: 0.1 }}>
              {url}
            </Typography>            
            <Typography variant="body2" color="inherit" sx={{ fontWeight: 'inherit', flexGrow: 0.1 }}>
              {time}
            </Typography>
            <Box component={InputIcon} color="inherit" sx={{ mr: 1 }} />
            <Box component={OutputIcon} color="inherit" sx={{ mr: 1 }} />  
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

export default function GmailTreeView() {
  return (
    <TreeView
      aria-label="gmail"
      defaultExpanded={['3']}
      defaultCollapseIcon={<ArrowDropDownIcon />}
      defaultExpandIcon={<ArrowRightIcon />}
      defaultEndIcon={<div style={{ width: 24 }} />}
      sx={{ height: 264, flexGrow: 1, maxWidth: 400, overflowY: 'auto' }}
    >
      <StyledTreeItem nodeId="1" state="success" url="https://service1.org" time="4s" responseItemCount="157"/>
      <StyledTreeItem nodeId="2" state="pending" url="https://service2.org">
        <StyledTreeItem
          nodeId="21"
          state="pending"
          url="https://service3.org"
        />
        <StyledTreeItem
          nodeId="22"
          state="success"
          url="https://service4.org"
          time="5s" 
          responseItemCount="207"
        />
     </StyledTreeItem>
      <StyledTreeItem nodeId="4" state="failure" url="https://service2.org" time="2s"/>
    </TreeView>
  );
}