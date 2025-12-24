"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "@/i18n/useTranslation";
import { suppliers } from "./suppliers";
import { BrandCard } from "./components/BrandCard";
import { PartnersSection } from "@/components/partners/PartnersSection";

export default function AboutPage() {
  const { t } = useTranslation("aboutus");
  const [bootLoading, setBootLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setBootLoading(false), 800);
    window.scrollTo({ top: 0, behavior: "smooth" });
    return () => clearTimeout(timer);
  }, []);

  const reasons = (t("reasons", { returnObjects: true }) || {}) as Record<
    string,
    { title: string; text: string }
  >;

  return (
    <main className="box-border w-full max-w-[1200px] mx-auto mt-[90px] px-4 py-10 bg-gray-50 relative text-[#660000]">
      {/* Шторка */}
      {bootLoading && (
        <div className="fixed inset-0 z-[60] bg-white text-black flex flex-col items-center justify-center animate-fadeIn">
          <div className="text-2xl font-semibold tracking-wide mb-6">...</div>
          <div className="w-[240px] h-[6px] rounded-full bg-black/10 overflow-hidden">
            <div className="h-full w-1/3 animate-slideBar rounded-full bg-black/70" />
          </div>
        </div>
      )}

      {/* Hero */}
      <section
        aria-labelledby="about-company"
        className={`relative overflow-hidden w-full mx-auto rounded-2xl border border-gray-200 bg-white shadow-sm p-6 md:p-10 transition-opacity duration-500 ${
          bootLoading ? "opacity-0" : "opacity-100"
        }`}
      >
        <h1
          id="about-company"
          className="text-center text-3xl md:text-4xl font-extrabold tracking-tight text-[#660000]"
        >
          {t("title")}
        </h1>

        <p className="mt-6 text-lg leading-8 max-w-3xl mx-auto text-[#660000]">
          {t("welcome")}
        </p>
        <p className="mt-4 text-lg leading-8 max-w-3xl mx-auto text-[#660000]">
          {t("mission")}
        </p>
      </section>

      {/* Advantages */}
      <section
        aria-labelledby="about-advantages"
        className={`relative w-full mx-auto mt-8 md:mt-12 rounded-2xl border border-gray-200 bg-gray-100 p-5 md:p-8 transition-opacity duration-500 ${
          bootLoading ? "opacity-0" : "opacity-100"
        }`}
      >
        <h2
          id="about-advantages"
          className="text-center text-2xl md:text-3xl font-bold text-[#660000]"
        >
          {t("subtitle")}
        </h2>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Object.entries(reasons).map(([key, value], idx) => (
            <article
              key={key}
              className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow animate-in-up"
              style={{
                animationDelay: `${idx * 0.07}s`,
                animationFillMode: "backwards",
              }}
            >
              <h3 className="text-xl font-semibold text-[#660000]">
                {value.title}
              </h3>
              <p className="mt-2 leading-7 text-[#660000]">{value.text}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Suppliers */}
      <section
        className={`relative w-full mx-auto mt-8 md:mt-12 transition-opacity duration-500 ${
          bootLoading ? "opacity-0" : "opacity-100"
        }`}
      >
        <h2 className="text-center text-2xl md:text-3xl font-bold mb-2 text-[#660000]">
          {t("suppliers.title")}
        </h2>
        <p className="text-center max-w-3xl mx-auto mb-8 text-[#660000]">
          {t("suppliers.subtitle")}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
          {suppliers.map((supplier, idx) => (
            <div
              key={supplier.slug}
              className="animate-in-up h-full"
              style={{
                animationDelay: `${idx * 0.07}s`,
                animationFillMode: "backwards",
              }}
            >
              {/* Если внутри BrandCard свои цвета — можно передать проп или обернуть в div с text-[#660000] */}
              <div className="text-[#660000] h-full">
                <BrandCard
                  name={supplier.name}
                  logo={supplier.logo}
                  href={supplier.href}
                  size={supplier.slug === 'ogneborets' ? 'xl' : (supplier.slug === 'elis' ? 'lg' : 'md')}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      

      {/* Partners Section */}
      <PartnersSection />
    </main>
  );
}
