'use client';

import React, { useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/lib/types';
import type { CartItem } from '@/lib/types';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { cart, updateQuantity, removeItem, getSubtotal, getItemCount, clearCart } = useCart();
  const itemCount = getItemCount();
  const subtotal = getSubtotal();
  const shipping = subtotal > 0 ? 1500 : 0; // R$ 15,00
  const total = subtotal + shipping;

  // Impedir scroll do body quando aberto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Fechar com ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        className="fixed right-0 top-0 z-50 w-full max-w-sm md:max-w-md h-full bg-white shadow-xl flex flex-col animate-in slide-in-from-right duration-300"
        role="dialog"
        aria-modal="true"
        aria-label="Carrinho de compras"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">
            Carrinho ({itemCount})
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Fechar carrinho"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {cart.items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center text-gray-500">
              <svg className="w-16 h-16 mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <p className="text-lg font-medium">Seu carrinho está vazio</p>
              <p className="text-sm mt-1">Adicione produtos para começar</p>
              <button
                onClick={onClose}
                className="mt-4 text-primary hover:underline"
              >
                Continuar comprando
              </button>
            </div>
          ) : (
            <>
              {cart.items.map((item: CartItem) => (
                <div
                  key={item.productId}
                  className="flex gap-3 p-2 bg-gray-50 rounded-lg"
                >
                  <Link
                    href={`/product/${item.snapshot.slug}`}
                    className="relative w-20 h-20 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100"
                  >
                    <Image
                      src={item.snapshot.image}
                      alt={item.snapshot.name}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/product/${item.snapshot.slug}`}
                      className="font-medium text-gray-900 line-clamp-1 hover:text-black transition-colors"
                    >
                      {item.snapshot.name}
                    </Link>
                    <p className="mt-1 text-sm font-semibold text-gray-900">
                      {formatPrice(item.snapshot.price)}
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-100 transition-colors"
                        aria-label="Diminuir quantidade"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                        </svg>
                      </button>
                      <span className="w-10 text-center text-sm font-medium">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-100 transition-colors"
                        aria-label="Aumentar quantidade"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                      </button>
                      <button
                        onClick={() => removeItem(item.productId)}
                        className="ml-auto text-xs text-gray-500 hover:text-red-600 transition-colors"
                      >
                        Remover
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {cart.items.length > 0 && (
                <button
                  onClick={clearCart}
                  className="w-full text-left text-sm text-red-600 hover:text-red-700 font-medium py-2"
                >
                  Limpar carrinho
                </button>
              )}
            </>
          )}
        </div>

        {/* Footer - Resumo */}
        {cart.items.length > 0 && (
          <div className="border-t border-gray-100 p-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-medium text-gray-900">{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Frete</span>
              <span className="font-medium text-gray-900">
                {shipping > 0 ? formatPrice(shipping) : 'Grátis'}
              </span>
            </div>
            <div className="flex justify-between text-base font-semibold text-gray-900 pt-2 border-t border-gray-100">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>

            <Link
              href="/cart"
              className="block w-full text-center bg-gray-100 text-gray-900 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
            >
              Ver carrinho
            </Link>
            <Link
              href="/checkout"
              className="block w-full text-center bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-900 transition-colors"
            >
              Finalizar compra
            </Link>
          </div>
        )}
      </aside>
    </>
  );
}