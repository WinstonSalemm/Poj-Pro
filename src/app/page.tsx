import CategoryBlock from "@/components/CategoryBlock/CategoryBlock";
import HomeSectionsClient from "@/components/home/HomeSectionsClient";
import PopularProductsBlock from "@/components/PopularProductsBlock/PopularProductsBlock";
import Link from "next/link";
import { getLocale } from "@/lib/api";
import { JsonLd } from "@/components/seo/JsonLd";
import { generateOrganization, generateWebSite } from "@/components/seo/snippets";
import HeroBanner from "@/components/Hero/HeroBanner";
import ActivePromotionsBanner from "@/components/home/ActivePromotionsBanner";
import LocalBusinessJsonLd from "@/components/seo/LocalBusinessJsonLd";
import { SITE_URL } from "@/lib/site";
import HomeNonCriticalWidgets from "@/components/home/HomeNonCriticalWidgets";

export default async function HomePage() {
  const locale = await getLocale();

  const heroCopy = locale === "en"
    ? {
        title: "Fire Extinguishers & Fire Safety in Tashkent - POJ PRO",
        eyebrow: "POJ PRO • Fire safety",
        description: "Choose certified fire-safety equipment for your business, home or facility. We will help you select the right solution and prepare a commercial offer.",
        catalog: "Open catalog",
        consultation: "Get a consultation",
        trust: ["Certified equipment", "Delivery across Uzbekistan", "Expert selection"],
        discountTitle: "5% off for registered users",
        discountText: "Create an account and get 5% off any order - no minimum.",
        discountAction: "Register",
        quoteTitle: "Need a quick quote?",
        quoteText: "Describe your task - a specialist will reply during business hours.",
        quoteAction: "Contact a specialist",
      }
    : locale === "uz"
      ? {
          title: "O‘t o‘chirgichlar va yong‘in xavfsizligi Toshkentda - POJ PRO",
          eyebrow: "POJ PRO • Yong‘in xavfsizligi",
          description: "Biznes, uy yoki obyekt uchun sertifikatlangan yong‘in xavfsizligi uskunalarini tanlang. Mutaxassislarimiz yechim tanlash va tijorat taklifini tayyorlashda yordam beradi.",
          catalog: "Katalogni ochish",
          consultation: "Maslahat olish",
          trust: ["Sertifikatlangan uskuna", "O‘zbekiston bo‘ylab yetkazib berish", "Mutaxassis tanlovi"],
          discountTitle: "Ro‘yxatdan o‘tganlarga 5%",
          discountText: "Akkount yarating va har qanday buyurtmaga 5% chegirma oling - minimal summa yo‘q.",
          discountAction: "Ro‘yxatdan o‘tish",
          quoteTitle: "Tezkor hisob-kitob kerakmi?",
          quoteText: "Talabingizni yozing - mutaxassis ish vaqtida javob beradi.",
          quoteAction: "Mutaxassis bilan bog‘lanish",
        }
      : {
          title: "Огнетушители и противопожарное оборудование в Ташкенте - POJ PRO",
          eyebrow: "POJ PRO • Пожарная безопасность",
          description: "Подберите сертифицированное оборудование для бизнеса, дома или объекта. Поможем выбрать решение и подготовим коммерческое предложение.",
          catalog: "Перейти в каталог",
          consultation: "Получить консультацию",
          trust: ["Сертифицированное оборудование", "Доставка по Узбекистану", "Подбор специалистом"],
          discountTitle: "Скидка 5% за регистрацию",
          discountText: "Зарегистрируйтесь и получите скидку 5% на любой заказ - без минимальной суммы.",
          discountAction: "Зарегистрироваться",
          quoteTitle: "Нужен быстрый расчёт?",
          quoteText: "Опишите задачу - специалист ответит в рабочее время.",
          quoteAction: "Связаться со специалистом",
        };

  return (
    <main>
        <HomeNonCriticalWidgets />
        {/* Google Ads: Просмотр страницы (home) */}
      {/* Conversion-focused first screen */}
      <section className="container-section pt-4 md:pt-6">
          <div className="relative overflow-hidden rounded-2xl bg-[#660000] px-4 py-5 text-white shadow-[0_14px_36px_rgba(102,0,0,0.16)] md:rounded-3xl md:px-8 md:py-7">
            <div aria-hidden="true" className="absolute -right-16 -top-20 h-52 w-52 rounded-full bg-white/10 blur-3xl" />
            <div aria-hidden="true" className="absolute -bottom-20 left-1/3 h-44 w-44 rounded-full bg-[#f4c36b]/15 blur-3xl" />
            <div className="relative grid items-start gap-5 lg:grid-cols-[minmax(0,1.35fr)_minmax(240px,0.65fr)] lg:gap-6">
              <div className="min-w-0">
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/70">{heroCopy.eyebrow}</p>
                <h1 className="max-w-3xl text-2xl font-bold leading-tight sm:text-3xl md:text-4xl md:leading-[1.1]">{heroCopy.title}</h1>
                <p className="mt-2.5 max-w-2xl text-sm leading-6 text-white/85 md:text-base md:leading-7">{heroCopy.description}</p>
                <div className="mt-4 flex flex-col gap-2.5 sm:flex-row">
                  <Link href="/catalog" className="inline-flex min-h-10 items-center justify-center rounded-xl bg-white px-4 py-2.5 text-center text-sm font-semibold text-[#660000] transition-colors hover:bg-[#fff4df] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white sm:min-h-11">
                    {heroCopy.catalog}
                  </Link>
                  <Link href="/contacts" className="inline-flex min-h-10 items-center justify-center rounded-xl border border-white/40 bg-white/10 px-4 py-2.5 text-center text-sm font-semibold text-white transition-colors hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white sm:min-h-11">
                    {heroCopy.consultation}
                  </Link>
                </div>
                <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-white/75 sm:text-sm">
                  {heroCopy.trust.map((item) => <li key={item} className="flex items-center gap-2"><span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-[#f4c36b]" />{item}</li>)}
                </ul>
              </div>
              <div className="grid gap-3">
                <div className="rounded-2xl border border-[#f4c36b]/35 bg-[#f4c36b]/10 p-4 backdrop-blur-sm">
                  <p className="text-base font-semibold leading-snug">{heroCopy.discountTitle}</p>
                  <p className="mt-1.5 text-sm leading-5 text-white/75">{heroCopy.discountText}</p>
                  <Link href="/register" className="mt-3 inline-flex min-h-10 w-full items-center justify-center rounded-xl bg-[#f4c36b] px-4 py-2.5 text-center text-sm font-semibold text-[#4b1300] transition-colors hover:bg-[#ffd98d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f4c36b]">
                    {heroCopy.discountAction}
                  </Link>
                </div>
                <div className="rounded-2xl border border-white/20 bg-black/10 p-4 backdrop-blur-sm">
                  <p className="text-base font-semibold leading-snug">{heroCopy.quoteTitle}</p>
                  <p className="mt-1.5 text-sm leading-5 text-white/75">{heroCopy.quoteText}</p>
                  <Link href="/contacts" className="mt-3 inline-flex min-h-10 w-full items-center justify-center rounded-xl border border-white/35 px-4 py-2.5 text-center text-sm font-semibold text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">
                    {heroCopy.quoteAction}
                  </Link>
                </div>
              </div>
            </div>
          </div>
      </section>

      {/* Hero */}
      <div className="mt-4 md:mt-6">
          <HeroBanner />
      </div>

      <ActivePromotionsBanner locale={locale} />

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
