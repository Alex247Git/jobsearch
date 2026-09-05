import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { AuthProvider } from './context/AuthContext';
import App from './App';

const theme = createTheme();

const renderApp = () =>
    render(
        <ThemeProvider theme={theme}>
            <AuthProvider>
                <App />
            </AuthProvider>
        </ThemeProvider>
    );

describe('App', () => {
    it('renders without crashing', () => {
        renderApp();
        expect(document.body).toBeInTheDocument();
    });
});
