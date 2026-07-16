'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useTranslation } from '@/i18n/useTranslation';

type Status = 'idle' | 'sending' | 'success' | 'error' | 'rate_limited';

type FormState = {
  name: string;
  email: string;
  phone: string;
  message: string;
  website: string;
};

function localeOf(language?: string): 'ru' | 'en' | 'uz' {
  const value = (language || 'ru').toLowerCase();
  if (value.startsWith('en')) return 'en';
  if (value.startsWith('uz')) return 'uz';
  return 'ru';
}
export default function EmailForm() {
  const { i18n } = useTranslation();
  const locale = localeOf(i18n?.language);
  const [product, setProduct] = useState('');
  const copy = useMemo(() => ({
    ru: {
      title: 'Оставить заявку', name: 'Ваше имя', email: 'Ваш email', phone: 'Ваш телефон', message: 'Опишите задачу или нужный товар', send: 'Отправить заявку', sending: 'Отправляем…', success: 'Заявка принята. Специалист свяжется с вами в рабочее время.', error: 'Не удалось отправить заявку. Попробуйте ещё раз или свяжитесь с нами напрямую.', rate: 'Слишком много попыток. Подождите несколько минут и повторите.', fallback: 'Можно сразу позвонить или написать в Telegram:',
    },
    en: {
      title: 'Send a request', name: 'Your name', email: 'Your email', phone: 'Your phone', message: 'Describe your request or product', send: 'Send request', sending: 'Sending…', success: 'Your request has been received. A specialist will contact you during business hours.', error: 'We could not send your request. Please try again or contact us directly.', rate: 'Too many attempts. Please wait a few minutes and try again.', fallback: 'You can also call or message us on Telegram:',
    },
    uz: {
      title: 'So‘rov qoldirish', name: 'Ismingiz', email: 'Emailingiz', phone: 'Telefon raqamingiz', message: 'Vazifangiz yoki kerakli mahsulotni yozing', send: 'So‘rov yuborish', sending: 'Yuborilmoqda…', success: 'So‘rovingiz qabul qilindi. Mutaxassis ish vaqtida siz bilan bog‘lanadi.', error: 'So‘rovni yuborib bo‘lmadi. Qayta urinib ko‘ring yoki biz bilan bevosita bog‘laning.', rate: 'Urinishlar juda ko‘p. Bir necha daqiqa kutib, qayta yuboring.', fallback: 'Darhol qo‘ng‘iroq qilishingiz yoki Telegram orqali yozishingiz mumkin:',
    },
  } as const)[locale], [locale]);
  const initialMessage = product ? `Интересует товар: ${product}` : '';
  const [form, setForm] = useState<FormState>({ name: '', email: '', phone: '', message: '', website: '' });
  const [status, setStatus] = useState<Status>('idle');
  const [startedAt] = useState(() => Date.now());

  useEffect(() => {
    const productFromQuery = new URLSearchParams(window.location.search).get('product')?.trim().slice(0, 200) || '';
    if (!productFromQuery) return;
    setProduct(productFromQuery);
    setForm((current) => current.message ? current : { ...current, message: `Интересует товар: ${productFromQuery}` });
  }, []);

  const update = (key: keyof FormState, value: string) => setForm((current) => ({ ...current, [key]: value }));

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus('sending');

    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, product, startedAt }),
      });

      if (response.ok) {
        setStatus('success');
        setForm({ name: '', email: '', phone: '', message: initialMessage, website: '' });
        return;
      }
      setStatus(response.status === 429 ? 'rate_limited' : 'error');
    } catch {
      setStatus('error');
    }
  };

  return (
    <form onSubmit={submit} className="mx-auto flex w-full max-w-2xl flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-7">
      <div>
        <h2 className="text-2xl font-semibold text-[#660000]">{copy.title}</h2>
        <p className="mt-2 text-sm leading-6 text-gray-600">{copy.fallback} <a className="font-medium !text-[#660000] underline" href="tel:+998712536616">+998 71 253 66 16</a> · <a className="font-medium !text-[#660000] underline" href="https://t.me/pojsystema" target="_blank" rel="noreferrer">Telegram</a></p>
      </div>

      <input
        type="text"
        name="website"
        value={form.website}
        onChange={(event) => update('website', event.target.value)}
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="absolute h-0 w-0 opacity-0 pointer-events-none"
      />

      <label className="grid gap-1.5 text-sm font-medium text-gray-800">
        {copy.name}
        <input required minLength={2} maxLength={80} autoComplete="name" value={form.name} onChange={(event) => update('name', event.target.value)} className="min-h-11 rounded-xl border border-gray-300 px-3 text-base outline-none focus:border-[#660000] focus:ring-2 focus:ring-[#660000]/20" />
      </label>
      <label className="grid gap-1.5 text-sm font-medium text-gray-800">
        {copy.email}
        <input required type="email" inputMode="email" maxLength={191} autoComplete="email" value={form.email} onChange={(event) => update('email', event.target.value)} className="min-h-11 rounded-xl border border-gray-300 px-3 text-base outline-none focus:border-[#660000] focus:ring-2 focus:ring-[#660000]/20" />
      </label>
      <label className="grid gap-1.5 text-sm font-medium text-gray-800">
        {copy.phone}
        <input required type="tel" inputMode="tel" minLength={7} maxLength={32} autoComplete="tel" value={form.phone} onChange={(event) => update('phone', event.target.value)} className="min-h-11 rounded-xl border border-gray-300 px-3 text-base outline-none focus:border-[#660000] focus:ring-2 focus:ring-[#660000]/20" />
      </label>
      <label className="grid gap-1.5 text-sm font-medium text-gray-800">
        {copy.message}
        <textarea required minLength={10} maxLength={2000} value={form.message} onChange={(event) => update('message', event.target.value)} className="min-h-32 rounded-xl border border-gray-300 px-3 py-2.5 text-base outline-none focus:border-[#660000] focus:ring-2 focus:ring-[#660000]/20" />
      </label>

      <button type="submit" disabled={status === 'sending'} className="inline-flex min-h-12 items-center justify-center rounded-xl bg-[#660000] px-5 py-3 font-semibold text-white transition-colors hover:bg-[#8B0000] disabled:cursor-not-allowed disabled:opacity-70">
        {status === 'sending' ? copy.sending : copy.send}
      </button>
      <p aria-live="polite" className={status === 'success' ? 'text-sm text-emerald-700' : status === 'idle' || status === 'sending' ? 'hidden' : 'text-sm text-red-700'}>
        {status === 'success' ? copy.success : status === 'rate_limited' ? copy.rate : copy.error}
      </p>
    </form>
  );
}
