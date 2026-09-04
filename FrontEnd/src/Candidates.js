import React, { useEffect, useState } from 'react';
import { socket } from './socket';
import { useNavigate } from 'react-router-dom';
import './Candidates.css';

function Candidates({ user }) {
    const [candidates, setCandidates] = useState([]);
    const [filteredCandidates, setFilteredCandidates] = useState([]);
    const [recommendedCandidates, setRecommendedCandidates] = useState([]);
    const [selectedCandidate, setSelectedCandidate] = useState(null);
    const [selectedCandidateName, setSelectedCandidateName] = useState("");
    const [messageText, setMessageText] = useState("");
    const [chatHistory, setChatHistory] = useState([]);
    const [searchName, setSearchName] = useState("");
    const [locationFilter, setLocationFilter] = useState("");
    const [availabilityFilter, setAvailabilityFilter] = useState("");
    const [jobFilter, setJobFilter] = useState("");
    const [jobs, setJobs] = useState([]);
    const [filteredRecommendedCandidates, setFilteredRecommendedCandidates] = useState([]);

    const navigate = useNavigate();

    useEffect(() => {
        fetch('http://localhost:5000/candidates')
            .then(res => res.json())
            .then(data => {
                setCandidates(data);
                setFilteredCandidates(data);
            })
            .catch(err => console.error('Error fetching candidates:', err));
    }, []);

    useEffect(() => {
        socket.on("receiveMessage", (newMessage) => {
            setChatHistory(prev => [...prev, newMessage]);
        });
        return () => {
            socket.off("receiveMessage");
        };
    }, []);

    useEffect(() => {
        if (user?.user_id) {
            const baseUrl = `http://localhost:5000/recommendations/candidates/${user.user_id}`;
            const queryParams = new URLSearchParams();
            if (jobFilter) {
                queryParams.append("job_id", jobFilter);
            }
            queryParams.append("limit", 10);
            queryParams.append("offset", 0);
            const url = `${baseUrl}?${queryParams.toString()}`;
            console.log("Fetching recommendations with URL:", url);
            console.log("Selected job ID (jobFilter):", jobFilter);
            fetch(url)
                .then(res => res.json())
                .then(data => {
                    if (Array.isArray(data)) {
                        setRecommendedCandidates(data);
                        console.log("Recommended Candidates:", data);
                    } else {
                        console.warn("Invalid data received for recommendations:", data);
                        setRecommendedCandidates([]);
                    }
                })
                .catch(err => {
                    console.error('Error fetching recommended candidates:', err);
                    setRecommendedCandidates([]);
                });
        }
    }, [user, jobFilter]);

    useEffect(() => {
        if (user?.user_id) {
            fetch(`http://localhost:5000/jobs/employer/${user.user_id}`)
                .then(res => res.json())
                .then(data => setJobs(data))
                .catch(err => console.error('Error fetching jobs:', err));
        }
    }, [user]);

    useEffect(() => {
        let updated = [...candidates];
        if (searchName.trim()) {
            updated = updated.filter(c =>
                (`${c.first_name} ${c.last_name}`).toLowerCase().includes(searchName.toLowerCase())
            );
        }
        if (locationFilter.trim()) {
            updated = updated.filter(c =>
                c.location?.toLowerCase().includes(locationFilter.toLowerCase())
            );
        }
        if (availabilityFilter) {
            updated = updated.filter(c =>
                c.availability === availabilityFilter
            );
        }
        setFilteredCandidates(updated);
        let updatedRecommended = [...recommendedCandidates];
        if (jobFilter) {
            updatedRecommended = updatedRecommended.filter(c =>
                String(c.job_id) === String(jobFilter)
            );
        }
        setFilteredRecommendedCandidates(updatedRecommended);
    }, [searchName, locationFilter, availabilityFilter, jobFilter, candidates, recommendedCandidates]);

    const recommendedIds = new Set(filteredRecommendedCandidates.map(c => c.user_id));

    const filteredAvailableCandidates = filteredCandidates.filter(c => !recommendedIds.has(c.user_id));

    const handleViewProfile = (candidateId) => {
        if (!candidateId) {
            console.error('Candidate ID is missing');
            return;
        }
        navigate(`/Profile/${candidateId}`);
    };

    const handleOpenMessageModal = (candidateId, candidateName) => {
        setSelectedCandidate(candidateId);
        setSelectedCandidateName(candidateName);
        setMessageText("");
        if (user?.user_id && candidateId) {
            fetchChatHistory(user.user_id, candidateId);
        }
    };

    const fetchChatHistory = (senderId, receiverId) => {
        fetch(`http://localhost:5000/messages/${senderId}/${receiverId}`)
            .then(res => res.json())
            .then(data => setChatHistory(data))
            .catch(err => console.error('Error fetching chat history:', err));
    };

    const handleSendMessage = () => {
        if (!user?.user_id || !selectedCandidate || !messageText.trim()) {
            alert('Please enter a message before sending.');
            return;
        }

        const messageData = {
            sender_id: user.user_id,
            receiver_id: selectedCandidate,
            message: messageText.trim(),
        };

        fetch('http://localhost:5000/messages', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(messageData),
        })
            .then(res => res.json())
            .then(newMessage => {
                if (newMessage && newMessage.message_id) {
                    setChatHistory(prev => [...prev, newMessage]);
                    setMessageText("");
                } else {
                    console.error('Failed to send message:', newMessage);
                }
            })
            .catch(err => console.error('Error sending message:', err));
    };

    return (
        <div className="candidates-page">
            <div className="candidates-sidebar">
                <h3>Search Candidates</h3>
                <div className="filter-group">
                    <input
                        type="text"
                        placeholder="e.g. John Doe"
                        value={searchName}
                        onChange={(e) => setSearchName(e.target.value)}
                    />
                </div>
                <h3>Filters</h3>
                <div className="filter-group">
                    <label>Filter Recommendations by Job</label>
                    <select value={jobFilter} onChange={(e) => setJobFilter(e.target.value)}>
                        <option value="">All Jobs</option>
                        {Array.isArray(jobs) && jobs.map((job) => (
                            <option key={job.job_id} value={job.job_id}>{job.title}</option>
                        ))}
                    </select>
                </div>
                <div className="filter-group">
                    <label>Location</label>
                    <input
                        type="text"
                        placeholder="e.g. Athens"
                        value={locationFilter}
                        onChange={(e) => setLocationFilter(e.target.value)}
                    />
                </div>
                <div className="filter-group">
                    <label>Availability</label>
                    <select
                        value={availabilityFilter}
                        onChange={(e) => setAvailabilityFilter(e.target.value)}
                    >
                        <option value="">All</option>
                        <option value="Yes">Available</option>
                        <option value="No">Not Available</option>
                    </select>
                </div>
            </div>

            <div className="candidates-main">
                {filteredRecommendedCandidates.length > 0 && (
                    <div className="recommended-slider">
                        <h2>🎯 Recommended Candidates</h2>
                        <div className="slider-track">
                            {filteredRecommendedCandidates.map(candidate => (
                                <div className="candidate-card recommended" key={`rec-${candidate.recommendation_id}`}>
                                    <span className="badge">⭐ Score {Number(candidate.score).toFixed(2)}</span>
                                    <h2>{candidate.first_name} {candidate.last_name}</h2>
                                    <p><strong>Location:</strong> {candidate.location}</p>
                                    <p><strong>Education:</strong> {candidate.education}</p>
                                    <p><strong>Certifications:</strong> {renderList(candidate.certifications)}</p>
                                    <p><strong>Languages:</strong> {renderList(candidate.languages)}</p>
                                    <p><strong>Availability:</strong> {candidate.availability === "Yes" ? "✅" : "❌"}</p>
                                    <p><strong>Bio:</strong> {candidate.bio}</p>
                                    <p><strong>Skills:</strong> {renderList(candidate.skills)}</p>
                                    <p><strong>Experience:</strong> {candidate.experience}</p>
                                    <p><strong>Age:</strong> {candidate.age}</p>
                                    <p><strong>Website:</strong> <a href={candidate.website} target="_blank" rel="noopener noreferrer">{candidate.website}</a></p>
                                    <p><strong>Social Links:</strong> {renderList(candidate.social_links)}</p>
                                    <p><strong>CV:</strong> <a href={candidate.cv} target="_blank" rel="noopener noreferrer">Download CV</a></p>
                                    <div className="candidate-buttons">
                                        <button
                                            className="apply-btn" onClick={() => handleViewProfile(candidate.candidate_id)}>
                                            🔎 View Profile
                                        </button>
                                        <button className="message-btn" onClick={() => handleOpenMessageModal(candidate.candidate_id, `${candidate.first_name} ${candidate.last_name}`)}>
                                            ✉️ Message
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="candidates-content">
                    <div className="candidates-list">
                        {filteredAvailableCandidates.length > 0 ? (
                            filteredAvailableCandidates.map(candidate => (
                                <div className="candidate-card" key={`cand-${candidate.user_id}`}>
                                    <h3>{candidate.first_name} {candidate.last_name}</h3>
                                    <p><strong>Location:</strong> {candidate.location}</p>
                                    <p><strong>Education:</strong> {candidate.education}</p>
                                    <p><strong>Certifications:</strong> {renderList(candidate.certifications)}</p>
                                    <p><strong>Languages:</strong> {renderList(candidate.languages)}</p>
                                    <p><strong>Availability:</strong> {candidate.availability === "Yes" ? "✅" : "❌"}</p>
                                    <p><strong>Bio:</strong> {candidate.bio}</p>
                                    <p><strong>Skills:</strong> {renderList(candidate.skills)}</p>
                                    <p><strong>Experience:</strong> {candidate.experience}</p>
                                    <p><strong>Age:</strong> {candidate.age}</p>
                                    <p><strong>Website:</strong> <a href={candidate.website} target="_blank" rel="noopener noreferrer">{candidate.website}</a></p>
                                    <p><strong>Social Links:</strong> {renderList(candidate.social_links)}</p>
                                    <p><strong>CV:</strong> <a href={candidate.cv} target="_blank" rel="noopener noreferrer">Download CV</a></p>
                                    <div className="candidate-buttons">
                                        <button className="apply-btn" onClick={() => handleViewProfile(candidate.user_id)}>
                                            🔎 View Profile
                                        </button>
                                        <button className="message-btn" onClick={() => handleOpenMessageModal(candidate.user_id, `${candidate.first_name} ${candidate.last_name}`)}>
                                            ✉️ Message
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p>No candidates found matching your filters.</p>
                        )}
                    </div>
                </div>

                {selectedCandidate && (
                    <div className="message-modal">
                        <div className="modal-content">
                            <h3>Chat with {selectedCandidateName || "Candidate"}</h3>
                            <textarea
                                value={messageText}
                                onChange={(e) => setMessageText(e.target.value)}
                                placeholder="Type your message..."
                            />
                            <button onClick={handleSendMessage}>Send</button>
                            <button onClick={() => setSelectedCandidate(null)}>Close</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
function renderList(field) {
    if (Array.isArray(field)) {
        return field.join(', ');
    }
    if (typeof field === 'string') {
        try {
            const parsed = JSON.parse(field);
            if (Array.isArray(parsed)) {
                return parsed.join(', ');
            }
            return field;
        } catch {
            return field;
        }
    }
    return field || "";
}

export default Candidates;
