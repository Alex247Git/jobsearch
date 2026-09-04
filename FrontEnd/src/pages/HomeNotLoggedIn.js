import React from 'react';
import { Link } from 'react-router-dom';
import {
    Box,
    Typography,
    Button,
    Container,
    Paper,
    Link as MuiLink,
    useTheme,
    useMediaQuery
} from '@mui/material';

function HomeNotLoggedIn() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    return (
        <Box
            sx={{
                minHeight: '70vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#f3f4f6',
                py: 4,
            }}
        >
            <Container maxWidth="md">
                <Paper
                    elevation={3}
                    sx={{
                        p: { xs: 4, md: 6 },
                        textAlign: 'center',
                        backgroundColor: 'background.paper',
                        borderRadius: 2,
                    }}
                >
                    <Typography
                        variant={isMobile ? 'h4' : 'h3'}
                        component="h1"
                        sx={{
                            mb: 2,
                            color: 'text.primary',
                            fontWeight: 'bold',
                        }}
                    >
                        Welcome to Our Platform!
                    </Typography>

                    <Typography
                        variant="h6"
                        sx={{
                            mb: 4,
                            color: 'text.secondary',
                            maxWidth: 600,
                            mx: 'auto',
                        }}
                    >
                        Discover job opportunities and connect with employers.
                    </Typography>

                    <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
                        <Typography
                            variant="body1"
                            sx={{
                                color: 'text.secondary',
                                textAlign: 'center',
                            }}
                        >
                            Please{' '}
                            <MuiLink
                                component={Link}
                                to="/login"
                                sx={{
                                    color: 'primary.main',
                                    textDecoration: 'none',
                                    fontWeight: 'bold',
                                    '&:hover': {
                                        textDecoration: 'underline',
                                    },
                                }}
                            >
                                log in
                            </MuiLink>
                            {' '}or{' '}
                            <MuiLink
                                component={Link}
                                to="/register"
                                sx={{
                                    color: 'primary.main',
                                    textDecoration: 'none',
                                    fontWeight: 'bold',
                                    '&:hover': {
                                        textDecoration: 'underline',
                                    },
                                }}
                            >
                                sign up
                            </MuiLink>
                            {' '}to get started.
                        </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                        <Button
                            component={Link}
                            to="/login"
                            variant="contained"
                            color="primary"
                            size="large"
                            sx={{
                                minWidth: 120,
                                textTransform: 'none',
                            }}
                        >
                            Log In
                        </Button>
                        <Button
                            component={Link}
                            to="/register"
                            variant="outlined"
                            color="primary"
                            size="large"
                            sx={{
                                minWidth: 120,
                                textTransform: 'none',
                            }}
                        >
                            Sign Up
                        </Button>
                    </Box>
                </Paper>
            </Container>
        </Box>
    );
}

export default HomeNotLoggedIn;
