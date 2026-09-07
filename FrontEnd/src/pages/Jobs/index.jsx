import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { socket } from '../../services/socket';
import {
    Box,
    Typography,
    Button,
    Container,
    Paper,
    Card,
    CardContent,
    CardActions,
    Grid,
    useTheme,
    useMediaQuery,
    IconButton,
    Tooltip,
} from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import BusinessIcon from '@mui/icons-material/Business';
import StarIcon from '@mui/icons-material/Star';
import MessageIcon from '@mui/icons-material/Message';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import { apiFetch } from '../../api';
import { useNotification } from '../../context/NotificationContext';
import JobFilters from './JobFilters';
import JobCard from './JobCard';
import MessageDialog from './MessageDialog';

function Jobs({ user }) {
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const notify = useNotification();

    const [jobs, setJobs] = useState([]);
    const [savedJobs, setSavedJobs] = useState([]);
    const [appliedJobs, setAppliedJobs] = useState([]);
    const [messageText, setMessageText] = useState("");
    const [selectedEmployer, setSelectedEmployer] = useState(null);
    const [chatHistory, setChatHistory] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [salaryRange, setSalaryRange] = useState([0, 1000000]);
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [jobType, setJobType] = useState("");
    const [recommendedJobs, setRecommendedJobs] = useState([]);
    const [companyRatings, setCompanyRatings] = useState([]);
    const [messageDialogOpen, setMessageDialogOpen] = useState(false);


    useEffect(() => {
        apiFetch(`/jobs`)
            .then(response => response.json())
            .then(data => {
                setJobs(Array.isArray(data) ? data : []);
            })
            .catch(error => console.error('Error fetching jobs:', error));
    }, []);

    useEffect(() => {
        if (user?.user_id) {
            apiFetch(`/applications/candidate/${user.user_id}`)
                .then(response => response.json())
                .then(data => {
                    setAppliedJobs(Array.isArray(data) ? data.map(application => application.job_id) : []);
                })
                .catch(error => console.error('Error fetching applied jobs:', error));
            apiFetch(`/saved_jobs/${user.user_id}`)
                .then(response => response.json())
                .then(data => {
                    setSavedJobs(Array.isArray(data) ? data.map(job => job.job_id) : []);
                })
                .catch(error => console.error('Error fetching saved jobs:', error));
        }
    }, [user]);

    useEffect(() => {
        apiFetch(`/company_ratings`)
            .then(response => response.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setCompanyRatings(data);
                } else {
                    setCompanyRatings([]);
                }
            })
            .catch(error => console.error('Error fetching company ratings:', error));
    }, []);

    useEffect(() => {
        if (user?.user_id) {
            apiFetch(`/recommendations/jobs/${user.user_id}`)
                .then(res => res.json())
                .then(data => {
                    setRecommendedJobs(Array.isArray(data) ? data : []);
                })
                .catch(error => console.error("Error fetching recommended jobs:", error));
        }
    }, [user]);

    useEffect(() => {
        socket.on("receiveMessage", (newMessage) => {
            setChatHistory(prevChat => [...prevChat, newMessage]);
        });

        return () => {
            socket.off("receiveMessage");
        };
    }, []);

    const handleApplication = (jobId) => {
        if (!user?.user_id) {
            notify.warning('Please log in to apply for jobs.');
            return;
        }
        if (appliedJobs.includes(jobId)) {
            notify.info('You have already applied for this job.');
            return;
        }
        apiFetch(`/applications`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${user.token}`,
            },
            body: JSON.stringify({
                job_id: jobId,
                status: 'pending',
            }),
        })
            .then(async response => {
                const data = await response.json();
                if (!response.ok) {
                    throw new Error(data.error || "Failed to apply for job.");
                }
                notify.success('Application submitted successfully!');
                setAppliedJobs(prev => [...prev, jobId]);
            })
            .catch(error => {
                console.error('❌ Error applying for job:', error);
                notify.error(error.message || 'Failed to submit application.');
            });
    };

    const handleSaveJob = (jobId) => {
        if (!user || !user.user_id) {
            notify.warning('Please log in to save jobs.');
            return;
        }
        if (savedJobs.includes(jobId)) {
            notify.info('This job is already saved.');
            return;
        }
        apiFetch(`/saved_jobs`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                user_id: user.user_id,
                job_id: jobId,
                role: user.role
            }),
        })
            .then(response => response.json())
            .then(() => {
                notify.success('Job saved successfully!');
                setSavedJobs([...savedJobs, jobId]);
            })
            .catch(error => {
                console.error('Error saving job:', error);
                notify.error('Failed to save job. Please try again.');
            });
    };

    const fetchChatHistory = (senderId, receiverId) => {
        apiFetch(`/messages/${senderId}/${receiverId}`)
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    console.error("Error fetching chat history:", data.error);
                    return;
                }
                setChatHistory(data);
            })
            .catch(error => {
                console.error('Error fetching chat history:', error);
            });
    };

    const handleSelectEmployer = (job) => {
        setSelectedEmployer(job);
        setMessageText("");
        setMessageDialogOpen(true);

        if (user?.user_id && job?.employer_id) {
            fetchChatHistory(user.user_id, job.employer_id);
        }
    };

    const handleSendMessage = () => {
        if (!user?.user_id || !selectedEmployer || !messageText.trim()) {
            notify.warning('Please enter a message before sending.');
            return;
        }

        const messageData = {
            sender_id: user.user_id,
            receiver_id: selectedEmployer.employer_id,
            message: messageText.trim(),
        };

        apiFetch(`/messages`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(messageData),
        })
            .then(response => response.json())
            .then((newMessage) => {
                if (newMessage.error) {
                    console.error("Message sending error:", newMessage.error);
                    notify.error('Failed to send message.');
                    return;
                }
                setChatHistory([...chatHistory, newMessage]);
                setMessageText("");
                notify.success('Message sent successfully!');
            })
            .catch(error => {
                console.error('Error sending message:', error);
                notify.error('Failed to send message. Please try again.');
            });
    };

    const handleCategoryChange = (category) => {
        setSelectedCategories((prevCategories) =>
            prevCategories.includes(category)
                ? prevCategories.filter(c => c !== category)
                : [...prevCategories, category]
        );
    };

    const filteredJobs = jobs.filter(job =>
        (searchQuery.trim() === "" || job.title?.toLowerCase().includes(searchQuery.toLowerCase()) || job.company_name?.toLowerCase().includes(searchQuery.toLowerCase())) &&
        (!isNaN(job.salary) && job.salary >= salaryRange[0] && job.salary <= salaryRange[1]) &&
        (selectedCategories.length === 0 || selectedCategories.includes(job.category)) &&
        (jobType === "" || job.job_type?.toLowerCase() === jobType.toLowerCase())
    );

    const getCompanyRating = (companyId) => {
        const ratingsForCompany = companyRatings.filter(r => r.company_id === companyId);
        if (ratingsForCompany.length === 0) return null;
        const total = ratingsForCompany.reduce((sum, r) => sum + r.rating, 0);
        return (total / ratingsForCompany.length).toFixed(1);
    };

    const renderStars = (rating) => {
        if (!rating) return null;
        const fullStars = Math.floor(rating);
        const halfStar = rating - fullStars >= 0.5;
        const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

        return (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                {[...Array(fullStars)].map((_, i) => (
                    <StarIcon key={`full-${i}`} sx={{ color: '#ffc107', fontSize: 16 }} />
                ))}
                {halfStar && <StarIcon sx={{ color: '#ffc107', fontSize: 16, opacity: 0.5 }} />}
                {[...Array(emptyStars)].map((_, i) => (
                    <StarIcon key={`empty-${i}`} sx={{ color: '#e0e0e0', fontSize: 16 }} />
                ))}
            </Box>
        );
    };

    return (
        <Box sx={{ display: 'flex', minHeight: 'calc(100vh - 140px)', backgroundColor: '#f3f4f6' }}>
                    {/* Sidebar */}
                    <JobFilters
                        searchQuery={searchQuery}
                        onSearchChange={setSearchQuery}
                        salaryRange={salaryRange}
                        onSalaryChange={setSalaryRange}
                        selectedCategories={selectedCategories}
                        onCategoryChange={handleCategoryChange}
                        jobType={jobType}
                        onJobTypeChange={setJobType}
                    />

            {/* Main Content */}
            <Box
                sx={{
                    flex: 1,
                    overflowY: 'auto',
                    height: '100%',
                }}
            >
                <Container maxWidth="xl" sx={{ py: 4 }}>
                    <Typography
                        variant={isMobile ? 'h4' : 'h3'}
                        component="h1"
                        sx={{
                            mb: 4,
                            textAlign: 'center',
                            fontWeight: 'bold',
                            color: 'text.primary',
                        }}
                    >
                        Explore Job Opportunities
                    </Typography>

                    {/* Job Listings */}
                    {/* Recommended Jobs */}
                    {recommendedJobs.length > 0 && (
                        <Box sx={{ mb: 4 }}>
                            <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold', color: 'primary.main' }}>
                                🔍 Recommended for You
                            </Typography>
                            <Box
                                sx={{
                                    display: 'flex',
                                    gap: 2,
                                    overflowX: 'auto',
                                    pb: 2,
                                    '&::-webkit-scrollbar': {
                                        height: 6,
                                    },
                                    '&::-webkit-scrollbar-track': {
                                        backgroundColor: '#f1f1f1',
                                        borderRadius: 3,
                                    },
                                    '&::-webkit-scrollbar-thumb': {
                                        backgroundColor: 'primary.main',
                                        borderRadius: 3,
                                    },
                                }}
                            >
                                {recommendedJobs.map((job) => (
                                    <Card
                                        key={`recommended-${job.job_id}`}
                                        sx={{
                                            minWidth: 300,
                                            cursor: 'pointer',
                                            transition: 'transform 0.2s',
                                            '&:hover': {
                                                transform: 'translateY(-4px)',
                                                boxShadow: theme.shadows[8],
                                            },
                                            border: '2px solid #ffc107',
                                        }}
                                        onClick={(e) => {
                                            if (!e.target.closest("button")) {
                                                navigate(`/job/${job.job_id}`);
                                            }
                                        }}
                                    >
                                        <CardContent>
                                            <Typography variant="h6" sx={{ mb: 1, color: '#ffc107' }}>
                                                {job.title} 🌟
                                            </Typography>
                                            <Typography variant="body2" sx={{ mb: 1, fontWeight: 'bold' }}>
                                                🔢 Recommendation Score: {job.score ? `${Number(job.score).toFixed(2)} / 10` : "N/A"}
                                            </Typography>
                                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                                <BusinessIcon sx={{ mr: 1, fontSize: 16 }} />
                                                <Typography variant="body2">{job.company_name}</Typography>
                                            </Box>
                                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                                {renderStars(getCompanyRating(job.company_id))}
                                                <Typography variant="body2" sx={{ ml: 1 }}>
                                                    {getCompanyRating(job.company_id) ? `${getCompanyRating(job.company_id)} / 5` : 'No ratings yet'}
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
                                                onClick={() => handleApplication(job.job_id)}
                                                disabled={appliedJobs.includes(job.job_id)}
                                            >
                                                {appliedJobs.includes(job.job_id) ? 'Applied ✅' : 'Apply Now'}
                                            </Button>
                                            <Tooltip title="Message Employer">
                                                <IconButton
                                                    color="primary"
                                                    onClick={() => handleSelectEmployer(job)}
                                                >
                                                    <MessageIcon />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title={savedJobs.includes(job.job_id) ? 'Saved' : 'Save Job'}>
                                                <IconButton
                                                    color={savedJobs.includes(job.job_id) ? 'secondary' : 'default'}
                                                    onClick={() => handleSaveJob(job.job_id)}
                                                    disabled={savedJobs.includes(job.job_id)}
                                                >
                                                    {savedJobs.includes(job.job_id) ? <BookmarkIcon /> : <BookmarkBorderIcon />}
                                                </IconButton>
                                            </Tooltip>
                                        </CardActions>
                                    </Card>
                                ))}
                            </Box>
                        </Box>
                    )}

                    {/* All Jobs */}
                    <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>
                        All Jobs
                    </Typography>

                    {filteredJobs.length > 0 ? (
                        <Grid container spacing={3} sx={{ px: 0 }}>
                            {filteredJobs.map((job) => (
                                <JobCard
                                    key={`job-${job.job_id}`}
                                    job={job}
                                    saved={savedJobs.includes(job.job_id)}
                                    applied={appliedJobs.includes(job.job_id)}
                                    rating={getCompanyRating(job.company_id)}
                                    renderStars={renderStars}
                                    onOpen={(jobId) => navigate(`/job/${jobId}`)}
                                    onApply={handleApplication}
                                    onMessage={handleSelectEmployer}
                                    onSave={handleSaveJob}
                                />
                            ))}
                        </Grid>
                    ) : (
                        <Paper sx={{ p: 4, textAlign: 'center' }}>
                            <Typography variant="h6" color="text.secondary">
                                No jobs found matching your criteria.
                            </Typography>
                        </Paper>
                    )}

                </Container>

                {/* Message Dialog */}
                <MessageDialog
                    open={messageDialogOpen}
                    onClose={() => setMessageDialogOpen(false)}
                    title={selectedEmployer?.title}
                    messageText={messageText}
                    onMessageChange={setMessageText}
                    onSend={handleSendMessage}
                />
            </Box>
        </Box>
    );
}

export default Jobs;
