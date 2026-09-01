import { NextRequest, NextResponse } from 'next/server';
import { updateStoredItem, removeStoredItem } from '@/lib/ml-store';
import { isAdminRequest } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

/**
 * PATCH /api/ml/links/:itemId
 * { "showInStore": true | false } — mostra/oculta na loja
 * { "images": ["https://..." ] } — define a galeria de fotos manualmente
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ itemId: string }> }
) {
  // Apenas o admin autenticado pode alterar itens
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
  }

  const { itemId } = await params;
  let body: { showInStore?: boolean; images?: string[] };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Corpo da requisição inválido.' }, { status: 400 });
  }

  const patch: { showInStore?: boolean; images?: string[] } = {};
  if (typeof body.showInStore === 'boolean') patch.showInStore = body.showInStore;
  if (Array.isArray(body.images)) {
    patch.images = body.images
      .map((u) => u.trim())
      .filter((u) => /^https?:\/\//i.test(u));
  }

  const item = await updateStoredItem(itemId, patch);
  if (!item) {
    return NextResponse.json({ error: 'Item não encontrado.' }, { status: 404 });
  }

  return NextResponse.json({ item });
}

/**
 * DELETE /api/ml/links/:itemId — remove o item da lista
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ itemId: string }> }
) {
  // Apenas o admin autenticado pode remover itens
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
  }

  const { itemId } = await params;
  const removed = await removeStoredItem(itemId);
  if (!removed) {
    return NextResponse.json({ error: 'Item não encontrado.' }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}