export interface Tax {
  id: number;
  name: string;
  tax_percentage: number | string;
  is_active: boolean;
  is_default: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface VariantAttributes {
  color?: string;
  size?: string;
  description?: string;
  [key: string]: string | undefined;
}

export interface Stock {
  id: number;
  product_id_variant: number;
  quantity: number;
  created_at?: string;
  updated_at?: string;
}

export interface ProductVariant {
  id: number;
  fk_product_id: string;
  sku: string;
  attributes: VariantAttributes;
  image_url?: string;
  stock?: Stock;
  created_at?: string;
  updated_at?: string;
}

export interface Product {
  id: string;
  name: string;
  base_price: number | string;
  tax_applied_id: number;
  tax?: Tax;
  variants?: ProductVariant[];
  image_url?: string;
  created_at?: string;
  updated_at?: string;
}

export interface UserRole {
  id: number;
  name: string;
  guard_name: string;
}

export interface User {
  id: number;
  name: string;
  last_name?: string;
  email: string;
  profile_picture?: string | null;
  two_factor_confirmed_at?: string | null;
  roles?: UserRole[] | string[];
}

export interface CartItem {
  id: string;
  product: Product;
  variant?: ProductVariant;
  quantity: number;
  unitPrice: number;
}

export interface OrderDetail {
  id: number;
  order_id: number;
  product_variant_id: number;
  quantity: number;
  unit_price: number;
  variant?: ProductVariant;
}

export interface Order {
  id: number;
  user_id: number;
  payment_method_id?: number;
  payment_reference?: string;
  total_amount: number;
  status: 'pending' | 'paid' | 'shipped' | 'cancelled';
  shipping_info: {
    address: string;
    city: string;
    postal_code: string;
    country: string;
    phone?: string;
  };
  details?: OrderDetail[];
  created_at?: string;
  updated_at?: string;
}
