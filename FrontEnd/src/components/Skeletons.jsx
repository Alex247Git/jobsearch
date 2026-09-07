import React from 'react';
import { Skeleton, Box, Paper, Grid, Stack } from '@mui/material';

export function JobCardSkeleton() {
    return (
        <Paper sx={{ p: 2, borderRadius: 2, height: '100%' }}>
            <Stack spacing={1.5}>
                <Skeleton variant="text" width="60%" height={28} />
                <Skeleton variant="text" width="40%" height={20} />
                <Stack direction="row" spacing={1}>
                    <Skeleton variant="text" width={80} height={20} />
                    <Skeleton variant="text" width={100} height={20} />
                    <Skeleton variant="text" width={90} height={20} />
                </Stack>
                <Skeleton variant="rounded" height={36} />
            </Stack>
        </Paper>
    );
}

export function JobListSkeleton({ count = 6 }) {
    return (
        <Grid container spacing={3}>
            {Array.from({ length: count }).map((_, i) => (
                <Grid item xs={12} md={6} lg={4} key={i}>
                    <JobCardSkeleton />
                </Grid>
            ))}
        </Grid>
    );
}

export function ProfileSkeleton() {
    return (
        <Box sx={{ p: 4 }}>
            <Stack spacing={3}>
                <Stack direction="row" spacing={2} alignItems="center">
                    <Skeleton variant="circular" width={64} height={64} />
                    <Box sx={{ flex: 1 }}>
                        <Skeleton variant="text" width="40%" height={32} />
                        <Skeleton variant="text" width="25%" height={20} />
                    </Box>
                </Stack>
                <Skeleton variant="rectangular" height={1} />
                {Array.from({ length: 6 }).map((_, i) => (
                    <Skeleton key={i} variant="text" width="100%" height={40} />
                ))}
            </Stack>
        </Box>
    );
}

export function MessageListSkeleton() {
    return (
        <Box sx={{ p: 2 }}>
            <Stack spacing={1.5}>
                {Array.from({ length: 5 }).map((_, i) => (
                    <Stack key={i} direction="row" spacing={1.5} alignItems="center">
                        <Skeleton variant="circular" width={40} height={40} />
                        <Box sx={{ flex: 1 }}>
                            <Skeleton variant="text" width="50%" height={20} />
                            <Skeleton variant="text" width="80%" height={16} />
                        </Box>
                    </Stack>
                ))}
            </Stack>
        </Box>
    );
}

export function ConversationSkeleton() {
    return (
        <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1, height: '100%' }}>
            {Array.from({ length: 6 }).map((_, i) => (
                <Box key={i} sx={{
                    alignSelf: i % 2 === 0 ? 'flex-start' : 'flex-end',
                    maxWidth: '60%',
                }}>
                    <Skeleton variant="rounded" width={120 + i * 20} height={36} sx={{ borderRadius: 2 }} />
                </Box>
            ))}
        </Box>
    );
}
