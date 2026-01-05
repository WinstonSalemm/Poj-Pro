'use client';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import i18n from '@/i18n';
import { X, Mail, Phone, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const STORAGE_KEY = 'pojpro-creator-modal-hidden';

// Маппинг языков для загрузки переводов
const langMap: Record<string, string> = {
  ru: 'ru',
  eng: 'eng',
  en: 'eng',
  uzb: 'uzb',
  uz: 'uzb',
};

export default function CreatorModal() {
  const [visible, setVisible] = useState(false);
  const { t, i18n: i18nInstance } = useTranslation('common');
  const [translationsLoaded, setTranslationsLoaded] = useState(false);

  // Загрузка переводов из public/locales
  useEffect(() => {
    const loadTranslationsForLang = async (lang: string) => {
      const langCode = langMap[lang] || lang;

      // Проверяем, загружены ли уже переводы для этого языка
      const hasLangCode = !!i18n.getResourceBundle(langCode, 'common');
      const hasLang = !!i18n.getResourceBundle(lang, 'common');

      if (hasLangCode || hasLang) {
        return true;
      }

      try {
        // Загружаем переводы из public/locales
        const response = await fetch(`/locales/${langCode}/common.json`);
        if (response.ok) {
          const translations = await response.json();
          i18n.addResourceBundle(langCode, 'common', translations, true, true);
          // Также добавляем для алиасов (en -> eng, uz -> uzb)
          if (lang === 'en' && langCode === 'eng') {
            i18n.addResourceBundle('en', 'common', translations, true, true);
          }
          if (lang === 'uz' && langCode === 'uzb') {
            i18n.addResourceBundle('uz', 'common', translations, true, true);
          }
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
      setTranslationsLoaded(true);
    };

    // Предзагружаем переводы для всех поддерживаемых языков
    const preloadAllTranslations = async () => {
      const languages = ['ru', 'eng', 'en', 'uzb', 'uz'];
      await Promise.all(languages.map(lang => loadTranslationsForLang(lang)));
    };

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

  useEffect(() => {
    const hidden = localStorage.getItem(STORAGE_KEY);
    if (hidden) return;

    // Показываем модальное окно через 3 секунды после загрузки
    const timer = setTimeout(() => {
      setVisible(true);
    }, 3000);

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

  const closeButtonLabel = t('close', { defaultValue: 'Закрыть' });

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, x: 20, scale: 0.95 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 20, scale: 0.95 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed bottom-6 right-6 z-50 w-[380px] max-w-[calc(100vw-2rem)]"
        >
          <div className="relative overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg ring-1 ring-black/5">
            {/* Decorative top bar */}
            <div className="absolute left-0 top-0 h-1.5 w-full bg-[#660000]"></div>

            {/* Close button */}
            <button
              onClick={close}
              aria-label={closeButtonLabel}
              className="absolute right-3 top-3 rounded-full p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 z-10"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Content */}
            <div className="p-6 pt-7">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {t('creator.title')}
                </h3>
                <p className="text-sm text-gray-600">
                  {t('creator.description')}
                </p>
              </div>

              <div className="space-y-3">
                {/* Email */}
                <a
                  href="mailto:winston234123@gmail.com"
                  className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-[#660000] hover:bg-[#fff0f0] transition-colors group"
                >
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#fff0f0] flex items-center justify-center group-hover:bg-[#660000] transition-colors">
                    <Mail className="h-5 w-5 text-[#660000] group-hover:text-white transition-colors" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-gray-500 mb-0.5">
                      {t('creator.email')}
                    </div>
                    <div className="text-sm font-medium text-gray-900 truncate">
                      winston234123@gmail.com
                    </div>
                  </div>
                </a>

                {/* Phone */}
                <a
                  href="tel:+998911321403"
                  className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-[#660000] hover:bg-[#fff0f0] transition-colors group"
                >
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#fff0f0] flex items-center justify-center group-hover:bg-[#660000] transition-colors">
                    <Phone className="h-5 w-5 text-[#660000] group-hover:text-white transition-colors" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-gray-500 mb-0.5">
                      {t('creator.phone')}
                    </div>
                    <div className="text-sm font-medium text-gray-900">
                      +998 91 132 14 03
                    </div>
                  </div>
                </a>

                {/* Telegram */}
                <a
                  href="https://t.me/djdvd1"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-[#660000] hover:bg-[#fff0f0] transition-colors group"
                >
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#fff0f0] flex items-center justify-center group-hover:bg-[#660000] transition-colors">
                    <MessageCircle className="h-5 w-5 text-[#660000] group-hover:text-white transition-colors" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-gray-500 mb-0.5">
                      {t('creator.telegram')}
                    </div>
                    <div className="text-sm font-medium text-gray-900">
                      @djdvd1
                    </div>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

