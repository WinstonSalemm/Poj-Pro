import https from 'https';
import { URL } from 'url';

function getSiteUrl() {
  const raw = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || 'https://www.poj-pro.uz';
  return raw.replace(/\/$/, '');
}

function request(url: string): Promise<{ status: number; body: string }> {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const req = https.request(
      {
        method: 'GET',
        hostname: u.hostname,
        path: u.pathname + u.search,
        protocol: u.protocol,
      },
      (res) => {
        let data = '';
        res.on('data', (c) => (data += c));
        res.on('end', () => resolve({ status: res.statusCode || 0, body: data }));
      }
    );
    req.on('error', reject);
    req.end();
  });
}

async function main() {
  const SITE_URL = getSiteUrl();
  const sitemap = `${SITE_URL}/sitemap.xml`;
  const targets = [
    `https://www.google.com/ping?sitemap=${encodeURIComponent(sitemap)}`,
    `https://www.bing.com/ping?sitemap=${encodeURIComponent(sitemap)}`,
  ];
  for (const t of targets) {
    try {
      const r = await request(t);
      console.log(`Ping ${t} => ${r.status}`);
      if (t.includes('google.com/ping') && r.status >= 400) {
        console.log('Note: Google sitemap ping endpoint may be deprecated/ignored. Submission via Search Console and robots.txt sitemap is sufficient.');
      }
      if (t.includes('bing.com/ping') && r.status >= 400) {
        console.log('Note: Bing may return 410 (Gone) for legacy ping endpoint. Consider IndexNow for Bing.');
      }
    } catch (e) {
      console.error(`Ping ${t} failed`, e);
    }
  }
}

main().catch((e) => { console.error(e); process.exitCode = 1; });
