import axios from 'axios';

// Use relative URL so Vite's dev proxy handles routing to the backend.
// This means all devices that load the frontend (localhost or 192.168.x.x)
// will have their API calls proxied correctly through the Vite server.
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL + '/api',
    
});

// Attach JWT access token from localStorage to every request
api.interceptors.request.use(
    (config) => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            try {
                const user = JSON.parse(userStr);
                if (user?.accessToken) {
                    config.headers.Authorization = `Bearer ${user.accessToken}`;
                }
            } catch (_) {}
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor — auto-refresh token on 401
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                // Relative URL — also proxied through Vite
                const res = await api.post('/auth/refresh');
                if (res.status === 200) {
                    const userStr = localStorage.getItem('user');
                    if (userStr) {
                        const user = JSON.parse(userStr);
                        user.accessToken = res.data.accessToken;
                        localStorage.setItem('user', JSON.stringify(user));
                    }
                    originalRequest.headers.Authorization = `Bearer ${res.data.accessToken}`;
                    return api(originalRequest);
                }
            } catch (refreshError) {
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    }
);

export default api;
