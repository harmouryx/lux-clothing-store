import { apiClient } from "@/lib/api";
import { Order } from "@/lib/types";

export async function getOrders(): Promise<Order[]> {
  try {
    const response = await apiClient.get<{ success: boolean; data: Order[] }>("/api/orders");
    return Array.isArray(response.data) ? response.data : response.data?.data || [];
  } catch (error) {
    console.error("Error fetching orders:", error);
    return [];
  }
}

export async function getOrderById(id: number | string): Promise<Order | null> {
  try {
    const response = await apiClient.get<{ success: boolean; data: Order }>(`/api/orders/${id}`);
    return response.data?.data || (response.data as unknown as Order);
  } catch (error) {
    console.error(`Error fetching order ${id}:`, error);
    return null;
  }
}

export async function markOrderAsPaid(id: number | string): Promise<Order> {
  const response = await apiClient.patch<{ success: boolean; data: Order }>(`/api/orders/${id}/pay`);
  return response.data?.data || (response.data as unknown as Order);
}

export async function markOrderAsShipped(id: number | string): Promise<Order> {
  const response = await apiClient.patch<{ success: boolean; data: Order }>(`/api/orders/${id}/ship`);
  return response.data?.data || (response.data as unknown as Order);
}
