import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Container, Paper, Stack, Typography, Button, Box, Divider, Dialog, DialogTitle,
    DialogContent, DialogActions, TextField, IconButton, Alert, CircularProgress,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import WorkIcon from '@mui/icons-material/Work';
import HomeWorkIcon from '@mui/icons-material/HomeWork';
import { apiFetch } from '../api';

function JobDetails({ user }) {
    const { jobId } = useParams();
    const navigate = useNavigate();
    const [job, setJob] = useState(null);
    const [appliedJobs, setAppliedJobs] = useState([]);
    const [savedJobs, setSavedJobs] = useState([]);
    const [messageText, setMessageText] = useState('');
    const [chatHistory, setChatHistory] = useState([]);
    const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);

    useEffect(() => {
        apiFetch(`/jobs/${jobId}`).then(r => r.json()).then(setJob).catch(console.error);
    }, [jobId]);

    useEffect(() => {
        if (!user?.user_id) return;
        apiFetch(`/applications/candidate/${user.user_id}`).then(r => r.json())
            .then(d => setAppliedJobs(d.map(a => a.job_id))).catch(console.error);
        apiFetch(`/saved_jobs/${user.user_id}`).then(r => r.json())
            .then(d => setSavedJobs(d.map(s => s.job_id))).catch(console.error);
    }, [user?.user_id]);

    const handleApplication = () => {
        if (!user?.user_id) return alert('Log in to apply.');
        if (appliedJobs.includes(job.job_id)) return;
        apiFetch('/applications', { method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: user.user_id, job_id: job.job_id, status: 'pending' }) })
            .then(r => r.json()).then(() => setAppliedJobs(p => [...p, job.job_id]));
    };

    const handleSaveJob = () => {
        if (!user?.user_id) return alert('Log in to save.');
        if (savedJobs.includes(job.job_id)) return;
        apiFetch('/saved_jobs', { method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: user.user_id, job_id: job.job_id, role: user.role }) })
            .then(r => r.json()).then(() => setSavedJobs(p => [...p, job.job_id]));
    };

    const fetchChatHistory = (senderId, receiverId) => {
        apiFetch(`/messages/${senderId}/${receiverId}`).then(r => r.json()).then(setChatHistory).catch(console.error);
    };

    const handleSendMessage = () => {
        if (!user?.user_id || !messageText.trim() || !job) return;
        apiFetch('/messages', { method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sender_id: user.user_id, receiver_id: job.employer_id, message: messageText.trim() }) })
            .then(r => r.json()).then(d => {
                if (d.message_id) { setChatHistory(p => [...p, d]); setMessageText(''); }
            });
    };

    if (!job) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}><CircularProgress /></Box>;
    const isApplied = appliedJobs.includes(job.job_id);
    const isSaved = savedJobs.includes(job.job_id);

    return (
        <Container maxWidth="md" sx={{ py: 6 }}>
            <Paper sx={{ p: 4, borderRadius: 3 }} elevation={1}>
                <Typography variant="h4" sx={{ mb: 1 }}>{job.title}</Typography>
                <Typography color="text.secondary" sx={{ mb: 3 }}>{job.company_name}</Typography>
                <Stack direction="row" spacing={3} sx={{ mb: 3 }} flexWrap="wrap">
                    <Stack direction="row" spacing={0.5} alignItems="center"><LocationOnIcon fontSize="small" color="action" /><Typography>{job.location}</Typography></Stack>
                    <Stack direction="row" spacing={0.5} alignItems="center"><WorkIcon fontSize="small" color="action" /><Typography>{job.job_type}</Typography></Stack>
                    <Stack direction="row" spacing={0.5} alignItems="center"><HomeWorkIcon fontSize="small" color="action" /><Typography>{job.remote_option ? 'Remote' : 'On-site'}</Typography></Stack>
                    <Stack direction="row" spacing={0.5} alignItems="center"><AttachMoneyIcon fontSize="small" color="action" /><Typography>${job.salary?.toLocaleString()}</Typography></Stack>
                </Stack>
                <Divider sx={{ my: 2 }} />
                <Typography sx={{ mb: 3 }}>{job.description}</Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ gap: 1 }}>
                    <Button variant="contained" color={isApplied ? 'success' : 'primary'} disabled={isApplied} onClick={handleApplication}>
                        {isApplied ? 'Applied ✓' : 'Apply Now'}
                    </Button>
                    <Button variant="outlined" color={isSaved ? 'success' : 'primary'} disabled={isSaved} onClick={handleSaveJob}>
                        {isSaved ? 'Saved ✓' : 'Save Job'}
                    </Button>
                    <Button variant="outlined" onClick={() => {
                        setIsMessageModalOpen(true); setMessageText('');
                        if (user?.user_id) fetchChatHistory(user.user_id, job.employer_id);
                    }}>Message Employer</Button>
                    <Button onClick={() => job.employer_id && navigate(`/profile/${job.employer_id}`)}>View Employer</Button>
                    <Button onClick={() => navigate(`/companies/${job.company_id}`)}>View Company</Button>
                </Stack>

                {chatHistory.length > 0 && (
                    <>
                        <Divider sx={{ my: 3 }} />
                        <Typography variant="h6" sx={{ mb: 1 }}>Chat History</Typography>
                        <Stack spacing={1} sx={{ maxHeight: 200, overflowY: 'auto' }}>
                            {chatHistory.map((m, i) => (
                                <Box key={i} sx={{
                                    alignSelf: m.sender_id === user?.user_id ? 'flex-end' : 'flex-start',
                                    bgcolor: m.sender_id === user?.user_id ? '#DCFCE7' : 'grey.100',
                                    px: 2, py: 1, borderRadius: 2, maxWidth: '70%',
                                }}>
                                    <Typography variant="body2">{m.message}</Typography>
                                </Box>
                            ))}
                        </Stack>
                    </>
                )}
            </Paper>

            <Dialog open={isMessageModalOpen} onClose={() => setIsMessageModalOpen(false)} fullWidth maxWidth="sm">
                <DialogTitle>
                    Message to {job.title}
                    <IconButton onClick={() => setIsMessageModalOpen(false)} sx={{ position: 'absolute', right: 8, top: 8 }}>
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    <TextField fullWidth multiline rows={4} value={messageText} placeholder="Type a message..."
                        onChange={(e) => setMessageText(e.target.value)} autoFocus />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setIsMessageModalOpen(false)}>Close</Button>
                    <Button variant="contained" startIcon={<SendIcon />} onClick={handleSendMessage} disabled={!messageText.trim()}>
                        Send
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
}

export default JobDetails;
