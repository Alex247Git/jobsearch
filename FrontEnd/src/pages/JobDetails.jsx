import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./JobDetails.css";
import { apiFetch } from '../api';

function JobDetails({ user }) {
    const { jobId } = useParams();
    const navigate = useNavigate();
    const [job, setJob] = useState(null);
    const [appliedJobs, setAppliedJobs] = useState([]);
    const [savedJobs, setSavedJobs] = useState([]);
    const [selectedEmployer, setSelectedEmployer] = useState(null);
    const [messageText, setMessageText] = useState("");
    const [chatHistory, setChatHistory] = useState([]);
    const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);

    useEffect(() => {
        apiFetch(`/jobs/${jobId}`)
            .then(response => response.json())
            .then(data => setJob(data))
            .catch(error => console.error("Error fetching job details:", error));
    }, [jobId]);

    useEffect(() => {
        if (user?.user_id) {
            apiFetch(`/applications/candidate/${user.user_id}`)
                .then(response => response.json())
                .then(data => setAppliedJobs(data.map(application => application.job_id)))
                .catch(error => console.error('Error fetching applied jobs:', error));

            apiFetch(`/saved_jobs/${user.user_id}`)
                .then(response => response.json())
                .then(data => setSavedJobs(data.map(job => job.job_id)))
                .catch(error => console.error('Error fetching saved jobs:', error));
        }
    }, [user]);

    const handleApplication = () => {
        if (!user?.user_id) {
            alert('You need to log in to apply for jobs.');
            return;
        }

        if (appliedJobs.includes(job.job_id)) {
            alert('You have already applied for this job.');
            return;
        }

        apiFetch(`/applications`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                user_id: user.user_id,
                job_id: job.job_id,
                status: 'pending',
                applied_at: new Date().toISOString(),
            }),
        })
            .then(response => response.json())
            .then(() => {
                alert('Application submitted successfully!');
                setAppliedJobs(prev => [...prev, job.job_id]);
            })
            .catch(error => console.error('Error applying for job:', error));
    };

    const handleSaveJob = () => {
        if (!user?.user_id) {
            alert('You need to log in to save jobs.');
            return;
        }

        if (savedJobs.includes(job.job_id)) {
            alert('This job is already saved.');
            return;
        }

        apiFetch(`/saved_jobs`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                user_id: user.user_id,
                job_id: job.job_id,
                role: user.role
            }),
        })
            .then(response => response.json())
            .then(() => {
                alert('Job saved successfully!');
                setSavedJobs(prev => [...prev, job.job_id]);
            })
            .catch(error => console.error('Error saving job:', error));
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

        apiFetch(`/messages`, {
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

    if (!job) return <p>Loading job details...</p>;

    return (
        <div className="job-details-container">
            <h1>{job.title}</h1>
            <p><strong>Company:</strong> {job.company_name}</p>
            <p><strong>Location:</strong> {job.location}</p>
            <p><strong>Type:</strong> {job.job_type}</p>
            <p><strong>Remote Option:</strong> {job.remote_option}</p>
            <p><strong>Salary:</strong> ${job.salary.toLocaleString()}</p>
            <p><strong>Description:</strong> {job.description}</p>

            <div className="job-buttons">
                <button
                    className="apply-btn"
                    onClick={handleApplication}
                    disabled={appliedJobs.includes(job.job_id)}
                >
                    {appliedJobs.includes(job.job_id) ? 'Applied ✅' : 'Apply Now'}
                </button>
                <button
                    className="save-btn"
                    onClick={handleSaveJob}
                    disabled={savedJobs.includes(job.job_id)}
                >
                    {savedJobs.includes(job.job_id) ? 'Saved ❤️' : 'Save'}
                </button>
                <button
                    className="message-btn"
                    onClick={() => {
                        setSelectedEmployer(job);
                        setMessageText("");
                        setIsMessageModalOpen(true);
                        if (user?.user_id) {
                            fetchChatHistory(user.user_id, job.employer_id);
                        }
                    }}
                >
                    ✉️ Message Employer
                </button>
                <button
                    className="profile-btn"
                    onClick={() => {
                        console.log("Full job object:", job);
                        console.log("Employer ID:", job.employer_id);
                        if (job.employer_id) {
                            navigate(`/profile/${job.employer_id}`); 
                        } else {
                            console.error("Employer ID is not available.");
                        }
                    }}
                >
                    View Employer Profile
                </button>
                <button
                    className="company-btn"
                    onClick={() => navigate(`/companies/${job.company_id}`)}
                >
                    View Company
                </button>
            </div>
            {isMessageModalOpen && selectedEmployer && (
                <div className="message-modal">
                    <div className="modal-content">
                        <h3>Message to Employer: <strong>{selectedEmployer.title}</strong></h3>
                        <textarea
                            placeholder="Type your message..."
                            value={messageText}
                            onChange={(e) => setMessageText(e.target.value)}
                            rows="5"
                            style={{ width: '100%' }}
                        />
                        <button onClick={handleSendMessage}>Send Message</button>
                        <button onClick={() => setIsMessageModalOpen(false)}>Close</button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default JobDetails;
