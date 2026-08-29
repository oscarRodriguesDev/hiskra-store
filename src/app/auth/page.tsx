import { Metadata } from 'next';
import { Suspense } from 'react';
import { AuthPageClient } from './AuthPageClient';

export const metadata: Metadata = {
  title: 'Entrar / Cadastrar | Hiskra Store',
  description: 'Acesse sua conta ou crie uma nova',
};

function AuthPageFallback() {
  return (
    <div className="py-16 bg-gray-50 min-h-[70vh] flex items-center justify-center">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-black mx-auto" />
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={<AuthPageFallback />}>
      <AuthPageClient />
    </Suspense>
  );
}