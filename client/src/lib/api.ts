import axios from 'axios';

// Ensure baseURL always ends with /api, regardless of how VITE_API_URL is configured
const rawBase = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const baseURL = rawBase.endsWith('/api') ? rawBase : `${rawBase.replace(/\/$/, '')}/api`;

/**
 * 🍪 withCredentials: true is the magic setting.
 * It tells the browser: "Include my cookies when sending requests
 * to this API, even though it's on a different domain (Render)."
 * Without this, the HttpOnly cookie would never be sent and
 * every request would be treated as unauthenticated.
 */
const api = axios.create({
    baseURL,
    withCredentials: true, // Send the HttpOnly session cookie on every request
});

export default api;
