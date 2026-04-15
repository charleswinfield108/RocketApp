import { ordersAPI } from './api';
import { NEXT_STATUS_ID } from '@/constants/orderStatus';

export interface ApiOrderProductDTO {
  id: number;
  name: string;
  quantity: number;
  unit_cost: number;
}

export interface ApiOrderDTO {
  id: number;
  customer_id: number;
  customer_name: string;
  customer_address: string;
  restaurant_id: number;
  restaurant_name: string;
  restaurant_address: string;
  courier_id: number;
  courier_name: string;
  status: string;
  products: ApiOrderProductDTO[];
  total_cost: number;
  created_on: string;
}

export const getDeliveries = async (courierId: number): Promise<ApiOrderDTO[]> => {
  const response = await ordersAPI.getCourierOrders(courierId);
  const body = response.data;
  if (Array.isArray(body)) return body;
  if (Array.isArray(body?.data)) return body.data;
  return [];
};

export const advanceOrderStatus = async (order: ApiOrderDTO): Promise<ApiOrderDTO> => {
  const nextId = NEXT_STATUS_ID[order.status];
  if (!nextId) throw new Error('Order is already delivered');

  const response = await ordersAPI.update(order.id, {
    restaurant_id: order.restaurant_id,
    customer_id: order.customer_id,
    order_status_id: nextId,
    restaurant_rating: null,
  });

  const body = response.data;
  return body?.data ?? body;
};
