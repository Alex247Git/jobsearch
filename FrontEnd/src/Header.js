import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Box } from '@mui/material';
import Navbar from './Navbar';

function Header({ isAuthenticated, onLogout, toggleUserRole, userRole, user, employmentInfo }) {
    const navigate = useNavigate();

    const handleLogoClick = () => {
        if (isAuthenticated) {
            navigate('/');
        } else {
            navigate('/HomeNotLoggedIn');
        }
    };

    return (
        <AppBar position="static" sx={{ backgroundColor: 'secondary.main' }}>
            <Toolbar>
                <Typography
                    variant="h1"
                    component="div"
                    sx={{
                        flexGrow: 0,
                        cursor: 'pointer',
                        color: 'primary.main',
                        fontWeight: 'bold',
                        '&:hover': {
                            color: 'primary.light',
                        },
                    }}
                    onClick={handleLogoClick}
                >
                    JobSearch
                </Typography>
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
