import React from 'react';
import { Box, Typography, TextField, Button } from '@mui/material';

const textFieldSx = {
    '& .MuiOutlinedInput-root': {
        '& fieldset': { borderColor: 'divider' },
        '&:hover fieldset': { borderColor: 'secondary.main' },
        '&.Mui-focused fieldset': { borderColor: 'secondary.main' },
    },
    '& .MuiInputLabel-root.Mui-focused': { color: 'black !important' },
};

function Step3EmployerForm({ data, onChange, onSubmit, loading }) {
    return (
        <Box component="form" onSubmit={onSubmit}>
            <Typography variant="h4" component="h1" sx={{ mb: 3, textAlign: 'center', fontWeight: 'bold', color: '#333' }}>
                Company Details
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <TextField label="Company Name" type="text" name="company_name" value={data.company_name} onChange={onChange} required variant="outlined" fullWidth InputProps={{ sx: { color: 'black' } }} InputLabelProps={{ sx: { color: 'black' } }} sx={textFieldSx} />
                <TextField label="Industry" type="text" name="industry" value={data.industry} onChange={onChange} required variant="outlined" fullWidth InputProps={{ sx: { color: 'black' } }} InputLabelProps={{ sx: { color: 'black' } }} sx={textFieldSx} />
                <TextField label="Founded Year" type="number" name="founded_year" value={data.founded_year} onChange={onChange} required variant="outlined" fullWidth InputProps={{ sx: { color: 'black' } }} InputLabelProps={{ sx: { color: 'black' } }} sx={textFieldSx} />
                <TextField label="Company Location" type="text" name="company_location" value={data.company_location} onChange={onChange} required variant="outlined" fullWidth InputProps={{ sx: { color: 'black' } }} InputLabelProps={{ sx: { color: 'black' } }} sx={textFieldSx} />
                <TextField label="Description" type="text" name="description" value={data.description} onChange={onChange} required variant="outlined" fullWidth InputProps={{ sx: { color: 'black' } }} InputLabelProps={{ sx: { color: 'black' } }} sx={textFieldSx} />
                <Button type="submit" fullWidth variant="contained" disabled={loading} sx={{ mt: 2, py: 1.5, backgroundColor: 'primary.main', color: 'primary.contrastText', '&:hover': { backgroundColor: 'primary.dark' }, textTransform: 'none', fontWeight: 'bold', borderRadius: '8px' }}>
                    {loading ? 'Creating Company...' : 'Continue'}
                </Button>
            </Box>
        </Box>
    );
}

export default Step3EmployerForm;