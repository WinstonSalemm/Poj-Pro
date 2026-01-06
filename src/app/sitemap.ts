import { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { prisma } from "@/lib/prisma";
import { getAllPostsAllLocales, getPostAlternates } from "@/lib/blog/loader";

// Supported locales
type Locale = "ru" | "uz" | "en";
const DEFAULT_LOCALE: Locale = "ru";

// Type for sitemap entry
type SitemapEntry = {
  url: string;
  lastModified: string | Date;
  changeFrequency?:
    | "always"
    | "hourly"
    | "daily"
    | "weekly"
    | "monthly"
    | "yearly"
    | "never";
  priority?: number;
  alternates?: {
    languages?: Record<string, string>;
  };
};

// Note: Language switching is client-side via cookies, not separate URLs
// Only blog has separate routes: /blog (ru), /en/blog (en), /uz/blog (uz)

// Static pages that don't change often
// Note: Language switching is client-side via cookies, no separate URLs for /ru/, /en/, /uz/
// Only blog has separate routes: /blog (ru), /en/blog (en), /uz/blog (uz)
function getStaticPages(): SitemapEntry[] {
  const baseRoutes = [
    { path: "/", priority: 1.0 },
    { path: "/about", priority: 0.8 },
    { path: "/contacts", priority: 0.8 },
    { path: "/catalog", priority: 0.9 },
    { path: "/documents", priority: 0.7 },
    { path: "/documents/certificates", priority: 0.7 },
    { path: "/guide", priority: 0.7 },
    { path: "/blog", priority: 0.7 }, // Russian blog (default)
  ];
  const staticRoutes = [...baseRoutes];

  const now = new Date().toISOString();
  const routesArr = Array.isArray(staticRoutes) ? staticRoutes : [];
  return routesArr.map(({ path, priority }) => ({
    url: `${SITE_URL}${path}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority,
  }));
}

// Generate product pages sitemap entries with correct URLs
// Only include active products with valid category slugs
async function getProductPages(): Promise<SitemapEntry[]> {
  try {
    const now = new Date();
    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        category: {
          isNot: null, // Only products with categories
        },
      },
      select: {
        slug: true,
        updatedAt: true,
        category: {
          select: {
            slug: true,
          },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    return products
      .filter((p) => p.category?.slug && p.slug) // Ensure both category and product slugs exist
      .map((p) => {
        const cat = p.category!.slug;
        const path = `/catalog/${cat}/${p.slug}`;
        const lastModified = p.updatedAt?.toISOString() ?? now.toISOString();
        return {
          url: `${SITE_URL}${path}`,
          lastModified,
          changeFrequency: "weekly" as const,
          priority: 0.7,
        } satisfies SitemapEntry;
      });
  } catch (error) {
    console.error("Error generating product pages for sitemap:", error);
    return [];
  }
}

// Generate category pages sitemap entries
// Only include categories that have active products
async function getCategoryPages(): Promise<SitemapEntry[]> {
  try {
    const now = new Date();
    const categories = await prisma.category.findMany({
      where: {
        products: {
          some: {
            isActive: true,
          },
        },
      },
      select: {
        slug: true,
        products: {
          where: { isActive: true },
          select: { updatedAt: true },
          orderBy: { updatedAt: "desc" },
          take: 1,
        },
      },
      orderBy: { slug: "asc" },
    });

    return categories.map((category) => {
      const path = `/catalog/${category.slug}`;
      // Use the most recent product update date, or current date if no products
      const lastModified = category.products[0]?.updatedAt
        ? category.products[0].updatedAt.toISOString()
        : now.toISOString();

      return {
        url: `${SITE_URL}${path}`,
        lastModified,
        changeFrequency: "weekly" as const,
        priority: 0.8,
      } satisfies SitemapEntry;
    });
  } catch (error) {
    console.error("Error generating category pages for sitemap:", error);
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
        const path = `${locale === DEFAULT_LOCALE ? "" : `/${locale}`}/blog/${
          post.slug
        }`;
        const last = post.frontmatter.date
          ? new Date(post.frontmatter.date)
          : now;
        const alts = getPostAlternates(post.slug);
        const languages = Object.fromEntries(
          Object.entries(alts).map(([loc, p]) => [loc, `${SITE_URL}${p}`])
        );
        return {
          url: `${SITE_URL}${path}`,
          lastModified: last,
          changeFrequency: "weekly",
          priority: 0.7,
          alternates: { languages },
        };
      });
    })();

    // Combine all pages and filter out any potential duplicates
    // Also filter out URLs with query parameters (should not be in sitemap)
    const allPages = [
      ...staticPages,
      ...categoryPages,
      ...productPages,
      ...blogEntries,
    ];
    const filteredPages = allPages.filter((page) => {
      const url = page.url;
      // Exclude URLs with query parameters
      if (url.includes("?")) return false;
      // Exclude URLs with fragments
      if (url.includes("#")) return false;
      // Ensure URL is absolute and valid
      if (!url.startsWith("http")) return false;
      return true;
    });

    const uniquePages = Array.from(
      new Map(filteredPages.map((page) => [page.url, page])).values()
    );

    return uniquePages;
  } catch (error) {
    console.error("Error generating sitemap:", error);
    // Return at least the static pages if there's an error
    return getStaticPages();
  }
}
