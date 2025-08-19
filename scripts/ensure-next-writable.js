// scripts/ensure-next-writable.js
import { mkdirSync, writeFileSync, rmSync } from 'fs';
import { join, dirname } from 'path';

const cwd = process.cwd();
const isOneDrive = /OneDrive/i.test(cwd) || /OneDrive/i.test(process.env.ONEDRIVE || '');

function tryWrite(filePath) {
  try {
    mkdirSync(dirname(filePath), { recursive: true });
    writeFileSync(filePath, String(Date.now()), 'utf8');
    rmSync(filePath, { force: true });
    return true;
  } catch (e) {
    if (e && e.code === 'EPERM') return false;
    // другие ошибки считаем не критичными
    return true;
  }
}

// 1) Сносим возможный «битый» .next
try {
  rmSync(join(cwd, '.next'), { recursive: true, force: true });
} catch {}

// 2) Пробная запись в будущую папку сборки (по умолчанию .next)
const testFileDefault = join(cwd, '.next', 'write.test');
const okDefault = tryWrite(testFileDefault);

// 3) Если в OneDrive или запись не удалась — совет и аварийная остановка
if (!okDefault) {
  console.error('\n[predev] EPERM: не удалось записать в .next (обычно из-за OneDrive/антивируса).');
  console.error('[predev] Рекомендация: перенесите проект из OneDrive (напр. C:\\dev\\site) ИЛИ поставьте OneDrive на паузу.');
  console.error('[predev] Временно можно использовать альтернативный distDir (node_modules/.cache/next).');
  process.exit(1);
}

// 4) Доп. предупреждение, если проект в OneDrive
if (isOneDrive) {
  console.warn('\n[predev] Внимание: проект находится в OneDrive. Это часто вызывает EPERM локи.');
  console.warn('[predev] Рекомендуется перенести проект вне OneDrive. Продолжаем запуск…\n');
}
