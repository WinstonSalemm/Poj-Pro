'use client';
import styles from './LanguageSwitcher.module.css';

const SUPPORTED = ['ru','en','uz'] as const;
type Lang = typeof SUPPORTED[number];

export default function LanguageSwitcher({ onChange }:{ onChange?: (l:Lang)=>void }) {
  const setLang = async (lng: Lang) => {
    try {
      const mod = (await import('i18next').catch(() => null)) as { default?: { changeLanguage?: (lng: string) => Promise<void> | void } } | null;
      const i18n = mod?.default;
      if (i18n?.changeLanguage) await i18n.changeLanguage(lng);
      onChange?.(lng);
      if (typeof window !== 'undefined') {
        localStorage.setItem('lang', lng);
        try { localStorage.setItem('i18nextLng', lng); } catch {}
        const url = new URL(window.location.href);
        url.searchParams.set('lang', lng);
        window.history.replaceState(null, '', url.toString());
        // Also set cookies for SSR detectors if used
        document.cookie = `i18next=${lng}; path=/; max-age=31536000; SameSite=Lax`;
        document.cookie = `lang=${lng}; path=/; max-age=31536000; SameSite=Lax`;
      }
    } catch {}
  };

  return (
    <div className={styles.wrap} role="group" aria-label="Выбор языка">
      {SUPPORTED.map(l => (
        <button key={l} className={styles.btn} onClick={() => setLang(l)} aria-label={`Язык ${l.toUpperCase()}`}>
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
