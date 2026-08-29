'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from 'react';
import type { Cart, CartItem, Product } from '@/lib/types';
import { calculateCartTotals } from '@/lib/types';
import { mockProducts } from '@/lib/mock-data';

const CART_STORAGE_KEY = 'hiskra_cart';
const CART_EXPIRY_DAYS = 30;

interface CartContextType {
  cart: Cart;
  isLoaded: boolean;
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getItemCount: () => number;
  getSubtotal: () => number;
  isInCart: (productId: string) => boolean;
  getItemQuantity: (productId: string) => number;
  syncFromServer: (serverItems: CartItem[]) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

function getInitialCart(): Cart {
  if (typeof window === 'undefined') {
    return { items: [], updatedAt: Date.now() };
  }

  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    if (stored) {
      const parsed: Cart = JSON.parse(stored);
      // Verificar expiração (30 dias)
      const expiryMs = CART_EXPIRY_DAYS * 24 * 60 * 60 * 1000;
      if (Date.now() - parsed.updatedAt < expiryMs) {
        return parsed;
      }
    }
  } catch {
    // Ignorar erro de parse
  }
  return { items: [], updatedAt: Date.now() };
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Cart>(() => getInitialCart());
  const [isLoaded, setIsLoaded] = useState(false);

  // Carregar do localStorage no mount (client-side)
  useEffect(() => {
    setCart(getInitialCart());
    setIsLoaded(true);
  }, []);

  // Persistir no localStorage sempre que mudar
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    }
  }, [cart, isLoaded]);

  const addItem = useCallback((product: Product, quantity = 1) => {
    setCart((prev) => {
      const existingIndex = prev.items.findIndex((item) => item.productId === product.id);
      const maxQuantity = Math.min(quantity, product.stock);

      if (existingIndex >= 0) {
        const newItems = [...prev.items];
        const newQuantity = Math.min(
          newItems[existingIndex].quantity + quantity,
          product.stock
        );
        newItems[existingIndex] = {
          ...newItems[existingIndex],
          quantity: newQuantity,
        };
        return { items: newItems, updatedAt: Date.now() };
      }

      // Novo item
      const newItem: CartItem = {
        productId: product.id,
        quantity: maxQuantity,
        snapshot: {
          name: product.name,
          price: product.price,
          image: product.images[0],
          slug: product.slug,
        },
      };
      return { items: [...prev.items, newItem], updatedAt: Date.now() };
    });
  }, []);

  const removeItem = useCallback((productId: string) => {
    setCart((prev) => ({
      items: prev.items.filter((item) => item.productId !== productId),
      updatedAt: Date.now(),
    }));
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }

    setCart((prev) => {
      const item = prev.items.find((i) => i.productId === productId);
      if (!item) return prev;

      // Buscar estoque atual do produto (mock)
      // Em produção, viria da API
      const product = mockProducts.find((p) => p.id === productId);
      const maxStock = product?.stock ?? 999;

      const newItems = prev.items.map((i) =>
        i.productId === productId ? { ...i, quantity: Math.min(quantity, maxStock) } : i
      );
      return { items: newItems, updatedAt: Date.now() };
    });
  }, []);

  const clearCart = useCallback(() => {
    setCart({ items: [], updatedAt: Date.now() });
  }, []);

  const getItemCount = useCallback(() => {
    return cart.items.reduce((sum, item) => sum + item.quantity, 0);
  }, [cart.items]);

  const getSubtotal = useCallback(() => {
    return cart.items.reduce(
      (sum, item) => sum + item.snapshot.price * item.quantity,
      0
    );
  }, [cart.items]);

  const isInCart = useCallback(
    (productId: string) => cart.items.some((item) => item.productId === productId),
    [cart.items]
  );

  const getItemQuantity = useCallback(
    (productId: string) =>
      cart.items.find((item) => item.productId === productId)?.quantity ?? 0,
    [cart.items]
  );

  const syncFromServer = useCallback((serverItems: CartItem[]) => {
    setCart((prev) => {
      // Merge inteligente: soma quantidades, mantém maior se mesmo produto
      const merged = new Map<string, CartItem>();

      // Adicionar itens do localStorage primeiro
      for (const item of prev.items) {
        merged.set(item.productId, item);
      }

      // Merge com itens do servidor
      for (const serverItem of serverItems) {
        const existing = merged.get(serverItem.productId);
        if (existing) {
          merged.set(serverItem.productId, {
            ...existing,
            quantity: Math.max(existing.quantity, serverItem.quantity),
          });
        } else {
          merged.set(serverItem.productId, serverItem);
        }
      }

      return { items: Array.from(merged.values()), updatedAt: Date.now() };
    });
  }, []);

  return (
    <CartContext.Provider
      value={{
        cart,
        isLoaded,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        getItemCount,
        getSubtotal,
        isInCart,
        getItemQuantity,
        syncFromServer,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart deve ser usado dentro de CartProvider');
  }
  return context;
}