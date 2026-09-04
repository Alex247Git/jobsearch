import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import "./Profile.css";
import { API_BASE_URL } from './api';

function Profile({ user }) {
    const { userId: paramUserId } = useParams();
    const viewedUserId = paramUserId || user?.user_id;

    const [profile, setProfile] = useState(null);
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({});

    useEffect(() => {
        if (!viewedUserId) {
            setError("No user ID found.");
            setLoading(false);
            return;
        }

        const fetchUserData = async () => {
            try {
                const userRes = await fetch(`${API_BASE_URL}/users/${viewedUserId}`, {
                    headers: { Authorization: `Bearer ${user.token}` },
                });
                if (!userRes.ok) throw new Error("Failed to fetch user data");
                const userJson = await userRes.json();
                setUserData(userJson);
            } catch (err) {
                setError("Failed to load user data.");
            }
        };

        const fetchProfileData = async () => {
            try {
                const profileRes = await fetch(`${API_BASE_URL}/profiles/${viewedUserId}`);
                if (!profileRes.ok) throw new Error("Failed to fetch profile");
                const profileJson = await profileRes.json();
                setProfile(profileJson);
                setFormData(profileJson);
            } catch (err) {
                setError("Failed to load profile.");
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
        fetchProfileData();
    }, [viewedUserId]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/profiles/${viewedUserId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${user.token}`
                },
                body: JSON.stringify(formData)
            });
            if (!response.ok) throw new Error("Failed to update profile");
            const updated = await response.json();
            setProfile({ ...profile, ...formData });
            setIsEditing(false);
        } catch (err) {
            setError("Failed to update profile.");
        }
    };

    if (loading) return <p className="loading-text">Loading profile...</p>;
    if (error) return <p className="error-text">{error}</p>;
    if (!profile || !userData) return <p className="error-text">No profile or user data found</p>;

    const isOwner = user && String(user.user_id) === String(profile.user_id);

    return (
        <div className="profile-container">
            <div className="profile-header">
                <h1>{userData.first_name} {userData.last_name}</h1>
                <p className="profile-location">
                    📍 {isEditing ?
                        <input name="location" value={formData.location || ""} onChange={handleInputChange} /> :
                        profile.location || "Location not set"}
                </p>
            </div>
            <div className="profile-info">
                <p><strong>Email:</strong> {userData.email}</p>
                <p><strong>Phone:</strong> {isEditing ? <input name="phone_number" value={userData.phone_number || ""} onChange={handleInputChange} /> : userData.phone_number || "Not provided"}</p>
                <p><strong>Date of Birth:</strong> {isEditing ? <input type="date" name="date_of_birth" value={userData.date_of_birth || ""} onChange={handleInputChange} /> : userData.date_of_birth || "Not specified"}</p>
                <p><strong>Bio:</strong> {isEditing ? <textarea name="bio" value={formData.bio || ""} onChange={handleInputChange} /> : formData.bio || "Not specified"}</p>
                <p><strong>Skills:</strong> {isEditing ? <input name="skills" value={formData.skills || ""} onChange={handleInputChange} /> : formData.skills || "Not specified"}</p>
                <p><strong>Experience:</strong> {isEditing ? <input name="experience" value={formData.experience || ""} onChange={handleInputChange} /> : formData.experience || "Not specified"}</p>
                <p><strong>Education:</strong> {isEditing ? <input name="education" value={formData.education || ""} onChange={handleInputChange} /> : formData.education || "Not specified"}</p>
                <p><strong>Certifications:</strong> {isEditing ? <input name="certifications" value={formData.certifications || ""} onChange={handleInputChange} /> : formData.certifications || "Not specified"}</p>
                <p><strong>Languages:</strong> {isEditing ? <input name="languages" value={formData.languages || ""} onChange={handleInputChange} /> : formData.languages || "Not specified"}</p>
                <p><strong>CV:</strong> {isEditing ?
                    <input name="cv" value={formData.cv || ""} onChange={handleInputChange} /> :
                    (formData.cv ? <a href={formData.cv} target="_blank" rel="noopener noreferrer">{formData.cv}</a> : "Not provided")}
                </p>
                <p><strong>Website:</strong> {isEditing ?
                    <input name="website" value={formData.website || ""} onChange={handleInputChange} /> :
                    (formData.website ? <a href={formData.website} target="_blank" rel="noopener noreferrer">{formData.website}</a> : "Not provided")}
                </p>
                <p><strong>Social Links:</strong> {isEditing ?
                    <input name="social_links" value={formData.social_links || ""} onChange={handleInputChange} /> :
                    (formData.social_links ? <a href={formData.social_links} target="_blank" rel="noopener noreferrer">{formData.social_links}</a> : "Not provided")}
                </p>
            </div>
            {isOwner && (
                <div className="profile-actions">
                    {isEditing ? (
                        <>
                            <button onClick={handleSave} className="save-btn">Save</button>
                            <button onClick={() => { setIsEditing(false); setFormData(profile); }} className="cancel-btn">Cancel</button>
                        </>
                    ) : (
                        <button onClick={() => setIsEditing(true)} className="edit-btn">Edit Profile</button>
                    )}
                </div>
            )}
        </div>
    );
}

export default Profile;
