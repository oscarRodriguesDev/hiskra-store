import Image from 'next/image';
import Link from 'next/link';
import { getStorefrontItems } from '@/lib/ml-store';

export async function MLStoreSection() {
  const items = await getStorefrontItems();

  if (items.length === 0) return null;

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
          <h2 className="text-2xl font-bold text-gray-900">Ofertas do Mercado Livre</h2>
          <p className="mt-1 text-sm text-gray-600">
            Produtos selecionados com preços competitivos.
          </p>
        </div>
      </div>

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
              aria-label={`Ver ${item.title} no Mercado Livre`}
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
                  Mercado Livre
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
                Comprar no Mercado Livre
              </a>
            </div>
          </article>
        ))}
      </div>

      <p className="mt-6 text-xs text-gray-400">
        <Link href="/products" className="hover:text-gray-600">Ofertas disponíveis enquanto durar o estoque dos vendedores.</Link> Ao comprar pelos links acima, a Hiskra pode receber uma comissão.
      </p>
    </section>
  );
}