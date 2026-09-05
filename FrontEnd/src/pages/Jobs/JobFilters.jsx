import React from 'react';
import {
    Box, Typography, TextField, Slider, Accordion, AccordionSummary,
    AccordionDetails, Chip, FormControl, InputLabel, Select, MenuItem,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const JOB_CATEGORIES = [

"Engineering", "Marketing", "Sales", "Finance", "Information Technology", "Customer Service",
"Healthcare", "Education", "Human Resources", "Project Management", "Design",
"Legal", "Business Development", "Accounting", "Operations", "Administrative",
"Data Science", "Consulting", "Product Management", "Manufacturing",
"Logistics", "Quality Assurance", "Public Relations", "Writing", "Other"
];

function JobFilters({
    searchQuery, onSearchChange,
    salaryRange, onSalaryChange,
    selectedCategories, onCategoryChange,
    jobType, onJobTypeChange,
}) {
    return (
                <Box sx={{ p: 3 }}>
{/* Search Section */}
<Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: 'white' }}>
    Search Jobs
</Typography>
<TextField
    fullWidth
    placeholder="Search jobs by title or company..."
    value={searchQuery}
    onChange={(e) => onSearchChange(e.target.value)}
    variant="outlined"
    sx={{ mb: 3, '& .MuiOutlinedInput-root': { color: 'greenyellow' }, '& .MuiInputLabel-root': { color: 'greenyellow' }, '& .MuiOutlinedInput-notchedOutline': { borderColor: 'white' } }}
    InputProps={{
        style: { color: 'white' }
    }}
    InputLabelProps={{
        style: { color: 'white' }
    }}
/>

{/* Filters */}
<Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: 'white' }}>
    Filters
</Typography>

{/* Salary Range */}
<Box sx={{ mb: 3 }}>
    <Typography variant="subtitle1" sx={{ mb: 1, color: 'greenyellow' }}>
        Salary Range: ${salaryRange[0].toLocaleString()} - ${salaryRange[1].toLocaleString()}
    </Typography>
    <Slider
        value={salaryRange}
        onChange={(event, newValue) => onSalaryChange(newValue)}
        valueLabelDisplay="auto"
        min={0}
        max={1000000}
        step={1000}
        sx={{
            color: 'greenyellow',
            '& .MuiSlider-thumb': {
                backgroundColor: 'greenyellow',
            },
            '& .MuiSlider-track': {
                backgroundColor: 'greenyellow',
            },
            '& .MuiSlider-rail': {
                backgroundColor: 'greenyellow',
            },
        }}
    />
</Box>

{/* Categories */}
<Accordion sx={{ mb: 2, '& .MuiAccordionSummary-root': { color: 'white' }, '& .MuiAccordionDetails-root': { color: 'white' } }}>
    <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: 'white' }} />}>
        <Typography variant="subtitle1" sx={{ color: 'white' }}>Categories</Typography>
    </AccordionSummary>
    <AccordionDetails>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {JOB_CATEGORIES.map(category => (
                <Chip
                    key={category}
                    label={category}
                    onClick={() => onCategoryChange(category)}
                    color="white"
                    variant={selectedCategories.includes(category) ? 'filled' : 'outlined'}
                    size="small"
                    sx={{
                        color: selectedCategories.includes(category) ? 'white' : 'white',
                        borderColor: 'white',
                        backgroundColor: selectedCategories.includes(category) ? 'greenyellow' : 'transparent',
                        '& .MuiChip-label': { color: 'white' },
                        '&:hover': {
                            backgroundColor: selectedCategories.includes(category) ? 'greenyellow' : 'rgba(255, 255, 255, 0.1)',
                        }
                    }}
                />
            ))}
        </Box>
    </AccordionDetails>
</Accordion>

{/* Job Type */}
<FormControl fullWidth sx={{ mb: 2 }}>
    <InputLabel sx={{ color: 'white' }}>Job Type</InputLabel>
    <Select
        value={jobType}
        onChange={(e) => onJobTypeChange(e.target.value)}
        label="Job Type"
        sx={{
            color: 'white',
            '& .MuiSelect-icon': { color: 'white' },
            '& .MuiOutlinedInput-notchedOutline': { borderColor: 'white' },
            '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'white' },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'white' },
            '& .MuiSelect-select': { color: 'white' }
        }}
    >
        <MenuItem value="">All</MenuItem>
        <MenuItem value="Full-time">Full-time</MenuItem>
        <MenuItem value="Part-time">Part-time</MenuItem>
        <MenuItem value="Internship">Internship</MenuItem>
    </Select>
</FormControl>
                </Box>
    );
}

export default JobFilters;
