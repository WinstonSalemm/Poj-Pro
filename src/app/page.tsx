import CategoryBlock from "@/components/CategoryBlock/CategoryBlock";
import HomeSectionsClient from "@/components/home/HomeSectionsClient";
import PopularProductsBlock from "@/components/PopularProductsBlock/PopularProductsBlock";
import { getLocale } from "@/lib/api";
import { JsonLd } from "@/components/seo/JsonLd";
import { generateOrganization, generateWebSite } from "@/components/seo/snippets";
import Link from "next/link";
import HeroBanner from "@/components/Hero/HeroBanner";

export default async function HomePage() {
  const locale = await getLocale();
  const h1Text =
    locale === "en"
      ? "Fire Extinguishers & Fire Safety in Tashkent"
      : locale === "uz"
      ? "O‘t o‘chirgichlar va yong‘in xavfsizligi Toshkentda"
      : "Огнетушители и пожарная безопасность в Ташкенте"; // RU default

  return (
    <main>
      <section className="container-section pt-4 md:pt-6">
        <h1 className="mx-auto max-w-3xl text-center text-2xl md:text-3xl font-bold text-[#660000] leading-tight md:leading-snug mb-2 md:mb-3">
          {h1Text}
        </h1>
      </section>
      <HeroBanner />
      <JsonLd data={generateOrganization()} type="Organization" keyOverride="org" />
      <JsonLd data={generateWebSite()} type="WebSite" keyOverride="website" />
      <HomeSectionsClient
        popularProducts={<PopularProductsBlock locale={locale} />}
        categoryBlock={<CategoryBlock locale={locale} />}
      />
      {/* SEO: Popular local queries and quick links */}
      <section className="container-section section-y">
        <h2 className="text-xl font-semibold !text-[#660000] mb-3">Популярные запросы в Ташкенте</h2>
        <nav aria-label="Популярные запросы" className="text-[#660000]">
          <ul className="flex flex-wrap gap-2">
            <li><Link href="/catalog/ognetushiteli" className="underline hover:no-underline">огнетушители ташкент купить</Link></li>
            <li><Link href="/catalog/rukava_i_pozharnaya_armatura" className="underline hover:no-underline">пожарные рукава ташкент купить</Link></li>
            <li><Link href="/catalog/furnitura_dlya_ognetushiteley" className="underline hover:no-underline">кронштейны огнетушителей ташкент купить</Link></li>
            <li><Link href="/catalog/pozharnye_shkafy" className="underline hover:no-underline">пожарные шкафы ташкент купить</Link></li>
            <li><Link href="/catalog/pozharnaya_signalizatsiya_i_svetozvukovye_ustroystva" className="underline hover:no-underline">пожарная сигнализация ташкент купить</Link></li>
            <li><Link href="/catalog/sistemy_pozharotusheniya_sprinkler" className="underline hover:no-underline">спринклерные системы ташкент</Link></li>
            <li><Link href="/catalog/siz" className="underline hover:no-underline">средства индивидуальной защиты ташкент</Link></li>
          </ul>
        </nav>
      </section>
    </main>
  );
}

export const revalidate = 3600;
