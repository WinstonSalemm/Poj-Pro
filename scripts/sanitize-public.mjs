#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

const root = process.cwd();
const publicDir = path.join(root, 'public');

/**
 * Allowed exceptions inside public/ for text assets
 */
const ALLOW = new Set([
  'robots.txt',
]);

/**
 * Returns true if a file under public/ is allowed although it matches an extension
 */
function isAllowedException(relPath) {
  const base = path.basename(relPath);
  if (ALLOW.has(base)) return true;
  if (/^.+\.webmanifest$/i.test(base)) return true;
  return false;
}

const offenders = [];

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    const rel = path.relative(publicDir, full).replace(/\\/g, '/');
    if (e.isDirectory()) {
      walk(full);
    } else {
      const ext = path.extname(e.name).toLowerCase();
      if (ext === '.html' || ext === '.js' || ext === '.css') {
        if (!isAllowedException(rel)) {
          offenders.push(rel);
        }
      }
      // Extra: detect vite-linked artifacts in any text file
      if (ext === '.html' || ext === '.js' || ext === '.css' || ext === '.map') {
        try {
          const content = fs.readFileSync(full, 'utf8');
          if (/localhost:5173|\bvite\b|vite\/deps|react_refresh/i.test(content)) {
            offenders.push(rel + ' (contains Vite/dev markers)');
          }
        } catch {}
      }
    }
  }
}

if (!fs.existsSync(publicDir)) {
  console.log('No public/ directory — skipping sanitize');
  process.exit(0);
}

walk(publicDir);

if (offenders.length) {
  console.error('[sanitize:public] Disallowed files found in public/:');
  for (const f of offenders) console.error(' -', f);
  console.error('\nMove legacy static site/Vite artifacts out of public/ (e.g., legacy_public_vite/).');
  process.exit(1);
}

console.log('[sanitize:public] OK — no disallowed files in public/.');
