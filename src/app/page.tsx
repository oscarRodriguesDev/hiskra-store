import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white py-20 md:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
              Hardware que <span className="text-amber-400">potencializa</span>
            </h1>
            <p className="mt-6 text-lg md:text-xl text-gray-300 max-w-xl">
              Componentes de PC, periféricos e hardware gamer de alta performance.
              Monte seu setup dos sonhos com as melhores marcas.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/products"
                className="inline-flex items-center justify-center px-6 py-3 text-base font-semibold text-gray-900 bg-white rounded-lg hover:bg-gray-100 transition-colors"
              >
                Ver ofertas
              </Link>
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-amber-400/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
        </div>
      </section>

      {/* Ofertas */}
      <section className="py-16 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8 text-center">Ofertas selecionadas</h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-center mb-8">
            Confira nossa seleção de produtos com bons preços.
          </p>
          <div className="text-center">
            <Link
              href="/products"
              className="inline-flex items-center justify-center px-6 py-3 text-base font-semibold text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors"
            >
              Ver ofertas
            </Link>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="p-6">
              <div className="mx-auto w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-7 h-7 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 01-2 2H7a2 2 0 01-2-2V8m14 0v10a2 2 0 01-2 2h-2a2 2 0 01-2-2V8m-9-4h4m-4 0v4" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Frete grátis</h3>
              <p className="mt-2 text-sm text-gray-600">Acima de R$ 199,00 para todo Brasil</p>
            </div>
            <div className="p-6">
              <div className="mx-auto w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-7 h-7 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Troca fácil</h3>
              <p className="mt-2 text-sm text-gray-600">Até 30 dias para trocar ou devolver</p>
            </div>
            <div className="p-6">
              <div className="mx-auto w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-7 h-7 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Pagamento seguro</h3>
              <p className="mt-2 text-sm text-gray-600">Seus dados protegidos com criptografia</p>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-16 bg-gray-900 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl md:text-3xl font-bold">Receba novidades</h2>
          <p className="mt-4 text-gray-300 max-w-xl mx-auto">
            Cadastre-se e ganhe 10% de desconto na primeira compra.
          </p>
          <form className="mt-8 max-w-md mx-auto flex gap-2" action="#">
            <input
              type="email"
              placeholder="Seu email"
              className="flex-1 px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/20"
              required
            />
            <button
              type="submit"
              className="px-6 py-3 bg-amber-400 text-gray-900 font-semibold rounded-lg hover:bg-amber-300 transition-colors"
            >
              Cadastrar
            </button>
          </form>
          <p className="mt-4 text-xs text-gray-500">Não enviamos spam. Veja nossa <a href="#" className="underline hover:text-white">política de privacidade</a>.</p>
        </div>
      </section>
    </div>
  );
}