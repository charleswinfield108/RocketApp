import axios, { AxiosInstance } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const apiClient: AxiosInstance = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8080',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token to every request
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
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error('Unauthorized access — token may be expired');
    }
    return Promise.reject(error);
  }
);

export default apiClient;

export const authAPI = {
  login: (email: string, password: string) =>
    apiClient.post('/api/v1/auth/login', { email, password }),
  logout: () =>
    apiClient.post('/api/v1/auth/logout'),
};

export const restaurantsAPI = {
  getAll: () =>
    apiClient.get('/api/v1/restaurants'),
  getById: (id: number | string) =>
    apiClient.get(`/api/v1/restaurants/${id}`),
};

export const ordersAPI = {
  getHistory: () =>
    apiClient.get('/api/v1/orders'),
  create: (orderData: unknown) =>
    apiClient.post('/api/v1/orders', orderData),
  getById: (id: number | string) =>
    apiClient.get(`/api/v1/orders/${id}`),
  rateOrder: (orderId: number, rating: number) =>
    apiClient.put(`/api/v1/orders/${orderId}/rating`, { restaurant_rating: rating }),
};
