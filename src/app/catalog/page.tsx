import type { Metadata } from 'next';
import { getAllCategories } from "@/lib/api/categories";
import { getDictionary } from "@/i18n/server";
import { getLocale } from "@/lib/api";
import CatalogView from "@/components/CatalogView";
import { SITE_URL } from '@/lib/site';

export const dynamic = 'force-dynamic';  // отключает SSG
export const revalidate = 0;             // не кешировать

export async function generateMetadata({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}): Promise<Metadata> {
  const params = (await searchParams) || {};
  const hasQuery = Object.values(params).some((value) => value != null);

  return {
    alternates: { canonical: `${SITE_URL}/catalog` },
    robots: hasQuery
      ? { index: false, follow: true }
      : { index: true, follow: true },
  };
}

export default async function CatalogCategoriesPage() {
  const locale = await getLocale();
  const dictionary = await getDictionary(locale);

  // Фетчим категории с принудительным обновлением данных
  const categories = await getAllCategories();

  return (
    <CatalogView categories={categories} dictionary={dictionary} locale={locale} />
  );
}
