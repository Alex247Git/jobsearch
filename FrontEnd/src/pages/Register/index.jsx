import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Alert,
    Paper,
    Container,
    Stepper,
    Step,
    StepLabel,
} from '@mui/material';
import { registerUser } from '../../services/RegisterController';
import { AuthContext } from '../../context/AuthContext';
import { apiFetch } from '../../api';
import Step1UserForm from './Step1UserForm';
import Step2ProfileForm from './Step2ProfileForm';
import Step3CandidateForm from './Step3CandidateForm';
import Step3EmployerForm from './Step3EmployerForm';
import Step4JobPostForm from './Step4JobPostForm';

function Register() {
    const [step, setStep] = useState(1);
    const [userId, setUserId] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');
    const [loading, setLoading] = useState(false);
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
        if (errorMessage) setErrorMessage('');
    };

    const handleSubmitUser = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrorMessage('');

        try {
            const response = await registerUser(userData, 1);
            setUserId(response.user_id);
            setUserData(prev => ({ ...prev, user_id: response.user_id }));
            setStep(2);
        } catch (error) {
            console.error('User registration failed:', error);
            setErrorMessage('Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitProfile = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrorMessage('');

        try {
            await registerUser({ ...profileData, user_id: userId }, 2);
            setStep(3);
        } catch (error) {
            console.error('Profile submission failed:', error);
            setErrorMessage('Profile submission failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitCandidate = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrorMessage('');

        const candidatePayload = {
            user_id: userData.user_id,
            cover_letter: candidateData.cover_letter,
            availability: candidateData.availability || 'Yes'
        };
        try {
            const response = await apiFetch(`/candidates`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(candidatePayload)
            });
            if (!response.ok) throw new Error('Failed to create candidate');
            login({ user_id: userData.user_id, role: userData.role, token: 'generated_token' });
            navigate('/Home');
        } catch (error) {
            console.error('Candidate details failed:', error);
            setErrorMessage('Candidate registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitEmployer = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrorMessage('');

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
            setErrorMessage('Company registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };
const handleSubmitJob = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrorMessage('');

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
            setErrorMessage('Job posting failed. Please try again.');
        } finally {
            setLoading(false);
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
                job_type: 'full-time',
                remote_option: false,
                category: ''
            });
            console.log('🧼 Form cleared for new job');
        } catch (error) {
            console.error('❌ Post another job failed:', error);
            setErrorMessage('Posting additional job failed. Please try again.');
        }
    };

    const steps = ['Basic Info', 'Profile', 'Role Details', 'Job Posting'];

    return (
        <Box
            sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#f3f4f6',
                minHeight: 'calc(100vh - 140px)',
            }}
        >
            <Container maxWidth="md">
                <Paper
                    elevation={3}
                    sx={{
                        borderRadius: '16px',
                        backgroundColor: 'white',
                        overflow: 'hidden',
                        border: '4px solid #282c34',
                        mx: 'auto',
                        p: 3,
                    }}
                >
                    <Box sx={{ mb: 4 }}>
                        <Stepper activeStep={step - 1} alternativeLabel>
                            {steps.map((label) => (
                                <Step key={label}>
                                    <StepLabel>{label}</StepLabel>
                                </Step>
                            ))}
                        </Stepper>
                    </Box>

                    {errorMessage && (
                        <Alert severity="error" sx={{ mb: 3 }}>
                            {errorMessage}
                        </Alert>
                    )}

                    {step === 1 && (
                        <Step1UserForm
                            data={userData}
                            onChange={handleChange(setUserData)}
                            onSubmit={handleSubmitUser}
                            loading={loading}
                        />
                    )}

                    {step === 2 && (
                        <Step2ProfileForm
                            data={profileData}
                            onChange={handleChange(setProfileData)}
                            onSubmit={handleSubmitProfile}
                            loading={loading}
                        />
                    )}

                    {step === 3 && userData.role === 'candidate' && (
                        <Step3CandidateForm
                            data={candidateData}
                            onChange={handleChange(setCandidateData)}
                            onSubmit={handleSubmitCandidate}
                            loading={loading}
                        />
                    )}

                    {step === 3 && userData.role === 'employer' && (
                        <Step3EmployerForm
                            data={companyData}
                            onChange={handleChange(setCompanyData)}
                            onSubmit={handleSubmitEmployer}
                            loading={loading}
                        />
                    )}

                    {step === 4 && (
                        <Step4JobPostForm
                            data={jobData}
                            onChange={handleChange(setJobData)}
                            onSubmit={handleSubmitJob}
                            onPostAnother={handlePostAnotherJob}
                            loading={loading}
                        />
                    )}
                </Paper>
            </Container>
        </Box>
    );
}

export default Register;