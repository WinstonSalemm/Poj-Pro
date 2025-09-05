import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import readingTime from 'reading-time';
import type { Locale, Post, PostFrontmatter } from './types';
import { extractToc } from './toc';
import { autoLinkHTML } from './autolink';

const ROOT = process.cwd();
const CONTENT_ROOT = path.join(ROOT, 'content', 'articles');

export function getLocales(): Locale[] { return ['ru','uz','en']; }

export function postsDir(locale: Locale) {
  return path.join(CONTENT_ROOT, locale);
}

export function getAllPostSlugs(locale: Locale): string[] {
  const dir = postsDir(locale);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter(f => f.endsWith('.md') || f.endsWith('.mdx'))
    .map(f => f.replace(/\.(md|mdx)$/i, ''));
}

export function loadPost(locale: Locale, slug: string): Post | null {
  const dir = postsDir(locale);
  const mdx = path.join(dir, `${slug}.mdx`);
  const md = path.join(dir, `${slug}.md`);
  const file = fs.existsSync(mdx) ? mdx : fs.existsSync(md) ? md : '';
  if (!file) return null;
  const raw = fs.readFileSync(file, 'utf8');
  const { content, data } = matter(raw);
  const fm = data as PostFrontmatter;
  const processor = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypeSlug)
    .use(rehypeAutolinkHeadings, { behavior: 'wrap' })
    .use(rehypeStringify);
  const html = String(processor.processSync(content));
  const toc = extractToc(html);
  const stats = readingTime(content);
  const htmlAuto = autoLinkHTML(html, locale);
  return {
    slug,
    locale,
    frontmatter: fm,
    content,
    html: htmlAuto,
    readingTimeMinutes: Math.max(1, Math.round(stats.minutes)),
    toc,
  };
}

export function getAllPosts(locale: Locale): Post[] {
  return getAllPostSlugs(locale)
    .map(slug => loadPost(locale, slug))
    .filter(Boolean) as Post[];
}

export function getPostAlternates(slug: string): Partial<Record<Locale, string>> {
  const result: Partial<Record<Locale, string>> = {};
  for (const loc of getLocales()) {
    const dir = postsDir(loc);
    const mdx = path.join(dir, `${slug}.mdx`);
    const md = path.join(dir, `${slug}.md`);
    const exists = fs.existsSync(mdx) || fs.existsSync(md);
    if (exists) result[loc] = `/${loc === 'ru' ? '' : loc + '/'}blog/${slug}`.replace('//','/');
  }
  return result;
}

export function getAllPostsAllLocales(): { locale: Locale; post: Post }[] {
  const out: { locale: Locale; post: Post }[] = [];
  for (const loc of getLocales()) {
    for (const p of getAllPosts(loc)) out.push({ locale: loc, post: p });
  }
  return out;
}

export function getRelatedPosts(locale: Locale, slug: string, limit = 5): Post[] {
  const current = loadPost(locale, slug);
  if (!current) return [];
  const tags = new Set((current.frontmatter.tags || []).map(t => t.toLowerCase()));
  const others = getAllPosts(locale).filter(p => p.slug !== slug);
  const scored = others.map(p => {
    const ptags = new Set((p.frontmatter.tags || []).map(t => t.toLowerCase()));
    let score = 0;
    for (const t of tags) if (ptags.has(t)) score++;
    return { p, score };
  }).sort((a,b)=> b.score - a.score || (a.p.frontmatter.date < b.p.frontmatter.date ? 1 : -1));
  return scored.filter(s=> s.score>0).slice(0, limit).map(s=> s.p);
}
