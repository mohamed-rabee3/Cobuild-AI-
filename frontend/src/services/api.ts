/**
 * Base API client configuration using Axios
 */
import axios, { AxiosError, AxiosInstance } from 'axios';

// Determine base URL based on environment
// Use direct backend connection in development to avoid proxy issues
const getBaseURL = (): string => {
    if (import.meta.env.DEV) {
        // Use direct backend URL in development
        // This avoids proxy issues and makes debugging easier
        const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
        console.log('[API Config] Base URL:', baseURL, 'Mode:', import.meta.env.MODE);
        return baseURL;
    }
    // Production: use environment variable or relative path
    return import.meta.env.VITE_API_URL || '';
};

// Log the base URL when module loads
const baseURL = getBaseURL();
console.log('[API Client] Initialized with baseURL:', baseURL);

// Create axios instance with base configuration
const apiClient: AxiosInstance = axios.create({
    baseURL: getBaseURL(),
    timeout: 120000, // 120 seconds (2 minutes) for AI generation
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor for logging (development only)
apiClient.interceptors.request.use(
    (config) => {
        if (import.meta.env.DEV) {
            const fullUrl = config.baseURL ? `${config.baseURL}${config.url}` : config.url;
            console.log(`[API Request] ${config.method?.toUpperCase()} ${fullUrl}`, {
                url: config.url,
                baseURL: config.baseURL || '(proxy)',
                fullUrl,
                data: config.data
            });
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
        // Log errors in development with more details
        if (import.meta.env.DEV) {
            console.error('[API Response Error] Full Error:', error);
            console.error('[API Response Error] Details:', {
                message: error.message,
                status: error.response?.status,
                statusText: error.response?.statusText,
                data: error.response?.data,
                url: error.config?.url,
                baseURL: error.config?.baseURL,
                code: error.code,
                request: error.request,
                stack: error.stack,
            });
        }

        // Extract error details
        const errorData = error.response?.data;
        
        // Handle different error types
        let errorMessage = 'An unexpected error occurred';
        let isRetryable = true;

        if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
            errorMessage = 'لا يمكن الاتصال بالخادم. تأكد من أن الخادم يعمل على المنفذ 8000.';
            isRetryable = true;
        } else if (error.message?.includes('timeout')) {
            errorMessage = 'انتهت مهلة الاتصال. الذكاء الاصطناعي يحتاج وقتاً أطول. حاول مرة أخرى.';
            isRetryable = true;
        } else if (error.response?.status === 404) {
            errorMessage = 'المسار غير موجود. تحقق من إعدادات الخادم.';
            isRetryable = false;
        } else if (error.response?.status === 503) {
            errorMessage = errorData?.message || 'الخدمة غير متاحة حالياً. حاول مرة أخرى.';
            isRetryable = errorData?.retryable ?? true;
        } else if (errorData?.message) {
            errorMessage = errorData.message;
            isRetryable = errorData.retryable ?? true;
        }

        // Return formatted error
        return Promise.reject({
            message: errorMessage,
            retryable: isRetryable,
            status: error.response?.status,
            code: error.code,
            originalError: error,
        });
    }
);

export default apiClient;
