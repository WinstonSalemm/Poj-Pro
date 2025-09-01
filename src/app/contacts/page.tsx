"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import dynamic from "next/dynamic";
import { SeoHead } from "@/components/seo/SeoHead";

const MapSection = dynamic(() => import("@/components/MapSection/MapSection"), {
  ssr: false,
  loading: () => <div className="h-[320px] w-full shimmer rounded-xl" />,
});

export default function ContactsPage() {
  const { t } = useTranslation();
  const [bootLoading, setBootLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setBootLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  // JSON-LD via SeoHead
  const orgJsonLd = {
    "@type": "Organization",
    name: "POJ PRO",
    url: "/",
    email: "mailto:pojpro2012@gmail.com",
    telephone: ["+998993936616", "+998993091001", "+998712536616", "+998909791218"],
    logo: "/OtherPics/logo.png",
    sameAs: [] as string[],
    address: {
      "@type": "PostalAddress",
      streetAddress: t("contacts.address.value"),
      addressCountry: "UZ",
    },
    contactPoint: [
      {
        "@type": "ContactPoint",
        telephone: "+998993936616",
        contactType: "sales",
        availableLanguage: ["ru", "en", "uz"],
      },
    ],
  } as const;

  const breadcrumbsJsonLd = {
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: t("nav.home", "Home"), item: "/" },
      { "@type": "ListItem", position: 2, name: t("contacts.title"), item: "/contacts" },
    ],
  } as const;

  return (
    <>
      <SeoHead
        title={`${t("contacts.title")} — POJ PRO`}
        description={t("contacts.description")}
        path="/contacts"
        locale={typeof window !== 'undefined' && navigator.language ? navigator.language : 'ru'}
        image="/OtherPics/logo.png"
        structuredData={[orgJsonLd, breadcrumbsJsonLd]}
      />
      <main className="w-full max-w-[1200px] mx-auto mt-[90px] px-4 py-10 bg-gray-50 relative text-[#660000]">

      {/* Шторка (белая) */}
      {bootLoading && (
        <div className="fixed inset-0 z-[60] bg-white text-black flex flex-col items-center justify-center animate-fadeIn">
          <div className="text-2xl font-semibold tracking-wide mb-6">...</div>
          <div className="w-[240px] h-[6px] rounded-full bg-black/10 overflow-hidden">
            <div className="h-full w-1/3 animate-slideBar rounded-full bg-black/70" />
          </div>
        </div>
      )}

      {/* Заголовок */}
      <header className={`text-center transition-opacity duration-500 ${bootLoading ? "opacity-0" : "opacity-100"}`}>
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">{t("contacts.title")}</h1>
        <p className="mt-4 text-base md:text-lg leading-7 max-w-3xl mx-auto">{t("contacts.description")}</p>
      </header>

      {/* Карточки с контактами */}
      <section
        aria-labelledby="contacts-info"
        className={`mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 transition-opacity duration-500 ${
          bootLoading ? "opacity-0" : "opacity-100"
        }`}
      >
        {bootLoading ? (
          // скелетоны 4шт
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-gray-200 bg-white p-5 shimmer h-[150px]" />
          ))
        ) : (
          <>
            {/* Address */}
            <article className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow animate-in-up"
              style={{ animationDelay: "0.00s", animationFillMode: "backwards" }}>
              <h2 id="contacts-info" className="text-xl font-semibold mb-2">{t("contacts.address.title")}</h2>
              <p>{t("contacts.address.value")}</p>
            </article>

            {/* Phones */}
            <article className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow animate-in-up"
              style={{ animationDelay: "0.07s", animationFillMode: "backwards" }}>
              <h2 className="text-xl font-semibold mb-2">{t("contacts.phone.title")}</h2>
              <ul className="space-y-1">
                <li><a className="!text-[#660000] hover:underline" href="tel:+998993936616">+998 99 393 66 16</a></li>
                <li><a className="!text-[#660000] hover:underline" href="tel:+998993091001">+998 99 309 10 01</a></li>
                <li><a className="!text-[#660000] hover:underline" href="tel:+998712536616">+998 71 253 66 16</a></li>
                <li><a className="!text-[#660000] hover:underline" href="tel:+998909791218">+998 90 979 12 18</a></li>
              </ul>
            </article>

            {/* Email */}
            <article className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow animate-in-up"
              style={{ animationDelay: "0.14s", animationFillMode: "backwards" }}>
              <h2 className="text-xl font-semibold mb-2">Email</h2>
              <a className="!text-[#660000] hover:underline" href="mailto:pojpro2012@gmail.com">
                pojpro2012@gmail.com
              </a>
            </article>

            {/* Hours */}
            <article className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow animate-in-up"
              style={{ animationDelay: "0.21s", animationFillMode: "backwards" }}>
              <h2 className="text-xl font-semibold mb-2">{t("contacts.hours.title")}</h2>
              <p>{t("contacts.hours.weekdays")}</p>
              <p>{t("contacts.hours.saturday")}</p>
              <p>{t("contacts.hours.sunday")}</p>
            </article>
          </>
        )}
      </section>

      {/* Карта */}
      <section className={`mt-10 transition-opacity duration-500 ${bootLoading ? "opacity-0" : "opacity-100"}`}>
        {bootLoading ? (
          <div className="h-[320px] w-full shimmer rounded-xl" />
        ) : (
          <MapSection />
        )}
      </section>

      {/* keyframes — те же, что в других экранах */}
      <style jsx global>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        .animate-fadeIn { animation: fadeIn .25s ease-out }

        @keyframes slideBar {
          0% { transform: translateX(-120%) }
          60% { transform: translateX(160%) }
          100% { transform: translateX(160%) }
        }
        .animate-slideBar { animation: slideBar 1.2s ease-in-out infinite }

        @keyframes inUp {
          0% { opacity: 0; transform: translateY(16px) }
          100% { opacity: 1; transform: translateY(0) }
        }
        .animate-in-up { animation: inUp .6s cubic-bezier(.22,.61,.36,1) both }

        .shimmer {
          position: relative;
          background: linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 37%, #f3f4f6 63%);
          background-size: 400% 100%;
          animation: shimmerMove 1.2s ease-in-out infinite;
        }
        @keyframes shimmerMove {
          0% { background-position: 100% 0 }
          100% { background-position: 0 0 }
        }
      `}</style>
      </main>
    </>
  );
}
