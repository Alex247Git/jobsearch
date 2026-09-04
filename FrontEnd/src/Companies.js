import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Link } from 'react-router-dom';
import "./Companies.css"; 
import { API_BASE_URL } from './api';

function Company() {
    const { companyId } = useParams();
    const [company, setCompany] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!companyId) {
            console.error("❌ No companyId found in URL.");
            setError("No company ID found.");
            setLoading(false);
            return;
        }

        const fetchCompany = async () => {
            console.log(`📡 Fetching company for company_id: ${companyId}`);
            try {
                const response = await fetch(`${API_BASE_URL}/companies/${companyId}`);
                if (!response.ok) {
                    throw new Error(`Failed to fetch company: ${response.statusText}`);
                }

                const data = await response.json();
                console.log("✅ Company data received:", data);
                setCompany(data);
            } catch (err) {
                console.error("⚠️ Error fetching company:", err);
                setError("Failed to load company info. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        fetchCompany();
    }, [companyId]);

    if (loading) return <p className="loading-text">Loading company details...</p>;
    if (error) return <p className="error-text">{error}</p>;
    if (!company) return <p className="error-text">No company found</p>;

    return (
        <div className="company-container">
            <div className="company-header">
                <img
                    src={company.logo || "/default-company-logo.png"}
                    alt="Company Logo"
                    className="company-logo"
                />
                <h1>{company.name}</h1>
                <p className="company-location">📍 {company.location || "Location not specified"}</p>
            </div>

            <div className="company-info">
                <p><strong>Description:</strong> {company.description || "No description available"}</p>
                <p><strong>Website:</strong> {company.website ? <a href={company.website} target="_blank" rel="noopener noreferrer">{company.website}</a> : "Not provided"}</p>
                <p><strong>Founded:</strong> {company.founded_year || "Unknown"}</p>
                <p><strong>Industry:</strong> {company.industry || "Not specified"}</p>
                <p><strong>Number of Employees:</strong> {company.employees_count || "Unknown"}</p>
                <p><strong>Posted Jobs:</strong> {company.posted_jobs?.length || 0}</p>
            </div>
            <Link to={`/Rating/${companyId}`}>Rate this company</Link>
        </div>
    );
}

export default Company;
