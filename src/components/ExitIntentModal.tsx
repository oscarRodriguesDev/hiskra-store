'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { formatPrice } from '@/lib/types';

const DISMISSED_KEY = 'hiskra_exit_dismissed';
const DISMISS_DURATION_HOURS = 24;

interface ExitIntentModalProps {
  isCheckoutPage?: boolean;
  isCartPage?: boolean;
}

export function ExitIntentModal({ isCheckoutPage = false, isCartPage = false }: ExitIntentModalProps) {
  const { cart, getItemCount } = useCart();
  const { user, isLoaded: authLoaded } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [mouseY, setMouseY] = useState(0);

  const itemCount = getItemCount();
  const hasItems = itemCount > 0;
  const shouldShow = hasItems && !user && authLoaded;

  // Verificar se dispensou recentemente
  const isDismissed = () => {
    if (typeof window === 'undefined') return false;
    try {
      const stored = localStorage.getItem(DISMISSED_KEY);
      if (stored) {
        const { timestamp } = JSON.parse(stored);
        const hoursPassed = (Date.now() - timestamp) / (1000 * 60 * 60);
        return hoursPassed < DISMISS_DURATION_HOURS;
      }
    } catch {
      // Ignorar
    }
    return false;
  };

  const dismiss = useCallback(() => {
    localStorage.setItem(DISMISSED_KEY, JSON.stringify({ timestamp: Date.now() }));
    setIsOpen(false);
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    setMouseY(e.clientY);
  }, []);

  const handleBeforeUnload = useCallback((e: BeforeUnloadEvent) => {
    if (shouldShow && !isDismissed()) {
      // Mostrar modal em vez do beforeunload nativo
      e.preventDefault();
      setIsOpen(true);
      // Para navegadores que suportam, definir returnValue
      e.returnValue = '';
      return '';
    }
  }, [shouldShow]);

  // Detectar intenção de saída (mouse saindo pela parte superior)
  useEffect(() => {
    if (!shouldShow || isDismissed()) return;

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [shouldShow, handleMouseMove, handleBeforeUnload]);

  // Detectar quando mouse sai da viewport (topo)
  useEffect(() => {
    if (!shouldShow || isDismissed() || isOpen) return;

    const checkExitIntent = () => {
      if (mouseY <= 10) {
        setIsOpen(true);
      }
    };

    const interval = setInterval(checkExitIntent, 100);
    return () => clearInterval(interval);
  }, [shouldShow, isDismissed, isOpen, mouseY]);

  if (!isOpen || !shouldShow) return null;

  const subtotal = cart.items.reduce(
    (sum, item) => sum + item.snapshot.price * item.quantity,
    0
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="exit-modal-title"
    >
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6 animate-in slide-in-from-top-4 duration-300">
        <div className="flex items-start justify-between">
          <div>
            <h2 id="exit-modal-title" className="text-xl font-bold text-gray-900">
              Vai sair sem finalizar?
            </h2>
            <p className="mt-2 text-gray-600">
              Você tem <span className="font-semibold">{itemCount}</span> item{itemCount > 1 ? 's' : ''} no carrinho
              {subtotal > 0 && ` (${formatPrice(subtotal)})`}.
            </p>
          </div>
          <button
            onClick={dismiss}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Fechar"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mt-6 space-y-3">
          <p className="text-gray-700">
            Crie sua conta agora e salve seu carrinho para continuar depois.
          </p>

          <div className="flex gap-3">
            <button
              onClick={() => {
                dismiss();
                window.location.href = '/auth?mode=register&returnUrl=' + encodeURIComponent(window.location.pathname);
              }}
              className="flex-1 bg-black text-white py-3 px-4 rounded-lg font-semibold hover:bg-gray-900 transition-colors"
            >
              Criar conta e salvar
            </button>
            <button
              onClick={dismiss}
              className="flex-1 border border-gray-300 text-gray-700 py-3 px-4 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
            >
              Agora não
            </button>
          </div>

          <p className="text-xs text-gray-500 text-center">
            Não mostraremos esta mensagem novamente por 24 horas.
          </p>
        </div>
      </div>
    </div>
  );
}