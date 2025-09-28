import React, { useEffect, useState } from 'react';
import './Applications.css';

function Applications({ user }) {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const user_id = user?.user_id;

    useEffect(() => {
        if (!user || !user_id) {
            console.error('User ID is undefined. Cannot fetch applications.');
            setLoading(false);
            return;
        }

        fetchApplications();
    }, [user_id]);

    const fetchApplications = () => {
        fetch(`http://localhost:5000/applications/candidate/${user_id}`)
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Failed to fetch applications');
                }
                return response.json();
            })
            .then((data) => {
                setApplications(data);
                setLoading(false);
            })
            .catch((error) => {
                console.error('Error fetching applications:', error);
                setLoading(false);
            });
    };

    const handleDeleteApplication = (applicationId) => {
        if (!window.confirm("Are you sure you want to delete this application?")) return;

        fetch(`http://localhost:5000/applications/${applicationId}`, {
            method: 'DELETE',
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to delete application');
            }
            return response.json();
        })
        .then(() => {
            setApplications(applications.filter(app => app.application_id !== applicationId));
            alert('Application deleted successfully!');
        })
        .catch(error => {
            console.error('Error deleting application:', error);
        });
    };

    if (!user_id) {
        return <p>Please log in to view your applications.</p>;
    }

    if (loading) {
        return <p>Loading applications...</p>;
    }

    return (
        <div className="applications-container">
            <h1>Your Applications</h1>
            {applications.length === 0 ? (
                <p>You haven't applied to any jobs yet.</p>
            ) : (
                <div className="application-list">
                    {applications.map((application) => (
                        <div key={application.application_id} className="application-card">
                            <h3>{application.job_title}</h3>
                            <p><strong>Company:</strong> {application.company_name}</p>
                            <p><strong>Location:</strong> {application.company_location}</p>
                            <p><strong>Salary:</strong> {application.job_salary}</p>
                            <p><strong>Applied At:</strong> {new Date(application.application_date).toLocaleString()}</p>
                            <button 
                                className="delete-button"
                                onClick={() => handleDeleteApplication(application.application_id)}
                            >
                                ❌ Delete Application
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default Applications;
