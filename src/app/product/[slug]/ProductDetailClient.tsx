'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import type { MLStoredItem } from '@/lib/ml-store';

interface Props {
  item: MLStoredItem;
}

/**
 * Normaliza URLs de imagem do Mercado Livre:
 * - Thumbnails pequenos (-F, -I, -P) → original (-O)
 * - .webp → .jpg (maior compatibilidade/qualidade)
 * - Remove o sufixo _2X_ (retina) que quebra a montagem do original
 * Mantém URLs de fora do ML intactas.
 */
function toMLOriginal(url: string): string {
  if (!url) return url;
  if (!/mlstatic\.com/i.test(url)) return url;
  return url
    .replace(/_2X_/g, '')
    .replace(/-(F|I|P|O)\.(webp|jpg|jpeg|png)$/i, '-O.jpg')
    .replace(/-(L|M|S)\.([a-z]+)$/i, (_, sz, ext) => (sz === 'O' ? `-O.${ext}` : `-O.jpg`));
}

export function ProductDetailClient({ item }: Props) {
  const rawImages = item.images && item.images.length > 0 ? item.images : [item.image || ''];
  const images = rawImages.map(toMLOriginal).filter(Boolean);
  const [selected, setSelected] = useState(0);

  const formatPrice = (v: number | null) => {
    if (v === null || v === undefined) return 'Ver preço';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: item.currencyId === 'USD' ? 'USD' : 'BRL',
    }).format(v);
  };

  const discount =
    item.originalPrice && item.price && item.originalPrice > item.price
      ? Math.round((1 - item.price / item.originalPrice) * 100)
      : null;

  const buyUrl = item.affiliateLink || item.permalink;

  return (
    <div className="py-12 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-gray-900">Início</Link>
          <span>/</span>
          <Link href="/products" className="hover:text-gray-900">Produtos</Link>
          <span>/</span>
          <span className="text-gray-900 font-medium truncate max-w-[220px]">{item.title}</span>
        </nav>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Galeria */}
          <div className="space-y-4">
            <div className="relative aspect-square w-full bg-gray-50 rounded-xl overflow-hidden">
              {images[selected] ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={images[selected]}
                  alt={item.title}
                  className="absolute inset-0 w-full h-full object-contain"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-gray-400">Sem imagem</div>
              )}
              {discount && (
                <div className="absolute top-4 left-4">
                  <span className="bg-red-500 text-white text-sm font-semibold px-3 py-1 rounded">-{discount}%</span>
                </div>
              )}
            </div>

            {/* Thumbnails / navegação */}
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelected(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors bg-gray-100 ${
                      index === selected ? 'border-gray-900' : 'border-transparent hover:border-gray-300'
                    }`}
                    aria-label={`Ver imagem ${index + 1}`}
                    aria-current={index === selected ? 'true' : 'false'}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={img}
                      alt={`${item.title} - imagem ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="lg:sticky lg:top-24 lg:self-start space-y-6">
            <div>
              <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">Oferta</span>
              <h1 className="mt-2 text-3xl md:text-4xl font-bold text-gray-900">{item.title}</h1>
            </div>

            <div className="flex items-baseline gap-4 flex-wrap">
              <span className="text-3xl font-bold text-gray-900">{formatPrice(item.price)}</span>
              {item.originalPrice && item.originalPrice > (item.price ?? 0) && (
                <span className="text-xl text-gray-400 line-through">{formatPrice(item.originalPrice)}</span>
              )}
            </div>

            <p className="text-sm text-gray-500">
              Venda realizada no Mercado Livre. Você será redirecionado para concluir a compra com segurança.
            </p>

            {/* Comprar — único ponto que sai do site */}
            <div className="border-t border-gray-100 pt-6 space-y-4">
              <a
                href={buyUrl}
                target="_blank"
                rel="noopener noreferrer sponsored"
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 rounded-lg bg-gray-900 text-white font-semibold text-lg hover:bg-gray-800 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                Comprar agora
              </a>
            </div>
          </div>
        </div>

        {/* Relacionados */}
        <section className="mt-20">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Outras ofertas da Hiskra</h2>
          <Link href="/products" className="text-sm text-gray-600 underline hover:text-gray-900">
            Ver todas as ofertas
          </Link>
        </section>
      </div>
    </div>
  );
}