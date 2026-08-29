'use client';

import React, { ReactNode } from 'react';
import { CartProvider } from '@/context/CartContext';
import { AuthProvider } from '@/context/AuthContext';
import { ExitIntentModal } from './ExitIntentModal';

interface ProvidersProps {
  children: ReactNode;
  isCheckoutPage?: boolean;
  isCartPage?: boolean;
}

export function Providers({
  children,
  isCheckoutPage = false,
  isCartPage = false,
}: ProvidersProps) {
  return (
    <AuthProvider>
      <CartProvider>
        {children}
        <ExitIntentModal isCheckoutPage={isCheckoutPage} isCartPage={isCartPage} />
      </CartProvider>
    </AuthProvider>
  );
}