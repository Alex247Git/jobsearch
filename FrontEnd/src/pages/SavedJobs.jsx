import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Container, Box, Paper, Stack, Typography, Button, Card, CardContent, CardActions,
    CircularProgress, Alert,
} from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import DeleteIcon from '@mui/icons-material/Delete';
import { apiFetch } from '../api';

function SavedJobs({ user }) {
    const [savedJobs, setSavedJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const user_id = user?.user_id;

    useEffect(() => {
        if (!user_id) { setLoading(false); return; }
        apiFetch(`/saved_jobs/${user_id}`)
            .then(r => { if (!r.ok) throw new Error(); return r.json(); })
            .then(d => { setSavedJobs(d); setLoading(false); })
            .catch(() => setLoading(false));
    }, [user_id]);

    const handleRemoveJob = (jobId) => {
        apiFetch(`/saved_jobs/${user_id}/${jobId}`, { method: 'DELETE' })
            .then(r => { if (!r.ok) throw new Error(); return r.json(); })
            .then(() => setSavedJobs(s => s.filter(j => j.job_id !== jobId)))
            .catch(err => console.error(err));
    };

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}><CircularProgress /></Box>;
    if (!user_id) return <Container sx={{ mt: 4 }}><Alert severity="warning">Please log in.</Alert></Container>;
    if (savedJobs.length === 0) return <Container sx={{ mt: 4 }}><Alert severity="info">You have no saved jobs.</Alert></Container>;

    return (
        <Container maxWidth="md" sx={{ py: 6 }}>
            <Typography variant="h4" sx={{ mb: 4 }}>Your Saved Jobs</Typography>
            <Stack spacing={2}>
                {savedJobs.map(job => (
                    <Card key={job.job_id} sx={{ cursor: 'pointer' }} onClick={() => navigate(`/job/${job.job_id}`)}>
                        <CardContent>
                            <Typography variant="h6">{job.title}</Typography>
                            <Typography color="text.secondary" sx={{ mb: 1 }}>{job.company_name}</Typography>
                            <Stack direction="row" spacing={2} sx={{ mb: 1 }}>
                                <Stack direction="row" spacing={0.5} alignItems="center">
                                    <LocationOnIcon fontSize="small" color="action" />
                                    <Typography variant="body2">{job.location}</Typography>
                                </Stack>
                                <Stack direction="row" spacing={0.5} alignItems="center">
                                    <AttachMoneyIcon fontSize="small" color="action" />
                                    <Typography variant="body2">${job.salary?.toLocaleString()}</Typography>
                                </Stack>
                                <Typography variant="body2">• {job.job_type} • {job.remote_option}</Typography>
                            </Stack>
                            <Typography variant="body2" color="text.secondary">{job.description?.slice(0, 120)}...</Typography>
                        </CardContent>
                        <CardActions>
                            <Button size="small" color="error" startIcon={<DeleteIcon />}
                                onClick={(e) => { e.stopPropagation(); handleRemoveJob(job.job_id); }}>
                                Remove
                            </Button>
                        </CardActions>
                    </Card>
                ))}
            </Stack>
        </Container>
    );
}

export default SavedJobs;
