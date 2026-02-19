import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { randomUUID } from 'crypto';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function isAuthed(request: Request): boolean {
  const token = request.headers.get('x-admin-token');
  const adminPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'admin-ship-2025';
  return token === adminPassword;
}

const ALLOWED_MIME_TYPES = new Set<string>([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
  'image/gif',
  'image/svg+xml',
]);

function getExtensionFromName(filename: string): string | undefined {
  const lastDot = filename.lastIndexOf('.');
  if (lastDot === -1) return undefined;
  const ext = filename.slice(lastDot + 1).toLowerCase();
  return ext || undefined;
}

// POST /api/admin/upload - Загрузка изображений в базу данных
export async function POST(request: NextRequest) {
  try {
    if (!isAuthed(request)) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const files = formData.getAll('files') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ success: false, message: 'No files provided' }, { status: 400 });
    }

    const uploadedImages: Array<{ id: string; url: string; data: string }> = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // Проверяем тип файла
      if (!file.type.startsWith('image/')) {
        console.log(`[upload] Skipping non-image file: ${file.name}`);
        continue;
      }

      console.log(`[upload] Processing file ${i + 1}/${files.length}:`, {
        originalName: file.name,
        fileSize: file.size,
        fileType: file.type,
      });

      // Валидация формата
      const inputExt = getExtensionFromName(file.name) || 'png';
      const isAllowed = ALLOWED_MIME_TYPES.has(file.type);
      if (!isAllowed) {
        return NextResponse.json(
          {
            success: false,
            message: `Неподдерживаемый формат изображения: ${file.type || inputExt}. Загрузите JPG/PNG/WEBP/AVIF (GIF/SVG тоже поддерживаются).`,
          },
          { status: 400 }
        );
      }

      // Конвертируем File в ArrayBuffer для сохранения в БД
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Генерируем уникальный ID для изображения
      const imageId = randomUUID();
      const fileName = `${Date.now()}-${imageId}.${inputExt}`;
      
      // URL для отображения (будет загружаться через API)
      const imageUrl = `/api/admin/image/${imageId}`;

      console.log(`[upload] Saving image to database: ${fileName}, size: ${buffer.length} bytes`);

      // Сохраняем в базу данных сразу (без productId, привяжем позже при сохранении товара)
      await prisma.productImage.create({
        data: {
          id: imageId,
          url: imageUrl,
          data: buffer,
          order: 0,
          // productId не указываем - привяжем при сохранении товара
        },
      });

      console.log(`[upload] Image saved to DB with ID: ${imageId}`);

      uploadedImages.push({
        id: imageId,
        url: imageUrl,
        data: buffer.toString('base64'), // Кодируем в base64 для превью на фронте
      });
    }

    if (uploadedImages.length === 0) {
      return NextResponse.json(
        { success: false, message: 'No valid image files uploaded' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { 
        images: uploadedImages,
        message: `Загружено файлов: ${uploadedImages.length}`,
      },
    });
  } catch (error) {
    console.error('[admin/upload][POST] error', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to upload files', 
        error: String(error),
        details: error instanceof Error ? { message: error.message, stack: error.stack } : undefined
      },
      { status: 500 }
    );
  }
}
