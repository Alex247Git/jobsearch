import React, { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import './MyJob.css';
import { apiFetch } from '../api';

function MyJob({ user }) {
    const [jobInfo, setJobInfo] = useState(null);
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState('');

    useEffect(() => {
        if (!user?.user_id) return;

        apiFetch(`/employed/${user.user_id}`)
            .then((res) => res.json())
            .then((data) => setJobInfo(data))
            .catch((err) => console.error("Error fetching job info:", err));
    }, [user]);

    const handleSubmitRating = () => {
        console.log("Submitting rating with:", {
            user_id: user?.user_id,
            company_id: jobInfo?.company_id,
            rating,
            comment,
        });
        if (!rating || !jobInfo?.company_id || !user?.user_id) {
            alert("Please provide all required fields.");
            return;
        }
        apiFetch(`/company_ratings`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                user_id: user.user_id,
                company_id: jobInfo.company_id,
                rating,
                comment,
            }),
        })
            .then((res) => {
                if (res.ok) {
                    alert('Rating submitted!');
                    setRating(0);
                    setComment('');
                } else {
                    throw new Error('Failed to submit rating');
                }
            })
            .catch((err) => console.error(err));
    };

    const handleLeaveJob = () => {
        if (!window.confirm("Are you sure you want to leave this job?")) return;

        apiFetch(`/employed/leavejob/${user.user_id}`, {
            method: 'DELETE',
        })
            .then((res) => {
                if (res.ok) {
                    alert('You have left the job.');
                    setJobInfo(null);
                } else {
                    throw new Error('Failed to leave job');
                }
            })
            .catch((err) => console.error(err));
    };

    const renderList = (data) => {
        if (!data) return "N/A";
        if (typeof data === 'string') data = data.split(',');
        return Array.isArray(data) ? data.join(', ') : data;
    };

    if (!jobInfo) {
        return <div className="container"><p>Loading job information...</p></div>;
    }

    return (
        <div className="container">
            <h1 className="title">My Job Information</h1>

            <div className="section">
                <h2 className="sectionTitle">Job Info</h2>
                <p className="paragraph"><strong>Title:</strong> {jobInfo.job_title}</p>
                <p className="paragraph"><strong>Description:</strong> {jobInfo.job_description}</p>
                <p className="paragraph"><strong>Location:</strong> {jobInfo.job_location}</p>
                <p className="paragraph"><strong>Skills Required:</strong> {renderList(jobInfo.job_skills)}</p>
                <p className="paragraph"><strong>Salary:</strong> {jobInfo.job_salary ? `$${jobInfo.job_salary}` : 'Not specified'}</p>
                <p className="paragraph"><strong>Job Type:</strong> {jobInfo.job_type}</p>
                <p className="paragraph"><strong>Remote Option:</strong> {jobInfo.remote_option ? 'Yes' : 'No'}</p>
                <p className="paragraph"><strong>Category:</strong> {jobInfo.job_category}</p>
                <p className="paragraph"><strong>Available:</strong> {jobInfo.is_available ? '✅' : '❌'}</p>
            </div>

            <div className="section">
                <h2 className="sectionTitle">Company Info</h2>
                <p className="paragraph"><strong>Company ID:</strong> {jobInfo.company_id}</p>
                <p className="paragraph"><strong>Company Name:</strong> {jobInfo.company_name}</p>
                <p className="paragraph"><strong>Industry:</strong> {jobInfo.company_industry}</p>
                <p className="paragraph"><strong>Location:</strong> {jobInfo.company_location}</p>
            </div>

            <div className="section">
                <h2 className="sectionTitle">Employer Info</h2>
                <p className="paragraph"><strong>Age:</strong> {jobInfo.employer_age}</p>
                <p className="paragraph"><strong>Bio:</strong> {jobInfo.employer_bio}</p>
                <p className="paragraph"><strong>Location:</strong> {jobInfo.employer_location}</p>
                <p className="paragraph"><strong>Website:</strong> <a href={jobInfo.employer_website} target="_blank" rel="noopener noreferrer">{jobInfo.employer_website}</a></p>
                <p className="paragraph"><strong>CV Link:</strong> <a href={jobInfo.employer_cv} target="_blank" rel="noopener noreferrer">Download</a></p>
            </div>

            <div className="section">
                <h2 className="sectionTitle">Rate the Company</h2>
                <div className="ratingStars">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                            key={star}
                            size={30}
                            color={(hoverRating || rating) >= star ? 'gold' : 'lightgray'}
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                            onClick={() => setRating(star)}
                            className="cursor-pointer"
                        />
                    ))}
                </div>

                <textarea
                    className="textarea"
                    placeholder="Leave a comment about the company..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                />

                <button className="button" onClick={handleSubmitRating}>
                    Submit Rating
                </button>
                <button className="button leave-button" onClick={handleLeaveJob}>
                    Leave Job
                </button>
            </div>
        </div>
    );
}

export default MyJob;
