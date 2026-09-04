import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from './AuthContext';
import {
    Box,
    Button,
    Menu,
    MenuItem,
    Typography,
    useMediaQuery,
    useTheme,
    IconButton,
    Drawer,
    List,
    ListItem,
    ListItemButton,
    ListItemText,
    Divider
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';

function Navbar({ isAuthenticated, onLogout, userRole, user, employmentInfo }) {
    const { logout } = useContext(AuthContext);
    const [anchorEl, setAnchorEl] = useState(null);
    const [mobileOpen, setMobileOpen] = useState(false);
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    const handleMenuClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = () => {
        logout();
        navigate('/HomeNotLoggedIn');
        handleMenuClose();
    };

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const navigationItems = [];
    if (isAuthenticated) {
        if (userRole === 'candidate' || userRole === 'employed') {
            navigationItems.push({ text: 'Jobs', path: '/Jobs' });
        }
        if (userRole === 'employer') {
            navigationItems.push({ text: 'Candidates', path: `/Candidate/${user?.user_id}` });
            navigationItems.push({ text: 'Employees', path: '/MyEmployees' });
        }
        if (userRole === 'employed') {
            navigationItems.push({ text: 'My Job', path: '/MyJob' });
        }
    }

    const userMenuItems = [
        { text: 'Profile', path: `/Profile/${user?.user_id}` },
        { text: 'My Messages', path: '/Messages' },
    ];

    if (userRole === 'candidate' || userRole === 'employed') {
        userMenuItems.push(
            { text: 'My Applications', path: '/Applications' },
            { text: 'My Saved Jobs', path: '/saved-jobs' }
        );
    }

    if (userRole === 'employer') {
        userMenuItems.push({ text: 'Applicants', path: '/Applicants' });
    }

    const drawer = (
        <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center' }}>
            <Typography variant="h6" sx={{ my: 2, color: 'primary.main' }}>
                JobSearch
            </Typography>
            <Divider />
            <List>
                {navigationItems.map((item) => (
                    <ListItem key={item.text} disablePadding>
                        <ListItemButton component={Link} to={item.path}>
                            <ListItemText primary={item.text} />
                        </ListItemButton>
                    </ListItem>
                ))}
                {isAuthenticated && (
                    <>
                        <Divider />
                        {userMenuItems.map((item) => (
                            <ListItem key={item.text} disablePadding>
                                <ListItemButton component={Link} to={item.path}>
                                    <ListItemText primary={item.text} />
                                </ListItemButton>
                            </ListItem>
                        ))}
                        <ListItem disablePadding>
                            <ListItemButton onClick={handleLogout}>
                                <ListItemText primary="Logout" />
                            </ListItemButton>
                        </ListItem>
                    </>
                )}
                {!isAuthenticated && (
                    <>
                        <Divider />
                        <ListItem disablePadding>
                            <ListItemButton component={Link} to="/register">
                                <ListItemText primary="Register" />
                            </ListItemButton>
                        </ListItem>
                        <ListItem disablePadding>
                            <ListItemButton component={Link} to="/login">
                                <ListItemText primary="Login" />
                            </ListItemButton>
                        </ListItem>
                    </>
                )}
            </List>
        </Box>
    );

    return (
        <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
            {isMobile ? (
                <>
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        edge="start"
                        onClick={handleDrawerToggle}
                        sx={{ mr: 2, color: 'text.primary' }}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Drawer
                        variant="temporary"
                        open={mobileOpen}
                        onClose={handleDrawerToggle}
                        ModalProps={{
                            keepMounted: true, 
                        }}
                        sx={{
                            display: { xs: 'block', md: 'none' },
                            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 240 },
                        }}
                    >
                        {drawer}
                    </Drawer>
                </>
            ) : (
                <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
                    {navigationItems.map((item) => (
                        <Button
                            key={item.text}
                            component={Link}
                            to={item.path}
                            sx={{
                                color: 'text.primary',
                                minHeight: '36px',
                                px: 2,
                                '&:hover': { color: 'primary.main' }
                            }}
                        >
                            {item.text}
                        </Button>
                    ))}
                </Box>
            )}

            {isAuthenticated ? (
                <Box sx={{ display: 'flex', alignItems: 'center', ml: 'auto', height: '100%' }}>
                    <Typography
                        onClick={handleMenuClick}
                        textTransform="uppercase"
                        sx={{
                            color: 'text.primary',
                            px: 2,
                            py: 0,
                            cursor: 'pointer',
                            borderRadius: 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            minHeight: '36px',
                            fontSize: '0.875rem',
                            fontWeight: 500,
                            lineHeight: 1.75,
                            letterSpacing: '0.02857em',
                            '&:hover': {
                                color: 'primary.main',
                                backgroundColor: 'rgba(180, 240, 0, 0.1)'
                            }
                        }}
                    >
                        {user?.first_name && user?.last_name ? `${user.first_name} ${user.last_name}` : 'User'}
                    </Typography>
                    <Menu
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}
                        onClose={handleMenuClose}
                        PaperProps={{
                            sx: {
                                mt: 1,
                                minWidth: 200,
                                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
                            }
                        }}
                    >
                        {userMenuItems.map((item) => (
                            <MenuItem
                                key={item.text}
                                component={Link}
                                to={item.path}
                                onClick={handleMenuClose}
                                sx={{
                                    py: 1.5,
                                    px: 2,
                                    '&:hover': {
                                        backgroundColor: 'rgba(180, 240, 0, 0.1)',
                                        color: 'primary.main',
                                    }
                                }}
                            >
                                {item.text}
                            </MenuItem>
                        ))}
                        <MenuItem
                            onClick={handleLogout}
                            sx={{
                                py: 1.5,
                                px: 2,
                                '&:hover': {
                                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                                    '& .MuiTypography-root': {
                                        color: 'rgba(239, 68, 68, 1)',
                                    }
                                }
                            }}
                        >
                            <Typography color="error.main" fontWeight="medium">
                                Logout
                            </Typography>
                        </MenuItem>
                    </Menu>
                </Box>
            ) : (
                !isMobile && (
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', height: '100%' }}>
                        <Button
                            component={Link}
                            to="/register"
                            variant="contained"
                            color="primary"
                            sx={{ minHeight: '36px' }}
                        >
                            Register
                        </Button>
                        <Button
                            component={Link}
                            to="/login"
                            variant="contained"
                            color="primary"
                            sx={{ minHeight: '36px' }}
                        >
                            Login
                        </Button>
                    </Box>
                )
            )}
        </Box>
    );
}

export default Navbar;
