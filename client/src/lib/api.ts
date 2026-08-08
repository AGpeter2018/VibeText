import axios from 'axios';

// Ensure baseURL always ends with /api, regardless of how VITE_API_URL is configured
const rawBase = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const baseURL = rawBase.endsWith('/api') ? rawBase : `${rawBase.replace(/\/$/, '')}/api`;

const api = axios.create({ baseURL });

// Add a request interceptor to attach the JWT token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('vibetext_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;
