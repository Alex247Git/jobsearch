import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Box, Stack } from '@mui/material';
import WorkIcon from '@mui/icons-material/Work';
import Navbar from '../components/Navbar';

function Header({ isAuthenticated, onLogout, toggleUserRole, userRole, user, employmentInfo }) {
    const navigate = useNavigate();

    const handleLogoClick = () => {
        if (isAuthenticated) navigate('/');
        else navigate('/HomeNotLoggedIn');
    };

    return (
        <AppBar
            position="sticky"
            color="transparent"
            elevation={0}
            sx={{
                backgroundColor: 'background.paper',
                color: 'text.primary',
                borderBottom: '1px solid',
                borderColor: 'divider',
                backdropFilter: 'saturate(180%) blur(8px)',
            }}
        >
            <Toolbar sx={{ maxWidth: 1280, width: '100%', mx: 'auto', px: { xs: 2, md: 3 } }}>
                <Stack
                    direction="row"
                    alignItems="center"
                    spacing={1}
                    onClick={handleLogoClick}
                    sx={{ cursor: 'pointer', '&:hover .brand-text': { color: 'primary.light' } }}
                >
                    <WorkIcon sx={{ color: 'primary.main', fontSize: 28 }} />
                    <Typography
                        className="brand-text"
                        variant="h6"
                        component="div"
                        sx={{ fontWeight: 700, color: 'primary.main', letterSpacing: -0.5 }}
                    >
                        JobSearch
                    </Typography>
                </Stack>
                <Box sx={{ flexGrow: 1 }} />
                <Navbar
                    isAuthenticated={isAuthenticated}
                    onLogout={onLogout}
                    userRole={userRole}
                    toggleUserRole={toggleUserRole}
                    user={user}
                    employmentInfo={employmentInfo}
                />
            </Toolbar>
        </AppBar>
    );
}

export default Header;
