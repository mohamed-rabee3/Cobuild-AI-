/**
 * Base API client configuration using Axios
 */
import axios, { AxiosError, AxiosInstance } from 'axios';

// Create axios instance with base configuration
const apiClient: AxiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
    timeout: 30000, // 30 seconds
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor for logging (development only)
apiClient.interceptors.request.use(
    (config) => {
        if (import.meta.env.DEV) {
            console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`, config.data);
        }
        return config;
    },
    (error) => {
        console.error('[API Request Error]', error);
        return Promise.reject(error);
    }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
    (response) => {
        if (import.meta.env.DEV) {
            console.log(`[API Response] ${response.config.url}`, response.data);
        }
        return response;
    },
    (error: AxiosError<{ error?: string; message?: string; retryable?: boolean }>) => {
        // Log errors in development
        if (import.meta.env.DEV) {
            console.error('[API Response Error]', error.response?.data || error.message);
        }

        // Extract error details
        const errorData = error.response?.data;
        const errorMessage = errorData?.message || 'An unexpected error occurred';
        const isRetryable = errorData?.retryable ?? true;

        // Return formatted error
        return Promise.reject({
            message: errorMessage,
            retryable: isRetryable,
            status: error.response?.status,
            originalError: error,
        });
    }
);

export default apiClient;
