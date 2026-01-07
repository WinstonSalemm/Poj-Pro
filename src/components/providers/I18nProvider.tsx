'use client';

import { I18nextProvider } from 'react-i18next';
import { useEffect, useState } from 'react';
import i18n from '@/i18n';

export function I18nProvider({ children, locale }: { children: React.ReactNode; locale: string }) {
    const [instance] = useState(() => i18n);

    useEffect(() => {
        // Normalize locale: convert legacy codes to standard codes
        const normalizedLocale = locale === 'eng' ? 'en' : locale === 'uzb' ? 'uz' : locale;
        
        // Only change if different to avoid unnecessary updates
        if (i18n.language !== normalizedLocale) {
            i18n.changeLanguage(normalizedLocale);
        }
    }, [locale]);

    return <I18nextProvider i18n={instance}>{children}</I18nextProvider>;
}
