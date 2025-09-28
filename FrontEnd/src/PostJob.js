import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { postJob } from './JobController';
import './PostJob.css';

function PostJob() {
    const location = useLocation();
    const navigate = useNavigate();
    const employerId = location.state?.userId;

    const [formData, setFormData] = useState({
        employer_id: employerId,
        title: '',
        description: '',
        location: '',
        skills_required: '',
        created_at: new Date().toISOString().split('T')[0], 
        salary: '',
        job_type: '',
        remote_option: 'No',
    });

    const [errorMessage, setErrorMessage] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await postJob(formData);
            console.log('Job posted successfully:', response);
            navigate('/dashboard'); 
        } catch (error) {
            setErrorMessage('Failed to post job. Please try again.');
        }
    };

    return (
        <div className="post-job">
            <h2>Post a New Job</h2>
            {errorMessage && <p className="error">{errorMessage}</p>}
            <form onSubmit={handleSubmit}>
                <label>
                    Job Title:
                    <input
                        type="text"
                        name="title"
                        placeholder="Enter job title"
                        value={formData.title}
                        onChange={handleChange}
                        required
                    />
                </label>
                <label>
                    Description:
                    <textarea
                        name="description"
                        placeholder="Enter job description"
                        value={formData.description}
                        onChange={handleChange}
                        required
                    />
                </label>
                <label>
                    Location:
                    <input
                        type="text"
                        name="location"
                        placeholder="Enter job location"
                        value={formData.location}
                        onChange={handleChange}
                        required
                    />
                </label>
                <label>
                    Skills Required:
                    <input
                        type="text"
                        name="skills_required"
                        placeholder="Enter required skills (comma-separated)"
                        value={formData.skills_required}
                        onChange={handleChange}
                        required
                    />
                </label>
                <label>
                    Salary:
                    <input
                        type="number"
                        name="salary"
                        placeholder="Enter salary amount"
                        value={formData.salary}
                        onChange={handleChange}
                        required
                    />
                </label>
                <label>
                    Job Type:
                    <select name="job_type" value={formData.job_type} onChange={handleChange} required>
                        <option value="">Select Job Type</option>
                        <option value="Full-time">Full-time</option>
                        <option value="Part-time">Part-time</option>
                        <option value="Contract">Contract</option>
                        <option value="Internship">Internship</option>
                    </select>
                </label>
                <label>
                    Remote Option:
                    <select name="remote_option" value={formData.remote_option} onChange={handleChange} required>
                        <option value="No">No</option>
                        <option value="Yes">Yes</option>
                    </select>
                </label>
                <button type="submit">Post Job</button>
            </form>
        </div>
    );
}

export default PostJob;
