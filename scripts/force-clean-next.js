// scripts/force-clean-next.js
import { rmSync } from 'fs';
import { join } from 'path';


const targets = [
  '.next',
  'node_modules/.cache/next'
];

for (const t of targets) {
  const p = join(process.cwd(), t);
  try {
    rmSync(p, { recursive: true, force: true });
    console.log(`[clean] removed: ${t}`);
  } catch (e) {
    console.warn(`[clean] skip: ${t} -> ${e.message}`);
  }
}
