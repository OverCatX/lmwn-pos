import axios, { AxiosError, AxiosInstance } from 'axios';

/**
 * API Error Response structure
 */
export interface ApiErrorResponse {
    statusCode: number;
    message: string;
    error?: string;
    timestamp?: string;
    path?: string;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
const API_VERSION = 'v1';

/**
 * Create configured Axios instance
 */
const createApiClient = (): AxiosInstance => {
    const client = axios.create({
        baseURL: `${API_BASE_URL}/api/${API_VERSION}`,
        timeout: 10000,
        headers: {
            'Content-Type': 'application/json',
        },
    });

    // Request interceptor
    client.interceptors.request.use(
        (config) => {
            // Add auth token if available
            const token = localStorage.getItem('auth_token');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }

            // Log request in development
            if (import.meta.env.DEV) {
                console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
            }

            return config;
        },
        (error) => {
            console.error('Request interceptor error:', error);
            return Promise.reject(error);
        }
    );

    // Response interceptor
    client.interceptors.response.use(
        (response) => {
            // Log response in development
            if (import.meta.env.DEV) {
                console.log(`API Response: ${response.config.url}`, response.data);
            }

            return response;
        },
        (error: AxiosError<ApiErrorResponse>) => {
            // Enhanced error handling
            if (error.response) {
                // Server responded with error status
                const apiError = error.response.data;
                console.error('API Error:', {
                    status: error.response.status,
                    message: apiError.message || error.message,
                    path: apiError.path,
                });

                // Handle specific status codes
                if (error.response.status === 401) {
                    // Unauthorized - redirect to login
                    localStorage.removeItem('auth_token');
                    window.location.href = '/login';
                }
            } else if (error.request) {
                // Request made but no response
                console.error('Network Error: No response from server');
            } else {
                // Error setting up request
                console.error('Request Setup Error:', error.message);
            }

            return Promise.reject(error);
        }
    );

    return client;
};

/**
 * Singleton API client instance
 */
export const apiClient = createApiClient();

/**
 * Helper function to handle API errors consistently
 */
export const handleApiError = (error: unknown): string => {
    if (axios.isAxiosError(error)) {
        const apiError = error.response?.data as ApiErrorResponse | undefined;
        return apiError?.message || error.message || 'An unexpected error occurred';
    }

    if (error instanceof Error) {
        return error.message;
    }

    return 'An unexpected error occurred';
};
