import { Metadata } from 'next';
import { CheckoutPageClient } from './CheckoutPageClient';

export const metadata: Metadata = {
  title: 'Checkout | Hiskra Store',
  description: 'Finalize sua compra com segurança',
};

export default function CheckoutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <CheckoutPageClient />
    </div>
  );
}