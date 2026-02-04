import CategoryBlock from "@/components/CategoryBlock/CategoryBlock";
import HomeSectionsClient from "@/components/home/HomeSectionsClient";
import PopularProductsBlock from "@/components/PopularProductsBlock/PopularProductsBlock";
import { getLocale } from "@/lib/api";
import { JsonLd } from "@/components/seo/JsonLd";
import { generateOrganization, generateWebSite } from "@/components/seo/snippets";
import HeroBanner from "@/components/Hero/HeroBanner";
import LocalBusinessJsonLd from "@/components/seo/LocalBusinessJsonLd";
import { SITE_URL } from "@/lib/site";
import BlurReveal from "@/components/ui/BlurReveal";
import MiniUpdateModal from "@/components/MiniUpdateModal/MiniUpdateModal";
import { AdsConversionOnMount } from "@/components/analytics/AdsConversionOnMount";

export default async function HomePage() {
  const locale = await getLocale();

  const h1Text =
    locale === "en"
      ? "Fire Extinguishers & Fire Safety in Tashkent"
      : locale === "uz"
        ? "O‘t o‘chirgichlar va yong‘in xavfsizligi Toshkentda"
        : "Огнетушители и противопожарное оборудование в Ташкенте — POJ PRO";

  return (
    <main>
        <MiniUpdateModal/>
        {/* Google Ads: Просмотр страницы (home) */}
        <AdsConversionOnMount type="pageViewSpecial" />
      {/* H1 */}
      <BlurReveal>
        <section className="container-section pt-4 md:pt-6">
          <h1 className="mx-auto max-w-3xl text-center text-2xl md:text-3xl font-bold text-[#660000] leading-tight md:leading-snug mb-2 md:mb-3">
            {h1Text}
          </h1>
        </section>
      </BlurReveal>

      {/* Hero */}
      <BlurReveal delay={100}>
        <HeroBanner />
      </BlurReveal>

      {/* Main content */}
      <BlurReveal delay={200}>
        <HomeSectionsClient
          popularProducts={<PopularProductsBlock locale={locale} />}
          categoryBlock={<CategoryBlock locale={locale} />}
        />
      </BlurReveal>

      {/* SEO links - скрыто */}

      {/* JSON-LD (без анимации!) */}
      <LocalBusinessJsonLd
        name="POJ PRO"
        url={SITE_URL}
        telephone="+998 99 393 66 16"
        image={[`${SITE_URL}/OtherPics/favicon-large.webp`]}
        priceRange="₮₮"
        address={{
          streetAddress: "ул. Уста Ширин, 105",
          addressLocality: "Ташкент",
          addressRegion: "Toshkent",
          postalCode: "100000",
          addressCountry: "UZ",
        }}
        openingHours={["Mo-Fr 09:00-18:00", "Sa 10:00-16:00"]}
        sameAs={[
          "https://t.me/pojsystema",
          "https://www.instagram.com/pojpro",
          "https://www.facebook.com/pojpro",
        ]}
      />

      <JsonLd data={generateOrganization()} type="Organization" keyOverride="org" />
      <JsonLd data={generateWebSite()} type="WebSite" keyOverride="website" />
    </main>
  );
}

export const revalidate = 3600;
