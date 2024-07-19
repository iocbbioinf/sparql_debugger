import React, { useState, useCallback } from 'react';
import { IconButton, Tooltip, Modal, Box, Button } from '@mui/material';
import InputIcon from '@mui/icons-material/Input';
import OutputIcon from '@mui/icons-material/Output';
import { saveAs } from 'file-saver';
import modalStyle from './styles/modalStyle'; 
import { baseUrl } from "./utils/constants";
import JSONPretty from 'react-json-pretty';
import DownloadIcon from '@mui/icons-material/Download';
import './styles/debugStyles.css'; 
import { getContentType } from './utils/api';


function ReqRespIconButton({ queryId, nodeId, isRequest }) {
  const [open, setOpen] = useState(false);
  const [fileContent, setFileContent] = useState('');
  const [fileBlob, setFileBlob] = useState(null);
  const [contentType, setContentType] = useState(null);

  const PREVIEW_LENGTH = 2000;

  const fetchPreviewContent = useCallback(async (queryId, callId, isRequest, setContentType) => {
    const reqResp = isRequest ? "request" : "response";
    const fullUrl = `${baseUrl}/query/${queryId}/call/${callId}/${reqResp}`;

    try {
      const response = await fetch(fullUrl, {
        headers: {
          'Accept-Encoding': 'gzip,deflate',
          'Range': `bytes=0-${PREVIEW_LENGTH - 1}`
        }
      });

      const blob = await response.blob();
      
      const text = await blob.text();

      const tmp = getContentType(text);
      setContentType(getContentType(text));

      if(text.length >= PREVIEW_LENGTH - 1) {
        setFileContent(text + "...");
      } else {
        setFileContent(text);
      }

    } catch (error) {
      console.error("Error fetching file content:", error);
      setFileContent("File not found or could not be loaded.");  
    }
  }, []);

  const fetchFileContent = useCallback(async (queryId, callId, isRequest, contentType) => {
    try {
      const reqResp = isRequest ? "request" : "response";
      const fullUrl = `${baseUrl}/query/${queryId}/call/${callId}/${reqResp}`;

      const response = await fetch(fullUrl, {
        headers: {
          'Accept-Encoding': 'gzip,deflate'
        }
      });
      
      const blob = await response.blob();

      setFileBlob(blob);

      const fileName = `${queryId}_${callId}_${reqResp}.${contentType}`;
      saveAs(blob, fileName);

    } catch (error) {
      console.error("Error fetching file content:", error);
    }
  }, []);


  const handleOpen = (event) => {
    fetchPreviewContent(queryId, nodeId, isRequest, setContentType);
    setOpen(true);
    event.stopPropagation();
  };

  const handleClose = (event) => {
    setOpen(false);
    event.stopPropagation();
  };

  const handleDownload = (event) => {
    fetchFileContent(queryId, nodeId, isRequest, contentType);
    event.stopPropagation();
  };

  const icon = isRequest ? <InputIcon /> : <OutputIcon />;
  const iconTitle = isRequest ? "Request" : "Response";

  return (
    <div>
      <Tooltip title={iconTitle}>
        <IconButton onClick={handleOpen} aria-label={iconTitle}>
          {icon}
        </IconButton>
      </Tooltip>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={modalStyle} className="modal-content">
          <Button
              onClick={handleDownload}
              variant="contained"
              startIcon={<DownloadIcon />}
              className="fancy-button"
            >
              Download
            </Button>
          <JSONPretty id="json-pretty" data={fileContent} theme={JSONPretty.monikai} className="json-pretty"></JSONPretty>
        </Box>
      </Modal>
    </div>
  );
}

export default ReqRespIconButton;
