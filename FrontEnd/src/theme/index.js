import { createTheme } from '@mui/material/styles';

// JobSearch Design Tokens — Clean Light + Green
// Single source of truth for the whole UI. Elements render their
// correct look automatically through pale-based component overrides.

const colors = {
    bg: '#F9FAFB',
    surface: '#FFFFFF',
    primary: '#16A34A',
    primaryDark: '#15803D',
    primaryLight: '#4ADE80',
    textPrimary: '#111827',
    textBody: '#374151',
    textSecondary: '#6B7280',
    border: '#E5E7EB',
    inputBorder: '#D1D5DB',
    successBg: '#DCFCE7',
    successText: '#166534',
    error: '#EF4444',
    warning: '#F59E0B',
};

const theme = createTheme({
    palette: {
        mode: 'light',
        primary: {
            main: colors.primary,
            dark: colors.primaryDark,
            light: colors.primaryLight,
            contrastText: '#FFFFFF',
        },
        success: {
            main: colors.primary,
            contrastText: '#FFFFFF',
        },
        error: {
            main: colors.error,
        },
        warning: {
            main: colors.warning,
        },
        background: {
            default: colors.bg,
            paper: colors.surface,
        },
        text: {
            primary: colors.textPrimary,
            secondary: colors.textSecondary,
        },
        divider: colors.border,
    },
    typography: {
        fontFamily: [
            'Inter', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"',
            'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', '"Helvetica Neue"', 'sans-serif',
        ].join(','),
        h1: { fontSize: '2rem', fontWeight: 700, color: colors.textPrimary },
        h2: { fontSize: '1.5rem', fontWeight: 600, color: colors.textPrimary },
        h3: { fontSize: '1.25rem', fontWeight: 600, color: colors.textPrimary },
        body1: { fontSize: '1rem', color: colors.textBody },
        body2: { fontSize: '0.875rem', color: colors.textSecondary },
        button: { textTransform: 'none', fontWeight: 600 },
    },
    shape: {
        borderRadius: 8,
    },
    spacing: 8,
    components: {
        // --- Buttons -----------------------------
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 6,
                    textTransform: 'none',
                    fontWeight: 600,
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                        transform: 'translateY(-1px)',
                        boxShadow: '0 4px 12px rgba(22, 163, 74, 0.3)',
                    },
                    '&:active': {
                        transform: 'translateY(0)',
                    },
                },
                containedPrimary: {
                    backgroundColor: colors.primary,
                    '&:hover': {
                        backgroundColor: colors.primaryDark,
                        boxShadow: '0 4px 16px rgba(22, 163, 74, 0.4)',
                    },
                },
                outlinedPrimary: {
                    borderColor: colors.primary,
                    color: colors.primaryDark,
                    '&:hover': {
                        borderColor: colors.primary,
                        backgroundColor: colors.successBg,
                        transform: 'translateY(-1px)',
                    },
                },
                textPrimary: {
                    '&:hover': {
                        backgroundColor: 'rgba(22, 163, 74, 0.06)',
                    },
                },
            },
        },
        // --- Cards -------------------------------
        MuiCard: {
            styleOverrides: {
                root: {
                    backgroundColor: colors.surface,
                    borderRadius: 8,
                    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                    transition: 'all 0.25s ease-in-out',
                    '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                    },
                },
            },
        },
        // -- Icon Buttons ------------------------
        MuiIconButton: {
            styleOverrides: {
                root: {
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                        transform: 'scale(1.1)',
                        backgroundColor: 'rgba(22, 163, 74, 0.08)',
                    },
                    '&:active': {
                        transform: 'scale(0.95)',
                    },
                },
            },
        },
        // --- Inputs ------------------------------
        MuiOutlinedInput: {
            styleOverrides: {
                root: {
                    borderRadius: 6,
                    transition: 'all 0.2s ease-in-out',
                    '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: colors.inputBorder,
                        transition: 'border-color 0.2s ease-in-out',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: colors.textSecondary,
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: colors.primary,
                        boxShadow: `0 0 0 3px ${colors.primary}20`,
                    },
                },
            },
        },
        MuiTextField: {
            defaultProps: {
                size: 'small',
            },
        },
        // --- AppBar / Header --------------------
        MuiAppBar: {
            styleOverrides: {
                root: {
                    backgroundColor: colors.surface,
                    color: colors.textPrimary,
                    boxShadow: 'none',
                    borderBottom: `1px solid ${colors.border}`,
                },
            },
        },
        MuiToolbar: {
            styleOverrides: {
                root: {
                    minHeight: 64,
                },
            },
        },
        // --- Chips ------------------------------
        MuiChip: {
            styleOverrides: {
                root: {
                    backgroundColor: colors.successBg,
                    color: colors.successText,
                    fontWeight: 500,
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                        transform: 'scale(1.05)',
                        boxShadow: '0 2px 8px rgba(22, 163, 74, 0.2)',
                    },
                },
            },
        },
        // --- Paper (modals, dropdowns) ----------
        MuiPaper: {
            styleOverrides: {
                root: {
                    backgroundColor: colors.surface,
                },
                elevation2: {
                    boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
                },
                elevation8: {
                    boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
                },
            },
        },
    },
});

export default theme;
export { colors };