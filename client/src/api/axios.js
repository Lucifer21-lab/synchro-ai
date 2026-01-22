import axios from 'axios';

// Create an axios instance with your backend URL
const api = axios.create({
    baseURL: 'http://localhost:5000/api', // Matches your server port
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request Interceptor: Attaches the Token to every request
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token'); // We will store the token here
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response Interceptor: Handles 401 (Unauthorized) errors globally
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            // If token is invalid/expired, log out the user
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;