import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerUser } from './RegisterController';
import { AuthContext } from './AuthContext';
import {
    Box,
    Typography,
    TextField,
    Button,
    Alert,
    Paper,
    Container,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Stepper,
    Step,
    StepLabel,
} from '@mui/material';

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
                        <Box component="form" onSubmit={handleSubmitUser}>
                            <Typography variant="h4" component="h1" sx={{ mb: 3, textAlign: 'center', fontWeight: 'bold', color: '#333' }}>
                                Register - Basic Information
                            </Typography>

                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                                <TextField
                                    label="First Name"
                                    type="text"
                                    name="first_name"
                                    value={userData.first_name}
                                    onChange={handleChange(setUserData)}
                                    required
                                    variant="outlined"
                                    fullWidth
                                    InputProps={{ sx: { color: 'black' } }}
                                    InputLabelProps={{ sx: { color: 'black' } }}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            '& fieldset': {
                                                borderColor: '#282c34',
                                            },
                                            '&:hover fieldset': {
                                                borderColor: 'secondary.main',
                                            },
                                            '&.Mui-focused fieldset': {
                                                borderColor: 'secondary.main',
                                            },
                                            '&.Mui-focused .MuiInputLabel-root': {
                                                color: 'black !important',
                                            },
                                        },
                                        '& .MuiInputLabel-root.Mui-focused': {
                                            color: 'black !important',
                                        },
                                    }}
                                />

                                <TextField
                                    label="Last Name"
                                    type="text"
                                    name="last_name"
                                    value={userData.last_name}
                                    onChange={handleChange(setUserData)}
                                    required
                                    variant="outlined"
                                    fullWidth
                                    InputProps={{ sx: { color: 'black' } }}
                                    InputLabelProps={{ sx: { color: 'black' } }}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            '& fieldset': {
                                                borderColor: '#282c34',
                                            },
                                            '&:hover fieldset': {
                                                borderColor: 'secondary.main',
                                            },
                                            '&.Mui-focused fieldset': {
                                                borderColor: 'secondary.main',
                                            },
                                            '&.Mui-focused .MuiInputLabel-root': {
                                                color: 'black !important',
                                            },
                                        },
                                        '& .MuiInputLabel-root.Mui-focused': {
                                            color: 'black !important',
                                        },
                                    }}
                                />

                                <TextField
                                    label="Email"
                                    type="email"
                                    name="email"
                                    value={userData.email}
                                    onChange={handleChange(setUserData)}
                                    required
                                    variant="outlined"
                                    fullWidth
                                    InputProps={{ sx: { color: 'black' } }}
                                    InputLabelProps={{ sx: { color: 'black' } }}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            '& fieldset': {
                                                borderColor: '#282c34',
                                            },
                                            '&:hover fieldset': {
                                                borderColor: 'secondary.main',
                                            },
                                            '&.Mui-focused fieldset': {
                                                borderColor: 'secondary.main',
                                            },
                                            '&.Mui-focused .MuiInputLabel-root': {
                                                color: 'black !important',
                                            },
                                        },
                                        '& .MuiInputLabel-root.Mui-focused': {
                                            color: 'black !important',
                                        },
                                    }}
                                />

                                <TextField
                                    label="Password"
                                    type="password"
                                    name="password"
                                    value={userData.password}
                                    onChange={handleChange(setUserData)}
                                    required
                                    variant="outlined"
                                    fullWidth
                                    InputProps={{ sx: { color: 'black' } }}
                                    InputLabelProps={{ sx: { color: 'black' } }}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            '& fieldset': {
                                                borderColor: '#282c34',
                                            },
                                            '&:hover fieldset': {
                                                borderColor: 'secondary.main',
                                            },
                                            '&.Mui-focused fieldset': {
                                                borderColor: 'secondary.main',
                                            },
                                            '&.Mui-focused .MuiInputLabel-root': {
                                                color: 'black !important',
                                            },
                                        },
                                        '& .MuiInputLabel-root.Mui-focused': {
                                            color: 'black !important',
                                        },
                                    }}
                                />

                                <TextField
                                    label="Phone Number"
                                    type="text"
                                    name="phone_number"
                                    value={userData.phone_number}
                                    onChange={handleChange(setUserData)}
                                    required
                                    variant="outlined"
                                    fullWidth
                                    InputProps={{ sx: { color: 'black' } }}
                                    InputLabelProps={{ sx: { color: 'black' } }}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            '& fieldset': {
                                                borderColor: '#282c34',
                                            },
                                            '&:hover fieldset': {
                                                borderColor: 'secondary.main',
                                            },
                                            '&.Mui-focused fieldset': {
                                                borderColor: 'secondary.main',
                                            },
                                            '&.Mui-focused .MuiInputLabel-root': {
                                                color: 'black !important',
                                            },
                                        },
                                        '& .MuiInputLabel-root.Mui-focused': {
                                            color: 'black !important',
                                        },
                                    }}
                                />

                                <TextField
                                    label="Date of Birth"
                                    type="date"
                                    name="date_of_birth"
                                    value={userData.date_of_birth}
                                    onChange={handleChange(setUserData)}
                                    required
                                    variant="outlined"
                                    fullWidth
                                    InputProps={{
                                        sx: { color: 'black' }
                                    }}
                                    InputLabelProps={{
                                        sx: { color: 'black' },
                                        shrink: true
                                    }}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            '& fieldset': {
                                                borderColor: '#282c34',
                                            },
                                            '&:hover fieldset': {
                                                borderColor: 'secondary.main',
                                            },
                                            '&.Mui-focused fieldset': {
                                                borderColor: 'secondary.main',
                                            },
                                            '&.Mui-focused .MuiInputLabel-root': {
                                                color: 'black !important',
                                            },
                                        },
                                        '& .MuiInputLabel-root.Mui-focused': {
                                            color: 'black !important',
                                        },
                                    }}
                                />

                                <FormControl fullWidth variant="outlined">
                                    <InputLabel sx={{ color: 'black' }}>Role</InputLabel>
                                    <Select
                                        name="role"
                                        value={userData.role}
                                        onChange={handleChange(setUserData)}
                                        label="Role"
                                        sx={{
                                            color: 'black',
                                            '& .MuiOutlinedInput-notchedOutline': {
                                                borderColor: '#282c34',
                                            },
                                            '&:hover .MuiOutlinedInput-notchedOutline': {
                                                borderColor: 'secondary.main',
                                            },
                                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                                borderColor: 'secondary.main',
                                            },
                                        }}
                                    >
                                        <MenuItem value="candidate">Candidate</MenuItem>
                                        <MenuItem value="employer">Employer</MenuItem>
                                    </Select>
                                </FormControl>

                                <Button
                                    type="submit"
                                    fullWidth
                                    variant="contained"
                                    disabled={loading}
                                    sx={{
                                        mt: 2,
                                        py: 1.5,
                                        backgroundColor: '#b4f000 !important',
                                        color: '#282c34 !important',
                                        '&:hover': {
                                            backgroundColor: '#a0d600 !important',
                                        },
                                        textTransform: 'none',
                                        fontWeight: 'bold',
                                        borderRadius: '8px',
                                    }}
                                >
                                    {loading ? 'Creating Account...' : 'Continue'}
                                </Button>
                            </Box>
                        </Box>
                    )}

                    {step === 2 && (
                        <Box component="form" onSubmit={handleSubmitProfile}>
                            <Typography variant="h4" component="h1" sx={{ mb: 3, textAlign: 'center', fontWeight: 'bold', color: '#333' }}>
                                Complete Your Profile
                            </Typography>

                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                                <TextField
                                    label="Age"
                                    type="number"
                                    name="age"
                                    value={profileData.age}
                                    onChange={handleChange(setProfileData)}
                                    required
                                    variant="outlined"
                                    fullWidth
                                    InputProps={{ sx: { color: 'black' } }}
                                    InputLabelProps={{ sx: { color: 'black' } }}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            '& fieldset': {
                                                borderColor: '#282c34',
                                            },
                                            '&:hover fieldset': {
                                                borderColor: 'secondary.main',
                                            },
                                            '&.Mui-focused fieldset': {
                                                borderColor: 'secondary.main',
                                            },
                                            '&.Mui-focused .MuiInputLabel-root': {
                                                color: 'black !important',
                                            },
                                        },
                                        '& .MuiInputLabel-root.Mui-focused': {
                                            color: 'black !important',
                                        },
                                    }}
                                />

                                <TextField
                                    label="Bio"
                                    multiline
                                    rows={4}
                                    name="bio"
                                    value={profileData.bio}
                                    onChange={handleChange(setProfileData)}
                                    required
                                    variant="outlined"
                                    fullWidth
                                    InputProps={{ sx: { color: 'black' } }}
                                    InputLabelProps={{ sx: { color: 'black' } }}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            '& fieldset': {
                                                borderColor: '#282c34',
                                            },
                                            '&:hover fieldset': {
                                                borderColor: 'secondary.main',
                                            },
                                            '&.Mui-focused fieldset': {
                                                borderColor: 'secondary.main',
                                            },
                                            '&.Mui-focused .MuiInputLabel-root': {
                                                color: 'black !important',
                                            },
                                        },
                                        '& .MuiInputLabel-root.Mui-focused': {
                                            color: 'black !important',
                                        },
                                    }}
                                />

                                <TextField
                                    label="Skills"
                                    type="text"
                                    name="skills"
                                    value={profileData.skills}
                                    onChange={handleChange(setProfileData)}
                                    required
                                    variant="outlined"
                                    fullWidth
                                    InputProps={{ sx: { color: 'black' } }}
                                    InputLabelProps={{ sx: { color: 'black' } }}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            '& fieldset': {
                                                borderColor: '#282c34',
                                            },
                                            '&:hover fieldset': {
                                                borderColor: 'secondary.main',
                                            },
                                            '&.Mui-focused fieldset': {
                                                borderColor: 'secondary.main',
                                            },
                                            '&.Mui-focused .MuiInputLabel-root': {
                                                color: 'black !important',
                                            },
                                        },
                                        '& .MuiInputLabel-root.Mui-focused': {
                                            color: 'black !important',
                                        },
                                    }}
                                />

                                <TextField
                                    label="Experience"
                                    multiline
                                    rows={4}
                                    name="experience"
                                    value={profileData.experience}
                                    onChange={handleChange(setProfileData)}
                                    required
                                    variant="outlined"
                                    fullWidth
                                    InputProps={{ sx: { color: 'black' } }}
                                    InputLabelProps={{ sx: { color: 'black' } }}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            '& fieldset': {
                                                borderColor: '#282c34',
                                            },
                                            '&:hover fieldset': {
                                                borderColor: 'secondary.main',
                                            },
                                            '&.Mui-focused fieldset': {
                                                borderColor: 'secondary.main',
                                            },
                                            '&.Mui-focused .MuiInputLabel-root': {
                                                color: 'black !important',
                                            },
                                        },
                                        '& .MuiInputLabel-root.Mui-focused': {
                                            color: 'black !important',
                                        },
                                    }}
                                />

                                <TextField
                                    label="Location"
                                    type="text"
                                    name="location"
                                    value={profileData.location}
                                    onChange={handleChange(setProfileData)}
                                    required
                                    variant="outlined"
                                    fullWidth
                                    InputProps={{ sx: { color: 'black' } }}
                                    InputLabelProps={{ sx: { color: 'black' } }}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            '& fieldset': {
                                                borderColor: '#282c34',
                                            },
                                            '&:hover fieldset': {
                                                borderColor: 'secondary.main',
                                            },
                                            '&.Mui-focused fieldset': {
                                                borderColor: 'secondary.main',
                                            },
                                            '&.Mui-focused .MuiInputLabel-root': {
                                                color: 'black !important',
                                            },
                                        },
                                        '& .MuiInputLabel-root.Mui-focused': {
                                            color: 'black !important',
                                        },
                                    }}
                                />

                                <TextField
                                    label="Education"
                                    multiline
                                    rows={4}
                                    name="education"
                                    value={profileData.education}
                                    onChange={handleChange(setProfileData)}
                                    required
                                    variant="outlined"
                                    fullWidth
                                    InputProps={{ sx: { color: 'black' } }}
                                    InputLabelProps={{ sx: { color: 'black' } }}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            '& fieldset': {
                                                borderColor: '#282c34',
                                            },
                                            '&:hover fieldset': {
                                                borderColor: 'secondary.main',
                                            },
                                            '&.Mui-focused fieldset': {
                                                borderColor: 'secondary.main',
                                            },
                                            '&.Mui-focused .MuiInputLabel-root': {
                                                color: 'black !important',
                                            },
                                        },
                                        '& .MuiInputLabel-root.Mui-focused': {
                                            color: 'black !important',
                                        },
                                    }}
                                />

                                <TextField
                                    label="Certifications"
                                    type="text"
                                    name="certifications"
                                    value={profileData.certifications}
                                    onChange={handleChange(setProfileData)}
                                    required
                                    variant="outlined"
                                    fullWidth
                                    InputProps={{ sx: { color: 'black' } }}
                                    InputLabelProps={{ sx: { color: 'black' } }}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            '& fieldset': {
                                                borderColor: '#282c34',
                                            },
                                            '&:hover fieldset': {
                                                borderColor: 'secondary.main',
                                            },
                                            '&.Mui-focused fieldset': {
                                                borderColor: 'secondary.main',
                                            },
                                            '&.Mui-focused .MuiInputLabel-root': {
                                                color: 'black !important',
                                            },
                                        },
                                        '& .MuiInputLabel-root.Mui-focused': {
                                            color: 'black !important',
                                        },
                                    }}
                                />

                                <TextField
                                    label="Languages"
                                    type="text"
                                    name="languages"
                                    value={profileData.languages}
                                    onChange={handleChange(setProfileData)}
                                    required
                                    variant="outlined"
                                    fullWidth
                                    InputProps={{ sx: { color: 'black' } }}
                                    InputLabelProps={{ sx: { color: 'black' } }}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            '& fieldset': {
                                                borderColor: '#282c34',
                                            },
                                            '&:hover fieldset': {
                                                borderColor: 'secondary.main',
                                            },
                                            '&.Mui-focused fieldset': {
                                                borderColor: 'secondary.main',
                                            },
                                            '&.Mui-focused .MuiInputLabel-root': {
                                                color: 'black !important',
                                            },
                                        },
                                        '& .MuiInputLabel-root.Mui-focused': {
                                            color: 'black !important',
                                        },
                                    }}
                                />

                                <TextField
                                    label="CV Link"
                                    type="text"
                                    name="cv"
                                    value={profileData.cv}
                                    onChange={handleChange(setProfileData)}
                                    required
                                    variant="outlined"
                                    fullWidth
                                    InputProps={{ sx: { color: 'black' } }}
                                    InputLabelProps={{ sx: { color: 'black' } }}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            '& fieldset': {
                                                borderColor: '#282c34',
                                            },
                                            '&:hover fieldset': {
                                                borderColor: 'secondary.main',
                                            },
                                            '&.Mui-focused fieldset': {
                                                borderColor: 'secondary.main',
                                            },
                                            '&.Mui-focused .MuiInputLabel-root': {
                                                color: 'black !important',
                                            },
                                        },
                                        '& .MuiInputLabel-root.Mui-focused': {
                                            color: 'black !important',
                                        },
                                    }}
                                />

                                <TextField
                                    label="Social Links"
                                    type="text"
                                    name="social_links"
                                    value={profileData.social_links}
                                    onChange={handleChange(setProfileData)}
                                    required
                                    variant="outlined"
                                    fullWidth
                                    InputProps={{ sx: { color: 'black' } }}
                                    InputLabelProps={{ sx: { color: 'black' } }}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            '& fieldset': {
                                                borderColor: '#282c34',
                                            },
                                            '&:hover fieldset': {
                                                borderColor: 'secondary.main',
                                            },
                                            '&.Mui-focused fieldset': {
                                                borderColor: 'secondary.main',
                                            },
                                            '&.Mui-focused .MuiInputLabel-root': {
                                                color: 'black !important',
                                            },
                                        },
                                        '& .MuiInputLabel-root.Mui-focused': {
                                            color: 'black !important',
                                        },
                                    }}
                                />

                                <TextField
                                    label="Website"
                                    type="text"
                                    name="website"
                                    value={profileData.website}
                                    onChange={handleChange(setProfileData)}
                                    variant="outlined"
                                    fullWidth
                                    InputProps={{ sx: { color: 'black' } }}
                                    InputLabelProps={{ sx: { color: 'black' } }}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            '& fieldset': {
                                                borderColor: '#282c34',
                                            },
                                            '&:hover fieldset': {
                                                borderColor: 'secondary.main',
                                            },
                                            '&.Mui-focused fieldset': {
                                                borderColor: 'secondary.main',
                                            },
                                            '&.Mui-focused .MuiInputLabel-root': {
                                                color: 'black !important',
                                            },
                                        },
                                        '& .MuiInputLabel-root.Mui-focused': {
                                            color: 'black !important',
                                        },
                                    }}
                                />

                                <Button
                                    type="submit"
                                    fullWidth
                                    variant="contained"
                                    disabled={loading}
                                    sx={{
                                        mt: 2,
                                        py: 1.5,
                                        backgroundColor: '#b4f000 !important',
                                        color: '#282c34 !important',
                                        '&:hover': {
                                            backgroundColor: '#a0d600 !important',
                                        },
                                        textTransform: 'none',
                                        fontWeight: 'bold',
                                        borderRadius: '8px',
                                    }}
                                >
                                    {loading ? 'Saving Profile...' : 'Next'}
                                </Button>
                            </Box>
                        </Box>
                    )}

                    {step === 3 && userData.role === 'candidate' && (
                        <Box component="form" onSubmit={handleSubmitCandidate}>
                            <Typography variant="h4" component="h1" sx={{ mb: 3, textAlign: 'center', fontWeight: 'bold', color: '#333' }}>
                                Candidate Details
                            </Typography>

                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                                <TextField
                                    label="Cover Letter"
                                    multiline
                                    rows={6}
                                    name="cover_letter"
                                    value={candidateData.cover_letter}
                                    onChange={handleChange(setCandidateData)}
                                    required
                                    variant="outlined"
                                    fullWidth
                                    InputProps={{ sx: { color: 'black' } }}
                                    InputLabelProps={{ sx: { color: 'black' } }}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            '& fieldset': {
                                                borderColor: '#282c34',
                                            },
                                            '&:hover fieldset': {
                                                borderColor: 'secondary.main',
                                            },
                                            '&.Mui-focused fieldset': {
                                                borderColor: 'secondary.main',
                                            },
                                            '&.Mui-focused .MuiInputLabel-root': {
                                                color: 'black !important',
                                            },
                                        },
                                        '& .MuiInputLabel-root.Mui-focused': {
                                            color: 'black !important',
                                        },
                                    }}
                                />

                                <Button
                                    type="submit"
                                    fullWidth
                                    variant="contained"
                                    disabled={loading}
                                    sx={{
                                        mt: 2,
                                        py: 1.5,
                                        backgroundColor: '#b4f000 !important',
                                        color: '#282c34 !important',
                                        '&:hover': {
                                            backgroundColor: '#a0d600 !important',
                                        },
                                        textTransform: 'none',
                                        fontWeight: 'bold',
                                        borderRadius: '8px',
                                    }}
                                >
                                    {loading ? 'Creating Profile...' : 'Finish Registration'}
                                </Button>
                            </Box>
                        </Box>
                    )}

                    {step === 3 && userData.role === 'employer' && (
                        <Box component="form" onSubmit={handleSubmitEmployer}>
                            <Typography variant="h4" component="h1" sx={{ mb: 3, textAlign: 'center', fontWeight: 'bold', color: '#333' }}>
                                Company Details
                            </Typography>

                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                                <TextField
                                    label="Company Name"
                                    type="text"
                                    name="company_name"
                                    value={companyData.company_name}
                                    onChange={handleChange(setCompanyData)}
                                    required
                                    variant="outlined"
                                    fullWidth
                                    InputProps={{ sx: { color: 'black' } }}
                                    InputLabelProps={{ sx: { color: 'black' } }}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            '& fieldset': {
                                                borderColor: '#282c34',
                                            },
                                            '&:hover fieldset': {
                                                borderColor: 'secondary.main',
                                            },
                                            '&.Mui-focused fieldset': {
                                                borderColor: 'secondary.main',
                                            },
                                            '&.Mui-focused .MuiInputLabel-root': {
                                                color: 'black !important',
                                            },
                                        },
                                        '& .MuiInputLabel-root.Mui-focused': {
                                            color: 'black !important',
                                        },
                                    }}
                                />

                                <TextField
                                    label="Industry"
                                    type="text"
                                    name="industry"
                                    value={companyData.industry}
                                    onChange={handleChange(setCompanyData)}
                                    required
                                    variant="outlined"
                                    fullWidth
                                    InputProps={{ sx: { color: 'black' } }}
                                    InputLabelProps={{ sx: { color: 'black' } }}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            '& fieldset': {
                                                borderColor: '#282c34',
                                            },
                                            '&:hover fieldset': {
                                                borderColor: 'secondary.main',
                                            },
                                            '&.Mui-focused fieldset': {
                                                borderColor: 'secondary.main',
                                            },
                                            '&.Mui-focused .MuiInputLabel-root': {
                                                color: 'black !important',
                                            },
                                        },
                                        '& .MuiInputLabel-root.Mui-focused': {
                                            color: 'black !important',
                                        },
                                    }}
                                />

                                <TextField
                                    label="Founded Year"
                                    type="number"
                                    name="founded_year"
                                    value={companyData.founded_year}
                                    onChange={handleChange(setCompanyData)}
                                    required
                                    variant="outlined"
                                    fullWidth
                                    InputProps={{ sx: { color: 'black' } }}
                                    InputLabelProps={{ sx: { color: 'black' } }}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            '& fieldset': {
                                                borderColor: '#282c34',
                                            },
                                            '&:hover fieldset': {
                                                borderColor: 'secondary.main',
                                            },
                                            '&.Mui-focused fieldset': {
                                                borderColor: 'secondary.main',
                                            },
                                            '&.Mui-focused .MuiInputLabel-root': {
                                                color: 'black !important',
                                            },
                                        },
                                        '& .MuiInputLabel-root.Mui-focused': {
                                            color: 'black !important',
                                        },
                                    }}
                                />

                                <TextField
                                    label="Company Location"
                                    type="text"
                                    name="company_location"
                                    value={companyData.company_location}
                                    onChange={handleChange(setCompanyData)}
                                    required
                                    variant="outlined"
                                    fullWidth
                                    InputProps={{ sx: { color: 'black' } }}
                                    InputLabelProps={{ sx: { color: 'black' } }}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            '& fieldset': {
                                                borderColor: '#282c34',
                                            },
                                            '&:hover fieldset': {
                                                borderColor: 'secondary.main',
                                            },
                                            '&.Mui-focused fieldset': {
                                                borderColor: 'secondary.main',
                                            },
                                            '&.Mui-focused .MuiInputLabel-root': {
                                                color: 'black !important',
                                            },
                                        },
                                        '& .MuiInputLabel-root.Mui-focused': {
                                            color: 'black !important',
                                        },
                                    }}
                                />

                                <TextField
                                    label="Description"
                                    multiline
                                    rows={4}
                                    name="description"
                                    value={companyData.description}
                                    onChange={handleChange(setCompanyData)}
                                    required
                                    variant="outlined"
                                    fullWidth
                                    InputProps={{ sx: { color: 'black' } }}
                                    InputLabelProps={{ sx: { color: 'black' } }}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            '& fieldset': {
                                                borderColor: '#282c34',
                                            },
                                            '&:hover fieldset': {
                                                borderColor: 'secondary.main',
                                            },
                                            '&.Mui-focused fieldset': {
                                                borderColor: 'secondary.main',
                                            },
                                            '&.Mui-focused .MuiInputLabel-root': {
                                                color: 'black !important',
                                            },
                                        },
                                        '& .MuiInputLabel-root.Mui-focused': {
                                            color: 'black !important',
                                        },
                                    }}
                                />

                                <Button
                                    type="submit"
                                    fullWidth
                                    variant="contained"
                                    disabled={loading}
                                    sx={{
                                        mt: 2,
                                        py: 1.5,
                                        backgroundColor: '#b4f000 !important',
                                        color: '#282c34 !important',
                                        '&:hover': {
                                            backgroundColor: '#a0d600 !important',
                                        },
                                        textTransform: 'none',
                                        fontWeight: 'bold',
                                        borderRadius: '8px',
                                    }}
                                >
                                    {loading ? 'Creating Company...' : 'Next'}
                                </Button>
                            </Box>
                        </Box>
                    )}

                    {step === 4 && (
                        <Box component="form" onSubmit={handleSubmitJob}>
                            <Typography variant="h4" component="h1" sx={{ mb: 3, textAlign: 'center', fontWeight: 'bold', color: '#333' }}>
                                Post Your First Job
                            </Typography>

                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                                <TextField
                                    label="Job Title"
                                    type="text"
                                    name="title"
                                    value={jobData.title}
                                    onChange={handleChange(setJobData)}
                                    required
                                    variant="outlined"
                                    fullWidth
                                    InputProps={{ sx: { color: 'black' } }}
                                    InputLabelProps={{ sx: { color: 'black' } }}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            '& fieldset': {
                                                borderColor: '#282c34',
                                            },
                                            '&:hover fieldset': {
                                                borderColor: 'secondary.main',
                                            },
                                            '&.Mui-focused fieldset': {
                                                borderColor: 'secondary.main',
                                            },
                                            '&.Mui-focused .MuiInputLabel-root': {
                                                color: 'black !important',
                                            },
                                        },
                                        '& .MuiInputLabel-root.Mui-focused': {
                                            color: 'black !important',
                                        },
                                    }}
                                />

                                <TextField
                                    label="Description"
                                    multiline
                                    rows={4}
                                    name="description"
                                    value={jobData.description}
                                    onChange={handleChange(setJobData)}
                                    required
                                    variant="outlined"
                                    fullWidth
                                    InputProps={{ sx: { color: 'black' } }}
                                    InputLabelProps={{ sx: { color: 'black' } }}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            '& fieldset': {
                                                borderColor: '#282c34',
                                            },
                                            '&:hover fieldset': {
                                                borderColor: 'secondary.main',
                                            },
                                            '&.Mui-focused fieldset': {
                                                borderColor: 'secondary.main',
                                            },
                                            '&.Mui-focused .MuiInputLabel-root': {
                                                color: 'black !important',
                                            },
                                        },
                                        '& .MuiInputLabel-root.Mui-focused': {
                                            color: 'black !important',
                                        },
                                    }}
                                />

                                <TextField
                                    label="Location"
                                    type="text"
                                    name="location"
                                    value={jobData.location}
                                    onChange={handleChange(setJobData)}
                                    required
                                    variant="outlined"
                                    fullWidth
                                    InputProps={{ sx: { color: 'black' } }}
                                    InputLabelProps={{ sx: { color: 'black' } }}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            '& fieldset': {
                                                borderColor: '#282c34',
                                            },
                                            '&:hover fieldset': {
                                                borderColor: 'secondary.main',
                                            },
                                            '&.Mui-focused fieldset': {
                                                borderColor: 'secondary.main',
                                            },
                                            '&.Mui-focused .MuiInputLabel-root': {
                                                color: 'black !important',
                                            },
                                        },
                                        '& .MuiInputLabel-root.Mui-focused': {
                                            color: 'black !important',
                                        },
                                    }}
                                />

                                <TextField
                                    label="Skills Required"
                                    type="text"
                                    name="skills_required"
                                    value={jobData.skills_required}
                                    onChange={handleChange(setJobData)}
                                    required
                                    variant="outlined"
                                    fullWidth
                                    InputProps={{ sx: { color: 'black' } }}
                                    InputLabelProps={{ sx: { color: 'black' } }}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            '& fieldset': {
                                                borderColor: '#282c34',
                                            },
                                            '&:hover fieldset': {
                                                borderColor: 'secondary.main',
                                            },
                                            '&.Mui-focused fieldset': {
                                                borderColor: 'secondary.main',
                                            },
                                            '&.Mui-focused .MuiInputLabel-root': {
                                                color: 'black !important',
                                            },
                                        },
                                        '& .MuiInputLabel-root.Mui-focused': {
                                            color: 'black !important',
                                        },
                                    }}
                                />

                                <TextField
                                    label="Salary"
                                    type="number"
                                    name="salary"
                                    value={jobData.salary}
                                    onChange={handleChange(setJobData)}
                                    required
                                    variant="outlined"
                                    fullWidth
                                    InputProps={{ sx: { color: 'black' } }}
                                    InputLabelProps={{ sx: { color: 'black' } }}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            '& fieldset': {
                                                borderColor: '#282c34',
                                            },
                                            '&:hover fieldset': {
                                                borderColor: 'secondary.main',
                                            },
                                            '&.Mui-focused fieldset': {
                                                borderColor: 'secondary.main',
                                            },
                                            '&.Mui-focused .MuiInputLabel-root': {
                                                color: 'black !important',
                                            },
                                        },
                                        '& .MuiInputLabel-root.Mui-focused': {
                                            color: 'black !important',
                                        },
                                    }}
                                />

                                <FormControl fullWidth variant="outlined">
                                    <InputLabel sx={{ color: 'black' }}>Job Type</InputLabel>
                                    <Select
                                        name="job_type"
                                        value={jobData.job_type}
                                        onChange={handleChange(setJobData)}
                                        label="Job Type"
                                        sx={{
                                            color: 'black',
                                            '& .MuiOutlinedInput-notchedOutline': {
                                                borderColor: '#282c34',
                                            },
                                            '&:hover .MuiOutlinedInput-notchedOutline': {
                                                borderColor: 'secondary.main',
                                            },
                                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                                borderColor: 'secondary.main',
                                            },
                                        }}
                                    >
                                        <MenuItem value="full-time">Full-time</MenuItem>
                                        <MenuItem value="part-time">Part-time</MenuItem>
                                        <MenuItem value="contract">Contract</MenuItem>
                                    </Select>
                                </FormControl>

                                <FormControl fullWidth variant="outlined">
                                    <InputLabel sx={{ color: 'black' }}>Remote Option</InputLabel>
                                    <Select
                                        name="remote_option"
                                        value={jobData.remote_option ? "true" : "false"}
                                        onChange={(e) => setJobData({ ...jobData, remote_option: e.target.value === "true" })}
                                        label="Remote Option"
                                        sx={{
                                            color: 'black',
                                            '& .MuiOutlinedInput-notchedOutline': {
                                                borderColor: '#282c34',
                                            },
                                            '&:hover .MuiOutlinedInput-notchedOutline': {
                                                borderColor: 'secondary.main',
                                            },
                                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                                borderColor: 'secondary.main',
                                            },
                                        }}
                                    >
                                        <MenuItem value="true">Yes</MenuItem>
                                        <MenuItem value="false">No</MenuItem>
                                    </Select>
                                </FormControl>

                                <TextField
                                    label="Category"
                                    type="text"
                                    name="category"
                                    value={jobData.category}
                                    onChange={handleChange(setJobData)}
                                    required
                                    variant="outlined"
                                    fullWidth
                                    InputProps={{ sx: { color: 'black' } }}
                                    InputLabelProps={{ sx: { color: 'black' } }}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            '& fieldset': {
                                                borderColor: '#282c34',
                                            },
                                            '&:hover fieldset': {
                                                borderColor: 'secondary.main',
                                            },
                                            '&.Mui-focused fieldset': {
                                                borderColor: 'secondary.main',
                                            },
                                            '&.Mui-focused .MuiInputLabel-root': {
                                                color: 'black !important',
                                            },
                                        },
                                        '& .MuiInputLabel-root.Mui-focused': {
                                            color: 'black !important',
                                        },
                                    }}
                                />

                                <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                                    <Button
                                        type="button"
                                        onClick={handlePostAnotherJob}
                                        variant="outlined"
                                        sx={{
                                            flex: 1,
                                            py: 1.5,
                                            color: '#282c34',
                                            borderColor: '#282c34',
                                            '&:hover': {
                                                borderColor: 'secondary.main',
                                                backgroundColor: 'rgba(180, 240, 0, 0.1)',
                                            },
                                            textTransform: 'none',
                                            fontWeight: 'bold',
                                            borderRadius: '8px',
                                        }}
                                    >
                                        Post Another Job
                                    </Button>

                                    <Button
                                        type="submit"
                                        variant="contained"
                                        disabled={loading}
                                        sx={{
                                            flex: 1,
                                            py: 1.5,
                                            backgroundColor: '#b4f000 !important',
                                            color: '#282c34 !important',
                                            '&:hover': {
                                                backgroundColor: '#a0d600 !important',
                                            },
                                            textTransform: 'none',
                                            fontWeight: 'bold',
                                            borderRadius: '8px',
                                        }}
                                    >
                                        {loading ? 'Posting Job...' : 'Finish Registration'}
                                    </Button>
                                </Box>
                            </Box>
                        </Box>
                    )}
                </Paper>
            </Container>
        </Box>
    );
}

export default Register;
