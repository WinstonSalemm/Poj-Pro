import fs from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import type { SupplyItem } from '@/types/content';

const ROOT = process.cwd();
const JSON_PATH = path.join('src', 'imports', 'supplies.json');

export async function loadSupplies(): Promise<SupplyItem[]> {
  const abs = path.join(ROOT, JSON_PATH);
  if (!fs.existsSync(abs)) return [];
  const raw = fs.readFileSync(abs, 'utf8');
  const arr = JSON.parse(raw) as SupplyItem[];
  return arr
    .slice(0, 5)
    .map((x) => ({ ...x, id: x.id ?? randomUUID() }));
}
