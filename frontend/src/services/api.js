import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor — inject auth token & branch header
api.interceptors.request.use(
  (config) => {
    // Demo token — will be replaced with real JWT from auth flow
    config.headers['Authorization'] = 'Bearer demo-token';

    // Inject branch scope header if set
    const branchId = sessionStorage.getItem('axleops-branch');
    if (branchId) {
      config.headers['X-AxleOps-Branch'] = branchId;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirect to login when implemented
      console.warn('Unauthorized — redirect to login');
    }
    return Promise.reject(error);
  }
);

export default api;
