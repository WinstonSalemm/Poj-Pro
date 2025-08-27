import fs from 'node:fs';

export function getFileSizeKb(p: string): number|undefined {
  try { const st = fs.statSync(p); return Math.round(st.size/1024); } catch { return undefined; }
}
