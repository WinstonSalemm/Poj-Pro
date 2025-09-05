import { getAllCategories } from "@/lib/api/categories";
import { getDictionary } from "@/i18n/server";
import { getLocale } from "@/lib/api";
import CatalogView from "@/components/CatalogView";

export default async function CatalogCategoriesPage() {
  const locale = await getLocale();
  const dictionary = await getDictionary(locale);
  const categories = await getAllCategories();

  return (
    <CatalogView categories={categories} dictionary={dictionary} locale={locale} />
  );
}
