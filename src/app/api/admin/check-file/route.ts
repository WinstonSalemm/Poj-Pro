import { NextRequest, NextResponse } from 'next/server';
import { access } from 'fs/promises';
import { join } from 'path';
import { existsSync, readdirSync } from 'fs';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function isAuthed(request: Request): boolean {
  const token = request.headers.get('x-admin-token');
  const adminPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'admin-ship-2025';
  return token === adminPassword;
}

// GET /api/admin/check-file - Проверка доступа к файлам
export async function GET(request: NextRequest) {
  try {
    if (!isAuthed(request)) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const fileName = searchParams.get('file');

    const publicDir = join(process.cwd(), 'public');
    const uploadDir = join(publicDir, 'ProductImages');

    // Общая информация о директориях
    const result: Record<string, unknown> = {
      cwd: process.cwd(),
      publicDir,
      uploadDir,
      publicDirExists: existsSync(publicDir),
      uploadDirExists: existsSync(uploadDir),
    };

    if (fileName) {
      const filePath = join(uploadDir, fileName);
      const publicPath = `/ProductImages/${fileName}`;
      
      result.file = fileName;
      result.filePath = filePath;
      result.publicPath = publicPath;
      result.fileExists = existsSync(filePath);
      
      if (result.fileExists) {
        try {
          await access(filePath);
          result.fileAccessible = true;
        } catch (err) {
          result.fileAccessible = false;
          result.fileAccessError = String(err);
        }
      }
    }

    // Список файлов в директории (первые 20)
    if (existsSync(uploadDir)) {
      try {
        const files = readdirSync(uploadDir).slice(0, 20);
        result.recentFiles = files;
        result.totalFiles = readdirSync(uploadDir).length;
      } catch (err) {
        result.readdirError = String(err);
      }
    }

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('[admin/check-file][GET] error', error);
    return NextResponse.json(
      { success: false, message: 'Failed to check file', error: String(error) },
      { status: 500 }
    );
  }
}
