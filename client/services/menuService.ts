import apiClient from './api';

// Shape returned by the API: { message: string, data: ApiProductDTO[] }
interface ApiProductDTO {
  id: number;
  restaurant_id: number;
  name: string;
  description: string;
  cost: number;
}

interface ApiMenuResponse {
  message: string;
  data: ApiProductDTO[];
}

// Menu API endpoints
const menuAPI = {
  getMenuByRestaurantId: (restaurantId: number | string) =>
    apiClient.get<ApiMenuResponse>(`/api/v1/restaurants/${restaurantId}/menu`),
};

export default menuAPI;
