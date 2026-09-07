import React, { useEffect, useState, useRef } from "react";
import { socket, connectSocket, disconnectSocket } from "../services/socket";
import {
    Box, Paper, Stack, Typography, Avatar, TextField, IconButton, Divider, Alert,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { apiFetch } from '../api';
import { useNotification } from '../context/NotificationContext';

function Messages({ user }) {
    const [conversations, setConversations] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState('');
    const messagesEndRef = useRef(null);
    const notify = useNotification();

    // Normalize to string once - JWT payload comes as number from API,
    // but the same id can come back as either type from different paths
    // (localStorage, JWT decode, route params). Comparing strings avoids
    // subtle "all messages look like theirs" bugs.
    const meId = user?.user_id != null ? String(user.user_id) : null;

    // Fetch conversations only when the logged-in user changes.
    useEffect(() => {
        if (!meId) return;
        connectSocket(meId);
        apiFetch(`/messages/conversations/${meId}`)
            .then(res => res.json())
            .then(data => setConversations(Array.isArray(data) ? data : []))
            .catch(err => console.error('Error fetching conversations:', err));
        return () => disconnectSocket();
    }, [meId]);

    // Listen for incoming socket messages. Only push if it belongs to
    // the currently open conversation. We track by string id to avoid
    // type-mismatch edge cases.
    useEffect(() => {
        const handle = (data) => {
            const sid = data.sender_id != null ? String(data.sender_id) : null;
            const rid = data.receiver_id != null ? String(data.receiver_id) : null;
            if (!selectedUser) return;
            const otherId = String(selectedUser.user_id);
            if (sid === otherId || rid === otherId) {
                setMessages(prev => {
                    // de-dupe in case socket + local echo deliver the same row
                    if (prev.some(m => m.message_id && m.message_id === data.message_id)) return prev;
                    return [...prev, data];
                });
            }
        };
        socket.on('receiveMessage', handle);
        return () => socket.off('receiveMessage', handle);
    }, [selectedUser?.user_id]);

    const loadMessages = (conv) => {
        setSelectedUser(conv);
        if (!meId) return;
        apiFetch(`/messages/${meId}/${conv.user_id}`)
            .then(res => res.json())
            .then(d => { setMessages(Array.isArray(d) ? d : []); setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50); })
            .catch(err => console.error('Error fetching messages:', err));
    };

    const sendMessage = () => {
        if (!message.trim() || !selectedUser || !meId) return;
        const payload = {
            sender_id: meId,
            receiver_id: selectedUser.user_id,
            message,
        };
        apiFetch('/messages', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        })
        .then(r => r.json())
        .then(saved => {
            const newMessage = {
                message_id: saved.messageId || saved.message_id,
                sender_id: Number(meId),
                receiver_id: selectedUser.user_id,
                message,
                created_at: new Date().toISOString(),
            };
            setMessages(p => [...p, newMessage]);
            setMessage('');
            socket.emit('sendMessage', newMessage);
            notify.success('Message sent!');
            setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
        })
        .catch(err => {
            console.error('Error sending message:', err);
            notify.error('Failed to send message. Please try again.');
        });
    };

    return (
        <Box sx={{ display: 'flex', height: 'calc(100vh - 200px)', border: 1, borderColor: 'divider', borderRadius: 2, overflow: 'hidden' }}>
            <Paper sx={{ width: 300, flexShrink: 0, borderRadius: 0, borderRight: 1, borderColor: 'divider' }} elevation={0}>
                <Typography variant="h6" sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>Chats</Typography>
                <Box sx={{ overflowY: 'auto', height: 'calc(100% - 64px)' }}>
                    {conversations.length === 0 ? (
                        <Typography sx={{ p: 3, color: 'text.secondary', textAlign: 'center', fontStyle: 'italic' }}>
                            No conversations yet
                        </Typography>
                    ) : conversations.map(conv => {
                        const convId = String(conv.user_id);
                        const isActive = selectedUser && String(selectedUser.user_id) === convId;
                        return (
                            <Stack key={conv.user_id} direction="row" spacing={1.5} alignItems="center"
                                onClick={() => loadMessages(conv)}
                                sx={{ p: 1.5, cursor: 'pointer', bgcolor: isActive ? 'action.selected' : 'transparent',
                                    '&:hover': { bgcolor: 'action.hover' } }}>
                                <Avatar sx={{ bgcolor: 'primary.main', width: 40, height: 40 }}>
                                    {conv.first_name?.charAt(0)}
                                </Avatar>
                                <Box>
                                    <Typography fontWeight="bold">{conv.first_name} {conv.last_name}</Typography>
                                    <Typography variant="caption" color="text.secondary">Click to view chat</Typography>
                                </Box>
                            </Stack>
                        );
                    })}
                </Box>
            </Paper>
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                {conversations.length === 0 ? (
                    <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Typography color="text.secondary">No open conversations</Typography>
                    </Box>
                ) : selectedUser ? (
                    <>
                        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                            <Typography variant="h6">{selectedUser.first_name} {selectedUser.last_name}</Typography>
                        </Box>
                        <Box sx={{ flex: 1, overflowY: 'auto', p: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
                            {messages.map((m, i) => {
                                // String compare to avoid number/string mismatch
                                const mine = m.sender_id != null && String(m.sender_id) === meId;
                                return (
                                    <Box key={m.message_id || i} sx={{
                                        alignSelf: mine ? 'flex-end' : 'flex-start',
                                        bgcolor: mine ? '#DCFCE7' : 'grey.100',
                                        color: 'text.primary',
                                        maxWidth: '60%', px: 2, py: 1, borderRadius: 2,
                                    }}>
                                        <Typography variant="body2">{m.message}</Typography>
                                    </Box>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </Box>
                        <Stack direction="row" spacing={1} sx={{ p: 1.5, borderTop: 1, borderColor: 'divider' }}>
                            <TextField fullWidth size="small" placeholder="Type a message..." value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter') sendMessage(); }} />
                            <IconButton color="primary" onClick={sendMessage} disabled={!message.trim()}>
                                <SendIcon />
                            </IconButton>
                        </Stack>
                    </>
                ) : (
                    <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Typography color="text.secondary">Select a conversation to start chatting</Typography>
                    </Box>
                )}
            </Box>
        </Box>
    );
}

export default Messages;
