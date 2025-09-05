import { getAllCategories } from "@/lib/api/categories";
import { getDictionary } from "@/i18n/server";
import { getLocale } from "@/lib/api";
import CatalogView from "@/components/CatalogView";

export const dynamic = 'force-dynamic';  // отключает SSG
export const revalidate = 0;             // не кешировать

export default async function CatalogCategoriesPage() {
  const locale = await getLocale();
  const dictionary = await getDictionary(locale);

  // Фетчим категории с принудительным обновлением данных
  const categories = await getAllCategories();

  return (
    <CatalogView categories={categories} dictionary={dictionary} locale={locale} />
  );
}
