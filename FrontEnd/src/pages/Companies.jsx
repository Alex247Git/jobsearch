import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
    Container, Box, Paper, Avatar, Typography, Stack, Link as MuiLink,
    Divider, CircularProgress, Alert, Button,
} from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import StarIcon from '@mui/icons-material/Star';
import { apiFetch } from '../api';

function Company() {
    const { companyId } = useParams();
    const [company, setCompany] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!companyId) { setError('No company ID found.'); setLoading(false); return; }
        apiFetch(`/companies/${companyId}`)
            .then(r => { if (!r.ok) throw new Error('Failed'); return r.json(); })
            .then(d => { setCompany(d); setLoading(false); })
            .catch(e => { setError('Failed to load company.'); setLoading(false); });
    }, [companyId]);

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}><CircularProgress /></Box>;
    if (error) return <Container sx={{ mt: 4 }}><Alert severity="error">{error}</Alert></Container>;
    if (!company) return <Container sx={{ mt: 4 }}><Alert severity="info">No company found</Alert></Container>;

    return (
        <Container maxWidth="md" sx={{ py: 6 }}>
            <Paper sx={{ p: 4, borderRadius: 3 }} elevation={1}>
                <Stack alignItems="center" spacing={1} sx={{ mb: 3 }}>
                    <Avatar src={company.logo || '/default-company-logo.png'} sx={{ width: 120, height: 120, bgcolor: 'background.default' }} />
                    <Typography variant="h4" sx={{ color: 'text.primary' }}>{company.name}</Typography>
                    <Stack direction="row" spacing={0.5} alignItems="center">
                        <LocationOnIcon fontSize="small" color="action" />
                        <Typography variant="body1" color="text.secondary">{company.location || 'Location not specified'}</Typography>
                    </Stack>
                </Stack>
                <Divider sx={{ my: 2 }} />
                <Stack spacing={1.5}>
                    <Typography><strong>Description:</strong> {company.description || 'No description available'}</Typography>
                    <Typography><strong>Website:</strong> {company.website ? <MuiLink href={company.website} target="_blank" rel="noopener noreferrer">{company.website}</MuiLink> : 'Not provided'}</Typography>
                    <Typography><strong>Founded:</strong> {company.founded_year || 'Unknown'}</Typography>
                    <Typography><strong>Industry:</strong> {company.industry || 'Not specified'}</Typography>
                    <Typography><strong>Number of Employees:</strong> {company.employees_count || 'Unknown'}</Typography>
                    <Typography><strong>Posted Jobs:</strong> {company.posted_jobs?.length || 0}</Typography>
                </Stack>
                <Box sx={{ mt: 3, textAlign: 'center' }}>
                    <Button component={Link} to={`/Rating/${companyId}`} variant="contained" startIcon={<StarIcon />}>
                        Rate this company
                    </Button>
                </Box>
            </Paper>
        </Container>
    );
}

export default Company;
