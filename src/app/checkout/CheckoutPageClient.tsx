'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { formatPrice } from '@/lib/types';
import type { Address } from '@/lib/types';

const initialAddress: Address = {
  id: '',
  userId: '',
  label: 'Casa',
  recipientName: '',
  phone: '',
  cep: '',
  street: '',
  number: '',
  complement: '',
  neighborhood: '',
  city: '',
  state: '',
  isDefault: true,
};

export function CheckoutPageClient() {
  const { cart, getSubtotal, clearCart } = useCart();
  const { user, isLoaded } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState(1); // 1: address, 2: payment, 3: review
  const [address, setAddress] = useState<Address>(initialAddress);
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'card' | 'boleto'>('pix');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const subtotal = getSubtotal();
  const shipping = subtotal >= 19900 ? 0 : 1500;
  const total = subtotal + shipping;
  const itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (isLoaded && !user) {
      router.push(`/auth?returnUrl=${encodeURIComponent('/checkout')}`);
    }
  }, [isLoaded, user, router]);

  // Redirect to cart if empty
  useEffect(() => {
    if (cart.items.length === 0) {
      router.push('/cart');
    }
  }, [cart.items.length, router]);

  if (!isLoaded || !user || cart.items.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-black" />
      </div>
    );
  }

  const validateAddress = () => {
    const newErrors: Record<string, string> = {};
    if (!address.recipientName.trim()) newErrors.recipientName = 'Nome do destinatário é obrigatório';
    if (!address.phone.trim()) newErrors.phone = 'Telefone é obrigatório';
    if (!address.cep.trim()) newErrors.cep = 'CEP é obrigatório';
    if (!address.street.trim()) newErrors.street = 'Endereço é obrigatório';
    if (!address.number.trim()) newErrors.number = 'Número é obrigatório';
    if (!address.neighborhood.trim()) newErrors.neighborhood = 'Bairro é obrigatório';
    if (!address.city.trim()) newErrors.city = 'Cidade é obrigatória';
    if (!address.state.trim()) newErrors.state = 'Estado é obrigatório';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateAddress()) return;

    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1500)); // Simular processamento

    // Simular criação do pedido
    const orderId = `HSK-${Date.now().toString(36).toUpperCase()}`;
    clearCart();
    router.push(`/checkout/success?orderId=${orderId}`);
  };

  const steps = [
    { number: 1, label: 'Endereço', href: '#' },
    { number: 2, label: 'Pagamento', href: '#' },
    { number: 3, label: 'Revisão', href: '#' },
  ];

  return (
    <div className="py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Progress Steps */}
        <nav className="mb-8" aria-label="Passos do checkout">
          <ol className="flex items-center" role="list">
            {steps.map((s, index) => (
              <li key={s.number} className="flex items-center">
                <div className="flex items-center">
                  <button
                    onClick={() => index < step - 1 && setStep(index + 1)}
                    className={`flex items-center gap-2 ${
                      index < step - 1 ? 'text-gray-700 hover:text-gray-900' : 'text-gray-400'
                    }`}
                    disabled={index >= step}
                  >
                    <span
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                        index + 1 < step
                          ? 'bg-green-500 text-white'
                          : index + 1 === step
                          ? 'bg-black text-white'
                          : 'bg-gray-200 text-gray-500'
                      }`}
                    >
                      {index + 1 < step ? (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      ) : index + 1 === step ? (
                        s.number
                      ) : null}
                    </span>
                    <span className="hidden sm:inline font-medium">{s.label}</span>
                  </button>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`hidden lg:block w-24 h-0.5 mx-2 ${
                      index + 1 < step ? 'bg-green-500' : 'bg-gray-200'
                    }`} />
                )}
              </li>
            ))}
          </ol>
        </nav>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Step 1: Address */}
            {step === 1 && (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-white rounded-xl border border-gray-100 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-6">Endereço de entrega</h2>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="recipientName" className="block text-sm font-medium text-gray-700 mb-1">
                        Nome do destinatário *
                      </label>
                      <input
                        id="recipientName"
                        type="text"
                        value={address.recipientName}
                        onChange={(e) => setAddress({ ...address, recipientName: e.target.value })}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-black/20 focus:border-black ${
                          errors.recipientName ? 'border-red-500' : 'border-gray-300'
                        }`}
                        required
                      />
                      {errors.recipientName && <p className="mt-1 text-sm text-red-600">{errors.recipientName}</p>}
                    </div>

                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                        Telefone *
                      </label>
                      <input
                        id="phone"
                        type="tel"
                        value={address.phone}
                        onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                        placeholder="(11) 99999-9999"
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-black/20 focus:border-black ${
                          errors.phone ? 'border-red-500' : 'border-gray-300'
                        }`}
                        required
                      />
                      {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
                    </div>
                  </div>

                  <div className="mt-4">
                    <label htmlFor="cep" className="block text-sm font-medium text-gray-700 mb-1">
                      CEP *
                    </label>
                    <input
                      id="cep"
                      type="text"
                      value={address.cep}
                      onChange={(e) => setAddress({ ...address, cep: e.target.value })}
                      placeholder="00000-000"
                      className={`w-full max-w-xs px-4 py-2 border rounded-lg focus:ring-2 focus:ring-black/20 focus:border-black ${
                        errors.cep ? 'border-red-500' : 'border-gray-300'
                      }`}
                      required
                    />
                    {errors.cep && <p className="mt-1 text-sm text-red-600">{errors.cep}</p>}
                    <p className="mt-1 text-xs text-gray-500">Buscaremos o endereço automaticamente</p>
                  </div>

                  <div className="mt-4">
                    <label htmlFor="street" className="block text-sm font-medium text-gray-700 mb-1">
                      Rua/Avenida *
                    </label>
                    <input
                      id="street"
                      type="text"
                      value={address.street}
                      onChange={(e) => setAddress({ ...address, street: e.target.value })}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-black/20 focus:border-black ${
                        errors.street ? 'border-red-500' : 'border-gray-300'
                      }`}
                      required
                    />
                    {errors.street && <p className="mt-1 text-sm text-red-600">{errors.street}</p>}
                  </div>

                  <div className="mt-4 grid sm:grid-cols-3 gap-4">
                    <div>
                      <label htmlFor="number" className="block text-sm font-medium text-gray-700 mb-1">
                        Número *
                      </label>
                      <input
                        id="number"
                        type="text"
                        value={address.number}
                        onChange={(e) => setAddress({ ...address, number: e.target.value })}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-black/20 focus:border-black ${
                          errors.number ? 'border-red-500' : 'border-gray-300'
                        }`}
                        required
                      />
                      {errors.number && <p className="mt-1 text-sm text-red-600">{errors.number}</p>}
                    </div>
                    <div className="sm:col-span-2">
                      <label htmlFor="complement" className="block text-sm font-medium text-gray-700 mb-1">
                        Complemento
                      </label>
                      <input
                        id="complement"
                        type="text"
                        value={address.complement}
                        onChange={(e) => setAddress({ ...address, complement: e.target.value })}
                        placeholder="Apto, bloco, casa..."
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black/20 focus:border-black"
                      />
                    </div>
                  </div>

                  <div className="mt-4 grid sm:grid-cols-3 gap-4">
                    <div>
                      <label htmlFor="neighborhood" className="block text-sm font-medium text-gray-700 mb-1">
                        Bairro *
                      </label>
                      <input
                        id="neighborhood"
                        type="text"
                        value={address.neighborhood}
                        onChange={(e) => setAddress({ ...address, neighborhood: e.target.value })}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-black/20 focus:border-black ${
                          errors.neighborhood ? 'border-red-500' : 'border-gray-300'
                        }`}
                        required
                      />
                      {errors.neighborhood && <p className="mt-1 text-sm text-red-600">{errors.neighborhood}</p>}
                    </div>
                    <div>
                      <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                        Cidade *
                      </label>
                      <input
                        id="city"
                        type="text"
                        value={address.city}
                        onChange={(e) => setAddress({ ...address, city: e.target.value })}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-black/20 focus:border-black ${
                          errors.city ? 'border-red-500' : 'border-gray-300'
                        }`}
                        required
                      />
                      {errors.city && <p className="mt-1 text-sm text-red-600">{errors.city}</p>}
                    </div>
                    <div>
                      <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
                        Estado *
                      </label>
                      <select
                        id="state"
                        value={address.state}
                        onChange={(e) => setAddress({ ...address, state: e.target.value })}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-black/20 focus:border-black ${
                          errors.state ? 'border-red-500' : 'border-gray-300'
                        }`}
                        required
                      >
                        <option value="">Selecione</option>
                        {['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'].map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                      {errors.state && <p className="mt-1 text-sm text-red-600">{errors.state}</p>}
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    type="submit"
                    className="px-6 py-3 bg-black text-white font-semibold rounded-lg hover:bg-gray-900 transition-colors"
                  >
                    Continuar para pagamento
                  </button>
                </div>
              </form>
            )}

            {/* Step 2: Payment */}
            {step === 2 && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl border border-gray-100 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-6">Forma de pagamento</h2>

                  <div className="space-y-3">
                    {[
                      { value: 'pix', label: 'PIX', desc: 'Pagamento instantâneo com 5% de desconto', icon: '💰' },
                      { value: 'card', label: 'Cartão de crédito', desc: 'Até 6x sem juros', icon: '💳' },
                      { value: 'boleto', label: 'Boleto bancário', desc: 'Vencimento em 3 dias úteis', icon: '📄' },
                    ].map((method) => (
                      <label
                        key={method.value}
                        className={`flex items-center gap-4 p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                          paymentMethod === method.value
                            ? 'border-black bg-gray-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="payment"
                          value={method.value}
                          checked={paymentMethod === method.value}
                          onChange={() => setPaymentMethod(method.value as typeof paymentMethod)}
                          className="w-5 h-5 text-black border-gray-300 focus:ring-black"
                        />
                        <span className="text-2xl">{method.icon}</span>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{method.label}</p>
                          <p className="text-sm text-gray-500">{method.desc}</p>
                        </div>
                      </label>
                    ))}

                    {paymentMethod === 'pix' && (
                      <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-sm text-green-800">
                          <strong>Desconto de 5% aplicado!</strong> Total com desconto:{' '}
                          {formatPrice(Math.round(total * 0.95))}
                        </p>
                      </div>
                    )}

                    {paymentMethod === 'card' && (
                      <div className="mt-4 space-y-4 border-t border-gray-100 pt-4">
                        <div className="grid sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Nome no cartão
                            </label>
                            <input type="text" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black/20 focus:border-black" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              CPF
                            </label>
                            <input type="text" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black/20 focus:border-black" placeholder="000.000.000-00" />
                          </div>
                        </div>
                        <div className="grid sm:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Número do cartão
                            </label>
                            <input type="text" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black/20 focus:border-black" placeholder="0000 0000 0000 0000" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Validade
                            </label>
                            <input type="text" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black/20 focus:border-black" placeholder="MM/AA" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              CVV
                            </label>
                            <input type="text" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black/20 focus:border-black" placeholder="123" />
                          </div>
                        </div>
                        <div className="grid sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Parcelas
                            </label>
                            <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black/20 focus:border-black">
                              {Array.from({ length: 12 }, (_, i) => i + 1).map((n) => (
                                <option key={n} value={n}>
                                  {n}x {n <= 6 ? 'sem juros' : 'com juros'}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mt-6 flex justify-between">
                    <button
                      onClick={() => setStep(1)}
                      className="px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Voltar
                    </button>
                    <button
                      onClick={() => setStep(3)}
                      className="px-6 py-3 bg-black text-white font-semibold rounded-lg hover:bg-gray-900 transition-colors"
                    >
                      Continuar para revisão
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Review */}
            {step === 3 && (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-white rounded-xl border border-gray-100 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-6">Revisão do pedido</h2>

                  {/* Address Summary */}
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-medium text-gray-900 mb-2">Endereço de entrega</h3>
                    <address className="not-italic text-sm text-gray-700 space-y-1">
                      <p>{address.recipientName}</p>
                      <p>{address.street}, {address.number}{address.complement && `, ${address.complement}`}</p>
                      <p>{address.neighborhood} - {address.city}/{address.state}</p>
                      <p>{address.cep}</p>
                      <p>{address.phone}</p>
                    </address>
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="mt-3 text-sm font-medium text-gray-700 hover:text-gray-900 underline"
                    >
                      Alterar endereço
                    </button>
                  </div>

                  {/* Payment Summary */}
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-medium text-gray-900 mb-2">Forma de pagamento</h3>
                    <p className="text-sm text-gray-700 capitalize">{paymentMethod}</p>
                    {paymentMethod === 'pix' && (
                      <p className="text-sm text-green-700 mt-1">5% de desconto aplicado</p>
                    )}
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="mt-3 text-sm font-medium text-gray-700 hover:text-gray-900 underline"
                    >
                      Alterar pagamento
                    </button>
                  </div>

                  {/* Items Summary */}
                  <div className="mb-6">
                    <h3 className="font-medium text-gray-900 mb-3">Itens do pedido</h3>
                    <div className="space-y-3 max-h-60 overflow-y-auto">
                      {cart.items.map((item) => (
                        <div key={item.productId} className="flex gap-3">
                          <img
                            src={item.snapshot.image}
                            alt={item.snapshot.name}
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{item.snapshot.name}</p>
                            <p className="text-sm text-gray-500">Qtd: {item.quantity}</p>
                            <p className="text-sm font-semibold text-gray-900">{formatPrice(item.snapshot.price * item.quantity)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Final Submit */}
                <div className="bg-white rounded-xl border border-gray-100 p-6">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-4 bg-black text-white font-semibold text-lg rounded-lg hover:bg-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Processando...' : 'Confirmar pedido'}
                  </button>
                  <p className="mt-3 text-center text-xs text-gray-500">
                    Ao confirmar, você concorda com nossos
                    <a href="#" className="underline hover:text-gray-700">Termos de Uso</a>
                  </p>
                </div>
              </form>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <aside className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-gray-100 p-6 sticky top-24">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Resumo</h2>

              <dl className="space-y-3 text-sm mb-4">
                <div className="flex justify-between">
                  <dt className="text-gray-600">Subtotal ({itemCount} itens)</dt>
                  <dd className="font-medium text-gray-900">{formatPrice(subtotal)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-600">Frete</dt>
                  <dd className="font-medium text-gray-900">
                    {shipping > 0 ? formatPrice(shipping) : 'Grátis'}
                  </dd>
                </div>
                {paymentMethod === 'pix' && (
                  <div className="flex justify-between text-green-600">
                    <dt>Desconto PIX (5%)</dt>
                    <dd className="font-medium">-{formatPrice(Math.round(total * 0.05))}</dd>
                  </div>
                )}
              </dl>

              <div className="border-t border-gray-100 pt-4">
                <div className="flex justify-between text-base font-semibold text-gray-900">
                  <dt>Total</dt>
                  <dd>
                    {paymentMethod === 'pix'
                      ? formatPrice(Math.round(total * 0.95))
                      : formatPrice(total)}
                  </dd>
                </div>
              </div>

              <p className="mt-4 text-xs text-gray-500 text-center">
                {subtotal >= 19900
                  ? '✓ Frete grátis aplicado!'
                  : `Faltam ${formatPrice(19900 - subtotal)} para frete grátis`}
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}