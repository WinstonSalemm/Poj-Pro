// src/hooks/useLocale.ts
'use client';

import { useTranslation } from 'react-i18next';
import { useMemo } from 'react';

/**
 * Хук для получения текущей локали в клиентских компонентах
 * Возвращает локаль в формате, совместимом с API (ru, eng, uzb)
 */
export function useLocale(): 'ru' | 'eng' | 'uzb' {
  const { i18n } = useTranslation();
  
  return useMemo(() => {
    const lang = (i18n.language || 'ru').toLowerCase();
    // Преобразуем UI коды в коды БД
    if (lang === 'en' || lang.startsWith('en')) return 'eng';
    if (lang === 'uz' || lang.startsWith('uz')) return 'uzb';
    return 'ru';
  }, [i18n.language]);
}

/**
 * Хук для получения локали в формате Next.js (ru, en, uz)
 */
export function useLocaleNext(): 'ru' | 'en' | 'uz' {
  const { i18n } = useTranslation();
  
  return useMemo(() => {
    const lang = (i18n.language || 'ru').toLowerCase();
    if (lang === 'eng' || lang === 'en' || lang.startsWith('en')) return 'en';
    if (lang === 'uzb' || lang === 'uz' || lang.startsWith('uz')) return 'uz';
    return 'ru';
  }, [i18n.language]);
}
