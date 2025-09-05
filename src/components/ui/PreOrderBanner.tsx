"use client";

import { useTranslation } from "@/i18n/useTranslation";
import { Info } from "lucide-react";

export default function PreOrderBanner() {
  const { t } = useTranslation();

  return (
    <div className="mb-6 rounded-md border-l-4 border-blue-500 bg-blue-50 p-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <Info className="h-5 w-5 text-blue-400" aria-hidden="true" />
        </div>
        <div className="ml-3">
          <p className="text-sm font-bold text-blue-800">
            {t('preOrderBanner.title', { defaultValue: 'Товар по предзаказу' })}
          </p>
          <p className="mt-1 text-sm text-blue-700">
            {t('preOrderBanner.body', { defaultValue: 'Мы подготовим для вас выгодное коммерческое предложение и доставим товар быстро, качественно и по лучшей цене.' })}
          </p>
        </div>
      </div>
    </div>
  );
}
