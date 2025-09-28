import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { socket } from './socket';
import './Jobs.css';

function Jobs({ user }) {
    const navigate = useNavigate();
    const [jobs, setJobs] = useState([]);
    const [savedJobs, setSavedJobs] = useState([]);
    const [appliedJobs, setAppliedJobs] = useState([]);
    const [messageText, setMessageText] = useState("");
    const [selectedEmployer, setSelectedEmployer] = useState(null);
    const [chatHistory, setChatHistory] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [minSalary, setMinSalary] = useState(0);
    const [maxSalary, setMaxSalary] = useState(1000000);
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [jobType, setJobType] = useState("");
    const [recommendedJobs, setRecommendedJobs] = useState([]);
    const [companyRatings, setCompanyRatings] = useState([]);
    const [showCategories, setShowCategories] = useState(false);
    const jobCategories = [
        "Engineering", "Marketing", "Sales", "Finance", "Information Technology", "Customer Service",
        "Healthcare", "Education", "Human Resources", "Project Management", "Design",
        "Legal", "Business Development", "Accounting", "Operations", "Administrative",
        "Data Science", "Consulting", "Product Management", "Manufacturing",
        "Logistics", "Quality Assurance", "Public Relations", "Writing", "Other"
    ];


    useEffect(() => {
        fetch('http://localhost:5000/jobs')
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
            fetch(`http://localhost:5000/applications/candidate/${user.user_id}`)
                .then(response => response.json())
                .then(data => {
                    console.log("Applied Jobs:", data);
                    setAppliedJobs(data.map(application => application.job_id));
                })
                .catch(error => console.error('Error fetching applied jobs:', error));
            fetch(`http://localhost:5000/saved_jobs/${user.user_id}`)
                .then(response => response.json())
                .then(data => {
                    console.log("Saved Jobs:", data);
                    setSavedJobs(data.map(job => job.job_id));
                })
                .catch(error => console.error('Error fetching saved jobs:', error));
        }
    }, [user]);

    useEffect(() => {
        fetch('http://localhost:5000/company_ratings')
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
            fetch(`http://localhost:5000/recommendations/jobs/${user.user_id}`)
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

        fetch('http://localhost:5000/applications', {
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

        fetch('http://localhost:5000/saved_jobs', {
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
        fetch(`http://localhost:5000/messages/${senderId}/${receiverId}`)
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
        if (selectedEmployer && selectedEmployer.job_id === job.job_id) {
            setSelectedEmployer(null);
        } else {
            setSelectedEmployer(job);
            setMessageText("");

            if (user?.user_id && job?.employer_id) {
                fetchChatHistory(user.user_id, job.employer_id);
            }
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

        fetch('http://localhost:5000/messages', {
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
        (!isNaN(job.salary) && job.salary >= minSalary && job.salary <= maxSalary) &&
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
        if (!rating) return '';
        const fullStars = Math.floor(rating);
        const halfStar = rating - fullStars >= 0.5;
        const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

        return (
            <>
                {'★'.repeat(fullStars)}
                {halfStar && '½'}
                {'☆'.repeat(emptyStars)}
            </>
        );
    };



    return (
        <div className="jobs-container">
            <h1>Explore Job Opportunities</h1>
            <div className="jobs-layout">

                <div className="sidebar">
                    <div className="search-section">
                        <h3>Search Jobs</h3>
                        <input
                            type="text"
                            placeholder="Search jobs by title or company..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="search-bar"
                        />
                    </div>
                    <h3>Filters</h3>
                    <div className="filter-section">
                        <label>Salary Range:</label>
                        <p>
                            ${minSalary.toLocaleString()} - ${maxSalary.toLocaleString()}
                        </p>
                        <div className="salary-slider">
                            <input
                                type="range"
                                min="0"
                                max="1000000"
                                step="1000"
                                value={minSalary}
                                onChange={(e) => {
                                    const value = Number(e.target.value);
                                    if (value <= maxSalary) setMinSalary(value);
                                }}
                            />
                            <input
                                type="range"
                                min="0"
                                max="1000000"
                                step="1000"
                                value={maxSalary}
                                onChange={(e) => {
                                    const value = Number(e.target.value);
                                    if (value >= minSalary) setMaxSalary(value);
                                }}
                            />
                        </div>
                    </div>
                    <div className="filter-section categories-section">
                        <label>Categories:</label>
                        <div className="dropdown">
                            <button
                                className="dropdown-toggle"
                                onClick={() => setShowCategories(!showCategories)}
                            >
                                Select Categories ▼
                            </button>
                            {showCategories && (
                                <div className="dropdown-menu">
                                    {jobCategories.map(category => (
                                        <label key={category} className="category-item">
                                            <input
                                                type="checkbox"
                                                checked={selectedCategories.includes(category)}
                                                onChange={() => handleCategoryChange(category)}
                                            />
                                            {category}
                                        </label>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="filter-section">
                        <label>Job Type:</label>
                        <select value={jobType} onChange={(e) => setJobType(e.target.value)}>
                            <option value="">All</option>
                            <option value="Full-time">Full-time</option>
                            <option value="Part-time">Part-time</option>
                            <option value="Internship">Internship</option>
                        </select>
                    </div>
                </div>

                <div className="job-listings">

                    {recommendedJobs.length > 0 && (
                        <div className="recommended-slider">
                            <h2>🔍 Recommended for You</h2>
                            <div className="slider-track">
                                {recommendedJobs.map((job) => (
                                    <div
                                        className="job-card recommended"
                                        key={`recommended-${job.job_id}`}
                                        onClick={(e) => {
                                            if (!e.target.closest("button")) {
                                                navigate(`/job/${job.job_id}`);
                                            }
                                        }}
                                    >
                                        <h2>{job.title} 🌟</h2>
                                        <div className="recommendation-score">
                                            <strong>🔢 Recommendation Score:</strong>
                                            <div className="score-value">
                                                {job.score ? `${Number(job.score).toFixed(2)} / 10` : "N/A"}
                                            </div>
                                        </div>
                                        <p><strong>Company:</strong> {job.company_name}</p>
                                        <p className="rating-container">
                                            <span className="stars">
                                                {getCompanyRating(job.company_id)
                                                    ? renderStars(getCompanyRating(job.company_id))
                                                    : '☆☆☆☆☆'}
                                            </span>
                                            <span className="rating-text">
                                                {getCompanyRating(job.company_id)
                                                    ? `${getCompanyRating(job.company_id)} / 5`
                                                    : 'No ratings yet'}
                                            </span>
                                        </p>
                                        <p><strong>Location:</strong> {job.location}</p>
                                        <p><strong>Category:</strong> {job.category}</p>
                                        <p><strong>Type:</strong> {job.job_type}</p>
                                        <p><strong>Remote: </strong> {job.remote_option === 1 ? 'Yes' : 'No'}</p>
                                        <p><strong>Salary:</strong> {job.salary?.toLocaleString() ? `$${job.salary.toLocaleString()}` : 'Not available'}</p>
                                        <p><strong>Description:</strong> {job.description}</p>
                                        <div className="job-buttons">
                                            <button
                                                className="apply-btn"
                                                onClick={() => handleApplication(job.job_id)}
                                                disabled={appliedJobs.includes(job.job_id)}
                                            >
                                                {appliedJobs.includes(job.job_id) ? 'Applied ✅' : 'Apply Now'}
                                            </button>
                                            <button
                                                className="message-btn"
                                                onClick={() => handleSelectEmployer(job)}
                                            >
                                                ✉️ Message Employer
                                            </button>
                                            <button
                                                className="save-btn"
                                                onClick={() => handleSaveJob(job.job_id)}
                                                disabled={savedJobs.includes(job.job_id)}
                                            >
                                                {savedJobs.includes(job.job_id) ? 'Saved ❤️' : 'Save'}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    <div className="jobs-container">
                        <h1>All Jobs</h1> 
                        <div className="jobs-layout">
                            <div className="job-listings">
                                {filteredJobs.length > 0 ? (
                                    filteredJobs.map((job) => (
                                        <div
                                            className="job-card"
                                            key={`job-${job.job_id}`}
                                            onClick={(e) => {
                                                if (!e.target.closest("button")) {
                                                    navigate(`/job/${job.job_id}`);
                                                }
                                            }}
                                        >
                                            <h2>{job.title}</h2>
                                            <p><strong>Company:</strong> {job.company_name}</p>
                                            <p className="rating-container">
                                                <span className="stars">
                                                    {getCompanyRating(job.company_id)
                                                        ? renderStars(getCompanyRating(job.company_id))
                                                        : '☆☆☆☆☆'}
                                                </span>
                                                <span className="rating-text">
                                                    {getCompanyRating(job.company_id)
                                                        ? `${getCompanyRating(job.company_id)} / 5`
                                                        : 'No ratings yet'}
                                                </span>
                                            </p>
                                            <p><strong>Location:</strong> {job.location}</p>
                                            <p><strong>Category:</strong> {job.category}</p>
                                            <p><strong>Type:</strong> {job.job_type}</p>
                                            <p><strong>Remote: </strong> {job.remote_option === 1 ? 'Yes' : 'No'}</p>
                                            <p><strong>Salary:</strong> {job.salary?.toLocaleString() ? `$${job.salary.toLocaleString()}` : 'Not available'}</p>
                                            <p><strong>Description:</strong> {job.description}</p>
                                            <div className="job-buttons">
                                                <button
                                                    className="apply-btn"
                                                    onClick={() => handleApplication(job.job_id)}
                                                    disabled={appliedJobs.includes(job.job_id)}
                                                >
                                                    {appliedJobs.includes(job.job_id) ? 'Applied ✅' : 'Apply Now'}
                                                </button>
                                                <button
                                                    className="message-btn"
                                                    onClick={() => handleSelectEmployer(job)}
                                                >
                                                    ✉️ Message Employer
                                                </button>
                                                <button
                                                    className="save-btn"
                                                    onClick={() => handleSaveJob(job.job_id)}
                                                    disabled={savedJobs.includes(job.job_id)}
                                                >
                                                    {savedJobs.includes(job.job_id) ? 'Saved ❤️' : 'Save'}
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p>No jobs found.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {selectedEmployer && (
                <div className="message-modal">
                    <div className="modal-content">
                        <h3>Sending a message to employer for job: <strong>{selectedEmployer.title}</strong></h3>
                        <textarea
                            placeholder="Type your message..."
                            value={messageText}
                            onChange={(e) => setMessageText(e.target.value)}
                            rows="5"
                            className="message-textarea"
                        />
                        <button onClick={handleSendMessage}>Send Message</button>
                        <button onClick={() => setSelectedEmployer(null)}>Close</button>
                    </div>
                </div>
            )}
        </div>
    );

}
export default Jobs;