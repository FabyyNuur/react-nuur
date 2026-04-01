import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:4000/api', // Assurez-vous que le backend tourne sur ce port
    headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        Pragma: 'no-cache',
    },
});

// Intercepteur pour injecter le token JWT automatiquement
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('nuurgym_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;
