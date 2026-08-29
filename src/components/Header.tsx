'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { CartDrawer } from './CartDrawer';

export function Header() {
  const { getItemCount } = useCart();
  const { user, logout, isLoaded } = useAuth();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const itemCount = getItemCount();

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-gray-100">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" aria-label="Navegação principal">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2" aria-label="Hiskra Store - Início">
            <svg className="w-8 h-8 text-black" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" fill="none"/>
            </svg>
            <span className="text-xl font-bold text-gray-900">Hiskra</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:gap-8">
            <Link href="/products" className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors">
              Produtos
            </Link>
            <Link href="/products?category=Camisetas" className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors">
              Camisetas
            </Link>
            <Link href="/products?category=Moletons" className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors">
              Moletons
            </Link>
            <Link href="/products?category=Acessórios" className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors">
              Acessórios
            </Link>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            {/* Search - Desktop */}
            <div className="hidden md:block">
              <Link
                href="/products"
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg text-gray-500 hover:bg-gray-200 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span className="text-sm">Buscar produtos...</span>
              </Link>
            </div>

            {/* Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 text-gray-700 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label={`Carrinho${itemCount > 0 ? ` com ${itemCount} itens` : ' vazio'}`}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center bg-red-500 text-white text-xs font-bold rounded-full">
                  {itemCount > 99 ? '99+' : itemCount}
                </span>
              )}
            </button>

            {/* Auth / User Menu */}
            {isLoaded ? (
              user ? (
                <div className="relative">
                  <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <span className="hidden sm:block">{user.name}</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {isMobileMenuOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setIsMobileMenuOpen(false)} />
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-50 animate-in slide-in-from-top-2 duration-200">
                        <Link
                          href="/account"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          Minha conta
                        </Link>
                        <Link
                          href="/orders"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          Meus pedidos
                        </Link>
                        <hr className="my-1 border-gray-100" />
                        <button
                          onClick={() => { logout(); setIsMobileMenuOpen(false); }}
                          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                        >
                          Sair
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <Link
                  href="/auth"
                  className="px-4 py-2 text-sm font-semibold text-white bg-black rounded-lg hover:bg-gray-900 transition-colors"
                >
                  Entrar / Cadastrar
                </Link>
              )
            ) : (
              <div className="w-24 h-10 bg-gray-200 animate-pulse rounded" />
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="w-full py-3 text-left text-sm font-medium text-gray-700 hover:text-gray-900"
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-menu"
          >
            Menu
          </button>
          {isMobileMenuOpen && (
            <div id="mobile-menu" className="py-3 space-y-2 border-t border-gray-100 animate-in slide-in-from-top-2 duration-200">
              <Link href="/products" className="block py-2 text-sm font-medium text-gray-700 hover:text-gray-900" onClick={() => setIsMobileMenuOpen(false)}>
                Produtos
              </Link>
              <Link href="/products?category=Camisetas" className="block py-2 text-sm font-medium text-gray-700 hover:text-gray-900" onClick={() => setIsMobileMenuOpen(false)}>
                Camisetas
              </Link>
              <Link href="/products?category=Moletons" className="block py-2 text-sm font-medium text-gray-700 hover:text-gray-900" onClick={() => setIsMobileMenuOpen(false)}>
                Moletons
              </Link>
              <Link href="/products?category=Acessórios" className="block py-2 text-sm font-medium text-gray-700 hover:text-gray-900" onClick={() => setIsMobileMenuOpen(false)}>
                Acessórios
              </Link>
              <hr className="border-gray-100" />
              {user ? (
                <>
                  <Link href="/account" className="block py-2 text-sm font-medium text-gray-700" onClick={() => setIsMobileMenuOpen(false)}>
                    Minha conta
                  </Link>
                  <Link href="/orders" className="block py-2 text-sm font-medium text-gray-700" onClick={() => setIsMobileMenuOpen(false)}>
                    Meus pedidos
                  </Link>
                  <button onClick={() => { logout(); setIsMobileMenuOpen(false); }} className="w-full text-left py-2 text-sm font-medium text-red-600">
                    Sair
                  </button>
                </>
              ) : (
                <Link href="/auth" className="block py-2 text-sm font-medium text-gray-700" onClick={() => setIsMobileMenuOpen(false)}>
                  Entrar / Cadastrar
                </Link>
              )}
            </div>
          )}
        </div>
      </nav>

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </header>
  );
}