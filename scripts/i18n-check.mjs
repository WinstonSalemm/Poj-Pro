#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

const localesDir = path.resolve(process.cwd(), 'src', 'locales');
const localeMap = { ru: 'ru', en: 'eng', uz: 'uzb' }; // project currently uses eng/uzb folders
const locales = Object.keys(localeMap);

function readJson(fp) {
  try {
    const raw = fs.readFileSync(fp, 'utf8');
    return JSON.parse(raw);
  } catch (e) {
    return { __error: e.message };
  }
}

function flattenKeys(obj, prefix = '') {
  const keys = new Set();
  if (obj && typeof obj === 'object') {
    for (const [k, v] of Object.entries(obj)) {
      const full = prefix ? `${prefix}.${k}` : k;
      if (v && typeof v === 'object' && !Array.isArray(v)) {
        for (const kk of flattenKeys(v, full)) keys.add(kk);
      } else {
        keys.add(full);
      }
    }
  }
  return keys;
}

function diffSets(base, other) {
  const missingInOther = [...base].filter((k) => !other.has(k));
  const extraInOther = [...other].filter((k) => !base.has(k));
  return { missingInOther, extraInOther };
}

function color(s, c) {
  const codes = { red: '\x1b[31m', green: '\x1b[32m', yellow: '\x1b[33m', cyan: '\x1b[36m', reset: '\x1b[0m' };
  return `${codes[c] || ''}${s}${codes.reset}`;
}

let exitCode = 0;

// Load files
const files = {};
for (const [display, folder] of Object.entries(localeMap)) {
  const fp = path.join(localesDir, folder, 'translation.json');
  files[display] = { file: fp, data: readJson(fp) };
}

// Validate JSON parse
for (const [lng, { file, data }] of Object.entries(files)) {
  if (data.__error) {
    console.error(color(`✖ ${lng} JSON parse error in ${file}: ${data.__error}`,'red'));
    exitCode = 1;
  }
}

if (exitCode) process.exit(exitCode);

// Extract aboutus subtree
const about = {};
for (const [lng, { data }] of Object.entries(files)) {
  const node = data?.aboutus;
  if (!node) {
    console.error(color(`✖ ${lng}: missing top-level "aboutus" object in translation.json`, 'red'));
    exitCode = 1;
  }
  about[lng] = node || {};
}

if (exitCode) process.exit(exitCode);

const baseLng = 'ru';
const baseKeys = flattenKeys(about[baseLng]);

for (const lng of locales) {
  if (lng === baseLng) continue;
  const keys = flattenKeys(about[lng]);
  const { missingInOther, extraInOther } = diffSets(baseKeys, keys);

  if (missingInOther.length === 0 && extraInOther.length === 0) {
    console.log(color(`✔ ${lng}: keys match ${baseLng}`,'green'));
    continue;
  }

  if (missingInOther.length) {
    console.log(color(`◆ ${lng}: missing keys compared to ${baseLng}:`, 'yellow'));
    for (const k of missingInOther) console.log(`  - ${k}`);
    exitCode = 1;
  }
  if (extraInOther.length) {
    console.log(color(`◇ ${lng}: extra keys not in ${baseLng}:`, 'cyan'));
    for (const k of extraInOther) console.log(`  + ${k}`);
  }
}

process.exit(exitCode);
