import { apiClient } from "@/lib/api";
import { User } from "@/lib/types";

export async function getUsers(): Promise<User[]> {
  try {
    const response = await apiClient.get<{ success: boolean; data: User[] }>("/api/users");
    return Array.isArray(response.data) ? response.data : response.data?.data || [];
  } catch {
    return [];
  }
}
