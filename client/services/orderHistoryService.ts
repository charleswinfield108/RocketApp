import apiClient from './api';

export interface OrderItem {
  itemId: string;
  name: string;
  quantity: number;
  price: number;
}

export interface Courier {
  name: string;
  phone?: string;
}

export interface Order {
  orderId: string;
  restaurantName: string;
  status: string;
  totalPrice: number;
  createdAt: string;
  items: OrderItem[];
  courier?: Courier;
  rating: number | null;
}

// Shape returned by the API
interface ApiProduct {
  product_id: number;
  product_name: string;
  quantity: number;
  unit_cost: number;
  total_cost: number;
}

interface ApiOrder {
  id: number;
  restaurant_name: string;
  courier_id: number | null;
  courier_name: string | null;
  status: string;
  products: ApiProduct[];
  total_cost: number;
  created_on: string;
  restaurant_rating: number | null;
}

interface ApiResponse {
  message: string;
  data: ApiOrder[];
}

// Map API order to client Order shape
const mapOrder = (o: ApiOrder): Order => ({
  orderId: String(o.id),
  restaurantName: o.restaurant_name,
  status: o.status,
  totalPrice: o.total_cost,
  createdAt: o.created_on,
  items: (o.products || []).map((p) => ({
    itemId: String(p.product_id),
    name: p.product_name,
    quantity: p.quantity,
    price: p.unit_cost,
  })),
  courier: o.courier_id ? { name: o.courier_name ?? 'Unknown' } : undefined,
  rating: o.restaurant_rating ?? null,
});

const orderHistoryAPI = {
  getHistory: (customerId: number) =>
    apiClient
      .get<ApiResponse>(`/api/v1/orders?type=customer&id=${customerId}`)
      .then((res) => ({
        ...res,
        data: { orders: (res.data.data || []).map(mapOrder) },
      })),
};

export default orderHistoryAPI;
