import Link from 'next/link';
import { getAllPosts } from '@/lib/blog/loader';
import type { Metadata } from 'next';
import { buildPageMetadata } from '@/lib/metadata';

export const dynamic = 'force-static';

export const metadata: Metadata = buildPageMetadata({
  defaultTitle: 'Blog',
  defaultDescription: "Yong'in xavfsizligi bo'yicha maqolalar",
  path: '/uz/blog',
  lang: 'uzb',
});

export default async function BlogListing({ searchParams }: { searchParams?: Promise<{ page?: string }> }) {
  const { page: pageParam } = (await searchParams) || {};
  const all = getAllPosts('uz').sort((a,b)=> (a.frontmatter.date < b.frontmatter.date ? 1 : -1));
  const pageSize = 10;
  const page = Math.max(1, parseInt(pageParam || '1', 10) || 1);
  const start = (page - 1) * pageSize;
  const posts = all.slice(start, start + pageSize);
  const pages = Math.max(1, Math.ceil(all.length / pageSize));
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-semibold mb-6">Blog</h1>
      <ul className="space-y-4">
        {posts.map(p => (
          <li key={p.slug} className="border-b pb-4">
            <Link href={`/uz/blog/${p.slug}`} className="text-xl font-medium hover:underline">{p.frontmatter.title}</Link>
            <div className="text-sm text-gray-500">{new Date(p.frontmatter.date).toLocaleDateString('uz-UZ')} • {p.readingTimeMinutes} min</div>
            <p className="mt-1 text-gray-700">{p.frontmatter.description}</p>
          </li>
        ))}
      </ul>
      {pages > 1 && (
        <nav className="flex items-center gap-2 mt-6">
          {Array.from({ length: pages }, (_, i) => i + 1).map(n => (
            <Link key={n} href={n === 1 ? '/uz/blog' : `/uz/blog?page=${n}`} className={`px-3 py-1 border rounded ${n === page ? 'bg-gray-200' : 'hover:bg-gray-50'}`}>{n}</Link>
          ))}
        </nav>
      )}
    </main>
  );
}
