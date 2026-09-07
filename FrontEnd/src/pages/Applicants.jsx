import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { socket } from '../services/socket';
import {
    Container, Box, Paper, Stack, Typography, Button, Card, CardContent, CardActions,
    Dialog, DialogTitle, DialogContent, DialogActions, TextField, Alert,
    CircularProgress, Chip, IconButton,
} from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import { apiFetch } from '../api';

function Applicants({ user }) {
    const [applicants, setApplicants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCandidate, setSelectedCandidate] = useState(null);
    const [selectedCandidateName, setSelectedCandidateName] = useState('');
    const [messageText, setMessageText] = useState('');
    const [accepting, setAccepting] = useState(null);
    const [declining, setDeclining] = useState(null);
    const navigate = useNavigate();
    const user_id = user?.user_id;

    useEffect(() => {
        if (!user_id) { setLoading(false); return; }
        apiFetch(`/applications/employer/${user_id}`)
            .then(r => { if (!r.ok) throw new Error(); return r.json(); })
            .then(d => { setApplicants(d.filter(a => a.application_status !== 'accepted')); setLoading(false); })
            .catch(() => setLoading(false));
    }, [user_id]);

    const handleSendMessage = async () => {
        if (!user_id || !selectedCandidate || !messageText.trim()) return;
        try {
            const res = await apiFetch('/messages', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sender_id: user_id, receiver_id: selectedCandidate, message: messageText.trim() }),
            });
            const newMessage = await res.json();
            if (newMessage.message_id) {
                socket.emit('sendMessage', newMessage);
                setMessageText(''); setSelectedCandidate(null);
            }
        } catch (err) { console.error(err); }
    };

    const handleAction = async (application_id, action) => {
        const status = action === 'accept' ? 'accepted' : 'declined';
        if (action === 'accept') setAccepting(application_id); else setDeclining(application_id);
        try {
            await apiFetch(`/applications/application/${application_id}`, {
                method: 'PUT', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status }),
            });
            setApplicants(prev => prev.map(a => a.application_id === application_id ? { ...a, application_status: status } : a));
        } catch (err) { console.error(err); }
        finally { action === 'accept' ? setAccepting(null) : setDeclining(null); }
    };

    if (!user_id) return <Container sx={{ mt: 4 }}><Alert severity="warning">Please log in.</Alert></Container>;
    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}><CircularProgress /></Box>;

    return (
        <Container maxWidth="lg" sx={{ py: 6 }}>
            <Typography variant="h4" sx={{ mb: 4 }}>Applicants</Typography>
            {applicants.length === 0 ? (
                <Alert severity="info">No pending applicants.</Alert>
            ) : (
                <Stack spacing={2}>
                    {applicants.map(a => (
                        <Card key={a.application_id}>
                            <CardContent>
                                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                                    <Box>
                                        <Typography variant="h6">{a.candidate_first_name} {a.candidate_last_name}</Typography>
                                        <Typography variant="body2" color="text.secondary">{a.candidate_email}</Typography>
                                    </Box>
                                    <Chip label={a.application_status} size="small" color={a.application_status === 'declined' ? 'error' : 'default'} />
                                </Stack>
                                <Typography variant="body2" sx={{ mt: 1 }}>Applied for: <strong>{a.job_title}</strong></Typography>
                                <Typography variant="caption" color="text.secondary">
                                    {new Date(a.application_date).toLocaleString()}
                                </Typography>
                            </CardContent>
                            <CardActions sx={{ gap: 1, flexWrap: 'wrap' }}>
                                <Button size="small" onClick={() => navigate(`/Profile/${a.candidate_id}`)}>View Profile</Button>
                                <Button size="small" startIcon={<EmailIcon />}
                                    onClick={() => {
                                        setSelectedCandidate(a.candidate_id);
                                        setSelectedCandidateName(`${a.candidate_first_name} ${a.candidate_last_name}`);
                                        setMessageText('');
                                    }}>Message</Button>
                                {a.application_status !== 'accepted' && (
                                    <Button size="small" color="success" variant="contained" disabled={accepting === a.application_id}
                                        onClick={() => handleAction(a.application_id, 'accept')}>
                                        {accepting === a.application_id ? 'Accepting...' : 'Accept'}
                                    </Button>
                                )}
                                {a.application_status !== 'declined' && (
                                    <Button size="small" color="error" variant="outlined" disabled={declining === a.application_id}
                                        onClick={() => handleAction(a.application_id, 'decline')}>
                                        {declining === a.application_id ? 'Declining...' : 'Decline'}
                                    </Button>
                                )}
                            </CardActions>
                        </Card>
                    ))}
                </Stack>
            )}

            <Dialog open={!!selectedCandidate} onClose={() => setSelectedCandidate(null)} fullWidth maxWidth="sm">
                <DialogTitle>
                    Message to {selectedCandidateName}
                    <IconButton onClick={() => setSelectedCandidate(null)} sx={{ position: 'absolute', right: 8, top: 8 }}>
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    <TextField fullWidth multiline rows={4} value={messageText}
                        onChange={(e) => setMessageText(e.target.value)} placeholder="Type a message..." autoFocus />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setSelectedCandidate(null)}>Cancel</Button>
                    <Button variant="contained" startIcon={<SendIcon />} onClick={handleSendMessage} disabled={!messageText.trim()}>
                        Send
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
}

export default Applicants;
