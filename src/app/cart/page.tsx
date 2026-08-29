import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { formatPrice } from '@/lib/types';
import { CartPageClient } from './CartPageClient';

export const metadata: Metadata = {
  title: 'Carrinho | Hiskra Store',
  description: 'Revise seus itens e finalize sua compra',
};

export default function CartPage() {
  return <CartPageClient />;
}