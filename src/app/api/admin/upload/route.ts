import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function isAuthed(request: Request): boolean {
  const token = request.headers.get('x-admin-token');
  const adminPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'admin-ship-2025';
  return token === adminPassword;
}

// POST /api/admin/upload - Загрузка изображений
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

    const uploadedPaths: string[] = [];
    const uploadDir = join(process.cwd(), 'public', 'ProductImages');

    // Создаём папку, если её нет
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    for (const file of files) {
      // Проверяем тип файла
      if (!file.type.startsWith('image/')) {
        continue; // Пропускаем не-изображения
      }

      // Генерируем уникальное имя файла
      const timestamp = Date.now();
      const randomStr = Math.random().toString(36).substring(2, 8);
      const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const extension = originalName.split('.').pop() || 'png';
      const fileName = `${timestamp}-${randomStr}.${extension}`;
      const filePath = join(uploadDir, fileName);

      // Конвертируем File в Buffer и сохраняем
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      await writeFile(filePath, buffer);

      // Возвращаем путь для использования в форме
      uploadedPaths.push(`/ProductImages/${fileName}`);
    }

    if (uploadedPaths.length === 0) {
      return NextResponse.json(
        { success: false, message: 'No valid image files uploaded' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { paths: uploadedPaths },
    });
  } catch (error) {
    console.error('[admin/upload][POST] error', error);
    return NextResponse.json(
      { success: false, message: 'Failed to upload files', error: String(error) },
      { status: 500 }
    );
  }
}
