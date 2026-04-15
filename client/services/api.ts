import axios, { AxiosInstance } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8080',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include JWT token
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error retrieving token:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized - could refresh token or logout
      console.error('Unauthorized access - token may be expired');
    }
    return Promise.reject(error);
  }
);

export default apiClient;

// Auth API endpoints
export const authAPI = {
  login: (email: string, password: string) =>
    apiClient.post('/api/v1/auth/login', { email, password }),
  logout: () =>
    apiClient.post('/api/v1/auth/logout'),
};

// Restaurants API endpoints
export const restaurantsAPI = {
  getAll: () =>
    apiClient.get('/api/v1/restaurants'),
  getById: (id: number | string) =>
    apiClient.get(`/api/v1/restaurants/${id}`),
};

// Orders API endpoints
export const ordersAPI = {
  getHistory: () =>
    apiClient.get('/api/v1/orders'),
  getPendingOrders: () =>
    apiClient.get('/api/v1/orders/pending'),
  getCourierOrders: (courierId: number) =>
    apiClient.get(`/api/v1/orders?type=courier&id=${courierId}`),
  create: (orderData: object) =>
    apiClient.post('/api/v1/orders', orderData),
  getById: (id: number | string) =>
    apiClient.get(`/api/v1/orders/${id}`),
  update: (id: number | string, dto: {
    restaurant_id: number;
    customer_id: number;
    order_status_id: number;
    restaurant_rating: number | null;
  }) =>
    apiClient.put(`/api/v1/orders/${id}`, dto),
};
