import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { serializeJSON } from '@/lib/json';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

function isAuthed(request: Request): boolean {
  const token = request.headers.get('x-admin-token');
  const adminPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'admin-ship-2025';
  return token === adminPassword;
}

// DELETE /api/admin/popular-products/[id] - удалить товар из популярных
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!isAuthed(request)) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

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
