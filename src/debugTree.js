import * as React from 'react';
import { styled, useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';

import { TreeView } from '@mui/x-tree-view/TreeView';
import { TreeItem, treeItemClasses } from '@mui/x-tree-view/TreeItem';

import loading from 'react-useanimations/lib/loading';

import DoneRoundedIcon from '@mui/icons-material/DoneRounded';
import ErrorIcon from '@mui/icons-material/Error';
import InputIcon from '@mui/icons-material/Input';
import OutputIcon from '@mui/icons-material/Output';
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip';
import Link from '@mui/material/Link';
import Modal from '@mui/material/Modal';
import JSONPretty from 'react-json-pretty';
import CircularProgress from '@mui/material/CircularProgress';

const PENDING_STATE = "pending"
const SUCCESS_STATE = "success"
const FAILURE_STATE = "failure"

const StyledDoneRoundedIcon = styled(DoneRoundedIcon)({
  backgroundColor: '#007800',
  color: '#ffffff',
  borderRadius: '50%'   
});

const StyledErrorIcon = styled(ErrorIcon)({
  color: '#aa0000'  
});


const StyledLoadingIcon = styled(loading)({
  color: "blue"
})

function AnimLoadingComponent() {
  return <CircularProgress style={{ width: '20px', height: '20px'}} />;
} 


const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 'auto',
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
  overflow: 'auto',
  maxHeight: '90vh'
};


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

const ReqRespIconButon = React.forwardRef(function ReqRespIconButon(props, ref) {

  const {
    isRequest,
    isErr,
    ...other
  } = props;

  const [open, setOpen] = React.useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const showRequest = () => {
    console.log('Icon clicked');
    // Add your click handling logic here
  };

  const responseOKJson = {"head": {"vars": ["COMPOUND"]},"results": {"bindings": [{"COMPOUND": {"type": "uri","value": "http://rdf.ncbi.nlm.nih.gov/pubchem/compound/CID3237257"}},{"COMPOUND": {"type": "uri","value": "http://rdf.ncbi.nlm.nih.gov/pubchem/compound/CID3252677"}}]}}
  const responseErr = `
  org.postgresql.util.PSQLException: ERROR: canceling statement due to statement timeout
	at org.postgresql.core.v3.QueryExecutorImpl.receiveErrorResponse(QueryExecutorImpl.java:2674)
	at org.postgresql.core.v3.QueryExecutorImpl.processResults(QueryExecutorImpl.java:2364)
	at org.postgresql.core.v3.QueryExecutorImpl.execute(QueryExecutorImpl.java:354)
	at org.postgresql.jdbc.PgStatement.executeInternal(PgStatement.java:484)
	at org.postgresql.jdbc.PgStatement.execute(PgStatement.java:404)
	at org.postgresql.jdbc.PgStatement.executeWithFlags(PgStatement.java:325)
	at org.postgresql.jdbc.PgStatement.executeCachedSql(PgStatement.java:311)
	at org.postgresql.jdbc.PgStatement.executeWithFlags(PgStatement.java:287)
	at org.postgresql.jdbc.PgStatement.executeQuery(PgStatement.java:239)
	at cz.iocb.chemweb.server.sparql.engine.Request.execute(Unknown Source)
	at cz.iocb.chemweb.server.servlets.endpoint.EndpointServlet.process(Unknown Source)
	at cz.iocb.chemweb.server.servlets.endpoint.EndpointServlet.doPost(Unknown Source)
	at javax.servlet.http.HttpServlet.service(HttpServlet.java:682)
	at javax.servlet.http.HttpServlet.service(HttpServlet.java:765)
	at org.apache.catalina.core.ApplicationFilterChain.internalDoFilter(ApplicationFilterChain.java:231)
	at org.apache.catalina.core.ApplicationFilterChain.doFilter(ApplicationFilterChain.java:166)
	at org.apache.tomcat.websocket.server.WsFilter.doFilter(WsFilter.java:52)
	at org.apache.catalina.core.ApplicationFilterChain.internalDoFilter(ApplicationFilterChain.java:193)
	at org.apache.catalina.core.ApplicationFilterChain.doFilter(ApplicationFilterChain.java:166)
	at org.apache.catalina.core.StandardWrapperValve.invoke(StandardWrapperValve.java:177)
	at org.apache.catalina.core.StandardContextValve.invoke(StandardContextValve.java:97)
	at org.apache.catalina.authenticator.AuthenticatorBase.invoke(AuthenticatorBase.java:543)
	at org.apache.catalina.core.StandardHostValve.invoke(StandardHostValve.java:135)
	at org.apache.catalina.valves.ErrorReportValve.invoke(ErrorReportValve.java:92)
	at org.apache.catalina.valves.AbstractAccessLogValve.invoke(AbstractAccessLogValve.java:698)
	at org.apache.catalina.core.StandardEngineValve.invoke(StandardEngineValve.java:78)
	at org.apache.catalina.connector.CoyoteAdapter.service(CoyoteAdapter.java:367)
	at org.apache.coyote.http11.Http11Processor.service(Http11Processor.java:639)
	at org.apache.coyote.AbstractProcessorLight.process(AbstractProcessorLight.java:65)
	at org.apache.coyote.AbstractProtocol$ConnectionHandler.process(AbstractProtocol.java:885)
	at org.apache.tomcat.util.net.NioEndpoint$SocketProcessor.doRun(NioEndpoint.java:1688)
	at org.apache.tomcat.util.net.SocketProcessorBase.run(SocketProcessorBase.java:49)
	at org.apache.tomcat.util.threads.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1191)
	at org.apache.tomcat.util.threads.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:659)
	at org.apache.tomcat.util.threads.TaskThread$WrappingRunnable.run(TaskThread.java:61)
	at java.base/java.lang.Thread.run(Thread.java:829)
  `
  const requestSparql = `SELECT ?COMPOUND ?ENTRY WHERE
  {
    {
      SELECT ?COMPOUND ?UNIPROT WHERE {
        SERVICE <https://service2.org> {
          SERVICE <https://service3.org> {
            ?COMPOUND sachem:substructureSearch [
                sachem:query "CC(=O)Oc1ccccc1C(O)=O" ]
          }
  
          ?ACTIVITY rdf:type chembl:Activity;
            chembl:hasMolecule ?COMPOUND;
            chembl:hasAssay ?ASSAY.
          ?ASSAY chembl:hasTarget ?TARGET.
          ?TARGET chembl:hasTargetComponent ?COMPONENT.
          ?COMPONENT chembl:targetCmptXref ?UNIPROT.
          ?UNIPROT rdf:type chembl:UniprotRef.
        }
      }
    }
  
    ?ENTRY skos:exactMatch ?UNIPROT.
  }`

  const iconTitle = (isRequest === true) ? "request" : "response"
  const reqRespData = (isRequest === true) ? requestSparql : (isErr === true) ? responseErr : responseOKJson

  const icon = (isRequest === true) ? <InputIcon/> : <OutputIcon/>
  
  return(
    <div>      
      <Tooltip title={iconTitle}>
        <IconButton onClick={handleOpen} hover={iconTitle} aria-label={iconTitle}>
          {icon}
        </IconButton>
      </Tooltip>    
      <Modal
          open={open}
          onClose={handleClose}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
        <Box sx={modalStyle}>
          <JSONPretty id="json-pretty" data={reqRespData} theme={JSONPretty.monikai}></JSONPretty>
        </Box>
      </Modal>
    </div>
  )
})


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

  if(state===PENDING_STATE) {
    return(
      <TreeItem
      label={
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            p: 0.5,
            pr: 0,
          }}
        >
          <Box sx={{ paddingRight: '10px' }}>
            <AnimLoadingComponent/>
          </Box>          
          <Typography variant="body2" sx={{ fontWeight: 'inherit', flexGrow: 0.1 }}>
            <Link href={url} target="_blank" rel="noopener noreferrer">
              {url}
            </Link>                          
          </Typography> 
          <Box color="inherit" sx={{ mr: 1 }} >
            <ReqRespIconButon isRequest={true}/>
          </Box>
        </Box>
      }
      style={styleProps}
      {...other}
      ref={ref}
    />
    )
  } else if(state === SUCCESS_STATE) {
    return (    
      <TreeItem
        label={
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              p: 0.5,
              pr: 0,
            }}
          >
            <Box sx={{ mr: 1 }}>
              <StyledDoneRoundedIcon style={{ backgroundColor: '#007800', color: '#ffffff', borderRadius: '50%' }} />
            </Box>
            <Typography variant="body2" sx={{ fontWeight: 'inherit', flexGrow: 0.1 }}>
                <Link href={url} target="_blank" rel="noopener noreferrer">
                {url}
                </Link>                          
            </Typography> 

            <Tooltip title='Time'>
              <Typography variant="body2" color="inherit" sx={{ fontWeight: 'inherit', flexGrow: 0.1 }}>
                {time}
              </Typography>
            </Tooltip>

            <Tooltip title='Response Item Count'>
              <Typography variant="body2" color="inherit" sx={{ fontWeight: 'inherit', flexGrow: 0.1 }}>
                {responseItemCount}
              </Typography>
            </Tooltip>

            <Box color="inherit" sx={{ mr: 1 }} >
              <ReqRespIconButon isRequest={true}/>
            </Box>
            <Box color="inherit" sx={{ mr: 1 }} >
              <ReqRespIconButon isRequest={false}/>
            </Box>


          </Box>
        }
        style={styleProps}
        {...other}
        ref={ref}
      />    
    )
  } else if(state === FAILURE_STATE) {
    return (    
      <TreeItem
        label={
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              p: 0.5,
              pr: 0,
            }}
          >
            <Box sx={{ mr: 1 }}>
              <StyledErrorIcon style={{ color: '#aa0000'}}/>
            </Box>
            <Typography variant="body2" sx={{ fontWeight: 'inherit', flexGrow: 0.1 }}>
              <Link href={url} target="_blank" rel="noopener noreferrer">
                {url}
              </Link>                          
            </Typography> 
            <Tooltip title='Time'>
              <Typography variant="body2" color="inherit" sx={{ fontWeight: 'inherit', flexGrow: 0.1 }}>
                {time}
              </Typography>
            </Tooltip>
            <Box color="inherit" sx={{ mr: 1 }} >
              <ReqRespIconButon isRequest={true}/>
            </Box>
            <Box color="inherit" sx={{ mr: 1 }} >
              <ReqRespIconButon isRequest={false} isErr={true}/>
            </Box>
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

export default function DebugTreeView() {
  return (
    <div>
      <div>
        <h3>Debug</h3>        
      </div>    
      <TreeView
      aria-label="idsmDebug"
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
    </div>
  );
}