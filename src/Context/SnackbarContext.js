import React, { createContext, useState } from 'react';

import { Snackbar } from '@material-ui/core';
import { Alert } from '@material-ui/lab';

export const SnackbarComponent = ({ open, message, severity, hideNotification }) => (
  <Snackbar open={open} autoHideDuration={2000} onClose={hideNotification}>
    <Alert elevation={6} variant="filled" severity={severity} onClose={hideNotification}>
      {message}
    </Alert>
  </Snackbar>
);

export const SnackbarContext = createContext();

export function SnackbarProvider({ children }) {
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: '',
  });

  const hideNotification = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setNotification({
      open: false,
      message: notification.message,
      severity: notification.severity,
    });
  };

  return (
    <SnackbarContext.Provider
      value={{
        setNotification,
        hideNotification,
      }}
    >
      {children}
      <SnackbarComponent
        open={notification.open}
        message={notification.message}
        severity={notification.severity}
        hideNotification={hideNotification}
      />
    </SnackbarContext.Provider>
  );
}

export function useSnackbar() {
  const context = React.useContext(SnackbarContext);
  if (context === undefined) {
    throw new Error('useSnackbar must be used within a SnackbarProvider');
  }
  return context;
}
