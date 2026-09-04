import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { API_BASE_URL } from '../api';
import {
    Box,
    Typography,
    TextField,
    Button,
    Alert,
    Paper,
    Container,
} from '@mui/material';

function Login() {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [errorMessage, setErrorMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        if (errorMessage) setErrorMessage('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrorMessage('');

        try {
            const response = await fetch(`${API_BASE_URL}/users/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            const data = await response.json();
            if (response.ok) {
                const userData = {
                    user_id: data.user.user_id,
                    role: data.user.role,
                    token: data.token,
                };
                login(userData);
                navigate('/Home');
            } else {
                setErrorMessage(data.error || 'Login failed.');
            }
        } catch (error) {
            console.error('Login error:', error);
            setErrorMessage('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box
            sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#f3f4f6',
                minHeight: 'calc(100vh - 237px)',
            }}
        >
            <Container maxWidth="sm">
                <Paper
                    elevation={3}
                    sx={{
                        borderRadius: '16px',
                        backgroundColor: 'white',
                        overflow: 'hidden',
                        border: '4px solid #282c34',
                        mx: 'auto',
                    }}
                >
                <Box
                sx={{
                    backgroundColor: 'white',
                    p: 3,
                    textAlign: 'center',
                    borderBottom: '2px solid #e0e0e0',
                }}
            >
                <Typography
                    variant="h4"
                    component="h1"
                    sx={{
                        fontWeight: 'bold',
                        mb: 1,
                        color: '#333',
                    }}
                >
                    Login
                </Typography>
                <Typography variant="body1" sx={{ color: '#666' }}>
                    Sign in to your account
                </Typography>
            </Box>

            <Box sx={{ px: 4, py: 2 }}>
                {errorMessage && (
                    <Alert severity="error" sx={{ mb: 3, mx: 0 }}>
                        {errorMessage}
                    </Alert>
                )}

                <Box
                    component="form"
                    onSubmit={handleSubmit}
                    backgroundColor = "white"
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 3,
                        px: 0,
                        py: 0,
                    }}
                >
                    <TextField
                        id="email"
                        label="Email"
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        variant="outlined"
                        fullWidth
                        InputProps={{
                            sx: { color: 'black' }
                        }}
                        InputLabelProps={{
                            sx: { color: 'black' }
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

                    <TextField
                        id="password"
                        label="Password"
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        variant="outlined"
                        fullWidth
                        InputProps={{
                            sx: { color: 'black' }
                        }}
                        InputLabelProps={{
                            sx: { color: 'black' }
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
                    <Button
                        type="submit"
                        fullWidth
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
                        {loading ? 'Logging in...' : 'Login'}
                    </Button>
                </Box>

                <Typography
                    variant="body2"
                    sx={{
                        mt: 3,
                        textAlign: 'center',
                        color: '#666',
                    }}
                >
                    Don't have an account?{' '}
                    <Button
                        component={Link}
                        to="/register"
                        sx={{
                            color: '#667eea',
                            textTransform: 'none',
                            fontWeight: 'bold',
                            p: 0,
                            minHeight: 'auto',
                            '&:hover': {
                                backgroundColor: 'transparent',
                                textDecoration: 'underline',
                            },
                        }}
                    >
                        Sign up
                    </Button>
                </Typography>
            </Box>
            </Paper>
        </Container>
    </Box>
    );
}

export default Login;
