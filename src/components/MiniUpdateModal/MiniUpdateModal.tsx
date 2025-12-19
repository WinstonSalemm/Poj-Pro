'use client';
import Link from 'next/link';
import { useEffect, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import i18n from '@/i18n';
import { X, AlertCircle, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const STORAGE_KEY = 'pojpro-mini-update-hidden';

// Маппинг языков для загрузки переводов
const langMap: Record<string, string> = {
  ru: 'ru',
  eng: 'eng',
  en: 'eng',
  uzb: 'uzb',
  uz: 'uzb',
};

export default function MiniUpdateModal() {
  const [visible, setVisible] = useState(false);
  const { t, i18n: i18nInstance } = useTranslation('common');
  const [translationsLoaded, setTranslationsLoaded] = useState(false);
  const [currentLang, setCurrentLang] = useState(i18nInstance.language || 'ru');

  // Загрузка переводов из public/locales
  useEffect(() => {
    const loadTranslationsForLang = async (lang: string) => {
      const langCode = langMap[lang] || lang;

      // Проверяем, загружены ли уже переводы для этого языка и всех его алиасов
      // Используем прямой импорт i18n для проверки наличия ресурсов
      const hasLangCode = !!i18n.getResourceBundle(langCode, 'common');
      const hasLang = !!i18n.getResourceBundle(lang, 'common');

      if (hasLangCode || hasLang) {
        return true; // Переводы уже загружены
      }

      try {
        // Загружаем переводы из public/locales
        const response = await fetch(`/locales/${langCode}/common.json`);
        if (response.ok) {
          const translations = await response.json();
          // Добавляем переводы для основного языка
          i18n.addResourceBundle(langCode, 'common', translations, true, true);
          // Также добавляем для алиасов (en -> eng, uz -> uzb)
          if (lang === 'en' && langCode === 'eng') {
            i18n.addResourceBundle('en', 'common', translations, true, true);
          }
          if (lang === 'uz' && langCode === 'uzb') {
            i18n.addResourceBundle('uz', 'common', translations, true, true);
          }
          // Если текущий язык отличается от langCode, добавляем и для него
          if (lang !== langCode) {
            i18n.addResourceBundle(lang, 'common', translations, true, true);
          }
          return true;
        }
        return false;
      } catch (error) {
        console.warn(`Failed to load common translations for ${lang}:`, error);
        return false;
      }
    };

    const loadTranslations = async (lang: string) => {
      await loadTranslationsForLang(lang);
      setCurrentLang(lang);
      setTranslationsLoaded(true);
    };

    // Предзагружаем переводы для всех поддерживаемых языков
    const preloadAllTranslations = async () => {
      const languages = ['ru', 'eng', 'en', 'uzb', 'uz'];
      await Promise.all(languages.map(lang => loadTranslationsForLang(lang)));
    };

    // Предзагружаем все переводы при монтировании
    preloadAllTranslations();

    // Загружаем переводы для текущего языка
    const initialLang = i18nInstance.language || 'ru';
    loadTranslations(initialLang);

    // Слушаем изменения языка
    const handleLanguageChange = async (lng: string) => {
      setTranslationsLoaded(false);
      await loadTranslations(lng);
    };

    i18n.on('languageChanged', handleLanguageChange);

    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, [i18nInstance]);

  const updateItems = useMemo(() => {
    if (!translationsLoaded) return [];
    const items = t('updates.items', { returnObjects: true, defaultValue: [] });
    return Array.isArray(items) ? items : [];
  }, [t, translationsLoaded, currentLang]);

  useEffect(() => {
    const hidden = localStorage.getItem(STORAGE_KEY);
    if (hidden) return;

    const timer = setTimeout(() => {
      setVisible(true);
    }, 2000);

    const onEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };

    window.addEventListener('keydown', onEsc);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('keydown', onEsc);
    };
  }, []);

  const close = () => {
    localStorage.setItem(STORAGE_KEY, '1');
    setVisible(false);
  };

  // Переводим aria-label для кнопки закрытия
  const closeButtonLabel = t('close', { defaultValue: 'Закрыть', ns: 'translation' });

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed bottom-6 right-6 z-50 w-[360px] max-w-[calc(100vw-2rem)]"
        >
          <div className="relative overflow-hidden rounded-xl border border-red-100 bg-white shadow-lg ring-1 ring-black/5">
            {/* Decorative elements */}
            <div className="absolute left-0 top-0 h-1.5 w-full bg-[#660000]"></div>
            <div className="absolute right-4 top-4 text-[#ffebee]">
              <AlertCircle className="h-16 w-16 opacity-10" />
            </div>

            {/* Close button */}
            <button
              onClick={close}
              aria-label={closeButtonLabel}
              className="absolute right-3 top-3 rounded-full p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Content */}
            <div className="p-5 pt-6">
              <div className="flex items-start">
                <div className="mr-4 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#fff0f0] text-[#660000]">
                  <AlertCircle className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {t('updates.title')}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {t('updates.subtitle')}
                  </p>
                </div>
              </div>

              <ul className="mt-4 space-y-2.5 text-sm text-gray-700">
                {updateItems?.map((item, index) => (
                  <li key={index} className="flex items-start">
                    <span className="mr-2 mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#660000]"></span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <Link
                href="/catalog"
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-[#660000] px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-[#7a0000] hover:shadow-md"
              >
                {t('goToCatalog')}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}