/*
  Validates sitemap.xml and robots.txt
  - Ensures no duplicate URLs
  - lastmod values are ISO-like
  - All URLs resolve with 2xx/3xx
  - robots.txt contains Sitemap: and basic Allow/Disallow sanity
*/

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

function isIsoLike(s: string) {
  // very permissive ISO8601-like validator
  return /\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[\+\-]\d{2}:?\d{2})?)?/i.test(s);
}

async function checkSitemap() {
  const res = await fetch(`${BASE_URL}/sitemap.xml`);
  if (!res.ok) throw new Error(`sitemap.xml not ok: ${res.status}`);
  const xml = await res.text();

  // Naive parsing of <url><loc>...</loc><lastmod>...</lastmod></url>
  const urlBlocks = [...xml.matchAll(/<url>([\s\S]*?)<\/url>/g)].map((m) => m[1]);
  if (urlBlocks.length === 0) throw new Error('No <url> entries in sitemap');

  const urls: string[] = [];
  const lastmods: Record<string, string | undefined> = {};
  for (const block of urlBlocks) {
    const loc = (block.match(/<loc>([\s\S]*?)<\/loc>/)?.[1] || '').trim();
    const lastmod = (block.match(/<lastmod>([\s\S]*?)<\/lastmod>/)?.[1] || '').trim();
    if (!loc) throw new Error('Sitemap entry missing <loc>');
    urls.push(loc);
    if (lastmod) lastmods[loc] = lastmod;
  }

  // Duplicates
  const set = new Set(urls);
  if (set.size !== urls.length) {
    const counts: Record<string, number> = {};
    urls.forEach((u) => (counts[u] = (counts[u] || 0) + 1));
    const dups = Object.entries(counts).filter(([, n]) => n > 1).map(([u]) => u);
    throw new Error(`Duplicate URLs in sitemap: ${dups.join(', ')}`);
  }

  // lastmod ISO-like
  for (const [u, lm] of Object.entries(lastmods)) {
    if (lm && !isIsoLike(lm)) throw new Error(`Non-ISO lastmod for ${u}: ${lm}`);
  }

  // All URLs resolve 2xx/3xx
  for (const u of urls) {
    const r = await fetch(u, { redirect: 'manual' });
    if (r.status >= 400) throw new Error(`Bad status for ${u}: ${r.status}`);
  }

  console.log(`Sitemap OK: ${urls.length} URLs`);
}

async function checkRobots() {
  const res = await fetch(`${BASE_URL}/robots.txt`);
  if (!res.ok) throw new Error(`robots.txt not ok: ${res.status}`);
  const txt = await res.text();

  if (!/sitemap:\s*https?:\/\//i.test(txt)) throw new Error('robots.txt missing Sitemap:');
  if (!/user-agent:\s*\*/i.test(txt)) console.warn('robots.txt missing generic User-agent: *');
  // Basic sanity that Allow/Disallow lines exist (not strictly required)
  if (!/(allow|disallow):/i.test(txt)) console.warn('robots.txt has no Allow/Disallow rules');

  console.log('robots.txt OK');
}

(async () => {
  try {
    await checkSitemap();
    await checkRobots();
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();

export {};
