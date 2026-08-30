import Image from 'next/image';
import Link from 'next/link';
import { getStorefrontItems } from '@/lib/ml-store';

export async function MLStoreSection() {
  const items = await getStorefrontItems();

  const formatPrice = (v: number | null, currency: string) => {
    if (v === null || v === undefined) return 'Ver preço';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: currency === 'USD' ? 'USD' : 'BRL',
    }).format(v);
  };

  return (
    <section className="mt-12">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Ofertas</h2>
          <p className="mt-1 text-sm text-gray-600">
            Produtos selecionados com bons preços.
          </p>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center shadow-sm">
          <svg className="mx-auto w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v18m9-9H3" />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900">Em breve, novidades por aqui</h3>
          <p className="mt-2 text-sm text-gray-600">
            Nossos produtos selecionados aparecerão nesta página.
          </p>
        </div>
      ) : (

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {items.map((item) => (
          <article
            key={item.itemId}
            className="group flex flex-col bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300"
          >
            <a
              href={item.affiliateLink || item.permalink}
              target="_blank"
              rel="noopener noreferrer sponsored"
              className="relative aspect-square overflow-hidden bg-gray-50"
              aria-label={`Ver ${item.title}`}
            >
              {item.image && (
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
              )}
            </a>

            <div className="flex-1 flex flex-col p-4">
              <a
                href={item.affiliateLink || item.permalink}
                target="_blank"
                rel="noopener noreferrer sponsored"
                className="flex-1 min-w-0"
              >
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Oferta
                </p>
                <h3 className="mt-1 text-base font-semibold text-gray-900 line-clamp-2 group-hover:text-black transition-colors">
                  {item.title}
                </h3>
              </a>

              <div className="mt-auto flex items-baseline justify-between gap-2 pt-2 border-t border-gray-100">
                <span className="text-lg font-bold text-gray-900">
                  {formatPrice(item.price, item.currencyId)}
                </span>
              </div>

              <a
                href={item.affiliateLink || item.permalink}
                target="_blank"
                rel="noopener noreferrer sponsored"
                className="mt-3 w-full inline-flex items-center justify-center px-4 py-2 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 transition-colors"
              >
                Ver oferta
              </a>
            </div>
          </article>
        ))}
      </div>
      )}

      <p className="mt-6 text-xs text-gray-400">
        <Link href="/products" className="hover:text-gray-600">Os preços e a disponibilidade podem variar.</Link> Ao comprar pelos links acima, a Hiskra pode receber uma comissão.
      </p>
    </section>
  );
}