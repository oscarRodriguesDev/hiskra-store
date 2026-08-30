import { notFound } from 'next/navigation';

// Página de detalhe desativada: as ofertas do Mercado Livre abrem direto no
// anúncio externo (link de afiliado), então não há produto interno para exibir.
export default async function ProductDetailPage() {
  notFound();
}