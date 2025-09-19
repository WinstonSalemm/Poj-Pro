"use client";

import Link from "next/link";
import Image from "next/image";
import { useTranslation } from "react-i18next";
import { Truck, Box, Handshake, Phone, LineChart, ShoppingCart } from "lucide-react";

export default function SmallAboutUs() {
  // Use default namespace typing; keys are fully-qualified (e.g., 'aboutus.*')
  const { t } = useTranslation();

  const reasons = [
    { Icon: ShoppingCart, title: t("aboutus.reasons.first.title"), text: t("aboutus.reasons.first.text") },
    { Icon: Truck, title: t("aboutus.reasons.delivery.title"), text: t("aboutus.reasons.delivery.text") },
    { Icon: Box, title: t("aboutus.reasons.stock.title"), text: t("aboutus.reasons.stock.text") },
    { Icon: Handshake, title: t("aboutus.reasons.honest.title"), text: t("aboutus.reasons.honest.text") },
    { Icon: Phone, title: t("aboutus.reasons.support.title"), text: t("aboutus.reasons.support.text") },
    { Icon: LineChart, title: t("aboutus.reasons.stability.title"), text: t("aboutus.reasons.stability.text") },
  ];

  return (
    <section className="py-[60px] px-5 max-[480px]:py-10 max-[360px]:py-8">
      <div className="max-w-[1200px] mx-auto">
        <h2 className="text-[2.5rem] font-bold mb-1 text-[#660000] text-center rounded-[3%] pt-2 max-[768px]:text-[2rem] max-[480px]:text-[1.6rem] max-[360px]:text-[1.4rem]">
          {t("aboutus.title")}
        </h2>
        <p className="flex justify-center text-center items-center text-[1.1rem] font-bold mb-5 text-[#681818] max-[768px]:text-[1rem] max-[768px]:px-2 max-[480px]:text-[0.95rem] max-[360px]:text-[0.85rem]">
          {t("aboutus.subtitle")}
        </p>

        {/* grid: repeat(auto-fit, minmax(280px, 1fr)) */}
        <div className="grid [grid-template-columns:repeat(auto-fit,minmax(280px,1fr))] gap-[30px] pt-2 max-[480px]:gap-5 max-[360px]:gap-4">
          {reasons.map(({ Icon, title, text }, i) => (
            <div
              key={i}
              className="bg-[#ebebeb] border border-[#660000] border-l-[5px] rounded-lg p-5 max-[480px]:p-4 max-[360px]:p-3"
              style={{ borderRightWidth: 1, borderBottomWidth: 1, borderTopWidth: 1 }}
            >
              <h3 className="text-[1.3rem] mb-2 text-[#660000] flex items-center gap-2 max-[768px]:text-[1.1rem] max-[480px]:text-[1rem] max-[360px]:text-[0.9rem]">
                <Icon aria-hidden className="shrink-0" />
                {title}
              </h3>
              <p className="text-[#965454] text-[0.95rem] max-[768px]:text-[0.9rem] max-[480px]:text-[0.85rem] max-[360px]:text-[0.8rem]">
                {text}
              </p>
            </div>
          ))}
        </div>

        {/* Featured supplier card: Ogneborets */}
        <div className="mt-6">
          <a
            href="https://www.510777.xn--p1ai/ru"
            target="_blank"
            rel="noopener noreferrer"
            aria-label={t('aboutus.featuredSupplier.aria', { defaultValue: 'Открыть сайт поставщика Огнеборец' })}
            className="block"
          >
            <div
              className="flex flex-col items-center gap-3 bg-white rounded-2xl p-7 md:p-8 shadow hover:shadow-lg transition-shadow max-w-[600px] mx-auto border-2 border-[#660000]/30 hover:border-[#660000]/50"
            >
              <Image
                src="/brands/ogneborets.svg"
                alt="Логотип поставщика Огнеборец"
                width={640}
                height={180}
                className="h-32 md:h-36 w-auto object-contain"
                loading="lazy"
                fetchPriority="low"
                sizes="(max-width: 768px) 256px, 600px"
              />
              <div className="text-center">
                <div className="text-[#660000] font-semibold text-lg md:text-xl">{t('aboutus.featuredSupplier.title', { defaultValue: "Наш главный поставщик — 'Огнеборец'. Мы предлагаем купить огнетушители и все необходимое для пожарной безопасности в Ташкенте по лучшим ценам." })}</div>
                <div className="text-[#965454] text-sm mt-1">{t('aboutus.featuredSupplier.cta', { defaultValue: 'Нажмите, чтобы перейти на официальный сайт' })}</div>
              </div>
            </div>
          </a>
        </div>

        <div className="flex justify-center">
          <Link
            href="/about"
            className="
    mt-5 px-5 py-5
    !text-[#660000] visited:text-[#660000] hover:text-[#660000] active:text-[#660000]
    underline decoration-[#660000] underline-offset-2 decoration-2
    opacity-100
    focus:outline-none focus:ring-2 focus:ring-[#660000] focus:ring-offset-2
    max-[480px]:text-[0.95rem] max-[480px]:py-[15px]
    max-[360px]:text-[0.9rem] max-[360px]:py-3
  "
          >
            {t('aboutus.more')}
          </Link>
        </div>
      </div>
    </section>
  );
}
