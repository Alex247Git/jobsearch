import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import {
    Box,
    Typography,
    Button,
    Container,
    Paper,
    useTheme,
    useMediaQuery,
    Grid,
    Card,
    CardContent,
    CardActions,
} from '@mui/material';
import WorkIcon from '@mui/icons-material/Work';
import PeopleIcon from '@mui/icons-material/People';
import BusinessIcon from '@mui/icons-material/Business';

function Home() {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
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
            <Container maxWidth="lg">
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
                        Welcome {user ? user.first_name : 'Guest'}!
                    </Typography>

                    {!user && (
                        <Typography
                            variant="h6"
                            sx={{
                                mb: 4,
                                color: 'text.secondary',
                                maxWidth: 600,
                                mx: 'auto',
                            }}
                        >
                            Please log in to access job listings or employer tools.
                        </Typography>
                    )}

                    {(user?.role === 'candidate' || user?.role === 'employed') && (
                        <>
                            <Typography
                                variant="h5"
                                sx={{
                                    mb: 4,
                                    color: 'text.primary',
                                    fontWeight: 'bold',
                                }}
                            >
                                Find your next job here!
                            </Typography>

                            <Grid container spacing={4} justifyContent="center">
                                <Grid size={{ xs: 12, md: 6, lg: 4 }}>
                                    <Card
                                        sx={{
                                            height: '100%',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            transition: 'transform 0.2s',
                                            '&:hover': {
                                                transform: 'translateY(-4px)',
                                                boxShadow: theme.shadows[8],
                                            },
                                        }}
                                    >
                                        <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
                                            <WorkIcon
                                                sx={{
                                                    fontSize: 48,
                                                    color: 'primary.main',
                                                    mb: 2,
                                                }}
                                            />
                                            <Typography variant="h6" component="h2" gutterBottom>
                                                Browse Jobs
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Discover exciting job opportunities that match your skills and interests.
                                            </Typography>
                                        </CardContent>
                                        <CardActions sx={{ justifyContent: 'center', pb: 2 }}>
                                            <Button
                                                variant="contained"
                                                color="primary"
                                                size="large"
                                                onClick={() => navigate('/Jobs')}
                                                sx={{
                                                    textTransform: 'none',
                                                    fontWeight: 'bold',
                                                }}
                                            >
                                                Browse Jobs
                                            </Button>
                                        </CardActions>
                                    </Card>
                                </Grid>

                                <Grid size={{ xs: 12, md: 6, lg: 4 }}>
                                    <Card
                                        sx={{
                                            height: '100%',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            transition: 'transform 0.2s',
                                            '&:hover': {
                                                transform: 'translateY(-4px)',
                                                boxShadow: theme.shadows[8],
                                            },
                                        }}
                                    >
                                        <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
                                            <PeopleIcon
                                                sx={{
                                                    fontSize: 48,
                                                    color: 'primary.main',
                                                    mb: 2,
                                                }}
                                            />
                                            <Typography variant="h6" component="h2" gutterBottom>
                                                My Applications
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Track your job applications and stay updated on their status.
                                            </Typography>
                                        </CardContent>
                                        <CardActions sx={{ justifyContent: 'center', pb: 2 }}>
                                            <Button
                                                variant="contained"
                                                color="primary"
                                                size="large"
                                                onClick={() => navigate('/Applications')}
                                                sx={{
                                                    textTransform: 'none',
                                                    fontWeight: 'bold',
                                                }}
                                            >
                                                View Applications
                                            </Button>
                                        </CardActions>
                                    </Card>
                                </Grid>

                                <Grid size={{ xs: 12, md: 6, lg: 4 }}>
                                    <Card
                                        sx={{
                                            height: '100%',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            transition: 'transform 0.2s',
                                            '&:hover': {
                                                transform: 'translateY(-4px)',
                                                boxShadow: theme.shadows[8],
                                            },
                                        }}
                                    >
                                        <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
                                            <WorkIcon
                                                sx={{
                                                    fontSize: 48,
                                                    color: 'primary.main',
                                                    mb: 2,
                                                }}
                                            />
                                            <Typography variant="h6" component="h2" gutterBottom>
                                                Saved Jobs
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Access your saved job listings for quick reference.
                                            </Typography>
                                        </CardContent>
                                        <CardActions sx={{ justifyContent: 'center', pb: 2 }}>
                                            <Button
                                                variant="outlined"
                                                color="primary"
                                                size="large"
                                                onClick={() => navigate('/saved-jobs')}
                                                sx={{
                                                    textTransform: 'none',
                                                    fontWeight: 'bold',
                                                }}
                                            >
                                                View Saved Jobs
                                            </Button>
                                        </CardActions>
                                    </Card>
                                </Grid>
                            </Grid>
                        </>
                    )}

                    {user?.role === 'employer' && (
                        <>
                            <Typography
                                variant="h5"
                                sx={{
                                    mb: 4,
                                    color: 'text.primary',
                                    fontWeight: 'bold',
                                }}
                            >
                                Find your next employee here!
                            </Typography>

                            <Grid container spacing={4} justifyContent="center">
                                <Grid size={{ xs: 12, md: 6, lg: 4 }}>
                                    <Card
                                        sx={{
                                            height: '100%',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            transition: 'transform 0.2s',
                                            '&:hover': {
                                                transform: 'translateY(-4px)',
                                                boxShadow: theme.shadows[8],
                                            },
                                        }}
                                    >
                                        <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
                                            <PeopleIcon
                                                sx={{
                                                    fontSize: 48,
                                                    color: 'primary.main',
                                                    mb: 2,
                                                }}
                                            />
                                            <Typography variant="h6" component="h2" gutterBottom>
                                                Browse Candidates
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Find qualified candidates for your open positions.
                                            </Typography>
                                        </CardContent>
                                        <CardActions sx={{ justifyContent: 'center', pb: 2 }}>
                                            <Button
                                                variant="contained"
                                                color="primary"
                                                size="large"
                                                onClick={() => navigate('/Candidates')}
                                                sx={{
                                                    textTransform: 'none',
                                                    fontWeight: 'bold',
                                                }}
                                            >
                                                Browse Candidates
                                            </Button>
                                        </CardActions>
                                    </Card>
                                </Grid>

                                <Grid size={{ xs: 12, md: 6, lg: 4 }}>
                                    <Card
                                        sx={{
                                            height: '100%',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            transition: 'transform 0.2s',
                                            '&:hover': {
                                                transform: 'translateY(-4px)',
                                                boxShadow: theme.shadows[8],
                                            },
                                        }}
                                    >
                                        <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
                                            <BusinessIcon
                                                sx={{
                                                    fontSize: 48,
                                                    color: 'primary.main',
                                                    mb: 2,
                                                }}
                                            />
                                            <Typography variant="h6" component="h2" gutterBottom>
                                                My Company
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Manage your company profile and job postings.
                                            </Typography>
                                        </CardContent>
                                        <CardActions sx={{ justifyContent: 'center', pb: 2 }}>
                                            <Button
                                                variant="outlined"
                                                color="primary"
                                                size="large"
                                                onClick={() => navigate('/MyEmployees')}
                                                sx={{
                                                    textTransform: 'none',
                                                    fontWeight: 'bold',
                                                }}
                                            >
                                                Manage Company
                                            </Button>
                                        </CardActions>
                                    </Card>
                                </Grid>

                                <Grid size={{ xs: 12, md: 6, lg: 4 }}>
                                    <Card
                                        sx={{
                                            height: '100%',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            transition: 'transform 0.2s',
                                            '&:hover': {
                                                transform: 'translateY(-4px)',
                                                boxShadow: theme.shadows[8],
                                            },
                                        }}
                                    >
                                        <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
                                            <WorkIcon
                                                sx={{
                                                    fontSize: 48,
                                                    color: 'primary.main',
                                                    mb: 2,
                                                }}
                                            />
                                            <Typography variant="h6" component="h2" gutterBottom>
                                                Job Applications
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Review applications for your posted jobs.
                                            </Typography>
                                        </CardContent>
                                        <CardActions sx={{ justifyContent: 'center', pb: 2 }}>
                                            <Button
                                                variant="contained"
                                                color="primary"
                                                size="large"
                                                onClick={() => navigate('/Applicants')}
                                                sx={{
                                                    textTransform: 'none',
                                                    fontWeight: 'bold',
                                                }}
                                            >
                                                View Applications
                                            </Button>
                                        </CardActions>
                                    </Card>
                                </Grid>
                            </Grid>
                        </>
                    )}

                    {user?.role === 'employed' && (
                        <Box sx={{ mt: 6 }}>
                            <Typography
                                variant="h5"
                                sx={{
                                    mb: 4,
                                    color: 'text.primary',
                                    fontWeight: 'bold',
                                }}
                            >
                                Employment Dashboard
                            </Typography>

                            <Grid container spacing={4} justifyContent="center">
                                <Grid size={{ xs: 12, md: 6, lg: 4 }}>
                                    <Card
                                        sx={{
                                            height: '100%',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            transition: 'transform 0.2s',
                                            '&:hover': {
                                                transform: 'translateY(-4px)',
                                                boxShadow: theme.shadows[8],
                                            },
                                        }}
                                    >
                                        <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
                                            <WorkIcon
                                                sx={{
                                                    fontSize: 48,
                                                    color: 'primary.main',
                                                    mb: 2,
                                                }}
                                            />
                                            <Typography variant="h6" component="h2" gutterBottom>
                                                My Job
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                View details about your current employment.
                                            </Typography>
                                        </CardContent>
                                        <CardActions sx={{ justifyContent: 'center', pb: 2 }}>
                                            <Button
                                                variant="contained"
                                                color="primary"
                                                size="large"
                                                onClick={() => navigate('/MyJob')}
                                                sx={{
                                                    textTransform: 'none',
                                                    fontWeight: 'bold',
                                                }}
                                            >
                                                View My Job
                                            </Button>
                                        </CardActions>
                                    </Card>
                                </Grid>
                            </Grid>
                        </Box>
                    )}
                </Paper>
            </Container>
        </Box>
    );
}

export default Home;
