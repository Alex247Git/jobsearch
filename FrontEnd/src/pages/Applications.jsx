import React, { useEffect, useState } from 'react';
import {
    Container, Box, Paper, Stack, Typography, Button, Card, CardContent, CardActions,
    CircularProgress, Alert,
} from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import DeleteIcon from '@mui/icons-material/Delete';
import { apiFetch } from '../api';

function Applications({ user }) {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const user_id = user?.user_id;

    useEffect(() => {
        if (!user_id) { setLoading(false); return; }
        apiFetch(`/applications/candidate/${user_id}`)
            .then(r => { if (!r.ok) throw new Error(); return r.json(); })
            .then(d => { setApplications(d); setLoading(false); })
            .catch(() => setLoading(false));
    }, [user_id]);

    const handleDelete = (applicationId) => {
        if (!window.confirm('Delete this application?')) return;
        apiFetch(`/applications/${applicationId}`, { method: 'DELETE' })
            .then(r => { if (!r.ok) throw new Error(); return r.json(); })
            .then(() => setApplications(a => a.filter(x => x.application_id !== applicationId)))
            .catch(err => console.error(err));
    };

    if (!user_id) return <Container sx={{ mt: 4 }}><Alert severity="warning">Please log in.</Alert></Container>;
    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}><CircularProgress /></Box>;
    if (applications.length === 0) return <Container sx={{ mt: 4 }}><Alert severity="info">You haven't applied to any jobs yet.</Alert></Container>;

    return (
        <Container maxWidth="md" sx={{ py: 6 }}>
            <Typography variant="h4" sx={{ mb: 4 }}>Your Applications</Typography>
            <Stack spacing={2}>
                {applications.map(app => (
                    <Card key={app.application_id}>
                        <CardContent>
                            <Typography variant="h6">{app.job_title}</Typography>
                            <Typography color="text.secondary">{app.company_name}</Typography>
                            <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
                                <Stack direction="row" spacing={0.5} alignItems="center">
                                    <LocationOnIcon fontSize="small" color="action" />
                                    <Typography variant="body2">{app.company_location}</Typography>
                                </Stack>
                                <Stack direction="row" spacing={0.5} alignItems="center">
                                    <AttachMoneyIcon fontSize="small" color="action" />
                                    <Typography variant="body2">${app.job_salary}</Typography>
                                </Stack>
                            </Stack>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                                Applied: {new Date(app.application_date).toLocaleString()}
                            </Typography>
                        </CardContent>
                        <CardActions>
                            <Button color="error" size="small" startIcon={<DeleteIcon />} onClick={() => handleDelete(app.application_id)}>
                                Delete
                            </Button>
                        </CardActions>
                    </Card>
                ))}
            </Stack>
        </Container>
    );
}

export default Applications;
