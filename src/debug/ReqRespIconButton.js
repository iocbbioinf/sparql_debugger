import React, { useState } from 'react';
import { IconButton, Tooltip, Modal, Box } from '@mui/material';
import InputIcon from '@mui/icons-material/Input';
import OutputIcon from '@mui/icons-material/Output';
import JSONPretty from 'react-json-pretty';
import { fetchFileContent } from './utils/api';
import modalStyle from './styles/modalStyle'; 

function ReqRespIconButton({ queryId, nodeId, isRequest }) {
  const [open, setOpen] = useState(false);
  const [fileContent, setFileContent] = useState('');

  const handleOpen =  (event) => {
    const response = fetchFileContent(queryId, nodeId, isRequest);
    setFileContent(response);
    setOpen(true);
    event.stopPropagation();
  };

  const handleClose = () => {
    setOpen(false);
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
        <Box sx={modalStyle}>
          <JSONPretty id="json-pretty" data={fileContent} theme={JSONPretty.monikai}></JSONPretty>
        </Box>
      </Modal>
    </div>
  );
}

export default ReqRespIconButton;