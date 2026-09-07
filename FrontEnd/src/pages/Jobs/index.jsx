import React, { useEffect, useState, useRef } from 'react';
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
    Chip,
    Avatar,
    Stack,
    Divider,
} from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import BusinessIcon from '@mui/icons-material/Business';
import StarIcon from '@mui/icons-material/Star';
import MessageIcon from '@mui/icons-material/Message';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import WorkIcon from '@mui/icons-material/Work';
import { apiFetch } from '../../api';
import { useNotification } from '../../context/NotificationContext';
import JobFilters from './JobFilters';
import JobCard from './JobCard';
import MessageDialog from './MessageDialog';
import { JobListSkeleton } from '../../components/Skeletons';

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
    const [loading, setLoading] = useState(true);
    const [sliderIndex, setSliderIndex] = useState(0);
    const sliderRef = useRef(null);
    const visibleItems = 3;

    const scrollSlider = (direction) => {
        if (!recommendedJobs.length) return;
        const maxIndex = Math.max(0, recommendedJobs.length - visibleItems);
        if (direction === 'left') {
            setSliderIndex(prev => Math.max(0, prev - 1));
        } else {
            setSliderIndex(prev => Math.min(maxIndex, prev + 1));
        }
    };


    useEffect(() => {
        setLoading(true);
        apiFetch(`/jobs`)
            .then(response => response.json())
            .then(data => {
                setJobs(Array.isArray(data) ? data : []);
            })
            .catch(error => console.error('Error fetching jobs:', error))
            .finally(() => setLoading(false));
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
                    {/* Recommended Jobs Slider */}
                    {recommendedJobs.length > 0 && (
                        <Box sx={{ mb: 5 }}>
                            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
                                <Stack direction="row" alignItems="center" spacing={1}>
                                    <WorkIcon color="primary" />
                                    <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                                        🔍 Recommended for You
                                    </Typography>
                                    <Chip label={`${recommendedJobs.length} jobs`} size="small" color="primary" variant="outlined" />
                                </Stack>
                                {recommendedJobs.length > 1 && (
                                    <Stack direction="row" spacing={1}>
                                        <IconButton onClick={() => scrollSlider('left')} disabled={sliderIndex === 0} size="small"
                                            sx={{ bgcolor: 'background.paper', border: 1, borderColor: 'divider', '&.Mui-disabled': { opacity: 0.3 } }}>
                                            <ArrowBackIosNewIcon fontSize="small" />
                                        </IconButton>
                                        <Typography variant="body2" color="text.secondary" sx={{ alignSelf: 'center', minWidth: 40, textAlign: 'center' }}>
                                            {sliderIndex + 1}-{Math.min(sliderIndex + visibleItems, recommendedJobs.length)} / {recommendedJobs.length}
                                        </Typography>
                                        <IconButton onClick={() => scrollSlider('right')} disabled={sliderIndex >= recommendedJobs.length - 1} size="small"
                                            sx={{ bgcolor: 'background.paper', border: 1, borderColor: 'divider', '&.Mui-disabled': { opacity: 0.3 } }}>
                                            <ArrowForwardIosIcon fontSize="small" />
                                        </IconButton>
                                    </Stack>
                                )}
                            </Stack>
                            <Grid container spacing={3}>
                                {recommendedJobs.slice(sliderIndex, sliderIndex + visibleItems).map((job) => (
                                    <JobCard
                                        key={`rec-${job.job_id}`}
                                        job={job}
                                        saved={savedJobs.includes(job.job_id)}
                                        applied={appliedJobs.includes(job.job_id)}
                                        rating={getCompanyRating(job.company_id)}
                                        renderStars={renderStars}
                                        onOpen={(jobId) => navigate(`/job/${jobId}`)}
                                        onApply={handleApplication}
                                        onMessage={handleSelectEmployer}
                                        onSave={handleSaveJob}
                                        recommended
                                    />
                                ))}
                            </Grid>
                        </Box>
                    )}

                    {/* All Jobs */}
                    <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>
                        All Jobs
                    </Typography>

                    {loading ? (
                        <JobListSkeleton count={6} />
                    ) : filteredJobs.length > 0 ? (
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
