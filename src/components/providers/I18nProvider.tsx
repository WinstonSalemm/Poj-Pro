'use client';

import { I18nextProvider } from 'react-i18next';
import { useEffect, useState } from 'react';
import i18n from '@/i18n';

export function I18nProvider({ children, locale }: { children: React.ReactNode; locale: string }) {
    const [instance] = useState(() => i18n);

    useEffect(() => {
        // Check for saved language preference first
        const savedLang = localStorage.getItem('i18nextLng') || 
                         document.cookie.split(';').find(c => c.trim().startsWith('i18next='))?.split('=')[1];
        
        if (savedLang && i18n.language !== savedLang) {
            // Use saved language if available
            i18n.changeLanguage(savedLang);
        } else {
            // Otherwise use server-provided locale
            const normalizedLocale = locale === 'eng' ? 'en' : locale === 'uzb' ? 'uz' : locale;
            
            // Only change if different to avoid unnecessary updates
            if (i18n.language !== normalizedLocale) {
                i18n.changeLanguage(normalizedLocale);
            }
        }
    }, [locale]);

    return <I18nextProvider i18n={instance}>{children}</I18nextProvider>;
}
