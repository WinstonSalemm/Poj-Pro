import CategoryBlock from "@/components/CategoryBlock/CategoryBlock";
import HomeSectionsClient from "@/components/home/HomeSectionsClient";
import PopularProductsBlock from "@/components/PopularProductsBlock/PopularProductsBlock";
import Link from "next/link";
import { getLocale } from "@/lib/api";
import { JsonLd } from "@/components/seo/JsonLd";
import { generateOrganization, generateWebSite } from "@/components/seo/snippets";
import HeroBanner from "@/components/Hero/HeroBanner";
import LocalBusinessJsonLd from "@/components/seo/LocalBusinessJsonLd";
import { SITE_URL } from "@/lib/site";
import HomeNonCriticalWidgets from "@/components/home/HomeNonCriticalWidgets";

export default async function HomePage() {
  const locale = await getLocale();

  const heroCopy = locale === "en"
    ? {
        title: "Fire Extinguishers & Fire Safety in Tashkent",
        eyebrow: "POJ PRO • Fire safety",
        description: "Choose certified fire-safety equipment for your business, home or facility. We will help you select the right solution and prepare a commercial offer.",
        catalog: "Open catalog",
        consultation: "Get a consultation",
        trust: ["Certified equipment", "Delivery across Uzbekistan", "Expert selection"],
        sideTitle: "Need a quick quote?",
        sideText: "Tell us what you need — a specialist will respond during business hours.",
        sideAction: "Contact a specialist",
      }
    : locale === "uz"
      ? {
          title: "O‘t o‘chirgichlar va yong‘in xavfsizligi Toshkentda",
          eyebrow: "POJ PRO • Yong‘in xavfsizligi",
          description: "Biznes, uy yoki obyekt uchun sertifikatlangan yong‘in xavfsizligi uskunalarini tanlang. Mutaxassislarimiz yechim tanlash va tijorat taklifini tayyorlashda yordam beradi.",
          catalog: "Katalogni ochish",
          consultation: "Maslahat olish",
          trust: ["Sertifikatlangan uskuna", "O‘zbekiston bo‘ylab yetkazib berish", "Mutaxassis tanlovi"],
          sideTitle: "Tezkor hisob-kitob kerakmi?",
          sideText: "Talabingizni yozing — mutaxassis ish vaqtida javob beradi.",
          sideAction: "Mutaxassis bilan bog‘lanish",
        }
      : {
          title: "Огнетушители и противопожарное оборудование в Ташкенте — POJ PRO",
          eyebrow: "POJ PRO • Пожарная безопасность",
          description: "Подберите сертифицированное оборудование для бизнеса, дома или объекта. Поможем выбрать решение и подготовим коммерческое предложение.",
          catalog: "Перейти в каталог",
          consultation: "Получить консультацию",
          trust: ["Сертифицированное оборудование", "Доставка по Узбекистану", "Подбор специалистом"],
          sideTitle: "Нужен быстрый расчёт?",
          sideText: "Опишите задачу — специалист ответит в рабочее время.",
          sideAction: "Связаться со специалистом",
        };

  return (
    <main>
        <HomeNonCriticalWidgets />
        {/* Google Ads: Просмотр страницы (home) */}
      {/* Conversion-focused first screen */}
      <section className="container-section pt-5 md:pt-8">
          <div className="relative overflow-hidden rounded-3xl bg-[#660000] px-5 py-8 text-white shadow-[0_18px_50px_rgba(102,0,0,0.18)] md:px-10 md:py-12">
            <div aria-hidden="true" className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
            <div aria-hidden="true" className="absolute -bottom-28 left-1/3 h-64 w-64 rounded-full bg-[#f4c36b]/15 blur-3xl" />
            <div className="relative grid items-center gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(260px,0.8fr)]">
              <div>
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-white/70">{heroCopy.eyebrow}</p>
                <h1 className="max-w-3xl text-3xl font-bold leading-tight md:text-5xl md:leading-[1.08]">{heroCopy.title}</h1>
                <p className="mt-4 max-w-2xl text-base leading-7 text-white/85 md:text-lg">{heroCopy.description}</p>
                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <Link href="/catalog" className="inline-flex min-h-12 items-center justify-center rounded-xl bg-white px-5 py-3 text-center font-semibold text-[#660000] transition-colors hover:bg-[#fff4df] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">
                    {heroCopy.catalog}
                  </Link>
                  <Link href="/contacts" className="inline-flex min-h-12 items-center justify-center rounded-xl border border-white/40 bg-white/10 px-5 py-3 text-center font-semibold text-white transition-colors hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">
                    {heroCopy.consultation}
                  </Link>
                </div>
                <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm text-white/75">
                  {heroCopy.trust.map((item) => <li key={item} className="flex items-center gap-2"><span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-[#f4c36b]" />{item}</li>)}
                </ul>
              </div>
              <div className="rounded-2xl border border-white/20 bg-black/10 p-5 backdrop-blur-sm md:p-6">
                <p className="text-xl font-semibold">{heroCopy.sideTitle}</p>
                <p className="mt-2 text-sm leading-6 text-white/75">{heroCopy.sideText}</p>
                <Link href="/contacts" className="mt-5 inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-[#f4c36b] px-4 py-2.5 text-center font-semibold text-[#4b1300] transition-colors hover:bg-[#ffd98d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f4c36b]">
                  {heroCopy.sideAction}
                </Link>
              </div>
            </div>
          </div>
      </section>

      {/* Hero */}
      <div className="mt-4 md:mt-6">
          <HeroBanner />
      </div>

      {/* Main content */}
      <HomeSectionsClient
          popularProducts={<PopularProductsBlock locale={locale} />}
          categoryBlock={<CategoryBlock locale={locale} />}
      />

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
