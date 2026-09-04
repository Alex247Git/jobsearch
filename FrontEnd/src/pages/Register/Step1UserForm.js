import React from 'react';
import { Box, Typography, TextField, Button, Select, MenuItem, FormControl, InputLabel } from '@mui/material';

const textFieldSx = {
    '& .MuiOutlinedInput-root': {
        '& fieldset': { borderColor: '#282c34' },
        '&:hover fieldset': { borderColor: 'secondary.main' },
        '&.Mui-focused fieldset': { borderColor: 'secondary.main' },
        '&.Mui-focused .MuiInputLabel-root': { color: 'black !important' },
    },
    '& .MuiInputLabel-root.Mui-focused': { color: 'black !important' },
};

function Step1UserForm({ data, onChange, onSubmit, loading }) {
    return (
        <Box component="form" onSubmit={onSubmit}>
            <Typography variant="h4" component="h1" sx={{ mb: 3, textAlign: 'center', fontWeight: 'bold', color: '#333' }}>
                Register - Basic Information
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <TextField label="First Name" type="text" name="first_name" value={data.first_name} onChange={onChange} required variant="outlined" fullWidth InputProps={{ sx: { color: 'black' } }} InputLabelProps={{ sx: { color: 'black' } }} sx={textFieldSx} />
                <TextField label="Last Name" type="text" name="last_name" value={data.last_name} onChange={onChange} required variant="outlined" fullWidth InputProps={{ sx: { color: 'black' } }} InputLabelProps={{ sx: { color: 'black' } }} sx={textFieldSx} />
                <TextField label="Email" type="email" name="email" value={data.email} onChange={onChange} required variant="outlined" fullWidth InputProps={{ sx: { color: 'black' } }} InputLabelProps={{ sx: { color: 'black' } }} sx={textFieldSx} />
                <TextField label="Password" type="password" name="password" value={data.password} onChange={onChange} required variant="outlined" fullWidth InputProps={{ sx: { color: 'black' } }} InputLabelProps={{ sx: { color: 'black' } }} sx={textFieldSx} />
                <TextField label="Phone Number" type="text" name="phone_number" value={data.phone_number} onChange={onChange} required variant="outlined" fullWidth InputProps={{ sx: { color: 'black' } }} InputLabelProps={{ sx: { color: 'black' } }} sx={textFieldSx} />
                <TextField label="Date of Birth" type="date" name="date_of_birth" value={data.date_of_birth} onChange={onChange} required variant="outlined" fullWidth InputLabelProps={{ shrink: true, sx: { color: 'black' } }} sx={textFieldSx} />
                <FormControl variant="outlined" fullWidth>
                    <InputLabel sx={{ color: 'black' }}>Role</InputLabel>
                    <Select label="Role" name="role" value={data.role} onChange={onChange} sx={{ color: 'black' }}>
                        <MenuItem value="candidate">Candidate</MenuItem>
                        <MenuItem value="employer">Employer</MenuItem>
                    </Select>
                </FormControl>
                <Button type="submit" fullWidth variant="contained" disabled={loading} sx={{ mt: 2, py: 1.5, backgroundColor: '#b4f000 !important', color: '#282c34 !important', '&:hover': { backgroundColor: '#a0d600 !important' }, textTransform: 'none', fontWeight: 'bold', borderRadius: '8px' }}>
                    {loading ? 'Creating Account...' : 'Continue'}
                </Button>
            </Box>
        </Box>
    );
}

export default Step1UserForm;