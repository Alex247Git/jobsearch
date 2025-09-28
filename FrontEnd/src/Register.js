import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerUser } from './RegisterController';
import { AuthContext } from './AuthContext';
import './Register.css';

function Register() {
    const [step, setStep] = useState(1);
    const [userId, setUserId] = useState(null);
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const [userData, setUserData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        phone_number: '',
        date_of_birth: '',
        is_verified: false,
        role: 'candidate'
    });

    const [profileData, setProfileData] = useState({
        age: '',
        bio: '',
        skills: '',
        experience: '',
        location: '',
        education: '',
        certifications: '',
        languages: '',
        social_links: '',
        website: '',
        cv: ''
    });

    const [candidateData, setCandidateData] = useState({
        cover_letter: ''
    });

    const [companyData, setCompanyData] = useState({
        company_name: '',
        industry: '',
        founded_year: '',
        company_location: '',
        description: ''
    });

    const [jobData, setJobData] = useState({
        title: '',
        description: '',
        location: '',
        skills_required: '',
        salary: '',
        job_type: 'full-time',
        remote_option: false,
        category: ''
    });

    const handleChange = (setter) => (e) => {
        const { name, value, type } = e.target;
        const parsedValue = (type === 'select-one' && name === 'job_remote_option')
            ? value === 'true'
            : value;
        setter((prev) => ({ ...prev, [name]: parsedValue }));
    };

    const handleSubmitUser = async (e) => {
        e.preventDefault();
        try {
            const response = await registerUser(userData, 1);
            setUserId(response.user_id);
            setUserData(prev => ({ ...prev, user_id: response.user_id }));
            setStep(2);
        } catch (error) {
            console.error('User registration failed:', error);
        }
    };


    const handleSubmitProfile = async (e) => {
        e.preventDefault();
        try {
            await registerUser({ ...profileData, user_id: userId }, 2);
            setStep(3);
        } catch (error) {
            console.error('Profile submission failed:', error);
        }
    };

    const handleSubmitCandidate = async (e) => {
        e.preventDefault();
        const candidatePayload = {
            user_id: userData.user_id,
            cover_letter: candidateData.cover_letter,
            availability: candidateData.availability || 'Yes'
        };
        try {
            const response = await fetch('http://localhost:5000/candidates', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(candidatePayload)
            });
            if (!response.ok) throw new Error('Failed to create candidate');
            login({ user_id: userData.user_id, role: userData.role, token: 'generated_token' });
            navigate('/Home');
        } catch (error) {
            console.error('Candidate details failed:', error);
        }
    };

    const handleSubmitEmployer = async (e) => {
        e.preventDefault();
        try {
            await registerUser({
                role: 'employer',
                company_name: companyData.company_name,
                industry: companyData.industry,
                founded_year: companyData.founded_year,
                company_location: companyData.company_location,
                description: companyData.description
            }, 3);
            setStep(4);
        } catch (error) {
            console.error('Company details failed:', error);
        }
    };

    const handleSubmitJob = async (e) => {
        e.preventDefault();
        try {
            const companyId = localStorage.getItem('companyId');
            console.log('📦 Submitting Job...');
            console.log('🧠 companyId:', companyId);
            console.log('📄 jobData:', jobData);

            const jobPayload = {
                ...jobData,
                company_id: companyId,
                user_id: userId,
                role: userData.role
            };
            console.log('🚀 Final jobPayload:', jobPayload);

            await registerUser(jobPayload, 4);
            console.log('✅ Job successfully registered');

            login({ user_id: userId, role: userData.role, token: 'generated_token' });
            console.log('🔐 User logged in');

            navigate('/Home');
        } catch (error) {
            console.error('❌ Job post failed:', error);
        }
    };

    const handlePostAnotherJob = async () => {
        try {
            const companyId = localStorage.getItem('companyId');
            console.log('📦 Posting another job...');
            console.log('🧠 companyId:', companyId);
            console.log('📄 jobData:', jobData);

            const jobPayload = {
                ...jobData,
                created_by: userId,
                company_id: companyId
            };
            console.log('🚀 Final jobPayload:', jobPayload);

            await registerUser({ ...jobData, user_id: userId }, 4);
            console.log('✅ Additional job posted');

            setJobData({
                title: '',
                description: '',
                location: '',
                skills_required: '',
                salary: '',
                type: 'full-time',
                remote_option: false,
                category: ''
            });
            console.log('🧼 Form cleared for new job');
        } catch (error) {
            console.error('❌ Post another job failed:', error);
        }
    };

    return (
        <div className="register">
            {step === 1 && (
                <form onSubmit={handleSubmitUser}>
                    <h2>Register</h2>
                    <label>First Name: <input type="text" name="first_name" placeholder="Alex" value={userData.first_name} onChange={handleChange(setUserData)} required /></label>
                    <label>Last Name: <input type="text" name="last_name" placeholder="Adamos" value={userData.last_name} onChange={handleChange(setUserData)} required /></label>
                    <label>Email: <input type="email" name="email" placeholder="Alex@example.com" value={userData.email} onChange={handleChange(setUserData)} required /></label>
                    <label>Password: <input type="password" name="password" placeholder="Create a password" value={userData.password} onChange={handleChange(setUserData)} required /></label>
                    <label>Phone Number: <input type="text" name="phone_number" placeholder="1234567890" value={userData.phone_number} onChange={handleChange(setUserData)} required /></label>
                    <label>Date of Birth: <input type="date" name="date_of_birth" value={userData.date_of_birth} onChange={handleChange(setUserData)} required /></label>
                    <label>Role:<select name="role" value={userData.role} onChange={handleChange(setUserData)}><option value="candidate">Candidate</option><option value="employer">Employer</option></select></label>
                    <button type="submit">Continue</button>
                </form>
            )}

            {step === 2 && (
                <form onSubmit={handleSubmitProfile}>
                    <h2>Complete Your Profile</h2>
                    <label>Age: <input className="first-label" type="number" name="age" value={profileData.age} onChange={handleChange(setProfileData)} placeholder="Enter your age" min="0" required /></label>
                    <label>Bio: <textarea name="bio" placeholder="Tell us about yourself" value={profileData.bio} onChange={handleChange(setProfileData)} required /></label>
                    <label>Skills: <input type="text" name="skills" placeholder="e.g. JavaScript, React" value={profileData.skills} onChange={handleChange(setProfileData)} required /></label>
                    <label>Experience: <textarea name="experience" placeholder="Describe your work experience" value={profileData.experience} onChange={handleChange(setProfileData)} required /></label>
                    <label>Location: <input type="text" name="location" placeholder="City, Country" value={profileData.location} onChange={handleChange(setProfileData)} required /></label>
                    <label>Education: <textarea name="education" placeholder="Your academic background" value={profileData.education} onChange={handleChange(setProfileData)} required /></label>
                    <label>Certifications: <input type="text" name="certifications" placeholder="e.g. AWS, PMP" value={profileData.certifications} onChange={handleChange(setProfileData)} required /></label>
                    <label>Languages: <input type="text" name="languages" placeholder="e.g. English, Spanish" value={profileData.languages} onChange={handleChange(setProfileData)} required /></label>
                    <label>CV Link: <input type="text" name="cv" placeholder="yourcv.com" value={profileData.cv_link} onChange={handleChange(setProfileData)} required /></label>
                    <label>Social Links: <input type="text" name="social_links" placeholder="LinkedIn, GitHub" value={profileData.social_links} onChange={handleChange(setProfileData)} required /></label>
                    <label>Website: <input type="text" name="website" placeholder="yourportfolio.com" value={profileData.website} onChange={handleChange(setProfileData)} /></label>
                    <button type="submit">Next</button>
                </form>
            )}

            {step === 3 && userData.role === 'candidate' && (
                <form onSubmit={handleSubmitCandidate}>
                    <h2>Candidate Details</h2>
                    <label>Cover Letter: <textarea name="cover_letter" placeholder="Write your cover letter" value={candidateData.cover_letter} onChange={handleChange(setCandidateData)} required /></label>
                    <button type="submit">Finish</button>
                </form>
            )}

            {step === 3 && userData.role === 'employer' && (
                <form onSubmit={handleSubmitEmployer}>
                    <h2>Company Details</h2>
                    <label>Company Name: <input type="text" name="company_name" placeholder="Company Inc." value={companyData.company_name} onChange={handleChange(setCompanyData)} required /></label>
                    <label>Industry: <input type="text" name="industry" placeholder="e.g. Technology, Finance" value={companyData.industry} onChange={handleChange(setCompanyData)} required /></label>
                    <label>Founded Year: <input type="number" name="founded_year" placeholder="2005" value={companyData.founded_year} onChange={handleChange(setCompanyData)} required /></label>
                    <label>Company Location: <input type="text" name="company_location" placeholder="Headquarters location" value={companyData.company_location} onChange={handleChange(setCompanyData)} required /></label>
                    <label>Description: <textarea name="description" placeholder="Brief description of your company" value={companyData.description} onChange={handleChange(setCompanyData)} required /></label>
                    <button type="submit">Next</button>
                </form>
            )}

            {step === 4 && (
                <form onSubmit={handleSubmitJob}>
                    <h2>Post a Job</h2>
                    <label>Job Title:<input type="text" name="title" placeholder="e.g. Frontend Developer" value={jobData.title} onChange={handleChange(setJobData)} required /></label>
                    <label>Description:<textarea name="description" placeholder="Job description and responsibilities" value={jobData.description} onChange={handleChange(setJobData)} required /></label>
                    <label>Location:<input type="text" name="location" placeholder="e.g. New York, USA" value={jobData.location} onChange={handleChange(setJobData)} required /></label>
                    <label>Skills Required:<input type="text" name="skills_required" placeholder="e.g. JavaScript, React, Node.js" value={jobData.skills_required} onChange={handleChange(setJobData)} required /></label>
                    <label>Salary:<input type="number" name="salary" placeholder="e.g. 60000" value={jobData.salary} onChange={handleChange(setJobData)} required /></label>
                    <label>Job Type:<select name="job_type" value={jobData.job_type} onChange={handleChange(setJobData)} required> <option value="full-time">Full-time</option> <option value="part-time">Part-time</option> <option value="contract">Contract</option> </select></label>
                    <label>Remote Option:<select name="remote_option" value={jobData.remote_option ? "true" : "false"} onChange={(e) => setJobData({ ...jobData, job_remote_option: e.target.value === "true" })} required><option value="true">Yes</option><option value="false">No</option></select></label>
                    <label>Category: <input type="text" name="category" placeholder="e.g. Data Science, Marketing" value={jobData.category} onChange={handleChange(setJobData)} required /></label>
                    <button type="button" onClick={handlePostAnotherJob}> Post Another Job </button>
                    <button type="submit">Finish</button>
                </form>
            )}
        </div>
    );
}

export default Register;
