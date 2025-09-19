#!/usr/bin/env node
/*
  extract-analyze-summary.mjs
  Parses .next/analyze/client.html and prints a concise bundle summary:
  - Total parsed size across nodes (approx)
  - Estimated "shared/common/framework" sum (by label match)
  - Top N largest nodes (by parsed size)

  Usage:
    node scripts/extract-analyze-summary.mjs [--file .next/analyze/client.html] [--top 15]
*/

import fs from 'node:fs/promises';
import path from 'node:path';

const args = process.argv.slice(2);
const getArg = (name, def) => {
  const idx = args.findIndex((a) => a === name || a.startsWith(name + '='));
  if (idx === -1) return def;
  const val = args[idx].includes('=') ? args[idx].split('=').slice(1).join('=') : args[idx + 1];
  return val ?? def;
};

const fileDefault = path.join('.next', 'analyze', 'client.html');
const filePath = path.resolve(getArg('--file', fileDefault));
const topN = Number(getArg('--top', '15')) || 15;

const LABEL_SHARED_RE = /(shared|common|commons|framework)/i;

function formatBytes(bytes) {
  if (!Number.isFinite(bytes)) return '0 B';
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} kB`;
  const mb = kb / 1024;
  return `${mb.toFixed(2)} MB`;
}

function flattenNodes(node, out) {
  if (!node || typeof node !== 'object') return;
  const size = Number(node.parsedSize ?? node.size ?? node.statSize ?? 0);
  const label = String(node.label ?? node.name ?? '')
    .replace(/^\/+/, '')
    .replace(/\\/g, '/');
  out.push({ label, size });
  if (Array.isArray(node.children)) {
    for (const ch of node.children) flattenNodes(ch, out);
  }
}

async function main() {
  const html = await fs.readFile(filePath, 'utf8');

  // Extract window.chartData = ... ; (array or object). Use non-greedy up to the first matching ";\n".
  const m = html.match(/window\.chartData\s*=\s*(\[[\s\S]*?\]);/);
  if (!m) {
    console.error('[analyze] Could not find window.chartData in', filePath);
    process.exitCode = 1;
    return;
  }

  let chartRaw = m[1];
  // Some builds can include trailing comments, attempt a minimal cleanup.
  try {
    const chartData = JSON.parse(chartRaw);
    // chartData can be an array of roots or a single root; normalize to array
    const roots = Array.isArray(chartData) ? chartData : [chartData];

    // Flatten
    const flat = [];
    for (const r of roots) flattenNodes(r, flat);

    // Summaries
    const totalParsed = flat.reduce((s, n) => s + (n.size || 0), 0);
    const sharedSum = flat
      .filter((n) => LABEL_SHARED_RE.test(n.label))
      .reduce((s, n) => s + (n.size || 0), 0);

    const top = [...flat]
      .sort((a, b) => (b.size || 0) - (a.size || 0))
      .slice(0, topN);

    // Group by top-level segment (before first /)
    const bySegment = new Map();
    for (const n of flat) {
      const seg = n.label.split('/')[0] || 'root';
      bySegment.set(seg, (bySegment.get(seg) || 0) + (n.size || 0));
    }
    const topSegments = [...bySegment.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([seg, size]) => ({ seg, size }));

    // Output
    console.log('— Next.js Analyze Summary —');
    console.log('File:', filePath);
    console.log('Total Parsed (approx):', formatBytes(totalParsed));
    console.log('Estimated Shared/Common/Framework (by label match):', formatBytes(sharedSum));
    console.log('\nTop', topN, 'nodes by parsed size:');
    for (const n of top) {
      console.log('  -', formatBytes(n.size).padEnd(9), n.label);
    }
    console.log('\nTop segments:');
    for (const t of topSegments) {
      console.log('  -', formatBytes(t.size).padEnd(9), t.seg);
    }
  } catch (e) {
    console.error('[analyze] Failed to parse chartData JSON. Error:', e?.message || e);
    process.exitCode = 1;
  }
}

main().catch((e) => {
  console.error('[analyze] Unexpected error:', e?.message || e);
  process.exitCode = 1;
});
