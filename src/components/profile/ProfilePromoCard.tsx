"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

type Props = {
  code: string;
  discountPercent?: number;
};

export default function ProfilePromoCard({ code, discountPercent = 5 }: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // ignore
    }
  };

  return (
    <section className="overflow-hidden rounded-2xl border border-[#660000]/15 bg-white shadow-[0_8px_28px_rgba(102,0,0,0.06)]">
      <div className="bg-[#660000] px-5 py-4 text-white sm:px-6">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-white/70">
          Ваш персональный промокод
        </p>
        <p className="mt-1 text-sm text-white/90">
          Скидка {discountPercent}% на любой заказ
        </p>
      </div>

      <div className="space-y-5 px-5 py-5 sm:px-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex-1 rounded-xl border border-dashed border-[#660000]/35 bg-[#fff9f8] px-4 py-4 text-center">
            <p className="font-mono text-2xl font-bold tracking-[0.28em] text-[#660000] sm:text-3xl">
              {code}
            </p>
          </div>
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#660000] px-4 text-sm font-semibold text-white transition hover:bg-[#8B0000]"
          >
            {copied ? <Check size={18} /> : <Copy size={18} />}
            {copied ? "Скопировано" : "Скопировать"}
          </button>
        </div>

        <ul className="space-y-3 text-sm leading-6 text-gray-700">
          <li className="flex gap-3">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#660000]" aria-hidden />
            <span>
              При оформлении заказа на сайте укажите этот промокод - получите скидку{" "}
              <strong className="font-semibold text-gray-900">{discountPercent}%</strong>.
            </span>
          </li>
          <li className="flex gap-3">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#660000]" aria-hidden />
            <span>
              Скидка действует на <strong className="font-semibold text-gray-900">любой заказ</strong> -
              без минимальной суммы.
            </span>
          </li>
          <li className="flex gap-3">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#660000]" aria-hidden />
            <span>
              Можно воспользоваться и в магазине: покажите или назовите промокод из аккаунта
              продавцу - скидка {discountPercent}% будет применена так же.
            </span>
          </li>
        </ul>
      </div>
    </section>
  );
}
