import React, { useEffect, useState } from 'react';
import './MyEmployees.css';
import { API_BASE_URL } from '../api';

const MyEmployees = () => {
    const [employees, setEmployees] = useState([]);
    const [ratings, setRatings] = useState({});
    const [comments, setComments] = useState({});
    const [message, setMessage] = useState('');
    const employerId = localStorage.getItem('user_id');

    useEffect(() => {
        const fetchEmployees = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/employed/employer/${employerId}`);
                const data = await res.json();
                setEmployees(data);
            } catch (error) {
                console.error('Error fetching employees:', error);
            }
        };

        if (employerId) {
            fetchEmployees();
        }
    }, [employerId]);

    const handleRatingChange = (candidateId, value) => {
        setRatings({ ...ratings, [candidateId]: value });
    };

    const handleCommentChange = (candidateId, value) => {
        setComments({ ...comments, [candidateId]: value });
    };

    const handleSubmit = async (candidateId) => {
        try {
            const rating = ratings[candidateId];
            const comment = comments[candidateId];

            const res = await fetch(`${API_BASE_URL}/candidate_ratings`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    candidate_id: candidateId,
                    employer_id: employerId,
                    rating,
                    comment,
                }),
            });

            const data = await res.json();

            if (res.ok) {
                setMessage(data.message || 'Rating submitted successfully');
            } else {
                setMessage(data.error || 'Something went wrong');
            }
        } catch (error) {
            console.error('Error submitting rating:', error);
            setMessage('Error submitting rating');
        }
    };

    return (
        <div className="my-employees-container">
            <h2>My Employees</h2>
            {employees.length === 0 && <p>No employees found.</p>}

            <div className="my-employees-grid">
                {employees.map((emp) => (
                    <div key={emp.user_id} className="my-employees-card">
                        <h3>{emp.first_name} {emp.last_name}</h3>
                        <p>{emp.email}</p>
                        <p>📍 Location: {emp.location || 'N/A'}</p>
                        <p>🎓 Education: {emp.education || 'N/A'}</p>
                        <p>🎖️ Certifications: {emp.certifications || 'N/A'}</p>
                        <p>🗣️ Languages: {emp.languages || 'N/A'}</p>

                        {emp.website && (
                            <p>🔗 Website: <a href={emp.website} target="_blank" rel="noopener noreferrer">{emp.website}</a></p>
                        )}
                        {emp.social_links && (
                            <p>🌐 Social: <a href={emp.social_links} target="_blank" rel="noopener noreferrer">{emp.social_links}</a></p>
                        )}

                        <label>Rating:</label>
                        <select
                            value={ratings[emp.user_id] || ''}
                            onChange={(e) => handleRatingChange(emp.user_id, e.target.value)}
                        >
                            <option value="">Select Rating</option>
                            {[1, 2, 3, 4, 5].map((num) => (
                                <option key={num} value={num}>
                                    {num} Star{num > 1 ? 's' : ''}
                                </option>
                            ))}
                        </select>

                        <label>Comment:</label>
                        <textarea
                            rows="3"
                            value={comments[emp.user_id] || ''}
                            onChange={(e) => handleCommentChange(emp.user_id, e.target.value)}
                            placeholder="Write a comment about this employee..."
                        />

                        <button onClick={() => handleSubmit(emp.user_id)}>Submit Rating</button>
                    </div>
                ))}
            </div>

            {message && <p className="my-employees-message">{message}</p>}
        </div>
    );
};

export default MyEmployees;
