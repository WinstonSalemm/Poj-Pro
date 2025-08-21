'use client';

import { useTranslation as useI18nTranslation } from 'react-i18next';
import { useCallback } from 'react';

// Define supported languages (accept aliases and standard codes)
type SupportedLanguage = 'ru' | 'uzb' | 'eng' | 'en' | 'uz';

// Extend i18next types
declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'translation';
  }
}

type KnownNS = 'translation' | 'aboutus';

export function useTranslation(ns?: KnownNS) {
  const nsArg = (ns ?? 'translation') as unknown as Parameters<typeof useI18nTranslation>[0];
  const { t, i18n: i18nInstance } = useI18nTranslation(nsArg);
  
  // Wrapper around i18n.changeLanguage to ensure we only use supported languages
  const changeLanguage = useCallback((lng: string) => {
    // Normalize language code (e.g., 'en-US' -> 'en')
    const head = lng.toLowerCase().split('-')[0] as SupportedLanguage;
    // Map standard codes to our primary resource keys
    const mapped: SupportedLanguage = head === 'en' ? 'eng' : head === 'uz' ? 'uzb' : head;
    const allowed: readonly SupportedLanguage[] = ['ru', 'uzb', 'eng', 'en', 'uz'];
    if (allowed.includes(head)) {
      return i18nInstance.changeLanguage(mapped);
    }
    return i18nInstance.changeLanguage('ru');
  }, [i18nInstance]);
  
  // Get current language, defaulting to 'ru' if not set
  const currentLanguage = (i18nInstance.language as SupportedLanguage) || 'ru';
  
  return {
    t: t as <T = string>(key: string, options?: T) => string,
    i18n: i18nInstance,
    changeLanguage,
    currentLanguage,
    ready: true
  };
}

// Define a more specific type for translation keys if needed
type TranslationKeys = string; // You can make this more specific if you have a list of all possible keys

export type TranslationKey = TranslationKeys;

export function useTranslatedText(key: TranslationKey): string {
  const { t } = useTranslation();
  return t(key);
}

// Helper type to get all possible translation keys
export type TranslationFunction = (key: TranslationKey) => string;
