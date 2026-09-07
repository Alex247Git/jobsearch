import EmailIcon from '@mui/icons-material/Email';
import GitHubIcon from '@mui/icons-material/GitHub';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import WorkIcon from '@mui/icons-material/Work';
import {
    Box, Container,
    Divider, IconButton,
    Link, Stack,
    Tooltip,
    Typography,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

const QUICK_LINKS = [
    { label: 'Home', to: '/' },
    { label: 'Jobs', to: '/Jobs' },
];

const SOCIAL = [
    { icon: <GitHubIcon fontSize="small" />, label: 'GitHub', href: 'https://github.com' },
    { icon: <LinkedInIcon fontSize="small" />, label: 'LinkedIn', href: 'https://linkedin.com' },
];

function Footer() {
    return (
        <Box
            component="footer"
            sx={{
                backgroundColor: 'background.paper',
                color: 'text.primary',
                borderTop: '1px solid',
                borderColor: 'divider',
                mt: 'auto',
                width: '100%',
            }}
        >
            <Container maxWidth="lg" sx={{ py: 6 }}>
                <Box
                    sx={{
                        display: 'grid',
                        gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '2fr 1fr 1fr' },
                        gap: 4,
                        mb: 4,
                    }}
                >
                    {/* Brand column */}
                    <Box>
                        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
                            <WorkIcon sx={{ color: 'primary.main', fontSize: 26 }} />
                            <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main', letterSpacing: -0.5 }}>
                                JobSearch
                            </Typography>
                        </Stack>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, maxWidth: 360 }}>
                            A full-stack job marketplace connecting candidates with employers.
                            Discover opportunities, apply in one click, and chat in real time.
                        </Typography>
                        <Stack direction="row" spacing={1}>
                            {SOCIAL.map((s) => (
                                <Tooltip key={s.label} title={s.label}>
                                    <IconButton
                                        component="a"
                                        href={s.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        size="small"
                                        sx={{
                                            color: 'text.secondary',
                                            border: '1px solid',
                                            borderColor: 'divider',
                                            '&:hover': { color: 'primary.main', borderColor: 'primary.main' },
                                        }}
                                    >
                                        {s.icon}
                                    </IconButton>
                                </Tooltip>
                            ))}
                        </Stack>
                    </Box>

                    {/* Quick links */}
                    <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                            Quick Links
                        </Typography>
                        <Stack spacing={1.2}>
                            {QUICK_LINKS.map((l) => (
                                <Link
                                    key={l.label}
                                    component={RouterLink}
                                    to={l.to}
                                    underline="none"
                                    color="text.secondary"
                                    sx={{ fontSize: 14, '&:hover': { color: 'primary.main' } }}
                                >
                                    {l.label}
                                </Link>
                            ))}
                        </Stack>
                    </Box>

                    {/* Contact */}
                    <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                            Contact
                        </Typography>
                        <Stack spacing={1.2}>
                            <Stack direction="row" spacing={1} alignItems="center">
                                <EmailIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                                <Typography variant="body2" color="text.secondary">hello@jobsearch.app</Typography>
                            </Stack>
                            <Stack direction="row" spacing={1} alignItems="flex-start">
                                <LocationOnIcon sx={{ fontSize: 16, color: 'text.secondary', mt: 0.4 }} />
                                <Typography variant="body2" color="text.secondary">
                                    Greece
                                </Typography>
                            </Stack>
                        </Stack>
                    </Box>
                </Box>

                <Divider sx={{ borderColor: 'divider', mb: 2 }} />

                <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    justifyContent="space-between"
                    alignItems={{ xs: 'center', sm: 'center' }}
                    spacing={1}
                >
                    <Typography variant="body2" color="text.secondary">
                        &copy; {new Date().getFullYear()} JobSearch. All rights reserved.
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        Built with React, MUI &amp; Express
                    </Typography>
                </Stack>
            </Container>
        </Box>
    );
}

export default Footer;
