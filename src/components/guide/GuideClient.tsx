"use client";

import { useTranslation } from "@/i18n/useTranslation";
import Link from "next/link";
import GuideFAQClient from "@/components/guide/GuideFAQClient";

export default function GuideClient() {
  const { t } = useTranslation();
  const title = t("guide.title");
  const intro = t(
    "guide.intro"
  );

  // helpers to read arrays from i18n
  const getArray = (key: string): string[] => {
    try {
      const anyT = t as unknown as (k: string, o?: unknown) => unknown;
      const arr = anyT(key, { returnObjects: true });
      return Array.isArray(arr) ? (arr as unknown as string[]) : [];
    } catch {
      return [];
    }
  };

  const aptRecs = getArray("guide.sections.apartment.recs");
  const offRecs = getArray("guide.sections.office.recs");
  const whRecs = getArray("guide.sections.warehouse.recs");
  const mtRecs = getArray("guide.sections.maintenance.recs");
  const sgRecs = getArray("guide.sections.signage.recs");
  // tables
  type Row = { type: string; qty: string; mount: string; notes: string };
  const getRows = (key: string): Row[] => {
    try {
      const anyT = t as unknown as (k: string, o?: unknown) => unknown;
      const arr = anyT(key, { returnObjects: true });
      return Array.isArray(arr) ? (arr as unknown as Row[]) : [];
    } catch {
      return [];
    }
  };
  const aptTable = getRows("guide.tables.apartment");
  const offTable = getRows("guide.tables.office");
  const whTable = getRows("guide.tables.warehouse");

  return (
    <div>
      <h1 className="text-2xl font-semibold text-[#660000] mb-3">{title}</h1>
      <p className="text-[#660000] mb-4">{intro}</p>

      {/* Table of contents */}
      <nav className="mb-4">
        <div className="rounded-xl border border-gray-200 bg-white p-3">
          <h2 className="text-lg font-semibold text-[#660000] mb-2">{t("guide.toc.title")}</h2>
          <ul className="flex flex-wrap gap-3 text-sm">
            <li><a className="text-[#660000] hover:underline" href="#apt">{t("guide.sections.apartment.title")}</a></li>
            <li><a className="text-[#660000] hover:underline" href="#office">{t("guide.sections.office.title")}</a></li>
            <li><a className="text-[#660000] hover:underline" href="#warehouse">{t("guide.sections.warehouse.title")}</a></li>
            {mtRecs.length > 0 && <li><a className="text-[#660000] hover:underline" href="#maintenance">{t("guide.sections.maintenance.title")}</a></li>}
            {sgRecs.length > 0 && <li><a className="text-[#660000] hover:underline" href="#signage">{t("guide.sections.signage.title")}</a></li>}
            <li><a className="text-[#660000] hover:underline" href="#faq">{t("guide.faqTitle")}</a></li>
          </ul>
        </div>
      </nav>

      {/* Quick catalog links */}
      <section className="mb-6">
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <h2 className="text-lg font-semibold text-[#660000] mb-3">{t("guide.quickLinks.title")}</h2>
          <div className="flex flex-wrap gap-2">
            <Link href="/catalog/ognetushiteli" className="btn-ghost">{t("categories.ognetushiteli")}</Link>
            <Link href="/catalog/pozharnye_shkafy" className="btn-ghost">{t("categories.pozharnye_shkafy")}</Link>
            <Link href="/catalog/rukava_i_pozharnaya_armatura" className="btn-ghost">{t("categories.rukava_i_pozharnaya_armatura")}</Link>
            <Link href="/catalog/pozharnaya_signalizatsiya_i_svetozvukovye_ustroystva" className="btn-ghost">{t("categories.pozharnaya_signalizatsiya_i_svetozvukovye_ustroystva")}</Link>
            <Link href="/catalog/siz" className="btn-ghost">{t("categories.siz")}</Link>
          </div>
        </div>
      </section>

      {/* Sections */}
      <section className="grid gap-4 md:grid-cols-3">
        <div id="apt" className="rounded-xl border border-gray-200 bg-white p-4">
          <h3 className="text-base font-semibold text-[#660000] mb-2">{t("guide.sections.apartment.title")}</h3>
          <ul className="list-disc pl-5 text-gray-700 space-y-1">
            {aptRecs.map((x, i) => (<li key={i}>{x}</li>))}
          </ul>
        </div>
        <div id="office" className="rounded-xl border border-gray-200 bg-white p-4">
          <h3 className="text-base font-semibold text-[#660000] mb-2">{t("guide.sections.office.title")}</h3>
          <ul className="list-disc pl-5 text-gray-700 space-y-1">
            {offRecs.map((x, i) => (<li key={i}>{x}</li>))}
          </ul>
        </div>
        <div id="warehouse" className="rounded-xl border border-gray-200 bg-white p-4">
          <h3 className="text-base font-semibold text-[#660000] mb-2">{t("guide.sections.warehouse.title")}</h3>
          <ul className="list-disc pl-5 text-gray-700 space-y-1">
            {whRecs.map((x, i) => (<li key={i}>{x}</li>))}
          </ul>
        </div>
      </section>

      {(mtRecs.length > 0 || sgRecs.length > 0) && (
        <section className="mt-4 grid gap-4 md:grid-cols-2">
          {mtRecs.length > 0 && (
            <div id="maintenance" className="rounded-xl border border-gray-200 bg-white p-4">
              <h3 className="text-base font-semibold text-[#660000] mb-2">{t("guide.sections.maintenance.title")}</h3>
              <ul className="list-disc pl-5 text-gray-700 space-y-1">
                {mtRecs.map((x, i) => (<li key={i}>{x}</li>))}
              </ul>
            </div>
          )}
          {sgRecs.length > 0 && (
            <div id="signage" className="rounded-xl border border-gray-200 bg-white p-4">
              <h3 className="text-base font-semibold text-[#660000] mb-2">{t("guide.sections.signage.title")}</h3>
              <ul className="list-disc pl-5 text-gray-700 space-y-1">
                {sgRecs.map((x, i) => (<li key={i}>{x}</li>))}
              </ul>
            </div>
          )}
        </section>
      )}

      {/* Minimum sets tables */}
      <section className="mt-6 grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <h3 className="text-base font-semibold text-[#660000] mb-2">{t("guide.tablesTitle")} — {t("guide.sections.apartment.title")}</h3>
          <div className="overflow-x-hidden">
            <table className="min-w-full table-fixed text-sm">
              <thead>
                <tr className="text-left text-gray-600">
                  <th className="w-2/5 py-1 pr-3 whitespace-normal break-words">{t("guide.tables.headers.type")}</th>
                  <th className="w-[15%] py-1 pr-3 whitespace-normal break-words">{t("guide.tables.headers.qty")}</th>
                  <th className="w-[22%] py-1 pr-3 whitespace-normal break-words">{t("guide.tables.headers.mount")}</th>
                  <th className="w-[23%] py-1 whitespace-normal break-words">{t("guide.tables.headers.notes")}</th>
                </tr>
              </thead>
              <tbody className="align-top">
                {aptTable.map((r, i) => (
                  <tr key={i} className="border-t">
                    <td className="w-2/5 py-2 pr-3 text-[#660000] whitespace-normal break-words">{r.type}</td>
                    <td className="w-[15%] py-2 pr-3 text-gray-800 whitespace-normal break-words">{r.qty}</td>
                    <td className="w-[22%] py-2 pr-3 text-gray-800 whitespace-normal break-words">{r.mount}</td>
                    <td className="w-[23%] py-2 text-gray-800 whitespace-normal break-words">{r.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <h3 className="text-base font-semibold text-[#660000] mb-2">{t("guide.tablesTitle")} — {t("guide.sections.office.title")}</h3>
          <div className="overflow-x-hidden overflow-y-hidden">
            <table className="min-w-full table-fixed text-sm">
              <thead>
                <tr className="text-left text-gray-600">
                  <th className="w-2/5 py-1 pr-3 whitespace-normal break-words">{t("guide.tables.headers.type")}</th>
                  <th className="w-[15%] py-1 pr-3 whitespace-normal break-words">{t("guide.tables.headers.qty")}</th>
                  <th className="w-[22%] py-1 pr-3 whitespace-normal break-words">{t("guide.tables.headers.mount")}</th>
                  <th className="w-[23%] py-1 whitespace-normal break-words">{t("guide.tables.headers.notes")}</th>
                </tr>
              </thead>
              <tbody className="align-top">
                {offTable.map((r, i) => (
                  <tr key={i} className="border-t">
                    <td className="w-2/5 py-2 pr-3 text-[#660000] whitespace-normal break-words">{r.type}</td>
                    <td className="w-[15%] py-2 pr-3 text-gray-800 whitespace-normal break-words">{r.qty}</td>
                    <td className="w-[22%] py-2 pr-3 text-gray-800 whitespace-normal break-words">{r.mount}</td>
                    <td className="w-[23%] py-2 text-gray-800 whitespace-normal break-words">{r.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <h3 className="text-base font-semibold text-[#660000] mb-2">{t("guide.tablesTitle")} — {t("guide.sections.warehouse.title")}</h3>
          <div className="overflow-x-hidden overflow-y-hidden">
            <table className="min-w-full table-fixed text-sm">
              <thead>
                <tr className="text-left text-gray-600">
                  <th className="w-2/5 py-1 pr-3 whitespace-normal break-words">{t("guide.tables.headers.type")}</th>
                  <th className="w-[15%] py-1 pr-3 whitespace-normal break-words">{t("guide.tables.headers.qty")}</th>
                  <th className="w-[22%] py-1 pr-3 whitespace-normal break-words">{t("guide.tables.headers.mount")}</th>
                  <th className="w-[23%] py-1 whitespace-normal break-words">{t("guide.tables.headers.notes")}</th>
                </tr>
              </thead>
              <tbody className="align-top">
                {whTable.map((r, i) => (
                  <tr key={i} className="border-t">
                    <td className="w-2/5 py-2 pr-3 text-[#660000] whitespace-normal break-words">{r.type}</td>
                    <td className="w-[15%] py-2 pr-3 text-gray-800 whitespace-normal break-words">{r.qty}</td>
                    <td className="w-[22%] py-2 pr-3 text-gray-800 whitespace-normal break-words">{r.mount}</td>
                    <td className="w-[23%] py-2 text-gray-800 whitespace-normal break-words">{r.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <div id="faq" className="mt-6 rounded-xl border border-gray-200 bg-white p-4">
        <GuideFAQClient />
      </div>

      {/* CTA */}
      <section className="mt-6 rounded-xl border border-gray-200 bg-white p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-[#660000]">{t("guide.cta.title")}</h3>
          <p className="text-gray-700">{t("guide.cta.subtitle")}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/contacts?topic=quote" className="btn-primary">{t("guide.cta.requestQuote")}</Link>
          <Link href="https://t.me/Pro_security_uz" target="_blank" rel="noopener noreferrer" className="btn-ghost">{t("guide.cta.consultation")}</Link>
        </div>
      </section>
    </div>
  );
}
