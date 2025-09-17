"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "@/i18n/useTranslation";
import Link from "next/link";
import GuideFAQClient from "@/components/guide/GuideFAQClient";

export default function GuideClient() {
  const { t } = useTranslation();
  const title = t("guide.title");
  const intro = t(
    "guide.intro"
  );

  // Track active section for TOC highlight
  const [activeId, setActiveId] = useState<string>("apt");

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
  const aptScrollRef = useRef<HTMLDivElement | null>(null);
  const officeScrollRef = useRef<HTMLDivElement | null>(null);
  const warehouseScrollRef = useRef<HTMLDivElement | null>(null);

  // Compute section IDs that actually exist
  const sectionIds = useMemo(() => {
    const ids = ["apt", "office", "warehouse"] as string[];
    if (mtRecs.length > 0) ids.push("maintenance");
    if (sgRecs.length > 0) ids.push("signage");
    ids.push("faq");
    return ids;
  }, [mtRecs.length, sgRecs.length]);

  useEffect(() => {
    // Observe sections to set activeId while scrolling
    const observer = new IntersectionObserver(
      (entries) => {
        // Pick the most visible entry
        let best: IntersectionObserverEntry | null = null;
        for (const e of entries) {
          if (!best || (e.intersectionRatio || 0) > (best.intersectionRatio || 0)) {
            best = e;
          }
        }
        if (best && best.isIntersecting && best.target && best.target.id) {
          setActiveId(best.target.id);
        }
      },
      {
        // account for fixed header (~68px)
        root: null,
        rootMargin: "-80px 0px -60% 0px",
        threshold: [0.15, 0.3, 0.6],
      }
    );
    const nodes = sectionIds
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => !!el);
    nodes.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [sectionIds]);

  // Custom horizontal scrollbar synced with a scroll container
  function HScrollBar({ scrollRef }: { scrollRef: React.RefObject<HTMLDivElement | null> }) {
    const trackRef = useRef<HTMLDivElement | null>(null);
    const [show, setShow] = useState(false);
    const [knobStyle, setKnobStyle] = useState<{ width: number; left: number }>({ width: 0, left: 0 });
    const brand = "#660000";

    const compute = () => {
      const el = scrollRef.current;
      const track = trackRef.current;
      if (!el || !track) return;
      const cw = el.clientWidth;
      const sw = el.scrollWidth;
      const hasOverflow = sw > cw + 2;
      setShow(hasOverflow);
      if (!hasOverflow) {
        setKnobStyle({ width: 0, left: 0 });
        return;
      }
      const tW = track.clientWidth;
      const knobW = Math.max(28, Math.round((tW * cw) / sw));
      const maxLeft = Math.max(0, tW - knobW);
      const left = Math.min(maxLeft, Math.max(0, (el.scrollLeft / Math.max(1, sw - cw)) * maxLeft));
      setKnobStyle({ width: knobW, left });
    };

    useEffect(() => {
      compute();
      const el = scrollRef.current;
      if (!el) return;
      const onScroll = () => compute();
      const onResize = () => compute();
      el.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", onResize);
      const ro = new ResizeObserver(() => compute());
      ro.observe(el);
      return () => {
        el.removeEventListener("scroll", onScroll);
        window.removeEventListener("resize", onResize);
        ro.disconnect();
      };
    }, []);

    // Drag behavior
    useEffect(() => {
      const track = trackRef.current;
      const el = scrollRef.current;
      if (!track || !el) return;
      let dragging = false;
      let startX = 0;
      let startLeft = 0;
      let startScrollLeft = 0;
      const onPointerDown = (e: PointerEvent) => {
        if (!(e.target as HTMLElement)?.dataset?.role) return;
        dragging = true;
        startX = e.clientX;
        startLeft = knobStyle.left;
        startScrollLeft = el.scrollLeft;
        (e.target as HTMLElement).setPointerCapture(e.pointerId);
        e.preventDefault();
      };
      const onPointerMove = (e: PointerEvent) => {
        if (!dragging) return;
        const tW = track.clientWidth;
        const cw = el.clientWidth;
        const sw = el.scrollWidth;
        const knobW = Math.max(28, Math.round((tW * cw) / sw));
        const maxLeft = Math.max(0, tW - knobW);
        const dx = e.clientX - startX;
        const nextLeft = Math.min(maxLeft, Math.max(0, startLeft + dx));
        const ratio = nextLeft / Math.max(1, maxLeft);
        el.scrollLeft = ratio * Math.max(1, sw - cw);
      };
      const onPointerUp = (e: PointerEvent) => {
        dragging = false;
        try { (e.target as HTMLElement).releasePointerCapture(e.pointerId); } catch {}
      };
      const onTrackClick = (e: MouseEvent) => {
        // Jump to position
        if (e.target && (e.target as HTMLElement).dataset.role === "knob") return;
        const rect = track.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const tW = track.clientWidth;
        const cw = el.clientWidth;
        const sw = el.scrollWidth;
        const knobW = Math.max(28, Math.round((tW * cw) / sw));
        const maxLeft = Math.max(0, tW - knobW);
        const clamped = Math.min(maxLeft, Math.max(0, x - knobW / 2));
        const ratio = clamped / Math.max(1, maxLeft);
        el.scrollTo({ left: ratio * Math.max(1, sw - cw), behavior: "smooth" });
      };
      track.addEventListener("pointerdown", onPointerDown);
      window.addEventListener("pointermove", onPointerMove);
      window.addEventListener("pointerup", onPointerUp);
      track.addEventListener("click", onTrackClick);
      return () => {
        track.removeEventListener("pointerdown", onPointerDown);
        window.removeEventListener("pointermove", onPointerMove);
        window.removeEventListener("pointerup", onPointerUp);
        track.removeEventListener("click", onTrackClick);
      };
    }, [knobStyle.left]);

    if (!show) return null;
    return (
      <div className="sm:hidden mt-2 select-none" ref={trackRef} role="presentation" aria-hidden>
        <div
          className="relative h-2 rounded-full"
          style={{ background: "#e8e8e8" }}
        >
          <div
            data-role="knob"
            className="absolute top-0 h-2 rounded-full"
            style={{ left: knobStyle.left, width: knobStyle.width, background: brand, boxShadow: "0 0 0 1px rgba(102,0,0,0.25) inset" }}
          />
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl md:text-3xl lg:text-4xl leading-tight font-semibold text-[#660000] mb-3 md:mb-4">
        {title}
      </h1>
      <p className="text-[#660000] text-base md:text-lg mb-4 md:mb-6">{intro}</p>

      {/* Table of contents */}
      <nav className="mb-4 md:mb-6" aria-label={t("guide.toc.title")}>
        <div className="rounded-xl border border-gray-200 bg-white p-3 sm:p-4">
          <h2 className="text-lg md:text-xl font-semibold text-[#660000] mb-2 md:mb-3">{t("guide.toc.title")}</h2>
          <ul className="flex flex-wrap gap-2.5 sm:gap-3 text-sm">
            <li><a className={`text-[#660000] hover:underline ${activeId==='apt' ? 'font-semibold underline underline-offset-4 decoration-[#660000]' : ''}`} aria-current={activeId==='apt' ? 'true' : undefined} href="#apt">{t("guide.sections.apartment.title")}</a></li>
            <li><a className={`text-[#660000] hover:underline ${activeId==='office' ? 'font-semibold underline underline-offset-4 decoration-[#660000]' : ''}`} aria-current={activeId==='office' ? 'true' : undefined} href="#office">{t("guide.sections.office.title")}</a></li>
            <li><a className={`text-[#660000] hover:underline ${activeId==='warehouse' ? 'font-semibold underline underline-offset-4 decoration-[#660000]' : ''}`} aria-current={activeId==='warehouse' ? 'true' : undefined} href="#warehouse">{t("guide.sections.warehouse.title")}</a></li>
            {mtRecs.length > 0 && <li><a className={`text-[#660000] hover:underline ${activeId==='maintenance' ? 'font-semibold underline underline-offset-4 decoration-[#660000]' : ''}`} aria-current={activeId==='maintenance' ? 'true' : undefined} href="#maintenance">{t("guide.sections.maintenance.title")}</a></li>}
            {sgRecs.length > 0 && <li><a className={`text-[#660000] hover:underline ${activeId==='signage' ? 'font-semibold underline underline-offset-4 decoration-[#660000]' : ''}`} aria-current={activeId==='signage' ? 'true' : undefined} href="#signage">{t("guide.sections.signage.title")}</a></li>}
            <li><a className={`text-[#660000] hover:underline ${activeId==='faq' ? 'font-semibold underline underline-offset-4 decoration-[#660000]' : ''}`} aria-current={activeId==='faq' ? 'true' : undefined} href="#faq">{t("guide.faqTitle")}</a></li>
          </ul>
        </div>
      </nav>

      {/* Quick catalog links */}
      <section className="mb-6 md:mb-8">
        <div className="rounded-xl border border-gray-200 bg-white p-4 sm:p-5">
          <h2 className="text-lg md:text-xl font-semibold text-[#660000] mb-3">{t("guide.quickLinks.title")}</h2>
          <div className="flex flex-col xs:flex-row flex-wrap gap-2">
            <Link href="/catalog/ognetushiteli" className="btn-ghost w-full sm:w-auto text-center">{t("categories.ognetushiteli")}</Link>
            <Link href="/catalog/pozharnye_shkafy" className="btn-ghost w-full sm:w-auto text-center">{t("categories.pozharnye_shkafy")}</Link>
            <Link href="/catalog/rukava_i_pozharnaya_armatura" className="btn-ghost w-full sm:w-auto text-center">{t("categories.rukava_i_pozharnaya_armatura")}</Link>
            <Link href="/catalog/pozharnaya_signalizatsiya_i_svetozvukovye_ustroystva" className="btn-ghost w-full sm:w-auto text-center">{t("categories.pozharnaya_signalizatsiya_i_svetozvukovye_ustroystva")}</Link>
            <Link href="/catalog/siz" className="btn-ghost w-full sm:w-auto text-center">{t("categories.siz")}</Link>
          </div>
        </div>
      </section>

      {/* Sections */}
      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div id="apt" className="scroll-mt-24 rounded-xl border border-gray-200 bg-white p-4 sm:p-5">
          <h3 className="text-base md:text-lg font-semibold text-[#660000] mb-2">{t("guide.sections.apartment.title")}</h3>
          <ul className="list-disc pl-5 text-gray-700 space-y-1">
            {aptRecs.map((x, i) => (<li key={i}>{x}</li>))}
          </ul>
        </div>
        <div id="office" className="scroll-mt-24 rounded-xl border border-gray-200 bg-white p-4 sm:p-5">
          <h3 className="text-base md:text-lg font-semibold text-[#660000] mb-2">{t("guide.sections.office.title")}</h3>
          <ul className="list-disc pl-5 text-gray-700 space-y-1">
            {offRecs.map((x, i) => (<li key={i}>{x}</li>))}
          </ul>
        </div>
        <div id="warehouse" className="scroll-mt-24 rounded-xl border border-gray-200 bg-white p-4 sm:p-5">
          <h3 className="text-base md:text-lg font-semibold text-[#660000] mb-2">{t("guide.sections.warehouse.title")}</h3>
          <ul className="list-disc pl-5 text-gray-700 space-y-1">
            {whRecs.map((x, i) => (<li key={i}>{x}</li>))}
          </ul>
        </div>
      </section>

      {(mtRecs.length > 0 || sgRecs.length > 0) && (
        <section className="mt-4 md:mt-6 grid gap-4 md:grid-cols-2">
          {mtRecs.length > 0 && (
            <div id="maintenance" className="scroll-mt-24 rounded-xl border border-gray-200 bg-white p-4">
              <h3 className="text-base font-semibold text-[#660000] mb-2">{t("guide.sections.maintenance.title")}</h3>
              <ul className="list-disc pl-5 text-gray-700 space-y-1">
                {mtRecs.map((x, i) => (<li key={i}>{x}</li>))}
              </ul>
            </div>
          )}
          {sgRecs.length > 0 && (
            <div id="signage" className="scroll-mt-24 rounded-xl border border-gray-200 bg-white p-4">
              <h3 className="text-base font-semibold text-[#660000] mb-2">{t("guide.sections.signage.title")}</h3>
              <ul className="list-disc pl-5 text-gray-700 space-y-1">
                {sgRecs.map((x, i) => (<li key={i}>{x}</li>))}
              </ul>
            </div>
          )}
        </section>
      )}

      {/* Minimum sets tables */}
      <section className="mt-6 md:mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <h3 className="text-base font-semibold text-[#660000] mb-2">{t("guide.tablesTitle")} — {t("guide.sections.apartment.title")}</h3>
          <div className="-mx-4 sm:mx-0 overflow-x-auto overflow-y-hidden" ref={aptScrollRef}>
            <table className="min-w-[640px] md:min-w-full table-fixed text-xs sm:text-sm">
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
          <HScrollBar scrollRef={aptScrollRef} />
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <h3 className="text-base font-semibold text-[#660000] mb-2">{t("guide.tablesTitle")} — {t("guide.sections.office.title")}</h3>
          <div className="-mx-4 sm:mx-0 overflow-x-auto overflow-y-hidden" ref={officeScrollRef}>
            <table className="min-w-[640px] md:min-w-full table-fixed text-xs sm:text-sm">
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
          <HScrollBar scrollRef={officeScrollRef} />
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <h3 className="text-base font-semibold text-[#660000] mb-2">{t("guide.tablesTitle")} — {t("guide.sections.warehouse.title")}</h3>
          <div className="-mx-4 sm:mx-0 overflow-x-auto overflow-y-hidden" ref={warehouseScrollRef}>
            <table className="min-w-[640px] md:min-w-full table-fixed text-xs sm:text-sm">
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
      <div id="faq" className="scroll-mt-24 mt-6 md:mt-8 rounded-xl border border-gray-200 bg-white p-4">
        <GuideFAQClient />
      </div>

      {/* CTA */}
      <section className="mt-6 md:mt-8 rounded-xl border border-gray-200 bg-white p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h3 className="text-lg md:text-xl font-semibold text-[#660000]">{t("guide.cta.title")}</h3>
          <p className="text-gray-700 text-sm md:text-base">{t("guide.cta.subtitle")}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/contacts?topic=quote" className="btn-primary w-full sm:w-auto text-center">{t("guide.cta.requestQuote")}</Link>
          <Link href="https://t.me/pojsystema" target="_blank" rel="noopener noreferrer" className="btn-ghost w-full sm:w-auto text-center">{t("guide.cta.consultation")}</Link>
        </div>
      </section>
    </div>
  );
}
