import React, { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import {
    Container, Paper, Stack, Typography, Button, TextField, Box, Divider, Alert,
} from '@mui/material';
import { apiFetch } from '../api';

function MyJob({ user }) {
    const [jobInfo, setJobInfo] = useState(null);
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState('');

    useEffect(() => {
        if (!user?.user_id) return;
        apiFetch(`/employed/${user.user_id}`)
            .then(res => res.json()).then(setJobInfo)
            .catch(err => console.error(err));
    }, [user?.user_id]);

    const handleSubmitRating = async () => {
        if (!rating || !jobInfo?.company_id || !user?.user_id) {
            alert('Please provide all required fields.'); return;
        }
        try {
            const res = await apiFetch('/company_ratings', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id: user.user_id, company_id: jobInfo.company_id, rating, comment }),
            });
            if (res.ok) { alert('Rating submitted!'); setRating(0); setComment(''); }
        } catch (err) { console.error(err); }
    };

    const handleLeaveJob = async () => {
        if (!window.confirm('Leave this job?')) return;
        try {
            const res = await apiFetch(`/employed/leavejob/${user.user_id}`, { method: 'DELETE' });
            if (res.ok) { alert('You have left the job.'); setJobInfo(null); }
        } catch (err) { console.error(err); }
    };

    const renderList = (data) => {
        if (!data) return 'N/A';
        if (typeof data === 'string') data = data.split(',');
        return Array.isArray(data) ? data.join(', ') : data;
    };

    if (!jobInfo) return <Container sx={{ mt: 6 }}><Alert severity="info">Loading job information...</Alert></Container>;

    const Section = ({ title, children }) => (
        <Box sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 1.5, color: 'primary.main' }}>{title}</Typography>
            <Stack spacing={0.5}>{children}</Stack>
        </Box>
    );
    const Row = ({ label, children }) => (
        <Typography><strong>{label}:</strong> {children}</Typography>
    );

    return (
        <Container maxWidth="md" sx={{ py: 6 }}>
            <Paper sx={{ p: 4, borderRadius: 3 }} elevation={1}>
                <Typography variant="h4" sx={{ mb: 3 }}>My Job Information</Typography>
                <Section title="Job Info">
                    <Row label="Title">{jobInfo.job_title}</Row>
                    <Row label="Description">{jobInfo.job_description}</Row>
                    <Row label="Location">{jobInfo.job_location}</Row>
                    <Row label="Skills Required">{renderList(jobInfo.job_skills)}</Row>
                    <Row label="Salary">{jobInfo.job_salary ? `$${jobInfo.job_salary}` : 'Not specified'}</Row>
                    <Row label="Job Type">{jobInfo.job_type}</Row>
                    <Row label="Remote Option">{jobInfo.remote_option ? 'Yes' : 'No'}</Row>
                    <Row label="Category">{jobInfo.job_category}</Row>
                    <Row label="Available">{jobInfo.is_available ? '✅' : '❌'}</Row>
                </Section>
                <Divider sx={{ my: 2 }} />
                <Section title="Company Info">
                    <Row label="ID">{jobInfo.company_id}</Row>
                    <Row label="Name">{jobInfo.company_name}</Row>
                    <Row label="Industry">{jobInfo.company_industry}</Row>
                    <Row label="Location">{jobInfo.company_location}</Row>
                </Section>
                <Divider sx={{ my: 2 }} />
                <Section title="Employer Info">
                    <Row label="Bio">{jobInfo.employer_bio}</Row>
                    <Row label="Location">{jobInfo.employer_location}</Row>
                </Section>
                <Divider sx={{ my: 2 }} />
                <Section title="Rate the Company">
                    <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                        {[1, 2, 3, 4, 5].map((star) => (
                            <Star key={star} size={30}
                                color={(hoverRating || rating) >= star ? 'gold' : 'lightgray'}
                                style={{ cursor: 'pointer' }}
                                onMouseEnter={() => setHoverRating(star)}
                                onMouseLeave={() => setHoverRating(0)}
                                onClick={() => setRating(star)} />
                        ))}
                    </Stack>
                    <TextField fullWidth multiline rows={3} value={comment} placeholder="Leave a comment..."
                        onChange={(e) => setComment(e.target.value)} sx={{ mb: 2 }} />
                    <Stack direction="row" spacing={1}>
                        <Button variant="contained" onClick={handleSubmitRating}>Submit Rating</Button>
                        <Button variant="outlined" color="error" onClick={handleLeaveJob}>Leave Job</Button>
                    </Stack>
                </Section>
            </Paper>
        </Container>
    );
}

export default MyJob;
