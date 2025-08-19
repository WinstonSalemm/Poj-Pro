"use client";
import { useTranslation } from "@/i18n/useTranslation";

export default function LoadingCertificates() {
  const { t } = useTranslation("translation");
  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <p className="text-gray-600">{t("common.loading")}</p>
    </div>
  );
}
