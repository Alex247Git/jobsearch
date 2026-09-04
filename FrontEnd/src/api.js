// Central API configuration.
// Override with REACT_APP_API_URL in .env for non-local environments.
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Fetch wrapper that attaches the stored JWT token (if any) and a JSON
// content-type for bodies. Use this for all API calls instead of raw fetch.
const apiFetch = (path, options = {}) => {
    const token = localStorage.getItem('token');
    const headers = { ...(options.headers || {}) };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    if (options.body && !headers['Content-Type']) {
        headers['Content-Type'] = 'application/json';
    }
    return fetch(`${API_BASE_URL}${path}`, { ...options, headers });
};

export { API_BASE_URL, apiFetch };
