import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add token to requests
api.interceptors.request.use((config) => {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
        const { token } = JSON.parse(userInfo);
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

/**
 * Convert http:// image URLs to https:// to prevent Mixed Content warnings.
 * Leaves relative URLs, data URIs, and already-https URLs unchanged.
 */
export const secureUrl = (url) => {
    if (!url || typeof url !== 'string') return url;
    if (url.startsWith('http://')) {
        return url.replace('http://', 'https://');
    }
    return url;
};

export default api;
