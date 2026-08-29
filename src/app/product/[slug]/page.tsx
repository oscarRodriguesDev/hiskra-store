import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getProductBySlug, mockProducts } from '@/lib/mock-data';
import { ProductDetailClient } from './ProductDetailClient';
import { ProductCard } from '@/components/ProductCard';

interface ProductDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProductDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  
  if (!product) {
    return { title: 'Produto não encontrado' };
  }

  return {
    title: `${product.name} | Hiskra Store`,
    description: product.shortDescription,
    openGraph: {
      title: product.name,
      description: product.shortDescription,
      images: product.images,
      type: 'website',
    },
    other: {
      'product:price:amount': (product.price / 100).toFixed(2),
      'product:price:currency': 'BRL',
      'product:availability': product.stock > 0 ? 'in stock' : 'out of stock',
    },
  };
}

function RelatedProducts({ currentProductId, category }: { currentProductId: string; category: string }) {
  const relatedProducts = mockProducts
    .filter((p) => p.id !== currentProductId && p.category === category && p.isActive)
    .slice(0, 4);

  if (relatedProducts.length === 0) return null;

  return (
    <section className="mt-20" aria-labelledby="related-heading">
      <h2 id="related-heading" className="text-2xl font-bold text-gray-900 mb-8">Você também pode gostar</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {relatedProducts.map((product, index) => (
          <ProductCard key={product.id} product={product} priority={index < 4} />
        ))}
      </div>
    </section>
  );
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { slug } = await params;
  const product = getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  return (
    <>
      <ProductDetailClient product={product} />
      <RelatedProducts currentProductId={product.id} category={product.category} />
    </>
  );
}