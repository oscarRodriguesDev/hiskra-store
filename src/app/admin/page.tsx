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

/** Produto vindo do scraping da vitrine (sem credenciais) */
interface ScrapedMLProduct {
  itemId?: string;
  productId?: string;
  userProductId?: string;
  title: string;
  price: number;
  currency: string;
  originalPrice: number | null;
  imageUrl: string;
  permalink: string;
  affiliateUrl: string;
}

/** Produto vindo da API (formato antigo MLB...) */
interface ApiSingle {
  type: 'single';
  itemId: string;
  permalink: string;
  affiliateLink: string;
  product: {
    name: string;
    price: number;
    images: string[];
  };
}

type SearchResult =
  | ApiSingle
  | { type: 'list'; source: string; products: ScrapedMLProduct[]; count: number };

export default function AdminLinksPage() {
  const [url, setUrl] = useState('');
  const [searching, setSearching] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SearchResult | null>(null);
  const [items, setItems] = useState<MLStoredItem[]>([]);
  const [mlStatus, setMlStatus] = useState<{ connected: boolean; message: string; loading: boolean }>({
    connected: false,
    message: '',
    loading: true,
  });

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
    fetch('/api/admin/ml-status')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) =>
        setMlStatus({
          connected: data?.connected ?? false,
          message: data?.message || '',
          loading: false,
        })
      )
      .catch(() => setMlStatus({ connected: false, message: '', loading: false }));
  }, [loadItems]);

  async function handleSearch() {
    if (!url.trim()) return;
    setSearching(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch(`/api/ml/link?url=${encodeURIComponent(url.trim())}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Não foi possível buscar o anúncio.');
        return;
      }
      setResult(data);
    } catch {
      setError('Erro de conexão ao buscar o anúncio.');
    } finally {
      setSearching(false);
    }
  }

  async function addToStore(payload: { url?: string; item?: ScrapedMLProduct }) {
    setSavingId(payload.url || payload.item?.permalink || 'saving');
    setError(null);
    try {
      const res = await fetch('/api/ml/links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Falha ao adicionar à loja.');
        return;
      }
      await loadItems();
    } catch {
      setError('Erro de conexão ao adicionar.');
    } finally {
      setSavingId(null);
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

  const formatPrice = (v: number | null | undefined, currency: string) => {
    if (v === null || v === undefined) return 'A consultar';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: currency === 'USD' ? 'USD' : 'BRL',
    }).format(v);
  };

  return (
    <div className="py-12 bg-gray-50 min-h-screen">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <nav className="flex items-center gap-2 text-sm text-gray-500 mb-4" aria-label="Breadcrumb">
            <a href="/" className="hover:text-gray-900">Início</a>
            <span>/</span>
            <span className="text-gray-900 font-medium">Painel de links</span>
          </nav>
          <div className="flex items-center justify-between gap-4">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Painel de links</h1>
            <button
              onClick={() => {
                fetch('/api/admin/logout', { method: 'POST' }).then(() => {
                  window.location.href = '/login';
                });
              }}
              className="shrink-0 px-4 py-2 rounded-lg border border-gray-300 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
            >
              Sair
            </button>
          </div>
          <p className="mt-2 text-gray-600">
            Cole seu link de afiliado (ex: <span className="font-mono text-sm">https://meli.la/XXXXXX</span>) e o
            sistema busca os anúncios da sua vitrine — sem credenciais. Escolha quais mostrar na loja.
          </p>
          <p className="mt-2 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
            Cada produto salvo usa o link da sua vitrine com o seu vínculo (matt_word/matt_tool) — toda venda
            feita por esses links é atribuída a você.
          </p>

          {/* Status da API do Mercado Livre (galeria de fotos) */}
          {!mlStatus.loading && !mlStatus.connected && (
            <div className="mt-3 text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
              <strong>Galeria de fotos:</strong> {mlStatus.message}{' '}
              <a
                href="/api/auth/ml/auth"
                className="underline font-medium hover:text-amber-900"
              >
                Conectar app do Mercado Livre
              </a>
            </div>
          )}
          {mlStatus.connected && (
            <div className="mt-3 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
              <strong>API do Mercado Livre conectada</strong> — galeria de fotos ativa.
            </div>
          )}
        </div>

        {/* Buscar link */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
          <label htmlFor="ml-url" className="block text-sm font-medium text-gray-700 mb-2">
            Link de afiliado ou ID do anúncio
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              id="ml-url"
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="https://meli.la/1PAVx9r"
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
          {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
        </div>

        {/* Resultado: produto único (API) ou lista da vitrine (scraping) */}
        {result && result.type === 'single' && (
          <div className="mt-6 bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Anúncio encontrado</h2>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative w-full sm:w-40 aspect-square rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                {result.product.images[0] ? (
                  <Image
                    src={result.product.images[0]}
                    alt={result.product.name}
                    fill
                    sizes="160px"
                    className="object-cover"
                  />
                ) : null}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-500">ID: {result.itemId}</p>
                <h3 className="mt-1 text-lg font-semibold text-gray-900 line-clamp-2">
                  {result.product.name}
                </h3>
                <p className="mt-2 text-2xl font-bold text-gray-900">
                  {formatPrice(result.product.price, 'BRL')}
                </p>
                <a
                  href={result.permalink}
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
                onClick={() => addToStore({ url: result.itemId })}
                disabled={savingId !== null}
                className="px-6 py-2.5 rounded-lg bg-gray-900 text-white font-medium hover:bg-gray-800 disabled:opacity-50 transition-colors"
              >
                {savingId ? 'Adicionando...' : 'Adicionar à loja'}
              </button>
            </div>
          </div>
        )}

        {result && result.type === 'list' && (
          <div className="mt-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-1">
              Produtos encontrados na sua vitrine
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              {result.count} anúncio{result.count !== 1 ? 's' : ''}. Clique em adicionar nos que quiser na loja.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {result.products.map((p, i) => (
                <div key={p.permalink || i} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm flex gap-4">
                  <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                    {p.imageUrl ? (
                      <Image src={p.imageUrl} alt={p.title} fill sizes="96px" className="object-cover" />
                    ) : null}
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col">
                    <p className="text-xs font-medium text-gray-500">
                      {p.itemId || p.productId || p.userProductId || 'Anúncio'}
                    </p>
                    <h3 className="mt-1 text-sm font-semibold text-gray-900 line-clamp-2">{p.title}</h3>
                    <div className="mt-auto flex items-end justify-between gap-2 pt-2">
                      <div>
                        <span className="text-lg font-bold text-gray-900">
                          {formatPrice(p.price, p.currency)}
                        </span>
                        {p.originalPrice ? (
                          <span className="ml-2 text-sm text-gray-400 line-through">
                            {formatPrice(p.originalPrice, p.currency)}
                          </span>
                        ) : null}
                      </div>
                      <button
                        onClick={() => addToStore({ item: p })}
                        disabled={savingId !== null}
                        className="px-4 py-2 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 disabled:opacity-50 transition-colors"
                      >
                        {savingId === p.permalink ? 'Adicionando...' : 'Adicionar'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Lista de itens salvos */}
        <div className="mt-10">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Itens salvos
            <span className="ml-2 text-sm font-normal text-gray-500">({items.length})</span>
          </h2>

          {items.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-100 p-8 text-center text-gray-500">
              Nenhum item salvo ainda. Cole seu link de afiliado acima para começar.
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