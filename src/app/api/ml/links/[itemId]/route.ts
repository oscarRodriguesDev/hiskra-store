import { NextRequest, NextResponse } from 'next/server';
import { updateStoredItem, removeStoredItem } from '@/lib/ml-store';

export const dynamic = 'force-dynamic';

/**
 * PATCH /api/ml/links/:itemId
 * { "showInStore": true | false } — mostra/oculta na loja
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ itemId: string }> }
) {
  const { itemId } = await params;
  let body: { showInStore?: boolean };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Corpo da requisição inválido. Envie JSON com { "showInStore": true|false }.' }, { status: 400 });
  }

  const item = await updateStoredItem(itemId, { showInStore: body.showInStore });
  if (!item) {
    return NextResponse.json({ error: 'Item não encontrado.' }, { status: 404 });
  }

  return NextResponse.json({ item });
}

/**
 * DELETE /api/ml/links/:itemId — remove o item da lista
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ itemId: string }> }
) {
  const { itemId } = await params;
  const removed = await removeStoredItem(itemId);
  if (!removed) {
    return NextResponse.json({ error: 'Item não encontrado.' }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}