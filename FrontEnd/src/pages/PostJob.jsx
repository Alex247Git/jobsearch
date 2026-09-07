import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    Container, Paper, Stack, TextField, Select, MenuItem, FormControl, InputLabel,
    Button, Typography, Alert, Divider,
} from '@mui/material';
import { postJob } from '../services/JobController';

function PostJob() {
    const location = useLocation();
    const navigate = useNavigate();
    const employerId = location.state?.userId;

    const [formData, setFormData] = useState({
        employer_id: employerId,
        title: '', description: '', location: '',
        skills_required: '', created_at: new Date().toISOString().split('T')[0],
        salary: '', job_type: '', remote_option: 'No',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const update = (name) => (e) => setFormData(prev => ({ ...prev, [name]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true); setError('');
        try {
            await postJob(formData);
            navigate('/dashboard');
        } catch { setError('Failed to post job. Please try again.'); }
        finally { setLoading(false); }
    };

    return (
        <Container maxWidth="sm" sx={{ py: 6 }}>
            <Paper sx={{ p: 4 }} elevation={1}>
                <Typography variant="h4" sx={{ mb: 3 }}>Post a New Job</Typography>
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                <form onSubmit={handleSubmit}>
                    <Stack spacing={2}>
                        <TextField required fullWidth label="Job Title" name="title"
                            value={formData.title} onChange={update('title')} />
                        <TextField required fullWidth multiline rows={4} label="Description" name="description"
                            value={formData.description} onChange={update('description')} />
                        <TextField required fullWidth label="Location" name="location"
                            value={formData.location} onChange={update('location')} />
                        <TextField required fullWidth label="Skills Required" name="skills_required"
                            placeholder="comma-separated" value={formData.skills_required} onChange={update('skills_required')} />
                        <TextField required fullWidth type="number" label="Salary" name="salary"
                            value={formData.salary} onChange={update('salary')} />
                        <FormControl fullWidth required>
                            <InputLabel>Job Type</InputLabel>
                            <Select name="job_type" value={formData.job_type} label="Job Type" onChange={update('job_type')}>
                                <MenuItem value="">Select</MenuItem>
                                <MenuItem value="Full-time">Full-time</MenuItem>
                                <MenuItem value="Part-time">Part-time</MenuItem>
                                <MenuItem value="Contract">Contract</MenuItem>
                                <MenuItem value="Internship">Internship</MenuItem>
                            </Select>
                        </FormControl>
                        <FormControl fullWidth>
                            <InputLabel>Remote Option</InputLabel>
                            <Select name="remote_option" value={formData.remote_option} label="Remote Option" onChange={update('remote_option')}>
                                <MenuItem value="No">No</MenuItem>
                                <MenuItem value="Yes">Yes</MenuItem>
                            </Select>
                        </FormControl>
                        <Button type="submit" variant="contained" size="large" disabled={loading} sx={{ mt: 2 }}>
                            {loading ? 'Posting...' : 'Post Job'}
                        </Button>
                    </Stack>
                </form>
            </Paper>
        </Container>
    );
}

export default PostJob;
