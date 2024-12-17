import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button
} from '@mui/material';

function SessionTimeoutDialog({ open, onClose, onConfirm }) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="session-timeout-dialog"
      aria-describedby="session-timeout-description"
    >
      <DialogTitle>
        Phiên làm việc đã hết hạn
      </DialogTitle>
      <DialogContent>
        <DialogContentText id="session-timeout-description">
          Phiên làm việc của bạn đã hết hạn. Vui lòng đăng nhập lại để tiếp tục.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onConfirm} variant="contained" autoFocus>
          Đăng nhập lại
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default SessionTimeoutDialog;