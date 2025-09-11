"use client";

import { useTranslation } from "@/i18n/useTranslation";
import { Info } from "lucide-react";

export default function PreOrderBanner() {
  const { t } = useTranslation();

  return (
    <aside
      className="fixed left-4 bottom-6 z-40 w-[280px] sm:w-[320px]"
      aria-label={t('preOrderBanner.title', { defaultValue: 'Товар по предзаказу' })}
    >
      <div className="rounded-xl border border-[#660000]/25 bg-white shadow-lg shadow-gray-200/60 p-4 text-[#660000]">
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 text-[#660000] shrink-0" aria-hidden="true" />
          <div>
            <p className="text-sm font-semibold leading-snug">
              {t('preOrderBanner.title', { defaultValue: 'Товар по предзаказу' })}
            </p>
            <p className="mt-1 text-sm text-gray-600">
              {t('preOrderBanner.body', { defaultValue: 'Мы подготовим для вас выгодное коммерческое предложение и доставим товар быстро, качественно и по лучшей цене.' })}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
