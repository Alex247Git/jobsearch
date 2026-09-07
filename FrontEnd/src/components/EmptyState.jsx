import React from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import InboxIcon from '@mui/icons-material/Inbox';
import WorkIcon from '@mui/icons-material/Work';
import PeopleIcon from '@mui/icons-material/People';
import MessageIcon from '@mui/icons-material/Message';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import BusinessIcon from '@mui/icons-material/Business';
import SearchIcon from '@mui/icons-material/Search';

const ICONS = {
    inbox: InboxIcon,
    work: WorkIcon,
    people: PeopleIcon,
    message: MessageIcon,
    bookmark: BookmarkIcon,
    business: BusinessIcon,
    search: SearchIcon,
};

export function EmptyState({ 
    icon = 'inbox', 
    title = 'Nothing here yet', 
    message = '',
    actionLabel,
    onAction,
}) {
    const Icon = ICONS[icon] || InboxIcon;
    return (
        <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 3, bgcolor: 'background.paper' }}>
            <Icon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
            <Typography variant="h6" sx={{ mb: 1, color: 'text.primary', fontWeight: 600 }}>
                {title}
            </Typography>
            {message && (
                <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary', maxWidth: 400, mx: 'auto' }}>
                    {message}
                </Typography>
            )}
            {actionLabel && onAction && (
                <Button variant="contained" onClick={onAction} sx={{ mt: 1 }}>
                    {actionLabel}
                </Button>
            )}
        </Paper>
    );
}
