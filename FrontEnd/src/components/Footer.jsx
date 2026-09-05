import React from 'react';
import { Box, Typography, Link, Divider } from '@mui/material';

function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: 'secondary.main',
        color: 'text.primary',
        py: 3,
        mt: 'auto',
        width: '100%',
      }}
    >
      <Box sx={{ px: { xs: 2, sm: 3, md: 4 } }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            mb: 2,
          }}
        >
          <Typography
            variant="h6"
            sx={{
              color: 'primary.main',
              fontWeight: 'bold',
            }}
          >
            JobSearch
          </Typography>

          <Box sx={{ display: 'flex', gap: 3 }}>
            <Link
              href="/about"
              color="text.secondary"
              sx={{
                textDecoration: 'none',
                '&:hover': {
                  color: 'text.primary',
                },
              }}
            >
              About
            </Link>
            <Link
              href="/contact"
              color="text.secondary"
              sx={{
                textDecoration: 'none',
                '&:hover': {
                  color: 'text.primary',
                },
              }}
            >
              Contact
            </Link>
            <Link
              href="/privacy"
              color="text.secondary"
              sx={{
                textDecoration: 'none',
                '&:hover': {
                  color: 'text.primary',
                },
              }}
            >
              Privacy
            </Link>
          </Box>
        </Box>

        <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.12)', mb: 2 }} />

        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <Typography
            variant="body2"
            sx={{
              color: 'text.secondary',
            }}
          >
            &copy; {new Date().getFullYear()} JobSearch. All rights reserved.
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

export default Footer;
