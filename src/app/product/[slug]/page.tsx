import { notFound } from 'next/navigation';
import { getStoredItems } from '@/lib/ml-store';
import { ProductDetailClient } from './ProductDetailClient';

// Acessa o produto por itemId (ex: /product/MLB5382062300)
export const dynamic = 'force-dynamic';

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const items = await getStoredItems();
  const item = items.find((i) => i.itemId === slug);
  if (!item) notFound();

  return <ProductDetailClient item={item} />;
}