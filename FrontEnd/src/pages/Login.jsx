import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { apiFetch } from '../api';
import {
    Box,
    Typography,
    TextField,
    Button,
    Alert,
    Paper,
    Container,
    InputAdornment,
    IconButton,
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

function Login() {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [touched, setTouched] = useState({ email: false, password: false });
    const [showPassword, setShowPassword] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useContext(AuthContext);
    const notify = useNotification();
    const navigate = useNavigate();

    const validateEmail = (email) => {
        if (!email) return 'Email is required';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Please enter a valid email';
        return '';
    };

    const validatePassword = (password) => {
        if (!password) return 'Password is required';
        if (password.length < 6) return 'Password must be at least 6 characters';
        return '';
    };

    const errors = {
        email: touched.email ? validateEmail(formData.email) : '',
        password: touched.password ? validatePassword(formData.password) : '',
    };

    const isValid = !validateEmail(formData.email) && !validatePassword(formData.password);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        if (errorMessage) setErrorMessage('');
    };

    const handleBlur = (e) => {
        const { name } = e.target;
        setTouched({ ...touched, [name]: true });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setTouched({ email: true, password: true });
        if (!isValid) {
            notify.warning('Please fix the errors before submitting.');
            return;
        }
        setLoading(true);
        setErrorMessage('');

        try {
            const response = await apiFetch(`/users/login`, {
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
                notify.success('Welcome back! Login successful.');
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
                        border: '4px solid', borderColor: 'divider',
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
                        onBlur={handleBlur}
                        error={touched.email && !!errors.email}
                        helperText={touched.email && errors.email}
                        required
                        variant="outlined"
                        fullWidth
                        InputProps={{
                            sx: { color: 'black' },
                            endAdornment: touched.email && !errors.email && (
                                <InputAdornment position="end">
                                    <CheckCircleIcon color="success" fontSize="small" />
                                </InputAdornment>
                            ),
                        }}
                        InputLabelProps={{
                            sx: { color: 'black' }
                        }}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                '& fieldset': {
                                    borderColor: 'divider',
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
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.password && !!errors.password}
                        helperText={touched.password && errors.password}
                        required
                        variant="outlined"
                        fullWidth
                        InputProps={{
                            sx: { color: 'black' },
                            endAdornment: (
                                <InputAdornment position="end">
                                    {touched.password && !errors.password && (
                                        <CheckCircleIcon color="success" fontSize="small" sx={{ mr: 1 }} />
                                    )}
                                    <IconButton
                                        onClick={() => setShowPassword(!showPassword)}
                                        edge="end"
                                        size="small"
                                    >
                                        {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                        InputLabelProps={{
                            sx: { color: 'black' }
                        }}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                '& fieldset': {
                                    borderColor: 'divider',
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
                            backgroundColor: 'primary.main',
                            color: 'primary.contrastText',
                            '&:hover': {
                                backgroundColor: 'primary.dark',
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
                            color: 'primary.main',
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
