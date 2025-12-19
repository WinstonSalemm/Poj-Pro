import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function isAuthed(request: Request): boolean {
  const token = request.headers.get('x-admin-token');
  const adminPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'admin-ship-2025';
  return token === adminPassword;
}

// POST /api/admin/products/new/move-all-to-main - Перевести все новые товары в основную массу
export async function POST(req: NextRequest) {
  try {
    if (!isAuthed(req)) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    // Новые товары: созданы за последние 14 дней
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

    // Базовые условия
    const whereClause: any = {
      isActive: true,
      createdAt: { gte: fourteenDaysAgo },
    };

    // Устанавливаем дату создания на 15 дней назад для всех найденных товаров (новые = за последние 14 дней)
    const oldDate = new Date();
    oldDate.setDate(oldDate.getDate() - 15);

    const result = await prisma.product.updateMany({
      where: whereClause,
      data: {
        createdAt: oldDate,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Переведено товаров в основную массу: ${result.count}`,
      count: result.count,
    });
  } catch (error) {
    console.error('[admin/products/new/move-all-to-main][POST] error', error);
    return NextResponse.json(
      { success: false, message: 'Failed to move products', error: String(error) },
      { status: 500 }
    );
  }
}
