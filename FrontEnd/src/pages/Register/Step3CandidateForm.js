import React from 'react';
import { Box, Typography, TextField, Button } from '@mui/material';

function Step3CandidateForm({ data, onChange, onSubmit, loading }) {
    return (
        <Box component="form" onSubmit={onSubmit}>
            <Typography variant="h4" component="h1" sx={{ mb: 3, textAlign: 'center', fontWeight: 'bold', color: '#333' }}>
                Candidate Details
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <TextField label="Cover Letter" type="text" name="cover_letter" value={data.cover_letter} onChange={onChange} required variant="outlined" fullWidth InputProps={{ sx: { color: 'black' } }} InputLabelProps={{ sx: { color: 'black' } }} sx={{ '& .MuiInputLabel-root.Mui-focused': { color: 'black !important' } }} />
                <Button type="submit" fullWidth variant="contained" disabled={loading} sx={{ mt: 2, py: 1.5, backgroundColor: '#b4f000 !important', color: '#282c34 !important', '&:hover': { backgroundColor: '#a0d600 !important' }, textTransform: 'none', fontWeight: 'bold', borderRadius: '8px' }}>
                    {loading ? 'Submitting...' : 'Finish Registration'}
                </Button>
            </Box>
        </Box>
    );
}

export default Step3CandidateForm;