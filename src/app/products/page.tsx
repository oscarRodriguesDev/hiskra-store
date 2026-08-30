import { Metadata } from 'next';
import { MLStoreSection } from '@/components/MLStoreSection';

// Página lê a vitrine (Turso) a cada request — nunca cachear o HTML, senão
// produtos adicionados/removidos no admin demoram (ou nunca) para aparecer.
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Ofertas | Hiskra Store',
  description: 'Ofertas selecionadas de componentes de PC, periféricos e hardware gamer.',
};

export default function ProductsPage() {
  return (
    <div className="py-12 bg-gray-50 min-h-screen">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <MLStoreSection />
      </div>
    </div>
  );
}