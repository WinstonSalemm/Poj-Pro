import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// GET /api/admin/image/[id] - Отдача изображения из базы данных
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: 'Image ID required' }, { status: 400 });
    }

    // Ищем изображение в ProductImage
    const productImage = await prisma.productImage.findFirst({
      where: { id },
      select: { data: true, url: true },
    });

    if (productImage?.data) {
      // Prisma возвращает Uint8Array для Bytes полей
      const buffer = Buffer.from(productImage.data);
      const contentType = getContentType(productImage.url || '');
      
      return new NextResponse(buffer, {
        headers: {
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
      });
    }

    // Ищем в Category
    const categoryImage = await prisma.category.findFirst({
      where: { id },
      select: { imageData: true, image: true },
    });

    if (categoryImage?.imageData) {
      const buffer = Buffer.from(categoryImage.imageData);
      const contentType = getContentType(categoryImage.image || '');
      
      return new NextResponse(buffer, {
        headers: {
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
      });
    }

    return NextResponse.json({ error: 'Image not found' }, { status: 404 });
  } catch (error) {
    console.error('[admin/image][GET] error:', error);
    return NextResponse.json(
      { error: 'Failed to load image' },
      { status: 500 }
    );
  }
}

function getContentType(url: string): string {
  if (url.endsWith('.png')) return 'image/png';
  if (url.endsWith('.jpg') || url.endsWith('.jpeg')) return 'image/jpeg';
  if (url.endsWith('.webp')) return 'image/webp';
  if (url.endsWith('.avif')) return 'image/avif';
  if (url.endsWith('.gif')) return 'image/gif';
  if (url.endsWith('.svg')) return 'image/svg+xml';
  return 'image/jpeg'; // default
}
