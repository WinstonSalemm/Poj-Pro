"use client";
import { useTranslation } from "@/i18n/useTranslation";

export default function ErrorCertificates({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const { t } = useTranslation("translation");
  return (
    <div className="max-w-5xl mt-[100px] mx-auto px-4 py-8">
      <div className="rounded-md border border-red-200 bg-red-50 p-4">
        <p className="text-red-700 mb-3">{t("common.error")}</p>
        <button
          onClick={() => reset()}
          className="inline-flex cursor-pointer items-center gap-2 text-sm !text-[#cc0000] rounded-md border px-3 py-2 hover:bg-white"
        >
          {t("common.tryAgain")}
        </button>
      </div>
    </div>
  );
}
