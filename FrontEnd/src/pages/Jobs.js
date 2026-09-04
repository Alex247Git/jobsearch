import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { socket } from '../services/socket';
import {
    Box,
    Typography,
    TextField,
    Button,
    Container,
    Paper,
    Card,
    CardContent,
    CardActions,
    Grid,
    Slider,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Chip,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    useTheme,
    useMediaQuery,
    IconButton,
    Tooltip,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import BusinessIcon from '@mui/icons-material/Business';
import StarIcon from '@mui/icons-material/Star';
import MessageIcon from '@mui/icons-material/Message';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import SendIcon from '@mui/icons-material/Send';
import { API_BASE_URL } from '../api';

function Jobs({ user }) {
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

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

    const jobCategories = [
        "Engineering", "Marketing", "Sales", "Finance", "Information Technology", "Customer Service",
        "Healthcare", "Education", "Human Resources", "Project Management", "Design",
        "Legal", "Business Development", "Accounting", "Operations", "Administrative",
        "Data Science", "Consulting", "Product Management", "Manufacturing",
        "Logistics", "Quality Assurance", "Public Relations", "Writing", "Other"
    ];

    useEffect(() => {
        fetch(`${API_BASE_URL}/jobs`)
            .then(response => response.json())
            .then(data => {
                console.log("Raw fetched data:", data);
                if (Array.isArray(data)) {
                    console.log("Sample job:", data[0]);
                }
                setJobs(data);
            })
            .catch(error => console.error('Error fetching jobs:', error));
    }, []);

    useEffect(() => {
        if (user?.user_id) {
            fetch(`${API_BASE_URL}/applications/candidate/${user.user_id}`)
                .then(response => response.json())
                .then(data => {
                    console.log("Applied Jobs:", data);
                    setAppliedJobs(data.map(application => application.job_id));
                })
                .catch(error => console.error('Error fetching applied jobs:', error));
            fetch(`${API_BASE_URL}/saved_jobs/${user.user_id}`)
                .then(response => response.json())
                .then(data => {
                    console.log("Saved Jobs:", data);
                    setSavedJobs(data.map(job => job.job_id));
                })
                .catch(error => console.error('Error fetching saved jobs:', error));
        }
    }, [user]);

    useEffect(() => {
        fetch(`${API_BASE_URL}/company_ratings`)
            .then(response => response.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setCompanyRatings(data);
                } else {
                    setCompanyRatings([]);
                    console.log('No company ratings found');
                }
            })
            .catch(error => console.error('Error fetching company ratings:', error));
    }, []);

    useEffect(() => {
        if (user?.user_id) {
            fetch(`${API_BASE_URL}/recommendations/jobs/${user.user_id}`)
                .then(res => res.json())
                .then(data => {
                    console.log("Recommended Jobs:", data);
                    setRecommendedJobs(data);
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
        console.log('📨 Submitting application with:', {
            user_id: user.user_id,
            job_id: jobId,
            status: 'pending',
            applied_at: new Date().toISOString(),
        });

        if (!user?.user_id) {
            alert('You need to log in to apply for jobs.');
            return;
        }

        if (appliedJobs.includes(jobId)) {
            alert('You have already applied for this job.');
            return;
        }

        fetch(`${API_BASE_URL}/applications`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                user_id: user.user_id,
                job_id: jobId,
                status: 'pending',
                applied_at: new Date().toISOString(),
            }),
        })
            .then(async response => {
                const data = await response.json();
                console.log('📬 Response from server:', data);

                if (!response.ok) {
                    throw new Error(data.error || "Failed to apply for job.");
                }

                alert('Application submitted successfully!');
                setAppliedJobs(prev => [...prev, jobId]);
            })
            .catch(error => {
                console.error('❌ Error applying for job:', error);
                alert(error.message);
            });
    };

    const handleSaveJob = (jobId) => {
        if (!user || !user.user_id) {
            alert('You need to be logged in to save jobs.');
            return;
        }

        if (savedJobs.includes(jobId)) {
            alert('This job is already saved.');
            return;
        }

        fetch(`${API_BASE_URL}/saved_jobs`, {
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
                alert('Job saved successfully!');
                setSavedJobs([...savedJobs, jobId]);
            })
            .catch(error => {
                console.error('Error saving job:', error);
            });
    };

    const fetchChatHistory = (senderId, receiverId) => {
        fetch(`${API_BASE_URL}/messages/${senderId}/${receiverId}`)
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
            alert('Please enter a message before sending.');
            return;
        }

        const messageData = {
            sender_id: user.user_id,
            receiver_id: selectedEmployer.employer_id,
            message: messageText.trim(),
        };

        fetch(`${API_BASE_URL}/messages`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(messageData),
        })
            .then(response => response.json())
            .then((newMessage) => {
                if (newMessage.error) {
                    console.error("Message sending error:", newMessage.error);
                    return;
                }
                setChatHistory([...chatHistory, newMessage]);
                setMessageText("");
            })
            .catch(error => {
                console.error('Error sending message:', error);
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
            <Box
                sx={{
                    width: 320,
                    flexShrink: 0,
                    backgroundColor: 'background.paper',
                    borderRight: '1px solid',
                    borderColor: 'divider',
                    overflowY: 'auto',
                    height: '100%',
                }}
            >
                <Box sx={{ p: 3 }}>
                    {/* Search Section */}
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: 'white' }}>
                        Search Jobs
                    </Typography>
                    <TextField
                        fullWidth
                        placeholder="Search jobs by title or company..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
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
                            onChange={(event, newValue) => setSalaryRange(newValue)}
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
                                {jobCategories.map(category => (
                                    <Chip
                                        key={category}
                                        label={category}
                                        onClick={() => handleCategoryChange(category)}
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
                            onChange={(e) => setJobType(e.target.value)}
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
            </Box>

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
                                <Grid item xs={12} sm={6} md={4} key={`job-${job.job_id}`}>
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
                                                navigate(`/job/${job.job_id}`);
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
                                </Grid>
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
                <Dialog
                    open={messageDialogOpen}
                    onClose={() => setMessageDialogOpen(false)}
                    maxWidth="sm"
                    fullWidth
                >
                    <DialogTitle>
                        Message Employer for: {selectedEmployer?.title}
                    </DialogTitle>
                    <DialogContent>
                        <TextField
                            autoFocus
                            margin="dense"
                            label="Your Message"
                            fullWidth
                            multiline
                            rows={4}
                            value={messageText}
                            onChange={(e) => setMessageText(e.target.value)}
                            placeholder="Type your message to the employer..."
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setMessageDialogOpen(false)}>Cancel</Button>
                        <Button
                            onClick={handleSendMessage}
                            variant="contained"
                            startIcon={<SendIcon />}
                        >
                            Send Message
                        </Button>
                    </DialogActions>
                </Dialog>
            </Box>
        </Box>
    );
}

export default Jobs;
