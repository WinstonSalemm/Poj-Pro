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

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Проверяем тип файла
      if (!file.type.startsWith('image/')) {
        console.log(`[upload] Skipping non-image file: ${file.name}`);
        continue; // Пропускаем не-изображения
      }

      // Генерируем уникальное имя файла с индексом для гарантии уникальности
      const timestamp = Date.now();
      const randomStr = Math.random().toString(36).substring(2, 15); // Увеличил длину
      const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const extension = originalName.split('.').pop()?.toLowerCase() || 'png';
      const fileName = `${timestamp}-${i}-${randomStr}.${extension}`;
      const filePath = join(uploadDir, fileName);

      console.log(`[upload] Processing file ${i + 1}/${files.length}:`, {
        originalName: file.name,
        newFileName: fileName,
        fileSize: file.size,
        fileType: file.type,
      });

      // Конвертируем File в Buffer и сохраняем
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      console.log(`[upload] Writing file to: ${filePath}, size: ${buffer.length} bytes`);
      await writeFile(filePath, buffer);
      
      // Небольшая задержка между файлами для гарантии уникальности timestamp
      if (i < files.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 10));
      }

      // Возвращаем путь для использования в форме
      const publicPath = `/ProductImages/${fileName}`;
      uploadedPaths.push(publicPath);
      console.log(`[upload] File saved successfully: ${publicPath}`);
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
