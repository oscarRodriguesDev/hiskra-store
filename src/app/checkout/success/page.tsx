import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

interface SuccessPageProps {
  searchParams: Promise<{ orderId?: string }>;
}

export const metadata: Metadata = {
  title: 'Pedido confirmado | Hiskra Store',
  description: 'Seu pedido foi realizado com sucesso',
};

export default async function SuccessPage({ searchParams }: SuccessPageProps) {
  const params = await searchParams;
  const orderId = params.orderId;

  if (!orderId) {
    notFound();
  }

  return (
    <div className="py-20 bg-gray-50 min-h-[60vh] flex items-center justify-center">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-green-100 mb-8">
          <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Pedido confirmado!</h1>
        <p className="mt-4 text-lg text-gray-600 max-w-xl mx-auto">
          Obrigado pela sua compra. Seu pedido foi processado com sucesso e você receberá a confirmação por email.
        </p>

        <div className="mt-8 p-6 bg-white rounded-xl border border-gray-100 max-w-md mx-auto text-left">
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-600">Número do pedido</dt>
              <dd className="font-mono font-semibold text-gray-900">{orderId}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-600">Status</dt>
              <dd className="font-medium text-green-600">Pagamento aprovado</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-600">Data</dt>
              <dd className="font-medium text-gray-900">{new Date().toLocaleDateString('pt-BR')}</dd>
            </div>
          </dl>
        </div>

        <div className="mt-8 flex flex-wrap gap-4 justify-center">
          <Link
            href="/products"
            className="px-6 py-3 bg-black text-white font-semibold rounded-lg hover:bg-gray-900 transition-colors"
          >
            Continuar comprando
          </Link>
          <Link
            href="/orders"
            className="px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
          >
            Ver meus pedidos
          </Link>
        </div>

        <p className="mt-8 text-sm text-gray-500">
          Um email de confirmação foi enviado para seu endereço de email cadastrado.
        </p>
      </div>
    </div>
  );
}