import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "@/i18n/useTranslation";
import { init, sendForm } from "@emailjs/browser";

// Чтение ключей из NEXT_PUBLIC_* переменных окружения (Next.js)
const EMAILJS_PUBLIC_KEY = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY || "V2o_Np2EpP147edQc";
const EMAILJS_SERVICE = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || "service_5wviz1q";
const EMAILJS_TEMPLATE = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID || "template_pn0fuci";

type Status = "idle" | "sending" | "ok" | "error";

const isValidEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test((s || "").trim());
const onlyDigitsPlus = (s: string) => String(s || "").replace(/[^\d+]/g, "");
const has7Digits = (s: string) => (s.match(/\d/g) || []).length >= 7;

const EmailForm: React.FC = () => {
  const { t } = useTranslation();
  const formRef = useRef<HTMLFormElement | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [cooldownUntil, setCooldownUntil] = useState<number>(0);

  useEffect(() => {
    try {
      init(EMAILJS_PUBLIC_KEY);
    } catch {
      /* ignore if already initialized */
    }
  }, []);

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();

    // honeypot
    const hp = (formRef.current?.elements.namedItem("website") as HTMLInputElement | null);
    if (hp?.value) return;

    // cooldown анти-спам (10с)
    const now = Date.now();
    if (now < cooldownUntil) return;
    setCooldownUntil(now + 10_000);

    // простая валидация
    const email = (formRef.current?.elements.namedItem("from_email") as HTMLInputElement)?.value;
    const phone = (formRef.current?.elements.namedItem("from_Number") as HTMLInputElement)?.value;
    if (!isValidEmail(email || "")) {
      setStatus("error");
      return;
    }
    if (!has7Digits(onlyDigitsPlus(phone || ""))) {
      setStatus("error");
      return;
    }

    setStatus("sending");
    try {
      await sendForm(EMAILJS_SERVICE, EMAILJS_TEMPLATE, formRef.current as HTMLFormElement);
      setStatus("ok");
      formRef.current?.reset();
    } catch (err) {
      console.error("EmailJS error:", err);
      setStatus("error");
    }
  };

  return (
    <div className="w-full">
      <form
        ref={formRef}
        onSubmit={handleSubmit}
        noValidate
        className="w-full max-w-[800px] mx-auto bg-white rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.1)] p-6 sm:p-8 flex flex-col gap-4"
      >
        {/* Honeypot */}
        <input
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden
          className="absolute opacity-0 pointer-events-none h-0 w-0"
        />

        <input type="hidden" name="to_email" value="pojpro2012@gmail.com" />

        <h3 className="text-xl font-semibold text-[#660000] text-center mb-2">
          {t("emailform.heading")}
        </h3>

        <input
          type="text"
          name="from_name"
          placeholder={t("emailform.name") as string}
          required
          minLength={2}
          maxLength={80}
          autoComplete="name"
          aria-label={t("emailform.name") as string}
          className="w-full rounded-md border border-[#d9d9d9] px-4 py-3 outline-none transition focus:border-[#660000] focus:shadow-[0_0_0_3px_rgba(102,0,0,0.12)]"
        />

        <input
          type="email"
          name="from_email"
          placeholder={t("emailform.email") as string}
          required
          inputMode="email"
          autoComplete="email"
          aria-label={t("emailform.email") as string}
          className="w-full rounded-md border border-[#d9d9d9] px-4 py-3 outline-none transition focus:border-[#660000] focus:shadow-[0_0_0_3px_rgba(102,0,0,0.12)]"
        />

        <input
          type="tel"
          name="from_Number"
          placeholder={(t("emailform.phone") as string) || "Ваш телефон"}
          required
          inputMode="tel"
          autoComplete="tel"
          pattern="^[\d+\s()-]{7,}$"
          maxLength={24}
          aria-label={(t("emailform.phone") as string) || "Телефон"}
          className="w-full rounded-md border border-[#d9d9d9] px-4 py-3 outline-none transition focus:border-[#660000] focus:shadow-[0_0_0_3px_rgba(102,0,0,0.12)]"
        />

        <textarea
          name="message"
          placeholder={t("emailform.message") as string}
          required
          minLength={10}
          maxLength={2000}
          aria-label={t("emailform.message") as string}
          className="w-full rounded-md border border-[#d9d9d9] px-4 py-3 outline-none transition min-h-[120px] resize-y focus:border-[#660000] focus:shadow-[0_0_0_3px_rgba(102,0,0,0.12)]"
        />

        <button
          type="submit"
          disabled={status === "sending"}
          className="inline-flex items-center justify-center rounded-md bg-[#660000] text-white px-6 py-3 font-medium transition hover:bg-[#550000] disabled:opacity-70 disabled:cursor-not-allowed active:translate-y-[1px]"
        >
          {status === "sending"
            ? (t("emailform.sending") as string)
            : status === "ok"
            ? (t("emailform.sent") as string)
            : (t("emailform.send") as string)}
        </button>

        {status === "error" && (
          <p className="text-[#b00020] text-center mt-2">{t("emailform.error") as string}</p>
        )}
      </form>
    </div>
  );
};

export default EmailForm;
