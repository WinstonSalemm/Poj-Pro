"use client";
import React from "react";
import { useTranslation } from "@/i18n/useTranslation";

export default function Price({ price }: { price: number | null }) {
  const { t } = useTranslation();

  if (price === null) {
    return <span>{t('common.priceOnRequest')}</span>;
  }

  const formatted = new Intl.NumberFormat(undefined, {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);

  return (
    <span>
      {formatted} {t('common.currency')}
    </span>
  );
}
