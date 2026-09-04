import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';

function MessageDialog({
    open, onClose, title, messageText, onMessageChange, onSend,
}) {
    return (
<Dialog
    open={open}
    onClose={onClose}
    maxWidth="sm"
    fullWidth
>
    <DialogTitle>
        Message Employer for: {title}
    </DialogTitle>
    <DialogContent>
        <TextField
            autoFocus
            margin="dense"
            label="Your Message"
            fullWidth
            multiline
            rows={4}
            value={messageText}
            onChange={(e) => onMessageChange(e.target.value)}
            placeholder="Type your message to the employer..."
        />
    </DialogContent>
    <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
            onClick={onSend}
            variant="contained"
            startIcon={<SendIcon />}
        >
            Send Message
        </Button>
    </DialogActions>
</Dialog>
    );
}

export default MessageDialog;
