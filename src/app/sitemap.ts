import { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site';
import { prisma } from '@/lib/prisma';
import { getAllPostsAllLocales, getPostAlternates } from '@/lib/blog/loader';

// Supported locales
 type Locale = 'ru' | 'uz' | 'en';
 const LOCALES: Locale[] = ['ru', 'uz', 'en'];
 const DEFAULT_LOCALE: Locale = 'ru';

 // Type for sitemap entry
 type SitemapEntry = {
   url: string;
   lastModified: string | Date;
   changeFrequency?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
   priority?: number;
   alternates?: {
     languages?: Record<string, string>;
   };
 };

 // Helper to generate alternate language URLs
 const localeMap: Record<Locale, string> = {
   ru: 'ru-RU',
   en: 'en-US',
   uz: 'uz-UZ',
 };

 function generateAlternateUrls(path: string): Record<string, string> {
   return LOCALES.reduce<Record<string, string>>((acc, locale) => {
     const langCode = localeMap[locale];
     acc[langCode] = `${SITE_URL}${locale === DEFAULT_LOCALE ? '' : `/${locale}`}${path}`;
     return acc;
   }, {});
 }

 // Static pages that don't change often
 function getStaticPages(): SitemapEntry[] {
  const baseRoutes = [
    { path: '/', priority: 1.0 },
    { path: '/about', priority: 0.8 },
    { path: '/contacts', priority: 0.8 },
    { path: '/catalog', priority: 0.9 },
    { path: '/documents', priority: 0.7 },
    { path: '/blog', priority: 0.7 },
  ];
   const staticRoutes = [...baseRoutes];

   const now = new Date().toISOString();
   const routesArr = Array.isArray(staticRoutes) ? staticRoutes : [];
   return routesArr.flatMap(({ path, priority }) => {
     // Only the homepage has localized routes in this app. Other static pages exist once at root.
     if (path === '/') {
       return LOCALES.map((locale): SitemapEntry => ({
         url: `${SITE_URL}${locale === DEFAULT_LOCALE ? '' : `/${locale}`}${path}`,
         lastModified: now,
         changeFrequency: 'weekly',
         priority,
         alternates: {
           languages: generateAlternateUrls(path),
         },
       }));
     }
     return [{
       url: `${SITE_URL}${path}`,
       lastModified: now,
       changeFrequency: 'weekly',
       priority,
     }];
   });
 }

 // Generate product pages sitemap entries with correct URLs
 async function getProductPages(): Promise<SitemapEntry[]> {
   try {
     const now = new Date().toISOString();
     const products = await prisma.product.findMany({
       select: {
         slug: true,
         updatedAt: true,
         category: { select: { slug: true } },
       },
       where: { isActive: true },
     });

     return products.map((p) => {
       const cat = p.category?.slug ? p.category.slug : 'catalog';
       const path = `/catalog/${cat}/${p.slug}`;
       const lastModified = p.updatedAt ?? now;
       return {
         url: `${SITE_URL}${path}`,
         lastModified,
         changeFrequency: 'weekly',
         priority: 0.7,
       } satisfies SitemapEntry;
     });
   } catch (error) {
     console.error('Error generating product pages for sitemap:', error);
     return [];
   }
 }

 // Generate category pages sitemap entries
 async function getCategoryPages(): Promise<SitemapEntry[]> {
   try {
     const now = new Date().toISOString();
     const categories = await prisma.category.findMany({
       select: { slug: true },
       orderBy: { slug: 'asc' },
     });

     return categories.map((category) => {
       const path = `/catalog/${category.slug}`;
       return {
         url: `${SITE_URL}${path}`,
         lastModified: now,
         changeFrequency: 'weekly',
         priority: 0.8,
       } satisfies SitemapEntry;
     });
   } catch (error) {
     console.error('Error generating category pages for sitemap:', error);
     return [];
   }
 }

 export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
   try {
     // Fetch all data in parallel
     const [staticPages, productPages, categoryPages] = await Promise.all([
       getStaticPages(),
       getProductPages(),
       getCategoryPages(),
     ]);

     // Blog posts from MDX across locales
     const blogEntries: SitemapEntry[] = (() => {
       const itemsRaw = getAllPostsAllLocales();
       const items = Array.isArray(itemsRaw) ? itemsRaw : [];
       const now = new Date().toISOString();
       return items.map(({ locale, post }): SitemapEntry => {
         const path = `${locale === DEFAULT_LOCALE ? '' : `/${locale}`}/blog/${post.slug}`;
         const last = post.frontmatter.date ? new Date(post.frontmatter.date) : now;
         const alts = getPostAlternates(post.slug);
         const languages = Object.fromEntries(
           Object.entries(alts).map(([loc, p]) => [loc, `${SITE_URL}${p}`])
         );
         return {
           url: `${SITE_URL}${path}`,
           lastModified: last,
           changeFrequency: 'weekly',
           priority: 0.7,
           alternates: { languages },
         };
       });
     })();

     // Combine all pages and filter out any potential duplicates
     const allPages = [...staticPages, ...categoryPages, ...productPages, ...blogEntries];
     const uniquePages = Array.from(new Map(allPages.map(page => [page.url, page])).values());

     return uniquePages;
   } catch (error) {
     console.error('Error generating sitemap:', error);
     // Return at least the static pages if there's an error
     return getStaticPages();
   }
 }
