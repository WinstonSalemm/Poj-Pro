#!/usr/bin/env node

import { execSync } from 'child_process';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';

// Configuration
const REPORTS_DIR = join(process.cwd(), 'seo-reports');
const LIGHTHOUSE_CONFIG = join(process.cwd(), '.lighthouserc.js');
const PORT = process.env.PORT || '3000';
const HOST = process.env.HOST || 'localhost';
const BASE_URL = `http://${HOST}:${PORT}`;

// Ensure reports directory exists
if (!existsSync(REPORTS_DIR)) {
  mkdirSync(REPORTS_DIR, { recursive: true });
  console.log(`Created reports directory at ${REPORTS_DIR}`);
}

console.log('🚀 Starting SEO and Performance Check');
console.log(`📊 Reports will be saved to: ${REPORTS_DIR}`);
console.log(`🌐 Testing URL: ${BASE_URL}`);

// Run Lighthouse CI
try {
  console.log('\n🔍 Running Lighthouse CI...');
  
  // Run Lighthouse CI
  execSync(
    `lighthouse-ci --config=${LIGHTHOUSE_CONFIG} --collect.url=${BASE_URL} --report=html`, 
    { stdio: 'inherit' }
  );

  console.log('\n✅ SEO and Performance check completed successfully!');
  console.log(`📊 Reports saved to: ${REPORTS_DIR}`);
  
  // Open the latest report in default browser
  try {
    const latestReport = join(REPORTS_DIR, 'latest.html');
    if (existsSync(latestReport)) {
      console.log(`🌐 Opening latest report in browser...`);
      const openCommand = process.platform === 'win32' ? 'start' : 'open';
      execSync(`${openCommand} ${latestReport}`, { stdio: 'ignore' });
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.warn('⚠ Could not open report in browser:', errorMessage);
  }
  
  process.exit(0);
} catch (error: unknown) {
  const errorMessage = error instanceof Error ? error.message : 'Unknown error';
  console.error('\n❌ SEO and Performance check failed:', errorMessage);
  console.log('\n💡 Tips to improve your scores:');
  console.log('1. Optimize images and use modern formats (WebP/AVIF)');
  console.log('2. Implement proper caching headers');
  console.log('3. Minify CSS/JS and remove unused code');
  console.log('4. Enable compression (gzip/brotli)');
  console.log('5. Use a CDN for static assets');
  process.exit(1);
}
