import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { socket } from './socket';
import './Applicants.css';

function Applicants({ user }) {
    const [applicants, setApplicants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCandidate, setSelectedCandidate] = useState(null);
    const [selectedCandidateName, setSelectedCandidateName] = useState("");
    const [messageText, setMessageText] = useState("");
    const [acceptingApplicant, setAcceptingApplicant] = useState(null);
    const [decliningApplicant, setDecliningApplicant] = useState(null);


    const navigate = useNavigate();
    const user_id = user?.user_id;

    useEffect(() => {
        if (!user_id) return;
        fetch(`http://localhost:5000/applications/employer/${user_id}`)
            .then((res) => res.json())
            .then((data) => {
                const pendingApplications = data.filter(app => app.application_status !== 'accepted');
                setApplicants(pendingApplications);
                setLoading(false);
            })
            .catch((err) => {
                console.error("Error fetching applicants:", err);
                setLoading(false);
            });
    }, [user_id]);


    const handleSendMessage = () => {
        if (!user_id || !selectedCandidate || !messageText.trim()) return;

        const messageData = {
            sender_id: user_id,
            receiver_id: selectedCandidate,
            message: messageText.trim(),
        };

        fetch("http://localhost:5000/messages", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(messageData),
        })
            .then((res) => res.json())
            .then((newMessage) => {
                if (newMessage.message_id) {
                    socket.emit("sendMessage", newMessage);
                    alert("Message sent!");
                    setMessageText("");
                    setSelectedCandidate(null);
                }
            })
            .catch((err) => console.error("Error sending message:", err));
    };

    const handleAcceptApplicant = async (application_id) => {
        setAcceptingApplicant(application_id);
        try {
            const res = await fetch(`http://localhost:5000/applications/application/${application_id}`, {
                method: 'PUT',
            });
            if (!res.ok) throw new Error("Failed to accept applicant");
            const data = await res.json();

            setApplicants((prev) =>
                prev.map((a) =>
                    a.application_id === application_id
                        ? { ...a, application_status: 'accepted' }
                        : a
                )
            );

            alert(data.message || "Applicant accepted.");
        } catch (error) {
            console.error("Accept error:", error);
            alert("Could not accept applicant.");
        } finally {
            setAcceptingApplicant(null);
        }
    };

    const handleDeclineApplicant = async (application_id) => {
        setDecliningApplicant(application_id);
        try {
            const res = await fetch(`http://localhost:5000/applications/application/${application_id}`, {
                method: 'PUT',
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: "declined" })
            });
            if (!res.ok) throw new Error("Failed to decline applicant");
            const data = await res.json();

            setApplicants((prev) =>
                prev.map((a) =>
                    a.application_id === application_id
                        ? { ...a, application_status: 'declined' }
                        : a
                )
            );

            alert(data.message || "Applicant declined.");
        } catch (error) {
            console.error("Decline error:", error);
            alert("Could not decline applicant.");
        } finally {
            setDecliningApplicant(null);
        }
    };

    if (!user_id) return <p>Please log in to view applicants.</p>;

    if (loading) return <div className="spinner">Loading applicants...</div>;

    return (
        <div className="applicants-container">
            <h1>Applicants for Your Jobs</h1>
            {applicants.length === 0 ? (
                <p>No applicants found.</p>
            ) : (
                <div className="applicant-list">
                    {applicants.map((a) => (
                        <div key={a.application_id} className="applicant-card">
                            <h3>{a.candidate_first_name} {a.candidate_last_name}</h3>
                            <p><strong>Email:</strong> {a.candidate_email}</p>
                            <p><strong>Job:</strong> {a.job_title}</p>
                            <p><strong>Status:</strong> {a.application_status}</p>
                            <p><strong>Applied:</strong> {new Date(a.application_date).toLocaleString()}</p>
                            <div className="button-group">
                                <button onClick={() => navigate(`/Profile/${a.candidate_id}`)}>View Profile</button>
                                <button
                                    onClick={() => {
                                        setSelectedCandidate(a.candidate_id);
                                        setSelectedCandidateName(`${a.candidate_first_name} ${a.candidate_last_name}`);
                                        setMessageText("");
                                    }}
                                >
                                    ✉️ Message
                                </button>
                                {a.application_status?.toLowerCase().trim() !== "accepted" && (
                                    <button
                                        onClick={() => handleAcceptApplicant(a.application_id)}
                                        disabled={acceptingApplicant === a.application_id}
                                    >
                                        {acceptingApplicant === a.application_id ? "Accepting..." : "Accept"}
                                    </button>
                                )}
                                {a.application_status?.toLowerCase().trim() !== "declined" && (
                                    <button
                                        onClick={() => handleDeclineApplicant(a.application_id)}
                                        disabled={decliningApplicant === a.application_id}
                                    >
                                        {decliningApplicant === a.application_id ? "Declining..." : "Decline"}
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {selectedCandidate && (
                <div className="message-modal">
                    <div className="modal-content">
                        <h3>Send message to {selectedCandidateName}</h3>
                        <textarea
                            value={messageText}
                            onChange={(e) => setMessageText(e.target.value)}
                            placeholder="Type a message..."
                        />
                        {!messageText.trim() && <p className="error-message">Message cannot be empty</p>}
                        <button
                            onClick={handleSendMessage}
                            disabled={!messageText.trim()}
                        >
                            Send
                        </button>
                        <button onClick={() => setSelectedCandidate(null)}>Close</button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Applicants;
