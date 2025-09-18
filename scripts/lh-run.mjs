#!/usr/bin/env node
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

function today() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

function run(cmd) {
  execSync(cmd, { stdio: 'inherit', env: process.env });
}

const baseOut = path.join(process.cwd(), 'public', 'reports', `lh-${today()}`);
ensureDir(baseOut);

// Usage examples:
// node scripts/lh-run.mjs catalog https://www.poj-pro.uz/catalog/ognetushiteli
// node scripts/lh-run.mjs sku-op5 https://www.poj-pro.uz/catalog/ognetushiteli/op-5

const [,, name, url] = process.argv;
if (!name || !url) {
  console.error('Usage: node scripts/lh-run.mjs <name> <url>');
  process.exit(2);
}

const outDesktop = path.join(baseOut, `${name}-desktop.html`);
const outMobile = path.join(baseOut, `${name}-mobile.html`);

run(`npx lighthouse ${url} --preset=desktop --output=html --output-path="${outDesktop}"`);
run(`npx lighthouse ${url} --preset=mobile --output=html --output-path="${outMobile}"`);

console.log(`Lighthouse reports saved to:\n - ${outDesktop}\n - ${outMobile}`);
