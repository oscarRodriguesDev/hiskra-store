'use client';

import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';

interface MLStoredItem {
  itemId: string;
  title: string;
  price: number | null;
  currencyId: string;
  image: string;
  permalink: string;
  affiliateLink: string;
  showInStore: boolean;
  createdAt: string;
}

interface LinkPreview {
  itemId: string;
  permalink: string;
  affiliateLink: string;
  product: {
    name: string;
    price: number;
    images: string[];
  };
}

export default function AdminLinksPage() {
  const [url, setUrl] = useState('');
  const [searching, setSearching] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<LinkPreview | null>(null);
  const [items, setItems] = useState<MLStoredItem[]>([]);

  const loadItems = useCallback(async () => {
    try {
      const res = await fetch('/api/ml/links');
      const data = await res.json();
      setItems(data.items ?? []);
    } catch {
      setItems([]);
    }
  }, []);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  async function handleSearch() {
    if (!url.trim()) return;
    setSearching(true);
    setError(null);
    setPreview(null);
    try {
      const res = await fetch(`/api/ml/link?url=${encodeURIComponent(url.trim())}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Não foi possível buscar o anúncio.');
        return;
      }
      setPreview(data);
    } catch {
      setError('Erro de conexão ao buscar o anúncio.');
    } finally {
      setSearching(false);
    }
  }

  async function handleAdd() {
    if (!preview) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch('/api/ml/links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: preview.itemId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Falha ao adicionar à loja.');
        return;
      }
      setPreview(null);
      setUrl('');
      await loadItems();
    } catch {
      setError('Erro de conexão ao adicionar.');
    } finally {
      setSaving(false);
    }
  }

  async function handleToggle(item: MLStoredItem) {
    const res = await fetch(`/api/ml/links/${item.itemId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ showInStore: !item.showInStore }),
    });
    if (res.ok) await loadItems();
  }

  async function handleRemove(item: MLStoredItem) {
    if (!confirm(`Remover "${item.title}" da lista?`)) return;
    const res = await fetch(`/api/ml/links/${item.itemId}`, { method: 'DELETE' });
    if (res.ok) await loadItems();
  }

  const formatPrice = (v: number | null, currency: string) => {
    if (v === null || v === undefined) return 'Preço no ML';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: currency === 'USD' ? 'USD' : 'BRL',
    }).format(v);
  };

  return (
    <div className="py-12 bg-gray-50 min-h-screen">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <nav className="flex items-center gap-2 text-sm text-gray-500 mb-4" aria-label="Breadcrumb">
            <a href="/" className="hover:text-gray-900">Início</a>
            <span>/</span>
            <span className="text-gray-900 font-medium">Painel de links</span>
          </nav>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Painel de links</h1>
          <p className="mt-2 text-gray-600">
            Cole o link de um anúncio do Mercado Livre para buscar os dados e escolher se ele aparece na loja.
          </p>
        </div>

        {/* Buscar link */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
          <label htmlFor="ml-url" className="block text-sm font-medium text-gray-700 mb-2">
            Link do anúncio
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              id="ml-url"
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="https://www.mercadolivre.com.br/MLB-1234567890-nome-do-produto"
              className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            />
            <button
              onClick={handleSearch}
              disabled={searching || !url.trim()}
              className="px-6 py-2.5 rounded-lg bg-gray-900 text-white font-medium hover:bg-gray-800 disabled:opacity-50 transition-colors"
            >
              {searching ? 'Buscando...' : 'Buscar'}
            </button>
          </div>
          {error && (
            <p className="mt-3 text-sm text-red-600">{error}</p>
          )}
        </div>

        {/* Preview do anúncio */}
        {preview && (
          <div className="mt-6 bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Anúncio encontrado</h2>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative w-full sm:w-40 aspect-square rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                {preview.product.images[0] ? (
                  <Image
                    src={preview.product.images[0]}
                    alt={preview.product.name}
                    fill
                    sizes="160px"
                    className="object-cover"
                  />
                ) : null}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-500">ID: {preview.itemId}</p>
                <h3 className="mt-1 text-lg font-semibold text-gray-900 line-clamp-2">
                  {preview.product.name}
                </h3>
                <p className="mt-2 text-2xl font-bold text-gray-900">
                  {formatPrice(preview.product.price, 'BRL')}
                </p>
                <a
                  href={preview.permalink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-block text-sm font-medium text-blue-600 hover:text-blue-800"
                >
                  Ver anúncio original ↗
                </a>
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <button
                onClick={handleAdd}
                disabled={saving}
                className="px-6 py-2.5 rounded-lg bg-gray-900 text-white font-medium hover:bg-gray-800 disabled:opacity-50 transition-colors"
              >
                {saving ? 'Adicionando...' : 'Adicionar à loja'}
              </button>
            </div>
          </div>
        )}

        {/* Lista de itens salvos */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Itens salvos
            <span className="ml-2 text-sm font-normal text-gray-500">({items.length})</span>
          </h2>

          {items.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-100 p-8 text-center text-gray-500">
              Nenhum item salvo ainda. Cole um link acima para começar.
            </div>
          ) : (
            <ul className="space-y-3">
              {items.map((item) => (
                <li
                  key={item.itemId}
                  className={`bg-white rounded-xl border p-4 shadow-sm flex items-center gap-4 ${
                    item.showInStore ? 'border-gray-200' : 'border-gray-200 opacity-70'
                  }`}
                >
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                    {item.image ? (
                      <Image src={item.image} alt={item.title} fill sizes="64px" className="object-cover" />
                    ) : null}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-500 truncate">{item.itemId}</p>
                    <h3 className="text-base font-semibold text-gray-900 line-clamp-1">{item.title}</h3>
                    <p className="text-sm font-bold text-gray-700 mt-0.5">
                      {formatPrice(item.price, item.currencyId)}
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row items-center gap-2 flex-shrink-0">
                    <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-700">
                      <input
                        type="checkbox"
                        checked={item.showInStore}
                        onChange={() => handleToggle(item)}
                        className="w-4 h-4 text-gray-900 border-gray-300 rounded focus:ring-gray-500"
                      />
                      Mostrar na loja
                    </label>
                    <button
                      onClick={() => handleRemove(item)}
                      className="text-sm text-red-600 hover:text-red-800 font-medium"
                      aria-label={`Remover ${item.title}`}
                    >
                      Remover
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}