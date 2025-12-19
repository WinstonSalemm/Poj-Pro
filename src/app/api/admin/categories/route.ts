import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function isAuthed(request: Request): boolean {
  const token = request.headers.get('x-admin-token');
  const adminPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'admin-ship-2025';
  return token === adminPassword;
}

// GET /api/admin/categories - Получить все категории для админа
export async function GET(req: NextRequest) {
  try {
    if (!isAuthed(req)) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const categories = await prisma.category.findMany({
      orderBy: [
        { name: 'asc' },
        { slug: 'asc' },
      ],
      select: {
        id: true,
        slug: true,
        name: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    console.error('[admin/categories][GET] error', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch categories', error: String(error) },
      { status: 500 }
    );
  }
}
