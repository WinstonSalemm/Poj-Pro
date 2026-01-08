'use client';
import Link from 'next/link';
import { useEffect, useState, useMemo } from 'react';
import { useTranslation } from '@/i18n/useTranslation';
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
  const [hasNewProducts, setHasNewProducts] = useState(false);
  const [checkingProducts, setCheckingProducts] = useState(true);

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

  // Проверяем наличие новых товаров
  useEffect(() => {
    const checkNewProducts = async () => {
      try {
        // Получаем локаль в формате БД
        const langCode = langMap[currentLang] || currentLang || 'ru';
        const dbLocale = langCode === 'eng' ? 'eng' : langCode === 'uzb' ? 'uzb' : 'ru';
        
        const response = await fetch(
          `/api/products/featured?type=new&locale=${dbLocale}&limit=1`
        );
        
        if (response.ok) {
          const data = await response.json();
          const hasProducts = data.success && 
                            Array.isArray(data.data?.products) && 
                            data.data.products.length > 0;
          setHasNewProducts(hasProducts);
        } else {
          setHasNewProducts(false);
        }
      } catch (error) {
        console.warn('Failed to check new products:', error);
        setHasNewProducts(false);
      } finally {
        setCheckingProducts(false);
      }
    };

    if (translationsLoaded) {
      checkNewProducts();
    }
  }, [translationsLoaded, currentLang]);

  useEffect(() => {
    const hidden = localStorage.getItem(STORAGE_KEY);
    if (hidden) return;
    
    // Не показываем модальное окно если нет новых товаров или еще проверяем
    if (checkingProducts || !hasNewProducts) return;

    let timer: NodeJS.Timeout | null = null;
    let startTime = Date.now();
    let accumulatedTime = 0;
    let isPageVisible = !document.hidden;

    // Отслеживаем видимость страницы - приостанавливаем таймер если пользователь ушел
    const handleVisibilityChange = () => {
      const now = Date.now();
      if (document.hidden) {
        // Страница скрыта - сохраняем накопленное время и останавливаем таймер
        accumulatedTime += now - startTime;
        if (timer) {
          clearTimeout(timer);
          timer = null;
        }
      } else {
        // Страница видна - возобновляем отсчет с оставшегося времени
        isPageVisible = true;
        startTime = now;
        const remainingTime = Math.max(0, 60000 - accumulatedTime);
        if (remainingTime > 0) {
          timer = setTimeout(() => {
            setVisible(true);
          }, remainingTime);
        } else {
          // Если уже накопилось 60 секунд, показываем сразу
          setVisible(true);
        }
      }
    };

    // Начинаем отсчет 60 секунд
    timer = setTimeout(() => {
      if (isPageVisible) {
        setVisible(true);
      }
    }, 60000);

    // Отслеживаем видимость страницы
    document.addEventListener('visibilitychange', handleVisibilityChange);

    const onEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };

    window.addEventListener('keydown', onEsc);

    return () => {
      if (timer) clearTimeout(timer);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('keydown', onEsc);
    };
  }, [checkingProducts, hasNewProducts]);

  const close = () => {
    localStorage.setItem(STORAGE_KEY, '1');
    setVisible(false);
  };

  // Переводим aria-label для кнопки закрытия
  const closeButtonLabel = t('close', { defaultValue: 'Закрыть', ns: 'translation' });

  return (
    <AnimatePresence>
      {visible && (
        <>
          {/* Backdrop with blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-md"
          />
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ 
              type: 'spring', 
              damping: 30, 
              stiffness: 400,
              mass: 0.8
            }}
            className="fixed top-1/2 left-1/2 z-50 w-[280px] -translate-x-1/2 -translate-y-1/2 max-w-[calc(100vw-2rem)]"
          >
          <div className="relative overflow-hidden rounded-xl border border-red-100 bg-white shadow-lg ring-1 ring-black/5">
            {/* Decorative elements */}
            <div className="absolute left-0 top-0 h-1.5 w-full bg-[#660000]"></div>
            <div className="absolute right-4 top-4 text-[#ffebee]">
              <AlertCircle className="h-16 w-16 opacity-10" />
            </div>

            {/* Close button - заметная, но не режущая */}
            <button
              onClick={close}
              aria-label={closeButtonLabel}
              className="absolute right-3 top-3 z-10 rounded-full p-1.5 bg-white/90 backdrop-blur-sm border border-gray-200 text-gray-600 transition-all hover:bg-white hover:text-[#660000] hover:border-[#660000]/30 hover:shadow-sm"
            >
              <X className="h-4 w-4" />
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
        </>
      )}
    </AnimatePresence>
  );
}