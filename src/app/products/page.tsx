import { Metadata } from 'next';
import { getProductsByCategory, categories, searchProducts } from '@/lib/mock-data';
import { ProductCard } from '@/components/ProductCard';
import { formatPrice } from '@/lib/types';

interface ProductsPageProps {
  searchParams: Promise<{ category?: string; q?: string }>;
}

export const metadata: Metadata = {
  title: 'Produtos | Hiskra Store',
  description: 'Componentes de PC, periféricos e hardware gamer. Processadores, placas de vídeo, memórias, SSDs, gabinetes, water coolers, teclados, mouses, monitores e headsets.',
};

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  const category = params.category || 'Todos';
  const query = params.q || '';

  let products = getProductsByCategory(category);
  if (query) {
    products = searchProducts(query);
  }

  const activeCategory = query ? 'Busca' : category;

  return (
    <div className="py-12 bg-gray-50 min-h-screen">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <nav className="flex items-center gap-2 text-sm text-gray-500 mb-4" aria-label="Breadcrumb">
            <a href="/" className="hover:text-gray-900">Início</a>
            <span>/</span>
            <span className="text-gray-900 font-medium capitalize">{activeCategory.toLowerCase()}</span>
          </nav>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
            {query ? `Resultados para "${query}"` : activeCategory}
          </h1>
          <p className="mt-2 text-gray-600">
            {products.length} produto{products.length !== 1 ? 's' : ''} encontrado{products.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Filters + Grid */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <aside className="lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-xl border border-gray-100 p-6 sticky top-24">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Categorias</h2>
              <nav className="space-y-2">
                {categories.map((cat) => (
                  <a
                    key={cat}
                    href={cat === 'Todos' ? '/products' : `/products?category=${encodeURIComponent(cat)}`}
                    className={`block px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      cat === category
                        ? 'bg-gray-900 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {cat}
                  </a>
                ))}
              </nav>

              {/* Price Filter */}
              <div className="mt-8 pt-8 border-t border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Preço</h3>
                <div className="space-y-3">
                  {[
                    { label: 'Até R$ 100', min: 0, max: 10000 },
                    { label: 'R$ 100 - R$ 200', min: 10000, max: 20000 },
                    { label: 'R$ 200 - R$ 300', min: 20000, max: 30000 },
                    { label: 'Acima de R$ 300', min: 30000, max: Infinity },
                  ].map((range) => (
                    <label key={range.label} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        className="w-4 h-4 text-gray-900 border-gray-300 rounded focus:ring-gray-500"
                      />
                      <span className="text-sm text-gray-700">{range.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Stock Filter */}
              <div className="mt-8 pt-8 border-t border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Disponibilidade</h3>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 text-gray-900 border-gray-300 rounded focus:ring-gray-500" />
                  <span className="text-sm text-gray-700">Apenas em estoque</span>
                </label>
              </div>
            </div>
          </aside>

          {/* Products Grid */}
          <div className="flex-1">
            {products.length === 0 ? (
              <div className="text-center py-16">
                <svg className="mx-auto w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="mt-4 text-lg font-medium text-gray-900">Nenhum produto encontrado</h3>
                <p className="mt-2 text-gray-600">
                  {query
                    ? 'Tente buscar com outros termos ou veja todas as categorias.'
                    : 'Esta categoria ainda não possui produtos.'}
                </p>
                <a
                  href="/products"
                  className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-gray-900 hover:text-gray-700"
                >
                  Ver todos os produtos
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map((product, index) => (
                  <ProductCard key={product.id} product={product} priority={index < 8} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}