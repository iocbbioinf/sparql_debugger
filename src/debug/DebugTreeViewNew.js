import * as React from 'react';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import { RichTreeView } from '@mui/x-tree-view/RichTreeView';

import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import DoneRoundedIcon from '@mui/icons-material/DoneRounded';
import ErrorIcon from '@mui/icons-material/Error';
import AnimLoadingComponent from './AnimLoadingComponent';
import ReqRespIconButton from './ReqRespIconButton';
import { PENDING_STATE, SUCCESS_STATE, FAILURE_STATE } from './utils/constants';

import { TreeItem2 } from '@mui/x-tree-view/TreeItem2';
import {
  TreeItem2Content,
} from '@mui/x-tree-view/TreeItem2';


function CustomLabel(props) {
    const { children, ...other } = props;

    const node = JSON.parse({children});

    const getIconComponent = () => {
        switch (node.state) {
          case PENDING_STATE:
            return <AnimLoadingComponent />;
          case SUCCESS_STATE:
            return <StyledDoneRoundedIcon />;
          case FAILURE_STATE:
            return <StyledErrorIcon />;
          default:
            return null;
        }
      };  
    
    return (
        <Box sx={{ display: 'flex', alignItems: 'center', p: 0.5, pr: 0 }}>
        {getIconComponent()}
        <Typography variant="body2" sx={{ ml: 1 }}>{node.httpStatus}</Typography>
        <Typography variant="body2" sx={{ flexGrow: 1, ml: 1 }}>
          <Link href={node.url} target="_blank" rel="noopener noreferrer">{node.url}</Link>
        </Typography>
        <ReqRespIconButton queryId={node.queryId} callId={node.callId} isRequest={true} />
        {node.state !== PENDING_STATE && <ReqRespIconButton queryId={node.queryId} callId={node.callId} isRequest={false} />}
        
        {node.duration && <Typography variant="body2" color="inherit" sx={{ fontWeight: 'inherit', flexGrow: 0.1 }}>
              {node.duration}
        </Typography>
        }

        {node.responseItemCount && <Typography variant="body2" sx={{ ml: 1 }}>{node.responseItemCount}</Typography>}
      </Box>

    );
}
  

const ITEMS = [
  {
    id: '1',
    label: JSON.stringify({
        queryId: 1,
        callId: 1,
        state: "SUCCESS",
        url: "http://test1.org",
        duration: 125,
        responseItemCount: 4,
        httpStatus: 200,    
    },null,0),
    children: [{ id: '2', 
                label: JSON.stringify({
                    queryId: 1,
                    callId: 2,
                    state: "SUCCESS",
                    url: "http://test1.org",
                    duration: 125,
                    responseItemCount: 4,
                    httpStatus: 200
                },null,0)
               }],
  }
];

const CustomTreeItemContent = styled(TreeItem2Content)(({ theme }) => ({
  padding: theme.spacing(0.5, 1),
}));

const StyledDoneRoundedIcon = styled(DoneRoundedIcon)({
    backgroundColor: '#007800',
    color: '#ffffff',
    borderRadius: '50%'   
  });
  
  const StyledErrorIcon = styled(ErrorIcon)({
    color: '#aa0000'  
  });      

const CustomTreeItem = React.forwardRef(function CustomTreeItem(props, ref) {

  return (
    <TreeItem2
      ref={ref}
      {...props}
      slots={{
        label: CustomLabel,
      }}
    />
  );
});

export default function CustomContentTreeView() {
  return (
    <Box sx={{ minHeight: 180, flexGrow: 1, maxWidth: 300 }}>
      <RichTreeView
        aria-label="icon expansion"
        sx={{ position: 'relative' }}
        defaultExpandedItems={['3']}
        items={ITEMS}
        slots={{ item: CustomTreeItem }}
      />
    </Box>
  );
}