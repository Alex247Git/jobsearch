import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box, Container, Paper, Stack, Typography, TextField, Select, MenuItem, FormControl, InputLabel,
    Button, Chip, Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Alert, Divider,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import StarIcon from '@mui/icons-material/Star';
import { apiFetch } from '../api';

function Candidates({ user }) {
    const [candidates, setCandidates] = useState([]);
    const [recommendedCandidates, setRecommendedCandidates] = useState([]);
    const [jobs, setJobs] = useState([]);
    const [searchName, setSearchName] = useState('');
    const [locationFilter, setLocationFilter] = useState('');
    const [availabilityFilter, setAvailabilityFilter] = useState('');
    const [jobFilter, setJobFilter] = useState('');
    const [selectedCandidate, setSelectedCandidate] = useState(null);
    const [selectedCandidateName, setSelectedCandidateName] = useState('');
    const [messageText, setMessageText] = useState('');
    const [chatHistory, setChatHistory] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        apiFetch('/candidates').then(r => r.json()).then(setCandidates).catch(console.error);
    }, []);

    useEffect(() => {
        if (!user?.user_id) return;
        const url = `/recommendations/candidates/${user.user_id}?limit=10&offset=0` + (jobFilter ? `&job_id=${jobFilter}` : '');
        apiFetch(url).then(r => r.json()).then(d => setRecommendedCandidates(Array.isArray(d) ? d : [])).catch(console.error);
        apiFetch(`/jobs/employer/${user.user_id}`).then(r => r.json()).then(setJobs).catch(console.error);
    }, [user?.user_id, jobFilter]);

    const filtered = candidates.filter(c => {
        if (searchName && !`${c.first_name} ${c.last_name}`.toLowerCase().includes(searchName.toLowerCase())) return false;
        if (locationFilter && !c.location?.toLowerCase().includes(locationFilter.toLowerCase())) return false;
        if (availabilityFilter && c.availability !== availabilityFilter) return false;
        return true;
    });
    const recommendedIds = new Set(recommendedCandidates.map(c => c.user_id));
    const available = filtered.filter(c => !recommendedIds.has(c.user_id));

    const openMessage = (id, name) => {
        setSelectedCandidate(id); setSelectedCandidateName(name); setMessageText('');
        if (user?.user_id && id) apiFetch(`/messages/${user.user_id}/${id}`).then(r => r.json()).then(setChatHistory).catch(console.error);
    };

    const sendMessage = async () => {
        if (!user?.user_id || !selectedCandidate || !messageText.trim()) return;
        try {
            const r = await apiFetch('/messages', { method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sender_id: user.user_id, receiver_id: selectedCandidate, message: messageText.trim() }) });
            const m = await r.json();
            if (m.message_id) { setChatHistory(p => [...p, m]); setMessageText(''); }
        } catch (err) { console.error(err); }
    };

    const renderList = (d) => {
        if (Array.isArray(d)) return d.join(', ');
        if (typeof d === 'string') { try { const p = JSON.parse(d); if (Array.isArray(p)) return p.join(', '); } catch {} return d; }
        return d || '';
    };

    const CandidateCard = ({ c, recommended, score }) => (
        <Paper sx={{ p: 2, minWidth: 300, maxWidth: 450, flexShrink: 0, position: 'relative',
            border: recommended ? 2 : 1, borderColor: recommended ? 'warning.main' : 'divider',
            bgcolor: recommended ? '#FFFEF7' : 'background.paper' }} elevation={recommended ? 2 : 1}>
            {recommended && <Chip icon={<StarIcon />} label={`Score ${Number(score).toFixed(2)}`} size="small"
                sx={{ position: 'absolute', top: 8, right: 8 }} color="warning" />}
            <Typography variant="h6">{c.first_name} {c.last_name}</Typography>
            <Stack spacing={0.5} sx={{ mt: 1 }}>
                <Typography variant="body2" color="text.secondary">{c.location}</Typography>
                <Typography variant="body2">Availability: {c.availability === 'Yes' ? '✅' : '❌'}</Typography>
                <Typography variant="body2">{c.bio}</Typography>
                <Typography variant="body2" color="text.secondary">Skills: {renderList(c.skills)}</Typography>
            </Stack>
            <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                <Button size="small" onClick={() => navigate(`/Profile/${c.user_id || c.candidate_id}`)}>View Profile</Button>
                <Button size="small" onClick={() => openMessage(c.user_id || c.candidate_id, `${c.first_name} ${c.last_name}`)}>Message</Button>
            </Stack>
        </Paper>
    );

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
                <Paper sx={{ p: 3, width: 280, flexShrink: 0, alignSelf: 'flex-start' }} elevation={1}>
                    <Typography variant="h6" sx={{ mb: 2 }}>Search & Filters</Typography>
                    <Stack spacing={2}>
                        <TextField fullWidth size="small" label="Name" placeholder="e.g. John Doe"
                            value={searchName} onChange={(e) => setSearchName(e.target.value)} />
                        <FormControl fullWidth size="small">
                            <InputLabel>Job (recommended)</InputLabel>
                            <Select value={jobFilter} label="Job (recommended)" onChange={(e) => setJobFilter(e.target.value)}>
                                <MenuItem value="">All</MenuItem>
                                {jobs.map(j => <MenuItem key={j.job_id} value={j.job_id}>{j.title}</MenuItem>)}
                            </Select>
                        </FormControl>
                        <TextField fullWidth size="small" label="Location" placeholder="e.g. Athens"
                            value={locationFilter} onChange={(e) => setLocationFilter(e.target.value)} />
                        <FormControl fullWidth size="small">
                            <InputLabel>Availability</InputLabel>
                            <Select value={availabilityFilter} label="Availability" onChange={(e) => setAvailabilityFilter(e.target.value)}>
                                <MenuItem value="">All</MenuItem>
                                <MenuItem value="Yes">Available</MenuItem>
                                <MenuItem value="No">Not Available</MenuItem>
                            </Select>
                        </FormControl>
                    </Stack>
                </Paper>

                <Box sx={{ flex: 1 }}>
                    {recommendedCandidates.length > 0 && (
                        <Box sx={{ mb: 4 }}>
                            <Typography variant="h5" sx={{ mb: 2 }}>🎯 Recommended Candidates</Typography>
                            <Stack direction="row" spacing={2} sx={{ overflowX: 'auto', pb: 2 }}>
                                {recommendedCandidates.map(c => (
                                    <CandidateCard key={`rec-${c.recommendation_id}`} c={c} recommended score={c.score} />
                                ))}
                            </Stack>
                        </Box>
                    )}
                    <Typography variant="h5" sx={{ mb: 2 }}>All Candidates</Typography>
                    {available.length === 0 ? (
                        <Alert severity="info">No candidates match your filters.</Alert>
                    ) : (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                            {available.map(c => <CandidateCard key={c.user_id} c={c} />)}
                        </Box>
                    )}
                </Box>
            </Stack>

            <Dialog open={!!selectedCandidate} onClose={() => setSelectedCandidate(null)} fullWidth maxWidth="sm">
                <DialogTitle>
                    Chat with {selectedCandidateName}
                    <IconButton onClick={() => setSelectedCandidate(null)} sx={{ position: 'absolute', right: 8, top: 8 }}>
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    {chatHistory.length > 0 && (
                        <Stack spacing={1} sx={{ maxHeight: 200, overflowY: 'auto', mb: 2 }}>
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
                    )}
                    <TextField fullWidth multiline rows={3} value={messageText} placeholder="Type a message..."
                        onChange={(e) => setMessageText(e.target.value)} autoFocus />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setSelectedCandidate(null)}>Close</Button>
                    <Button variant="contained" startIcon={<SendIcon />} onClick={sendMessage} disabled={!messageText.trim()}>
                        Send
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
}

export default Candidates;
