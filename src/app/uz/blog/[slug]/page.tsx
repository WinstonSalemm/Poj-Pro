import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { loadPost, getAllPostSlugs, getPostAlternates, getRelatedPosts } from '@/lib/blog/loader';
import ArticleJsonLd from '@/components/seo/ArticleJsonLd';
import FaqJsonLd from '@/components/seo/FaqJsonLd';

export const dynamic = 'force-static';

type Params = { slug: string };

export async function generateStaticParams(): Promise<Params[]> {
  const slugs = getAllPostSlugs('uz');
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const post = loadPost('uz', slug);
  if (!post) return {};
  const alternates = getPostAlternates(slug);
  return {
    title: post.frontmatter.title,
    description: post.frontmatter.description,
    alternates: {
      canonical: `/uz/blog/${post.slug}`,
      languages: {
        'ru-RU': alternates.ru || `/blog/${post.slug}`,
        'en-US': alternates.en || `/en/blog/${post.slug}`,
        'uz-UZ': alternates.uz || `/uz/blog/${post.slug}`,
      },
    },
  };
}

export default async function ArticlePage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const post = loadPost('uz', slug);
  if (!post) return notFound();
  const faqs = [] as { question: string; answer: string }[];
  const related = getRelatedPosts('uz', slug, 5);
  return (
    <main className="container mx-auto px-4 py-8 prose max-w-3xl">
      <ArticleJsonLd
        mainEntityOfPage={`/uz/blog/${post.slug}`}
        headline={post.frontmatter.title}
        description={post.frontmatter.description}
        image={post.frontmatter.cover ? [post.frontmatter.cover] : undefined}
        author={{ name: 'POJ PRO' }}
        datePublished={post.frontmatter.date}
        dateModified={post.frontmatter.date}
        articleSection="Blog"
        inLanguage={'uz'}
        articleBody={post.content}
      />
      {faqs.length > 0 ? <FaqJsonLd faqs={faqs} /> : null}

      <nav className="text-sm text-gray-600 mb-6">
        <Link href="/uz/blog">Blog</Link>
      </nav>
      <h1>{post.frontmatter.title}</h1>
      <p className="text-gray-500 text-sm">{new Date(post.frontmatter.date).toLocaleDateString('uz-UZ')} • {post.readingTimeMinutes} min</p>
      {post.toc.length > 0 && (
        <aside className="not-prose bg-gray-50 border rounded p-4 my-4">
          <div className="font-semibold mb-2">Mundarija</div>
          <ul className="text-sm space-y-1">
            {post.toc.map(i => (
              <li key={i.id} className={i.depth === 3 ? 'pl-4' : ''}>
                <a href={`#${i.id}`} className="hover:underline">{i.text}</a>
              </li>
            ))}
          </ul>
        </aside>
      )}
      {post.frontmatter.cover ? (
        <div className="relative w-full aspect-[16/9] rounded my-4 overflow-hidden bg-gray-50">
          <Image
            src={post.frontmatter.cover}
            alt={post.frontmatter.title || 'cover'}
            fill
            sizes="(max-width: 768px) 100vw, 768px"
            priority={false}
            loading="lazy"
            className="object-cover"
            quality={70}
          />
        </div>
      ) : null}
      <div dangerouslySetInnerHTML={{ __html: post.html || '' }} />

      <hr className="my-8" />
      <section>
        <h3>Bog&#39;liq</h3>
        <ul className="list-disc pl-5">
          {related.slice(0,5).map(r => (
            <li key={r.slug}><Link href={`/uz/blog/${r.slug}`}>{r.frontmatter.title}</Link></li>
          ))}
        </ul>
      </section>
    </main>
  );
}
