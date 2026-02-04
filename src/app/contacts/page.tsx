import ContactsClient from "./ContactsClient";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { buildPageMetadata, langFromCookieHeader } from "@/lib/metadata";
import LocalBusinessJsonLd from "@/components/seo/LocalBusinessJsonLd";
import { BreadcrumbJsonLd } from "@/components/seo/BreadcrumbJsonLd";
import { SITE_URL } from "@/lib/site";
import { AdsConversionOnMount } from "@/components/analytics/AdsConversionOnMount";

export async function generateMetadata(): Promise<Metadata> {
  const h = await headers();
  const cookie = h.get("cookie");
  const lang = langFromCookieHeader(cookie);
  return buildPageMetadata({
    titleKey: "contacts.seo.title",
    descriptionKey: "contacts.seo.description",
    path: "/contacts",
    lang,
    keywords: ['контакты', 'связаться', 'адрес', 'телефон', 'POJ PRO', 'Ташкент'],
  });
}

export default function ContactsPage() {
  return (
    <>
      {/* JSON-LD: Breadcrumbs */}
      <BreadcrumbJsonLd items={[
        { name: 'POJ PRO', url: '/' },
        { name: 'Контакты', url: '/contacts' },
      ]} />

      {/* JSON-LD: LocalBusiness */}
      <LocalBusinessJsonLd
        name="POJ PRO"
        url={SITE_URL + '/contacts'}
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

      <ContactsClient />

      {/* Google Ads: Конверсия "Контакт" (загрузка страницы контактов) */}
      <AdsConversionOnMount type="contact" />
    </>
  );
}
