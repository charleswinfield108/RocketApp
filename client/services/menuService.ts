import apiClient from './api';

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  restaurantId: string;
}

export interface MenuResponse {
  items: MenuItem[];
  restaurantId: string;
  restaurantName: string;
}

// Menu API endpoints
export const menuAPI = {
  getMenuByRestaurantId: (restaurantId: string) =>
    apiClient.get<MenuResponse>(`/api/v1/restaurants/${restaurantId}/menu`),
  
  getMenuItems: (restaurantId: string) =>
    apiClient.get<MenuItem[]>(`/api/v1/restaurants/${restaurantId}/items`),
};

export default menuAPI;
