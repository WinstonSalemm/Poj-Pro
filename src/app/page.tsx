import CategoryBlock from "@/components/CategoryBlock/CategoryBlock";
import HomeSectionsClient from "@/components/home/HomeSectionsClient";
import PopularProductsBlock from "@/components/PopularProductsBlock/PopularProductsBlock";
import { getLocale } from "@/lib/api";
import { JsonLd } from "@/components/seo/JsonLd";
import { generateOrganization, generateWebSite } from "@/components/seo/snippets";

export default async function HomePage() {
  const locale = await getLocale();

  return (
    <main>
      <JsonLd data={generateOrganization()} type="Organization" keyOverride="org" />
      <JsonLd data={generateWebSite()} type="WebSite" keyOverride="website" />
      <HomeSectionsClient
        popularProducts={<PopularProductsBlock locale={locale} />}
        categoryBlock={<CategoryBlock locale={locale} />}
      />
    </main>
  );
}

export const revalidate = 60;
