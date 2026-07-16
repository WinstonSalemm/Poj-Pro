import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { serializeJSON } from '@/lib/json';
import { requireAdmin } from '@/lib/requireAdmin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// DELETE /api/admin/popular-products/[id] - удалить товар из популярных
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authError = await requireAdmin();
    if (authError) return authError;

    const { id } = await params;

    await prisma.popularProduct.delete({
      where: { id },
    });

    return NextResponse.json(serializeJSON({ success: true }), { status: 200 });
  } catch (error) {
    console.error('[admin/popular-products][DELETE] error', error);
    return NextResponse.json({ success: false, message: 'Failed to delete popular product' }, { status: 500 });
  }
}
