// Central API configuration.
// Override with REACT_APP_API_URL in .env for non-local environments.
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export { API_BASE_URL };
