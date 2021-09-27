/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';

import {
  Button,
  Dialog as MuiDialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@material-ui/core';

export const DefaultDialogComponent = ({
  open,
  onClose,
  onSuccess,
  title = 'Dialog',
  okText = 'Ok',
  noText = 'Cancel',
  message = 'Message',
  Dialog = MuiDialog,
}) => (
  <Dialog open={open} onClose={onClose}>
    <DialogTitle>{title}</DialogTitle>
    <DialogContent dividers>{message}</DialogContent>
    <DialogActions>
      <Button onClick={onClose}>{noText}</Button>
      <Button variant="contained" color="primary" onClick={onSuccess}>
        {okText}
      </Button>
    </DialogActions>
  </Dialog>
);

export const DialogComponent = ({ Dialog = DefaultDialogComponent, ...props }) => (
  <Dialog {...props} />
);

export const DialogContext = React.createContext({});

export const DialogProvider = ({ children }) => {
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [{ config, resolve, reject }, setConfig] = React.useState({});

  const openDialog = (callback) => {
    setDialogOpen(true);
    setConfig(callback);
  };

  const resetDialog = () => {
    setConfig({});
    setDialogOpen(false);
  };

  const onConfirm = (e) => {
    resolve(e);
    resetDialog();
  };

  const onCancel = (e) => {
    reject(e);
    resetDialog();
  };

  return (
    <DialogContext.Provider value={{ openDialog }}>
      {/* eslint-disable-next-line react/jsx-props-no-spreading */}
      <DialogComponent {...config} open={dialogOpen} onSuccess={onConfirm} onClose={onCancel} />
      {children}
    </DialogContext.Provider>
  );
};

export const useDialog = () => {
  const { openDialog } = React.useContext(DialogContext);

  const showDialog = (config) =>
    new Promise((resolve, reject) => openDialog({ config, resolve, reject }));

  return { showDialog };
};
