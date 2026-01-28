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
        image: true,
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

// POST /api/admin/categories - Создать новую категорию
export async function POST(req: NextRequest) {
  try {
    if (!isAuthed(req)) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { slug, name, image } = body as {
      slug: string;
      name?: string;
      image?: string;
    };

    if (!slug || !slug.trim()) {
      return NextResponse.json(
        { success: false, message: 'slug is required' },
        { status: 400 }
      );
    }

    const category = await prisma.category.upsert({
      where: { slug: slug.trim() },
      update: {
        ...(name !== undefined ? { name: name.trim() || null } : {}),
        ...(image !== undefined ? { image: image.trim() || null } : {}),
      },
      create: {
        slug: slug.trim(),
        name: name?.trim() || slug.trim(),
        image: image?.trim() || null,
      },
    });

    return NextResponse.json({
      success: true,
      data: category,
    });
  } catch (error) {
    console.error('[admin/categories][POST] error', error);
    
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
      return NextResponse.json(
        { success: false, message: 'Категория с таким slug уже существует' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, message: 'Failed to create category', error: String(error) },
      { status: 500 }
    );
  }
}
