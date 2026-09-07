import React, { createContext, useContext, useState, useCallback } from 'react';
import { Snackbar, Alert, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
    const [notification, setNotification] = useState(null);

    const showNotification = useCallback((message, severity = 'info', duration = 4000) => {
        setNotification({ message, severity, open: true, id: Date.now() });
        if (duration > 0) {
            setTimeout(() => {
                setNotification(prev => prev ? { ...prev, open: false } : null);
            }, duration);
        }
    }, []);

    const hideNotification = useCallback(() => {
        setNotification(prev => prev ? { ...prev, open: false } : null);
    }, []);

    const notify = {
        success: (msg, duration) => showNotification(msg, 'success', duration),
        error: (msg, duration) => showNotification(msg, 'error', duration),
        warning: (msg, duration) => showNotification(msg, 'warning', duration),
        info: (msg, duration) => showNotification(msg, 'info', duration),
    };

    return (
        <NotificationContext.Provider value={notify}>
            {children}
            {notification && (
                <Snackbar
                    open={notification.open}
                    autoHideDuration={notification.id ? 4000 : null}
                    onClose={hideNotification}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    sx={{ bottom: { xs: 90, sm: 24 } }}
                >
                    <Alert
                        severity={notification.severity}
                        variant="filled"
                        action={
                            <IconButton size="small" color="inherit" onClick={hideNotification}>
                                <CloseIcon fontSize="small" />
                            </IconButton>
                        }
                        sx={{ width: '100%', minWidth: 280 }}
                    >
                        {notification.message}
                    </Alert>
                </Snackbar>
            )}
        </NotificationContext.Provider>
    );
}

export function useNotification() {
    const context = useContext(NotificationContext);
    if (!context) throw new Error('useNotification must be used within NotificationProvider');
    return context;
}
