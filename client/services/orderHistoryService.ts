import apiClient from './api';

export interface OrderItem {
  itemId: string;
  name: string;
  quantity: number;
  price: number;
}

export interface Courier {
  courierId?: string;
  name: string;
  phone?: string;
  status?: string;
  deliveryTime?: string;
}

export interface Order {
  orderId: string;
  restaurantId: string;
  restaurantName: string;
  status: 'confirmed' | 'preparing' | 'out for delivery' | 'delivered' | 'cancelled';
  totalPrice: number;
  createdAt: string;
  deliveredAt?: string;
  items: OrderItem[];
  courier?: Courier;
  deliveryAddress?: string;
}

export interface OrderHistoryResponse {
  orders: Order[];
}

// Order History API endpoints
export const orderHistoryAPI = {
  getHistory: () =>
    apiClient.get<OrderHistoryResponse>('/api/v1/customer/orders'),
  
  getOrderById: (orderId: string) =>
    apiClient.get<{ order: Order }>(`/api/v1/customer/orders/${orderId}`),
};

export default orderHistoryAPI;
