export interface Product {
  id: string;
  slug: string;
  name: string;
  description: string;
  shortDescription: string;
  price: number; // em centavos
  compareAtPrice?: number;
  images: string[];
  category: string;
  stock: number;
  isActive: boolean;
  featured: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  productId: string;
  quantity: number;
  snapshot: {
    name: string;
    price: number;
    image: string;
    slug: string;
  };
}

export interface Cart {
  items: CartItem[];
  updatedAt: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
  passwordHash: string; // mock: armazenamos hash simples
  createdAt: string;
}

export interface Address {
  id: string;
  userId: string;
  label: string;
  recipientName: string;
  phone: string;
  cep: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  isDefault: boolean;
}

export interface Order {
  id: string;
  userId: string;
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';
  items: OrderItem[];
  subtotal: number;
  shippingCost: number;
  discount: number;
  total: number;
  shippingAddress: Address;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  productId: string;
  productSnapshot: {
    name: string;
    price: number;
    image: string;
    slug: string;
  };
  quantity: number;
  unitPrice: number;
  total: number;
}

// Helpers
export function formatPrice(cents: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(cents / 100);
}

export function calculateCartTotals(items: CartItem[]): { subtotal: number; itemCount: number } {
  let subtotal = 0;
  let itemCount = 0;
  for (const item of items) {
    subtotal += item.snapshot.price * item.quantity;
    itemCount += item.quantity;
  }
  return { subtotal, itemCount };
}