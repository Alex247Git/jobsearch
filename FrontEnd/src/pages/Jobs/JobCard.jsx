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
    recommended = false,
    score = null,
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
            border: recommended ? '2px solid #FFD700' : '1px solid',
            borderColor: recommended ? '#FFD700' : 'divider',
            boxShadow: recommended ? '0 0 12px rgba(255, 215, 0, 0.3)' : theme.shadows[2],
            position: 'relative',
            overflow: 'visible',
            '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: recommended
                    ? '0 0 20px rgba(255, 215, 0, 0.5)'
                    : theme.shadows[8],
            },
        }}
        onClick={(e) => {
            if (!e.target.closest("button")) {
                onOpen(job.job_id);
            }
        }}
    >
        {recommended && (
            <Box sx={{
                position: 'absolute',
                top: -10,
                left: 12,
                bgcolor: '#FFD700',
                color: '#000',
                px: 1.5,
                py: 0.3,
                borderRadius: 1,
                fontSize: '0.7rem',
                fontWeight: 700,
                letterSpacing: 0.5,
                zIndex: 1,
                boxShadow: '0 2px 8px rgba(255, 215, 0, 0.4)',
            }}>
                RECOMMENDED
            </Box>
        )}
        {recommended && score != null && (
            <Box sx={{
                position: 'absolute',
                top: -10,
                right: 12,
                bgcolor: 'success.main',
                color: '#fff',
                px: 1.5,
                py: 0.3,
                borderRadius: 1,
                fontSize: '0.7rem',
                fontWeight: 700,
                zIndex: 1,
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
            }}>
                {(score * 10).toFixed(0)}% MATCH
            </Box>
        )}
        <CardContent sx={{ flexGrow: 1, pt: recommended ? 3 : 2 }}>
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
