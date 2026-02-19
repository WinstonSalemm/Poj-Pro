import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir, access } from 'fs/promises';
import { join, resolve } from 'path';
import { randomUUID } from 'crypto';
import { existsSync } from 'fs';
import sharp from 'sharp';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function isAuthed(request: Request): boolean {
  const token = request.headers.get('x-admin-token');
  const adminPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'admin-ship-2025';
  return token === adminPassword;
}

const PASSTHROUGH_MIME_TYPES = new Set<string>([
  // Keep original bytes (sharp либо не нужен, либо может сломать анимацию/вектор)
  'image/gif',
  'image/svg+xml',
]);

const ALLOWED_MIME_TYPES = new Set<string>([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
  ...PASSTHROUGH_MIME_TYPES,
]);

function getExtensionFromName(filename: string): string | undefined {
  const lastDot = filename.lastIndexOf('.');
  if (lastDot === -1) return undefined;
  const ext = filename.slice(lastDot + 1).toLowerCase();
  return ext || undefined;
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
    // Используем process.cwd() для получения корня проекта
    const publicDir = join(process.cwd(), 'public');
    const uploadDir = join(publicDir, 'ProductImages');

    console.log('[upload] Public directory:', publicDir);
    console.log('[upload] Upload directory:', uploadDir);

    // Проверяем существование public директории
    try {
      await access(publicDir);
      console.log('[upload] Public directory exists');
    } catch (err) {
      console.error('[upload] Public directory does not exist:', err);
      return NextResponse.json(
        { success: false, message: 'Директория public не найдена' },
        { status: 500 }
      );
    }

    // Создаём папку ProductImages, если её нет
    if (!existsSync(uploadDir)) {
      console.log('[upload] Creating upload directory:', uploadDir);
      await mkdir(uploadDir, { recursive: true });
    }

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // Проверяем тип файла
      if (!file.type.startsWith('image/')) {
        console.log(`[upload] Skipping non-image file: ${file.name}`);
        continue; // Пропускаем не-изображения
      }

      console.log(`[upload] Processing file ${i + 1}/${files.length}:`, {
        originalName: file.name,
        fileSize: file.size,
        fileType: file.type,
      });

      // Конвертируем File в Buffer
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Валидация формата: некоторые "image/*" (например HEIC) часто не отображаются в браузере
      // и/или не поддерживаются на сервере. Чтобы не было ощущения, что "загрузился баннер",
      // приводим растровые изображения к webp (кроме gif/svg), либо отклоняем загрузку.
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

      let outputBuffer = buffer;
      let outputExt = inputExt;

      if (!PASSTHROUGH_MIME_TYPES.has(file.type)) {
        try {
          // normalize orientation, strip metadata, convert to webp for reliable browser display
          outputBuffer = await sharp(buffer, { failOn: 'none' })
            .rotate()
            .webp({ quality: 82 })
            .toBuffer();
          outputExt = 'webp';
        } catch (e) {
          console.error('[upload] sharp convert error', e);
          return NextResponse.json(
            {
              success: false,
              message: `Не удалось обработать изображение. Попробуйте JPG/PNG/WEBP. (Файл: ${file.name})`,
            },
            { status: 400 }
          );
        }
      }

      // Генерируем уникальное имя файла без зависимости от исходного имени
      const fileName = `${Date.now()}-${randomUUID()}.${outputExt}`;
      const filePath = join(uploadDir, fileName);

      console.log(`[upload] Writing file to: ${filePath}, size: ${outputBuffer.length} bytes`);
      await writeFile(filePath, outputBuffer);

      // Проверяем что файл действительно записался
      try {
        await access(filePath);
        console.log('[upload] File written successfully:', filePath);
      } catch (accessErr) {
        console.error('[upload] Failed to verify file after write:', accessErr);
        throw new Error(`Не удалось сохранить файл: ${fileName}`);
      }

      // Возвращаем путь для использования в форме
      // Используем resolve для уверенности в правильности пути
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
      message: `Загружено файлов: ${uploadedPaths.length}`,
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
