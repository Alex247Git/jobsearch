import React from 'react';
import { Box, Button, TextField, Typography } from '@mui/material';

function Step2ProfileForm({ data, onChange, onSubmit, loading }) {
    return (
<Box component="form" onSubmit={onSubmit}>
    <Typography variant="h4" component="h1" sx={{ mb: 3, textAlign: 'center', fontWeight: 'bold', color: '#333' }}>
        Complete Your Profile
    </Typography>

    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <TextField
            label="Age"
            type="number"
            name="age"
            value={data.age}
            onChange={onChange}
            required
            variant="outlined"
            fullWidth
            InputProps={{ sx: { color: 'black' } }}
            InputLabelProps={{ sx: { color: 'black' } }}
            sx={{
                '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                        borderColor: 'divider',
                    },
                    '&:hover fieldset': {
                        borderColor: 'secondary.main',
                    },
                    '&.Mui-focused fieldset': {
                        borderColor: 'secondary.main',
                    },
                    '&.Mui-focused .MuiInputLabel-root': {
                        color: 'black !important',
                    },
                },
                '& .MuiInputLabel-root.Mui-focused': {
                    color: 'black !important',
                },
            }}
        />

        <TextField
            label="Bio"
            multiline
            rows={4}
            name="bio"
            value={data.bio}
            onChange={onChange}
            required
            variant="outlined"
            fullWidth
            InputProps={{ sx: { color: 'black' } }}
            InputLabelProps={{ sx: { color: 'black' } }}
            sx={{
                '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                        borderColor: 'divider',
                    },
                    '&:hover fieldset': {
                        borderColor: 'secondary.main',
                    },
                    '&.Mui-focused fieldset': {
                        borderColor: 'secondary.main',
                    },
                    '&.Mui-focused .MuiInputLabel-root': {
                        color: 'black !important',
                    },
                },
                '& .MuiInputLabel-root.Mui-focused': {
                    color: 'black !important',
                },
            }}
        />

        <TextField
            label="Skills"
            type="text"
            name="skills"
            value={data.skills}
            onChange={onChange}
            required
            variant="outlined"
            fullWidth
            InputProps={{ sx: { color: 'black' } }}
            InputLabelProps={{ sx: { color: 'black' } }}
            sx={{
                '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                        borderColor: 'divider',
                    },
                    '&:hover fieldset': {
                        borderColor: 'secondary.main',
                    },
                    '&.Mui-focused fieldset': {
                        borderColor: 'secondary.main',
                    },
                    '&.Mui-focused .MuiInputLabel-root': {
                        color: 'black !important',
                    },
                },
                '& .MuiInputLabel-root.Mui-focused': {
                    color: 'black !important',
                },
            }}
        />

        <TextField
            label="Experience"
            multiline
            rows={4}
            name="experience"
            value={data.experience}
            onChange={onChange}
            required
            variant="outlined"
            fullWidth
            InputProps={{ sx: { color: 'black' } }}
            InputLabelProps={{ sx: { color: 'black' } }}
            sx={{
                '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                        borderColor: 'divider',
                    },
                    '&:hover fieldset': {
                        borderColor: 'secondary.main',
                    },
                    '&.Mui-focused fieldset': {
                        borderColor: 'secondary.main',
                    },
                    '&.Mui-focused .MuiInputLabel-root': {
                        color: 'black !important',
                    },
                },
                '& .MuiInputLabel-root.Mui-focused': {
                    color: 'black !important',
                },
            }}
        />

        <TextField
            label="Location"
            type="text"
            name="location"
            value={data.location}
            onChange={onChange}
            required
            variant="outlined"
            fullWidth
            InputProps={{ sx: { color: 'black' } }}
            InputLabelProps={{ sx: { color: 'black' } }}
            sx={{
                '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                        borderColor: 'divider',
                    },
                    '&:hover fieldset': {
                        borderColor: 'secondary.main',
                    },
                    '&.Mui-focused fieldset': {
                        borderColor: 'secondary.main',
                    },
                    '&.Mui-focused .MuiInputLabel-root': {
                        color: 'black !important',
                    },
                },
                '& .MuiInputLabel-root.Mui-focused': {
                    color: 'black !important',
                },
            }}
        />

        <TextField
            label="Education"
            multiline
            rows={4}
            name="education"
            value={data.education}
            onChange={onChange}
            required
            variant="outlined"
            fullWidth
            InputProps={{ sx: { color: 'black' } }}
            InputLabelProps={{ sx: { color: 'black' } }}
            sx={{
                '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                        borderColor: 'divider',
                    },
                    '&:hover fieldset': {
                        borderColor: 'secondary.main',
                    },
                    '&.Mui-focused fieldset': {
                        borderColor: 'secondary.main',
                    },
                    '&.Mui-focused .MuiInputLabel-root': {
                        color: 'black !important',
                    },
                },
                '& .MuiInputLabel-root.Mui-focused': {
                    color: 'black !important',
                },
            }}
        />

        <TextField
            label="Certifications"
            type="text"
            name="certifications"
            value={data.certifications}
            onChange={onChange}
            required
            variant="outlined"
            fullWidth
            InputProps={{ sx: { color: 'black' } }}
            InputLabelProps={{ sx: { color: 'black' } }}
            sx={{
                '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                        borderColor: 'divider',
                    },
                    '&:hover fieldset': {
                        borderColor: 'secondary.main',
                    },
                    '&.Mui-focused fieldset': {
                        borderColor: 'secondary.main',
                    },
                    '&.Mui-focused .MuiInputLabel-root': {
                        color: 'black !important',
                    },
                },
                '& .MuiInputLabel-root.Mui-focused': {
                    color: 'black !important',
                },
            }}
        />

        <TextField
            label="Languages"
            type="text"
            name="languages"
            value={data.languages}
            onChange={onChange}
            required
            variant="outlined"
            fullWidth
            InputProps={{ sx: { color: 'black' } }}
            InputLabelProps={{ sx: { color: 'black' } }}
            sx={{
                '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                        borderColor: 'divider',
                    },
                    '&:hover fieldset': {
                        borderColor: 'secondary.main',
                    },
                    '&.Mui-focused fieldset': {
                        borderColor: 'secondary.main',
                    },
                    '&.Mui-focused .MuiInputLabel-root': {
                        color: 'black !important',
                    },
                },
                '& .MuiInputLabel-root.Mui-focused': {
                    color: 'black !important',
                },
            }}
        />

        <TextField
            label="CV Link"
            type="text"
            name="cv"
            value={data.cv}
            onChange={onChange}
            required
            variant="outlined"
            fullWidth
            InputProps={{ sx: { color: 'black' } }}
            InputLabelProps={{ sx: { color: 'black' } }}
            sx={{
                '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                        borderColor: 'divider',
                    },
                    '&:hover fieldset': {
                        borderColor: 'secondary.main',
                    },
                    '&.Mui-focused fieldset': {
                        borderColor: 'secondary.main',
                    },
                    '&.Mui-focused .MuiInputLabel-root': {
                        color: 'black !important',
                    },
                },
                '& .MuiInputLabel-root.Mui-focused': {
                    color: 'black !important',
                },
            }}
        />

        <TextField
            label="Social Links"
            type="text"
            name="social_links"
            value={data.social_links}
            onChange={onChange}
            required
            variant="outlined"
            fullWidth
            InputProps={{ sx: { color: 'black' } }}
            InputLabelProps={{ sx: { color: 'black' } }}
            sx={{
                '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                        borderColor: 'divider',
                    },
                    '&:hover fieldset': {
                        borderColor: 'secondary.main',
                    },
                    '&.Mui-focused fieldset': {
                        borderColor: 'secondary.main',
                    },
                    '&.Mui-focused .MuiInputLabel-root': {
                        color: 'black !important',
                    },
                },
                '& .MuiInputLabel-root.Mui-focused': {
                    color: 'black !important',
                },
            }}
        />

        <TextField
            label="Website"
            type="text"
            name="website"
            value={data.website}
            onChange={onChange}
            variant="outlined"
            fullWidth
            InputProps={{ sx: { color: 'black' } }}
            InputLabelProps={{ sx: { color: 'black' } }}
            sx={{
                '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                        borderColor: 'divider',
                    },
                    '&:hover fieldset': {
                        borderColor: 'secondary.main',
                    },
                    '&.Mui-focused fieldset': {
                        borderColor: 'secondary.main',
                    },
                    '&.Mui-focused .MuiInputLabel-root': {
                        color: 'black !important',
                    },
                },
                '& .MuiInputLabel-root.Mui-focused': {
                    color: 'black !important',
                },
            }}
        />

        <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={loading}
            sx={{
                mt: 2,
                py: 1.5,
                backgroundColor: 'primary.main',
                color: 'primary.contrastText',
                '&:hover': {
                    backgroundColor: 'primary.dark',
                },
                textTransform: 'none',
                fontWeight: 'bold',
                borderRadius: '8px',
            }}
        >
            {loading ? 'Saving Profile...' : 'Next'}
        </Button>
    </Box>
</Box>
    );
}

export default Step2ProfileForm;
