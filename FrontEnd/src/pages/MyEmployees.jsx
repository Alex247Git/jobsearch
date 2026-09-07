import React, { useEffect, useState } from 'react';
import {
    Container, Box, Paper, Stack, Typography, TextField, Select, MenuItem, FormControl, InputLabel,
    Button, Alert, Divider, Link as MuiLink, Box as MuiBox,
} from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import SchoolIcon from '@mui/icons-material/School';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import LanguageIcon from '@mui/icons-material/Language';
import { apiFetch } from '../api';

const MyEmployees = () => {
    const [employees, setEmployees] = useState([]);
    const [ratings, setRatings] = useState({});
    const [comments, setComments] = useState({});
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const employerId = localStorage.getItem('user_id');

    useEffect(() => {
        if (!employerId) return;
        apiFetch(`/employed/employer/${employerId}`)
            .then(r => r.json()).then(setEmployees)
            .catch(err => setError('Failed to load employees'));
    }, [employerId]);

    const handleSubmit = async (candidateId) => {
        const rating = ratings[candidateId];
        const comment = comments[candidateId];
        if (!rating) { setMessage('Please select a rating.'); return; }
        try {
            const r = await apiFetch('/candidate_ratings', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ candidate_id: candidateId, employer_id: employerId, rating, comment }),
            });
            const data = await r.json();
            setMessage(r.ok ? (data.message || 'Rating submitted') : (data.error || 'Failed to submit'));
        } catch { setMessage('Error submitting rating'); }
    };

    return (
        <Container maxWidth="lg" sx={{ py: 6 }}>
            <Typography variant="h4" sx={{ mb: 4 }}>My Employees</Typography>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
            {employees.length === 0 ? (
                <Alert severity="info">No employees found.</Alert>
            ) : (
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 3 }}>
                    {employees.map(emp => (
                        <Paper key={emp.user_id} sx={{ p: 3 }} elevation={1}>
                            <Typography variant="h6">{emp.first_name} {emp.last_name}</Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>{emp.email}</Typography>
                            <Divider sx={{ my: 1.5 }} />
                            <Stack spacing={0.5} sx={{ mb: 2 }}>
                                {emp.location && <Stack direction="row" spacing={0.5} alignItems="center"><LocationOnIcon fontSize="small" color="action" /><Typography variant="body2">{emp.location}</Typography></Stack>}
                                {emp.education && <Stack direction="row" spacing={0.5} alignItems="center"><SchoolIcon fontSize="small" color="action" /><Typography variant="body2">{emp.education}</Typography></Stack>}
                                {emp.certifications && <Stack direction="row" spacing={0.5} alignItems="center"><EmojiEventsIcon fontSize="small" color="action" /><Typography variant="body2">{emp.certifications}</Typography></Stack>}
                                {emp.languages && <Stack direction="row" spacing={0.5} alignItems="center"><LanguageIcon fontSize="small" color="action" /><Typography variant="body2">{emp.languages}</Typography></Stack>}
                            </Stack>
                            {(emp.website || emp.social_links) && (
                                <Stack spacing={0.5} sx={{ mb: 2 }}>
                                    {emp.website && <MuiLink href={emp.website} target="_blank" rel="noopener noreferrer">Website</MuiLink>}
                                    {emp.social_links && <MuiLink href={emp.social_links} target="_blank" rel="noopener noreferrer">Social</MuiLink>}
                                </Stack>
                            )}
                            <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                                <InputLabel>Rating</InputLabel>
                                <Select value={ratings[emp.user_id] || ''} label="Rating"
                                    onChange={(e) => setRatings({ ...ratings, [emp.user_id]: e.target.value })}>
                                    <MenuItem value="">Select rating</MenuItem>
                                    {[1, 2, 3, 4, 5].map(n => <MenuItem key={n} value={n}>{n} Star{n > 1 ? 's' : ''}</MenuItem>)}
                                </Select>
                            </FormControl>
                            <TextField fullWidth multiline rows={3} size="small" placeholder="Write a comment..."
                                value={comments[emp.user_id] || ''} sx={{ mb: 2 }}
                                onChange={(e) => setComments({ ...comments, [emp.user_id]: e.target.value })} />
                            <Button variant="contained" onClick={() => handleSubmit(emp.user_id)}>Submit Rating</Button>
                        </Paper>
                    ))}
                </Box>
            )}
        </Container>
    );
};

export default MyEmployees;
