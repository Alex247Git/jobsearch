import React from 'react';
import {
    Box, Typography, Card, CardContent, CardActions, Grid,
    Button, Tooltip, IconButton, useTheme,
} from '@mui/material';
import BusinessIcon from '@mui/icons-material/Business';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import MessageIcon from '@mui/icons-material/Message';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';

function JobCard({
    job, saved, applied, rating, renderStars,
    onOpen, onApply, onMessage, onSave,
}) {
    const theme = useTheme();
    return (
<Grid size={{ xs: 12, sm: 6, md: 4 }} key={`job-${job.job_id}`}>
    <Card
        sx={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            cursor: 'pointer',
            transition: 'transform 0.2s',
            '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: theme.shadows[8],
            },
        }}
        onClick={(e) => {
            if (!e.target.closest("button")) {
                onOpen(job.job_id);
            }
        }}
    >
        <CardContent sx={{ flexGrow: 1 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                {job.title}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <BusinessIcon sx={{ mr: 1, fontSize: 16 }} />
                <Typography variant="body2">{job.company_name}</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                {renderStars(rating)}
                <Typography variant="body2" sx={{ ml: 1 }}>
                    {rating ? `${rating} / 5` : 'No ratings yet'}
                </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <LocationOnIcon sx={{ mr: 1, fontSize: 16 }} />
                <Typography variant="body2">{job.location}</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <AttachMoneyIcon sx={{ mr: 1, fontSize: 16 }} />
                <Typography variant="body2">
                    {job.salary?.toLocaleString() ? `$${job.salary.toLocaleString()}` : 'Not available'}
                </Typography>
            </Box>
            <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Type:</strong> {job.job_type}
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Remote:</strong> {job.remote_option === 1 ? 'Yes' : 'No'}
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
                {job.description}
            </Typography>
        </CardContent>
        <CardActions>
            <Button
                variant="contained"
                color="primary"
                fullWidth
                onClick={() => onApply(job.job_id)}
                disabled={applied}
            >
                {applied ? 'Applied ✅' : 'Apply Now'}
            </Button>
            <Tooltip title="Message Employer">
                <IconButton
                    color="primary"
                    onClick={() => onMessage(job)}
                >
                    <MessageIcon />
                </IconButton>
            </Tooltip>
            <Tooltip title={saved ? 'Saved' : 'Save Job'}>
                <IconButton
                    color={saved ? 'secondary' : 'default'}
                    onClick={() => onSave(job.job_id)}
                    disabled={saved}
                >
                    {saved ? <BookmarkIcon /> : <BookmarkBorderIcon />}
                </IconButton>
            </Tooltip>
        </CardActions>
    </Card>
</Grid>
    );
}

export default JobCard;
