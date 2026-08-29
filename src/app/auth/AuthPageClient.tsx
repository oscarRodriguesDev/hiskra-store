'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export function AuthPageClient() {
  const { login, register, isLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<'login' | 'register'>(
    searchParams.get('mode') === 'register' ? 'register' : 'login'
  );
  const returnUrl = searchParams.get('returnUrl') || '/';

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (searchParams.get('registered') === 'true') {
      setSuccess('Conta criada com sucesso! Faça login para continuar.');
      setMode('login');
    }
  }, [searchParams]);

  const validateLogin = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.email.trim()) newErrors.email = 'Email é obrigatório';
    if (!formData.password) newErrors.password = 'Senha é obrigatória';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateRegister = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Nome é obrigatório';
    if (!formData.email.trim()) newErrors.email = 'Email é obrigatório';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Email inválido';
    if (!formData.password) newErrors.password = 'Senha é obrigatória';
    else if (formData.password.length < 8) newErrors.password = 'Senha deve ter pelo menos 8 caracteres';
    else if (!/[A-Z]/.test(formData.password)) newErrors.password = 'Senha deve ter pelo menos uma letra maiúscula';
    else if (!/[0-9]/.test(formData.password)) newErrors.password = 'Senha deve ter pelo menos um número';
    else if (!/[!@#$%^&*]/.test(formData.password)) newErrors.password = 'Senha deve ter pelo menos um caractere especial (!@#$%^&*)';
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Senhas não conferem';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (mode === 'login') {
      if (!validateLogin()) return;
      const result = await login(formData.email, formData.password);
      if (result.success) {
        router.push(returnUrl);
        router.refresh();
      } else {
        setError(result.error || 'Erro ao fazer login');
      }
    } else {
      if (!validateRegister()) return;
      const result = await register(formData.name, formData.email, formData.password);
      if (result.success) {
        setSuccess('Conta criada com sucesso! Redirecionando...');
        setTimeout(() => {
          router.push(`/auth?mode=login&returnUrl=${encodeURIComponent(returnUrl)}`);
          router.refresh();
        }, 1500);
      } else {
        setError(result.error || 'Erro ao criar conta');
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <div className="py-16 bg-gray-50 min-h-[70vh] flex items-center justify-center">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto">
          {/* Logo */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2">
              <svg className="w-10 h-10 text-black" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" fill="none"/>
              </svg>
              <span className="text-2xl font-bold text-gray-900">Hiskra</span>
            </Link>
          </div>

          {/* Tab Switcher */}
          <div className="bg-white rounded-xl border border-gray-100 p-1 mb-6" role="tablist">
            <div className="flex">
              <button
                role="tab"
                aria-selected={mode === 'login'}
                onClick={() => { setMode('login'); setErrors({}); setError(''); setSuccess(''); }}
                className={`flex-1 py-3 px-4 text-sm font-semibold rounded-lg transition-colors ${
                  mode === 'login'
                    ? 'bg-black text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Entrar
              </button>
              <button
                role="tab"
                aria-selected={mode === 'register'}
                onClick={() => { setMode('register'); setErrors({}); setError(''); setSuccess(''); }}
                className={`flex-1 py-3 px-4 text-sm font-semibold rounded-lg transition-colors ${
                  mode === 'register'
                    ? 'bg-black text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Cadastrar
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-100 p-6 space-y-5" noValidate>
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm" role="alert">
                {error}
              </div>
            )}

            {success && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm" role="status">
                {success}
              </div>
            )}

            {mode === 'register' && (
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Nome completo *
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-black/20 focus:border-black ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  required
                  autoComplete="name"
                  disabled={isLoading}
                />
                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-black/20 focus:border-black ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
                required
                autoComplete="email"
                disabled={isLoading}
              />
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Senha *
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-black/20 focus:border-black ${
                  errors.password ? 'border-red-500' : 'border-gray-300'
                }`}
                required
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                disabled={isLoading}
              />
              {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
              {mode === 'register' && (
                <p className="mt-2 text-xs text-gray-500">
                  Mínimo 8 caracteres, 1 maiúscula, 1 número, 1 caractere especial (!@#$%^&*)
                </p>
              )}
            </div>

            {mode === 'register' && (
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirmar senha *
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-black/20 focus:border-black ${
                    errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                  }`}
                  required
                  autoComplete="new-password"
                  disabled={isLoading}
                />
                {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-black text-white font-semibold rounded-lg hover:bg-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Processando...' : mode === 'login' ? 'Entrar' : 'Criar conta'}
            </button>

            {mode === 'login' && (
              <p className="text-center text-sm text-gray-600">
                <Link href="/auth?mode=register" className="font-medium text-gray-900 hover:underline">
                  Não tem conta? Cadastre-se
                </Link>
              </p>
            )}

            {mode === 'register' && (
              <p className="text-center text-sm text-gray-600">
                <Link href="/auth?mode=login" className="font-medium text-gray-900 hover:underline">
                  Já tem conta? Entre
                </Link>
              </p>
            )}

            <p className="text-center text-xs text-gray-500">
              Ao continuar, você concorda com nossos
              <Link href="#" className="underline hover:text-gray-700">Termos de Uso</Link>
              e
              <Link href="#" className="underline hover:text-gray-700">Política de Privacidade</Link>
            </p>
          </form>

          {/* Demo credentials */}
          <div className="mt-8 p-4 bg-gray-50 rounded-lg text-center">
            <p className="text-xs text-gray-600">
              <strong>Demo:</strong> demo@hiskra.com / demo123
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}