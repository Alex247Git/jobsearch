import React, { useState, useEffect } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import {
    Container, Paper, Stack, Box, Typography, TextField, Button, Link as MuiLink,
    Alert, CircularProgress, Divider,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { apiFetch } from '../api';

const FIELDS = [
    { key: 'location', label: 'Location', icon: <LocationOnIcon fontSize="small" /> },
    { key: 'phone_number', label: 'Phone', kind: 'user' },
    { key: 'date_of_birth', label: 'Date of Birth', type: 'date', kind: 'user' },
    { key: 'bio', label: 'Bio', multiline: true },
    { key: 'skills', label: 'Skills' },
    { key: 'experience', label: 'Experience' },
    { key: 'education', label: 'Education' },
    { key: 'certifications', label: 'Certifications' },
    { key: 'languages', label: 'Languages' },
    { key: 'cv', label: 'CV', kind: 'link' },
    { key: 'website', label: 'Website', kind: 'link' },
    { key: 'social_links', label: 'Social Links', kind: 'link' },
];

function Profile({ user }) {
    const { userId: paramUserId } = useParams();
    const viewedUserId = paramUserId || user?.user_id;
    const [profile, setProfile] = useState(null);
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({});

    useEffect(() => {
        if (!viewedUserId) { setError('No user ID found.'); setLoading(false); return; }
        const fetchUser = async () => {
            try {
                const r = await apiFetch(`/users/${viewedUserId}`, { headers: { Authorization: `Bearer ${user.token}` } });
                if (!r.ok) throw new Error();
                setUserData(await r.json());
            } catch { setError('Failed to load user data.'); }
        };
        const fetchProfile = async () => {
            try {
                const r = await apiFetch(`/profiles/${viewedUserId}`);
                if (r.status === 404) { setProfile(null); setFormData({}); return; }
                if (!r.ok) throw new Error();
                const d = await r.json();
                setProfile(d); setFormData(d);
            } catch { setError('Failed to load profile.'); }
            finally { setLoading(false); }
        };
        fetchUser(); fetchProfile();
    }, [viewedUserId]);

    const handleSave = async () => {
        try {
            const r = await apiFetch(profile ? `/profiles/${viewedUserId}` : '/profiles', {
                method: profile ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
                body: JSON.stringify(formData),
            });
            if (!r.ok) throw new Error();
            setProfile({ ...(profile || { user_id: viewedUserId }), ...formData });
            setIsEditing(false);
        } catch { setError('Failed to update profile.'); }
    };

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}><CircularProgress /></Box>;
    if (error) return <Container sx={{ mt: 4 }}><Alert severity="error">{error}</Alert></Container>;
    if (!userData) return <Container sx={{ mt: 4 }}><Alert severity="info">No user data found</Alert></Container>;

    const isOwner = user && String(user.user_id) === String(profile?.user_id ?? viewedUserId);
    const getValue = (field) => (field.kind === 'user' ? userData[field.key] : formData[field.key]);
    const setValue = (field, v) => field.kind === 'user' ? setUserData({ ...userData, [field.key]: v }) : setFormData({ ...formData, [field.key]: v });

    return (
        <Container maxWidth="md" sx={{ py: 6 }}>
            <Paper sx={{ p: 4, borderRadius: 3 }} elevation={1}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                    <Box>
                        <Typography variant="h4" sx={{ color: 'text.primary' }}>
                            {userData.first_name} {userData.last_name}
                        </Typography>
                        {isEditing ? (
                            <TextField size="small" name="location" value={formData.location || ''}
                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                placeholder="Location" sx={{ mt: 1 }} />
                        ) : (
                            <Stack direction="row" spacing={0.5} alignItems="center" sx={{ color: 'text.secondary', mt: 0.5 }}>
                                <LocationOnIcon fontSize="small" /> <Typography>{(profile && profile.location) || 'Location not set'}</Typography>
                            </Stack>
                        )}
                    </Box>
                </Stack>
                <Divider sx={{ mb: 3 }} />
                <Stack spacing={2}>
                    {FIELDS.filter(f => f.key !== 'location').map(field => {
                        const val = getValue(field);
                        if (isEditing) {
                            return (
                                <TextField key={field.key} label={field.label} value={val || ''} type={field.type || 'text'}
                                    multiline={field.multiline} fullWidth size="small"
                                    onChange={(e) => setValue(field, e.target.value)} />
                            );
                        }
                        return (
                            <Stack key={field.key} direction="row" spacing={1}>
                                <Typography sx={{ minWidth: 140, color: 'text.primary' }}><strong>{field.label}:</strong></Typography>
                                <Typography sx={{ flex: 1, color: 'text.secondary' }}>
                                    {val ? (field.kind === 'link'
                                        ? <MuiLink href={val} target="_blank" rel="noopener noreferrer">{val}</MuiLink>
                                        : val) : 'Not specified'}
                                </Typography>
                            </Stack>
                        );
                    })}
                </Stack>
                {isOwner && (
                    <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ mt: 4 }}>
                        {isEditing ? (
                            <>
                                <Button variant="outlined" startIcon={<CancelIcon />} onClick={() => { setIsEditing(false); setFormData(profile || {}); }}>Cancel</Button>
                                <Button variant="contained" startIcon={<SaveIcon />} onClick={handleSave}>Save</Button>
                            </>
                        ) : (
                            <Button variant="contained" startIcon={<EditIcon />} onClick={() => setIsEditing(true)}>Edit Profile</Button>
                        )}
                    </Stack>
                )}
            </Paper>
        </Container>
    );
}

export default Profile;
