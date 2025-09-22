import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; 
import './SavedJobs.css'; 

function SavedJobs({ user }) {
    const [savedJobs, setSavedJobs] = useState([]);
    const user_id = user?.user_id;
    const navigate = useNavigate(); 

    useEffect(() => {
        if (!user_id) {
            console.error('User ID is undefined. Cannot fetch saved jobs.');
            return;
        }
        fetch(`http://localhost:5000/saved_jobs/${user_id}`)
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Failed to fetch saved jobs');
                }
                return response.json();
            })
            .then((data) => setSavedJobs(data))
            .catch((error) => console.error('Error fetching saved jobs:', error));
    }, [user_id]);

    const handleRemoveJob = (jobId) => {
        if (!user_id) {
            console.error('User ID is undefined. Cannot remove saved job.');
            return;
        }
        fetch(`http://localhost:5000/saved_jobs/${user_id}/${jobId}`, {
            method: 'DELETE',
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Failed to remove saved job');
                }
                return response.json();
            })
            .then(() => {
                alert('Job removed successfully!');
                setSavedJobs(savedJobs.filter((job) => job.job_id !== jobId));
            })
            .catch((error) => console.error('Error removing job:', error));
    };

    const handleJobClick = (jobId) => {
        navigate(`/job/${jobId}`); 
    };

    return (
        <div className="saved-jobs-container">
            <h1>Your Saved Jobs</h1>
            <div className="saved-job-listings">
                {savedJobs.map((job) => (
                    <div
                        key={job.job_id}
                        className="saved-job-card"
                        onClick={() => handleJobClick(job.job_id)}
                        style={{ cursor: 'pointer' }} 
                    >
                        <h2>{job.title}</h2>
                        <p><strong>Company:</strong> {job.company_name}</p>
                        <p><strong>Location:</strong> {job.location}</p>
                        <p><strong>Type:</strong> {job.job_type}</p>
                        <p><strong>Remote Option:</strong> {job.remote_option}</p>
                        <p><strong>Salary:</strong> ${job.salary.toLocaleString()}</p>
                        <p><strong>Description:</strong> {job.description}</p>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveJob(job.job_id);
                            }}
                            className="saved-remove-button"
                        >
                            Remove Job
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default SavedJobs;
