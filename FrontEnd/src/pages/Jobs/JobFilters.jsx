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
                <Box
                    sx={{
                        width: 300,
                        flexShrink: 0,
                        alignSelf: 'flex-start',
                        bgcolor: 'background.paper',
                        borderRadius: 2,
                        boxShadow: 1,
                        p: 3,
                    }}
                >
{/* Search Section */}
<Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
    Search Jobs
</Typography>
<TextField
    fullWidth
    size="small"
    placeholder="Search jobs by title or company..."
    value={searchQuery}
    onChange={(e) => onSearchChange(e.target.value)}
    variant="outlined"
    sx={{ mb: 3 }}
/>

{/* Filters */}
<Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
    Filters
</Typography>

{/* Salary Range */}
<Box sx={{ mb: 3 }}>
    <Typography variant="subtitle1" sx={{ mb: 1, color: 'primary.main', fontWeight: 'bold' }}>
        Salary Range: ${salaryRange[0].toLocaleString()} - ${salaryRange[1].toLocaleString()}
    </Typography>
    <Slider
        value={salaryRange}
        onChange={(event, newValue) => onSalaryChange(newValue)}
        valueLabelDisplay="auto"
        min={0}
        max={1000000}
        step={1000}
    />
</Box>

{/* Categories */}
<Accordion sx={{ mb: 2, boxShadow: 'none', border: '1px solid', borderColor: 'divider' }}>
    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography variant="subtitle1">Categories</Typography>
    </AccordionSummary>
    <AccordionDetails>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {JOB_CATEGORIES.map(category => {
                const selected = selectedCategories.includes(category);
                return (
                    <Chip
                        key={category}
                        label={category}
                        onClick={() => onCategoryChange(category)}
                        variant={selected ? 'filled' : 'outlined'}
                        size="small"
                        sx={selected ? {
                            bgcolor: '#DCFCE7',
                            color: '#166534',
                            '&:hover': { bgcolor: '#BBF7D0' },
                        } : {
                            color: 'text.primary',
                            borderColor: 'divider',
                            '&:hover': { bgcolor: 'grey.100' },
                        }}
                    />
                );
            })}
        </Box>
    </AccordionDetails>
</Accordion>

{/* Job Type */}
<FormControl fullWidth sx={{ mb: 2 }}>
    <InputLabel>Job Type</InputLabel>
    <Select
        value={jobType}
        onChange={(e) => onJobTypeChange(e.target.value)}
        label="Job Type"
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
