'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/lib/types';
import type { CartItem } from '@/lib/types';

export function CartPageClient() {
  const { cart, updateQuantity, removeItem, getSubtotal, clearCart } = useCart();
  const subtotal = getSubtotal();
  const shipping = subtotal > 0 ? 1500 : 0;
  const total = subtotal + shipping;
  const itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);

  if (cart.items.length === 0) {
    return (
      <div className="py-16 bg-gray-50 min-h-[60vh] flex items-center justify-center">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <svg className="mx-auto w-24 h-24 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          <h1 className="mt-6 text-2xl font-bold text-gray-900">Seu carrinho está vazio</h1>
          <p className="mt-2 text-gray-600 max-w-md mx-auto">
            Parece que você ainda não adicionou nenhum produto. Que tal dar uma olhada na nossa coleção?
          </p>
          <Link
            href="/products"
            className="mt-8 inline-flex items-center justify-center px-6 py-3 text-base font-semibold text-white bg-black rounded-lg hover:bg-gray-900 transition-colors"
          >
            Continuar comprando
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12 bg-gray-50 min-h-screen">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Carrinho ({itemCount})</h1>
          <p className="mt-1 text-gray-600">Revise seus itens antes de finalizar a compra</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.items.map((item: CartItem) => (
              <article
                key={item.productId}
                className="flex gap-4 bg-white rounded-xl border border-gray-100 p-4 shadow-sm"
              >
                <Link
                  href={`/product/${item.snapshot.slug}`}
                  className="relative w-24 h-24 flex-shrink-0 overflow-hidden rounded-lg bg-gray-50"
                >
                  <Image
                    src={item.snapshot.image}
                    alt={item.snapshot.name}
                    fill
                    className="object-cover"
                    sizes="96px"
                  />
                </Link>

                <div className="flex-1 min-w-0">
                  <Link
                    href={`/product/${item.snapshot.slug}`}
                    className="font-medium text-gray-900 hover:text-black transition-colors line-clamp-1"
                  >
                    {item.snapshot.name}
                  </Link>
                  <p className="mt-1 text-sm font-semibold text-gray-900">{formatPrice(item.snapshot.price)}</p>

                  <div className="mt-3 flex items-center gap-3">
                    <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 transition-colors"
                        aria-label="Diminuir quantidade"
                        disabled={item.quantity <= 1}
                      >
                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                        </svg>
                      </button>
                      <span className="w-12 text-center text-sm font-medium border-x border-gray-300">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 transition-colors"
                        aria-label="Aumentar quantidade"
                      >
                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                      </button>
                    </div>

                    <button
                      onClick={() => removeItem(item.productId)}
                      className="text-sm text-gray-500 hover:text-red-600 font-medium transition-colors"
                    >
                      Remover
                    </button>
                  </div>
                </div>

                <div className="text-right">
                  <p className="font-semibold text-gray-900">
                    {formatPrice(item.snapshot.price * item.quantity)}
                  </p>
                </div>
              </article>
            ))}

            {cart.items.length > 1 && (
              <button
                onClick={clearCart}
                className="w-full text-left text-sm text-red-600 hover:text-red-700 font-medium py-4"
              >
                Limpar carrinho
              </button>
            )}

            {/* Continue Shopping */}
            <Link
              href="/products"
              className="inline-flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900 mt-4"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Continuar comprando
            </Link>
          </div>

          {/* Order Summary */}
          <aside className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-gray-100 p-6 sticky top-24">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Resumo do pedido</h2>

              <dl className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <dt className="text-gray-600">Subtotal ({itemCount} itens)</dt>
                  <dd className="font-medium text-gray-900">{formatPrice(subtotal)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-600">Frete</dt>
                  <dd className="font-medium text-gray-900">
                    {shipping > 0 ? formatPrice(shipping) : 'Grátis'}
                  </dd>
                </div>
                {subtotal >= 19900 && shipping > 0 && (
                  <div className="flex justify-between text-green-600 text-sm">
                    <dt>Desconto frete grátis</dt>
                    <dd className="font-medium">-{formatPrice(shipping)}</dd>
                  </div>
                )}
              </dl>

              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex justify-between text-base font-semibold text-gray-900">
                  <dt>Total</dt>
                  <dd>{formatPrice(total)}</dd>
                </div>
                <p className="mt-2 text-xs text-gray-500 text-center">
                  Frete grátis em compras acima de R$ 199,00
                </p>
              </div>

              <Link
                href="/checkout"
                className="mt-6 block w-full text-center bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-900 transition-colors"
              >
                Finalizar compra
              </Link>

              <p className="mt-4 text-center text-xs text-gray-500">
                Ao continuar, você concorda com nossos
                <a href="#" className="underline hover:text-gray-700">Termos de Uso</a>
                e
                <a href="#" className="underline hover:text-gray-700">Política de Privacidade</a>
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}