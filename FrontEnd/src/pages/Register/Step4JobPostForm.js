import React from 'react';
import { Box, Button, FormControl, InputLabel, MenuItem, Select, TextField, Typography } from '@mui/material';

function Step4JobPostForm({ data, onChange, onSubmit, onPostAnother, loading }) {
    return (
<Box component="form" onSubmit={onSubmit}>
    <Typography variant="h4" component="h1" sx={{ mb: 3, textAlign: 'center', fontWeight: 'bold', color: '#333' }}>
        Post Your First Job
    </Typography>

    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <TextField
            label="Job Title"
            type="text"
            name="title"
            value={data.title}
            onChange={onChange}
            required
            variant="outlined"
            fullWidth
            InputProps={{ sx: { color: 'black' } }}
            InputLabelProps={{ sx: { color: 'black' } }}
            sx={{
                '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                        borderColor: '#282c34',
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
            label="Description"
            multiline
            rows={4}
            name="description"
            value={data.description}
            onChange={onChange}
            required
            variant="outlined"
            fullWidth
            InputProps={{ sx: { color: 'black' } }}
            InputLabelProps={{ sx: { color: 'black' } }}
            sx={{
                '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                        borderColor: '#282c34',
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
                        borderColor: '#282c34',
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
            label="Skills Required"
            type="text"
            name="skills_required"
            value={data.skills_required}
            onChange={onChange}
            required
            variant="outlined"
            fullWidth
            InputProps={{ sx: { color: 'black' } }}
            InputLabelProps={{ sx: { color: 'black' } }}
            sx={{
                '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                        borderColor: '#282c34',
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
            label="Salary"
            type="number"
            name="salary"
            value={data.salary}
            onChange={onChange}
            required
            variant="outlined"
            fullWidth
            InputProps={{ sx: { color: 'black' } }}
            InputLabelProps={{ sx: { color: 'black' } }}
            sx={{
                '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                        borderColor: '#282c34',
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

        <FormControl fullWidth variant="outlined">
            <InputLabel sx={{ color: 'black' }}>Job Type</InputLabel>
            <Select
                name="job_type"
                value={data.job_type}
                onChange={onChange}
                label="Job Type"
                sx={{
                    color: 'black',
                    '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#282c34',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'secondary.main',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'secondary.main',
                    },
                }}
            >
                <MenuItem value="full-time">Full-time</MenuItem>
                <MenuItem value="part-time">Part-time</MenuItem>
                <MenuItem value="contract">Contract</MenuItem>
            </Select>
        </FormControl>

        <FormControl fullWidth variant="outlined">
            <InputLabel sx={{ color: 'black' }}>Remote Option</InputLabel>
            <Select
                name="remote_option"
                value={data.remote_option ? "true" : "false"}
                onChange={(e) => onChange({ target: { name: 'remote_option', value: e.target.value === 'true', type: 'select-one' } })}
                label="Remote Option"
                sx={{
                    color: 'black',
                    '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#282c34',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'secondary.main',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'secondary.main',
                    },
                }}
            >
                <MenuItem value="true">Yes</MenuItem>
                <MenuItem value="false">No</MenuItem>
            </Select>
        </FormControl>

        <TextField
            label="Category"
            type="text"
            name="category"
            value={data.category}
            onChange={onChange}
            required
            variant="outlined"
            fullWidth
            InputProps={{ sx: { color: 'black' } }}
            InputLabelProps={{ sx: { color: 'black' } }}
            sx={{
                '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                        borderColor: '#282c34',
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

        <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            <Button
                type="button"
                onClick={onPostAnother}
                variant="outlined"
                sx={{
                    flex: 1,
                    py: 1.5,
                    color: '#282c34',
                    borderColor: '#282c34',
                    '&:hover': {
                        borderColor: 'secondary.main',
                        backgroundColor: 'rgba(180, 240, 0, 0.1)',
                    },
                    textTransform: 'none',
                    fontWeight: 'bold',
                    borderRadius: '8px',
                }}
            >
                Post Another Job
            </Button>

            <Button
                type="submit"
                variant="contained"
                disabled={loading}
                sx={{
                    flex: 1,
                    py: 1.5,
                    backgroundColor: '#b4f000 !important',
                    color: '#282c34 !important',
                    '&:hover': {
                        backgroundColor: '#a0d600 !important',
                    },
                    textTransform: 'none',
                    fontWeight: 'bold',
                    borderRadius: '8px',
                }}
            >
                {loading ? 'Posting Job...' : 'Finish Registration'}
            </Button>
        </Box>
    </Box>
</Box>
    );
}

export default Step4JobPostForm;
