'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/lib/types';
import type { Product } from '@/lib/types';

interface ProductDetailClientProps {
  product: Product;
}

export function ProductDetailClient({ product }: ProductDetailClientProps) {
  const { addItem, isInCart, getItemQuantity } = useCart();
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const inCart = isInCart(product.id);
  const cartQuantity = getItemQuantity(product.id);

  const handleAddToCart = () => {
    addItem(product, quantity);
    setQuantity(1);
  };

  const maxQty = Math.min(99, product.stock);

  return (
    <div className="py-12 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-gray-900">Início</Link>
          <span>/</span>
          <Link href="/products" className="hover:text-gray-900">Produtos</Link>
          <span>/</span>
          <Link href={`/products?category=${product.category}`} className="hover:text-gray-900">
            {product.category}
          </Link>
          <span>/</span>
          <span className="text-gray-900 font-medium truncate max-w-[200px]">{product.name}</span>
        </nav>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Gallery */}
          <div className="space-y-4">
            <div className="aspect-square bg-gray-50 rounded-xl overflow-hidden relative">
              <Image
                src={product.images[selectedImage]}
                alt={product.name}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              {product.compareAtPrice && (
                <div className="absolute top-4 left-4">
                  <span className="bg-red-500 text-white text-sm font-semibold px-3 py-1 rounded">
                    -{Math.round((1 - product.price / product.compareAtPrice!) * 100)}% OFF
                  </span>
                </div>
              )}
              {product.stock > 0 && product.stock <= 5 && (
                <div className="absolute top-4 right-4">
                  <span className="bg-orange-500 text-white text-sm font-semibold px-3 py-1 rounded">
                    Últimas {product.stock} unidades
                  </span>
                </div>
              )}
              {!product.isActive || product.stock === 0 ? (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <span className="bg-white px-6 py-3 rounded-lg font-semibold text-gray-900 text-lg">
                    Indisponível
                  </span>
                </div>
              ) : null}
            </div>

            {/* Thumbnails */}
            {product.images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                      index === selectedImage ? 'border-gray-900' : 'border-transparent hover:border-gray-300'
                    }`}
                    aria-label={`Ver imagem ${index + 1}`}
                    aria-current={index === selectedImage ? 'true' : 'false'}
                  >
                    <Image
                      src={image}
                      alt={`${product.name} - imagem ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="lg:sticky lg:top-24 lg:self-start space-y-6">
            <div>
              <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">{product.category}</span>
              <h1 className="mt-2 text-3xl md:text-4xl font-bold text-gray-900">{product.name}</h1>
            </div>

            <div className="flex items-baseline gap-4 flex-wrap">
              <span className="text-3xl font-bold text-gray-900">{formatPrice(product.price)}</span>
              {product.compareAtPrice && (
                <span className="text-xl text-gray-400 line-through">{formatPrice(product.compareAtPrice)}</span>
              )}
            </div>

            <div className="prose prose-gray max-w-none text-gray-700">
              <p>{product.description}</p>
            </div>

            {/* Tags */}
            {product.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {product.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Add to Cart */}
            <div className="border-t border-gray-100 pt-6 space-y-4">
              {/* Quantity Selector */}
              <div>
                <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-2">
                  Quantidade
                </label>
                <div className="flex items-center gap-4">
                  <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-12 h-12 flex items-center justify-center hover:bg-gray-100 transition-colors"
                      aria-label="Diminuir quantidade"
                      disabled={quantity <= 1}
                    >
                      <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                      </svg>
                    </button>
                    <input
                      id="quantity"
                      type="number"
                      min="1"
                      max={maxQty}
                      value={quantity}
                      onChange={(e) => setQuantity(Math.min(maxQty, Math.max(1, parseInt(e.target.value) || 1)))}
                      className="w-16 h-12 text-center border-x border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500/20"
                      aria-label="Quantidade"
                    />
                    <button
                      onClick={() => setQuantity(Math.min(maxQty, quantity + 1))}
                      className="w-12 h-12 flex items-center justify-center hover:bg-gray-100 transition-colors"
                      aria-label="Aumentar quantidade"
                      disabled={quantity >= maxQty}
                    >
                      <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </button>
                  </div>
                  <span className="text-sm text-gray-500">Estoque: {product.stock}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleAddToCart}
                  disabled={!product.isActive || product.stock === 0 || inCart}
                  className={`flex-1 py-4 px-6 rounded-lg font-semibold text-lg transition-colors ${
                    !product.isActive || product.stock === 0
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      : inCart
                      ? 'bg-gray-900 text-white'
                      : 'bg-black text-white hover:bg-gray-900'
                  }`}
                >
                  {inCart ? (
                    <>
                      <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Adicionado ({cartQuantity})
                    </>
                  ) : (
                    'Adicionar ao carrinho'
                  )}
                </button>

                <button
                  className="flex items-center justify-center gap-2 px-6 py-4 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                  aria-label="Adicionar à lista de desejos"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  <span className="hidden sm:inline">Desejos</span>
                </button>
              </div>

              {/* Trust badges */}
              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <span>Compra segura</span>
                </div>
                <div className="flex items-center gap-1">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>Troca grátis 30 dias</span>
                </div>
                <div className="flex items-center gap-1">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 01-2 2H7a2 2 0 01-2-2V8m14 0v10a2 2 0 01-2 2h-2a2 2 0 01-2-2V8m-9-4h4m-4 0v4" />
                  </svg>
                  <span>Entrega rápida</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        <section className="mt-20">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Você também pode gostar</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" id="related-products">
            {/* Will be filled by server component */}
          </div>
        </section>
      </div>
    </div>
  );
}