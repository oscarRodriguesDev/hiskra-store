'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { formatPrice } from '@/lib/types';
import type { Product } from '@/lib/types';

interface ProductCardProps {
  product: Product;
  priority?: boolean;
}

export function ProductCard({ product, priority = false }: ProductCardProps) {
  return (
    <article className="group flex flex-col bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300">
      <Link
        href={`/product/${product.slug}`}
        className="relative aspect-square overflow-hidden bg-gray-50"
        aria-label={`Ver detalhes de ${product.name}`}
      >
        {product.images[0] && (
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            priority={priority}
            loading={priority ? 'eager' : 'lazy'}
          />
        )}

        {product.compareAtPrice && (
          <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded">
            -{Math.round((1 - product.price / product.compareAtPrice!) * 100)}%
          </span>
        )}

        {product.featured && (
          <span className="absolute top-3 right-3 bg-amber-500 text-white text-xs font-semibold px-2 py-1 rounded">
            Destaque
          </span>
        )}

        {product.stock > 0 && product.stock <= 5 && (
          <span className="absolute bottom-3 left-3 bg-orange-500 text-white text-xs font-semibold px-2 py-1 rounded">
            Últimas {product.stock} un.
          </span>
        )}

        {!product.isActive || product.stock === 0 ? (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="bg-white px-4 py-2 rounded-lg font-semibold text-gray-900">
              Indisponível
            </span>
          </div>
        ) : null}
      </Link>

      <div className="flex-1 flex flex-col p-4">
        <div className="flex items-start justify-between gap-2">
          <Link href={`/product/${product.slug}`} className="flex-1 min-w-0">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              {product.category}
            </p>
            <h3 className="mt-1 text-base font-semibold text-gray-900 line-clamp-1 group-hover:text-black transition-colors">
              {product.name}
            </h3>
          </Link>
        </div>

        <div className="mt-auto flex items-baseline justify-between gap-2 pt-2 border-t border-gray-100">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-gray-900">{formatPrice(product.price)}</span>
            {product.compareAtPrice && (
              <span className="text-sm text-gray-400 line-through">{formatPrice(product.compareAtPrice)}</span>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}