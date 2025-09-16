import Image from "next/image";
import Link from "next/link";

export default function AutumnPromo({ locale }: { locale: string }) {
  const t = (key: string) => {
    const ru = {
      badge: "Осенняя акция",
      title: "Оптовая цена на огнетушитель ОП-4 — 85 000 сум",
      desc: "Сертификат. Сервис. Бесплатная доставка по Ташкенту при заказе от 5 000 000 сум.",
      cta1: "Заказать",
      cta2: "Каталог огнетушителей",
    } as const;
    const uz = {
      badge: "Kuzgi aksiya",
      title: "OP-4 o‘t o‘chirgich uchun ulgurji narx — 85 000 so‘m",
      desc: "Sertifikat. Servis. Toshkent bo‘ylab yetkazib berish. 5 000 000 so‘m dan buyuk buyurtmalarga yetkazib berish.",
      cta1: "Buyurtma berish",
      cta2: "O‘t o‘chirgichlar katalogi",
    } as const;
    const en = {
      badge: "Autumn promotion",
      title: "Wholesale price for OP-4 extinguisher — 85,000 UZS",
      desc: "Certified. Service. Delivery in Tashkent. Orders over 5 000 000 UZS are delivered.",
      cta1: "Order now",
      cta2: "Extinguishers catalog",
    } as const;
    const dict = locale === "uz" ? uz : locale === "en" ? en : ru;
    return (dict as any)[key];
  };

  return (
    <section aria-label={t("badge")} className="container-section mt-[100px]">
      <div className="relative overflow-hidden rounded-xl border border-[#660000]/20 bg-[#3B0000] text-white shadow-md">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6 p-4 md:p-6 lg:p-7">
          {/* Text */}
          <div className="flex-1 min-w-0 order-2 md:order-1 text-left">
            <div className="inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-xs md:text-sm font-medium tracking-wide">
              {t("badge")}
            </div>
            {(() => {
              const full = t("title");
              const idx = full.lastIndexOf("—");
              const left = idx !== -1 ? full.slice(0, idx).trim() : full;
              const right = idx !== -1 ? full.slice(idx + 1).trim() : "";
              return (
                <h2 className="mt-2 md:mt-3 text-lg md:text-2xl font-bold leading-snug">
                  {left}
                  {idx !== -1 && (
                    <>
                      {" - "}
                      <span className="inline-block align-baseline rounded bg-white text-[#660000] px-2 py-0.5 md:px-2.5 md:py-1 font-extrabold tracking-tight">
                        {right}
                      </span>
                    </>
                  )}
                </h2>
              );
            })()}
            <p className="mt-1 md:mt-2 text-sm md:text-base text-white/90">
              {t("desc")}
            </p>

            <div className="mt-3 md:mt-4 flex flex-wrap gap-3">
              <Link
                href="/contacts"
                className="inline-flex items-center justify-center rounded-md bg-white text-[#660000] px-4 py-2 text-sm md:text-base font-semibold hover:bg-white/95 transition-colors"
              >
                {t("cta1")}
              </Link>
              <Link
                href="/catalog/ognetushiteli"
                className="inline-flex items-center justify-center rounded-md border border-white/60 px-4 py-2 text-sm md:text-base font-semibold text-white hover:bg-white/10 transition-colors"
              >
                {t("cta2")}
              </Link>
            </div>
          </div>

          {/* Image */}
          <div className="relative w-[140px] h-[140px] md:w-[180px] md:h-[180px] lg:w-[200px] lg:h-[200px] shrink-0 order-1 md:order-2 self-start md:self-auto">
            <Image
              src="/ProductImages/Op-4.png"
              alt="Огнетушитель ОП-4"
              fill
              sizes="(max-width: 768px) 140px, (max-width: 1024px) 180px, 200px"
              className="object-contain drop-shadow-[0_6px_16px_rgba(0,0,0,0.35)]"
              priority
              quality={80}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
