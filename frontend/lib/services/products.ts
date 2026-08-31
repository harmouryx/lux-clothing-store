import { apiClient } from "@/lib/api";
import { Product } from "@/lib/types";

export interface VariantInput {
  sku: string;
  attributes: {
    size?: string;
    color?: string;
    description?: string;
  };
  image_url?: string;
  quantity: number;
}

export interface CreateProductInput {
  name: string;
  base_price: number;
  tax_applied_id: number;
  image_url?: string;
  product_variants: VariantInput[];
}

export interface UpdateProductInput {
  name?: string;
  base_price?: number;
  tax_applied_id?: number;
  image_url?: string;
}

export async function getProducts(): Promise<Product[]> {
  try {
    const response = await apiClient.get<Product[] | { data: Product[] }>("/api/products");
    if (Array.isArray(response.data)) {
      return response.data;
    }
    if (response.data && typeof response.data === "object" && "data" in response.data) {
      return Array.isArray((response.data as { data: Product[] }).data)
        ? (response.data as { data: Product[] }).data
        : [];
    }
    return [];
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
}

export async function getProductById(id: string): Promise<Product | null> {
  try {
    const response = await apiClient.get<{ success: boolean; data: Product }>(`/api/products/${id}`);
    return response.data?.data || (response.data as unknown as Product);
  } catch (error) {
    console.error(`Error fetching product ${id}:`, error);
    return null;
  }
}

export async function createProduct(input: CreateProductInput): Promise<Product> {
  const response = await apiClient.post<{ success: boolean; data: Product }>("/api/products", input);
  return response.data?.data || (response.data as unknown as Product);
}

export async function updateProduct(id: string, input: UpdateProductInput): Promise<Product> {
  const response = await apiClient.put<{ success: boolean; data: Product }>(`/api/products/${id}`, input);
  return response.data?.data || (response.data as unknown as Product);
}

export async function deleteProduct(id: string): Promise<void> {
  await apiClient.delete(`/api/products/${id}`);
}
