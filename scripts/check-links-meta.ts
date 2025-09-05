/*
  Crawl selected pages and validate:
  - <title> and meta[name="description"] exist
  - canonical link is absolute
  - hreflang alternates exist for ru/uz/en
  - no <a> links return 4xx/5xx (same-origin only)
*/

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const LOCALES = ['ru', 'uz', 'en'] as const;
const PATHS = [
  '/',
  '/catalog/ognetushiteli',
  '/catalog/ognetushiteli/op-5',
];

function withLocale(path: string, locale: string) {
  if (!path.startsWith('/')) path = `/${path}`;
  if (path === '/') return `/${locale}`;
  return `/${locale}${path}`;
}

function absoluteUrl(u: string) {
  try {
    return new URL(u, BASE_URL).toString();
  } catch {
    return '';
  }
}

async function fetchHtml(url: string) {
  const res = await fetch(url, { redirect: 'manual' });
  if (res.status >= 400) throw new Error(`Bad status ${res.status} for ${url}`);
  return await res.text();
}

function getHeadTag(html: string, selector: string) {
  const pattern = new RegExp(`<${selector}[^>]*>([\\s\\S]*?)<\\/${selector}>`, 'i');
  return html.match(pattern)?.[1]?.trim();
}

function getMetaContent(html: string, name: string) {
  const re = new RegExp(`<meta[^>]*name=["']${name}["'][^>]*content=["']([^"']+)["'][^>]*>`, 'i');
  return html.match(re)?.[1];
}

function getLinkHref(html: string, rel: string) {
  const re = new RegExp(`<link[^>]*rel=["']${rel}["'][^>]*href=["']([^"']+)["'][^>]*>`, 'i');
  return html.match(re)?.[1];
}

function extractLinks(html: string): string[] {
  const links: string[] = [];
  const re = /<a[^>]*href=["']([^"'#]+)["'][^>]*>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) {
    links.push(m[1]);
  }
  return links;
}

async function checkPage(url: string) {
  const html = await fetchHtml(url);

  // title
  const title = getHeadTag(html, 'title');
  if (!title) throw new Error(`Missing <title> for ${url}`);

  // description
  const desc = getMetaContent(html, 'description');
  if (!desc) throw new Error(`Missing meta description for ${url}`);

  // canonical
  const canonical = getLinkHref(html, 'canonical');
  if (!canonical || !/^https?:\/\//i.test(canonical)) {
    throw new Error(`Invalid canonical for ${url}: ${canonical}`);
  }

  // hreflang (at least 1)
  const hasHreflang = /<link[^>]*rel=["']alternate["'][^>]*hreflang=/i.test(html);
  if (!hasHreflang) throw new Error(`Missing hreflang alternates for ${url}`);

  // same-origin links
  const links = extractLinks(html)
    .map((u) => absoluteUrl(u))
    .filter((u) => u.startsWith(BASE_URL));

  for (const link of links) {
    const res = await fetch(link, { redirect: 'manual' });
    if (res.status >= 400) throw new Error(`Broken link ${link} on ${url} -> ${res.status}`);
  }

  console.log(`OK ${url} (links checked: ${links.length})`);
}

(async () => {
  try {
    for (const locale of LOCALES) {
      for (const p of PATHS) {
        const url = `${BASE_URL}${withLocale(p, locale)}`;
        await checkPage(url);
      }
    }
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();

// Ensure this file is treated as a module by TypeScript
export {};
