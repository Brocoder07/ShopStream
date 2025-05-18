// User Types
export interface User {
  id: number;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN';
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest extends LoginRequest {
  username: string;
}

// Product Types
export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
}

// Order Types
export interface OrderItem {
  id: number;
  productId: number;
  quantity: number;
  price: number;
  name: string;
}

export interface Order {
  id: number;
  userId: number;
  user: User;
  items: OrderItem[];
  status: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  totalAmount: number;
  orderDate: string;
  createdAt: string;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
}

// Cart Types
export interface CartItem {
  productId: number;
  quantity: number;
  product: Product;
}

// Payment Types
export interface PaymentResponse {
  status: string;
  reference: string;
  timestamp: string;
  amount: number;
  currency: string;
} 