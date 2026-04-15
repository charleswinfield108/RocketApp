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

const parseOrders = (body: any): ApiOrderDTO[] => {
  if (Array.isArray(body)) return body;
  if (Array.isArray(body?.data)) return body.data;
  return [];
};

export const getDeliveries = async (courierId: number): Promise<ApiOrderDTO[]> => {
  const [pendingRes, courierRes] = await Promise.all([
    ordersAPI.getPendingOrders(),
    ordersAPI.getCourierOrders(courierId),
  ]);

  const pendingOrders = parseOrders(pendingRes.data);
  const courierOrders = parseOrders(courierRes.data);

  // All PENDING orders + courier's IN PROGRESS / DELIVERED orders (no duplicates)
  const courierNonPending = courierOrders.filter((o) => o.status !== 'pending');
  const seen = new Set<number>();
  const merged: ApiOrderDTO[] = [];
  for (const order of [...pendingOrders, ...courierNonPending]) {
    if (!seen.has(order.id)) {
      seen.add(order.id);
      merged.push(order);
    }
  }
  return merged;
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
