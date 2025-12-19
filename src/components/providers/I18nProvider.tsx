'use client';

import { I18nextProvider } from 'react-i18next';
import { useEffect, useState } from 'react';
import i18n from '@/i18n';

export function I18nProvider({ children, locale }: { children: React.ReactNode; locale: string }) {
    const [instance] = useState(() => i18n);

    useEffect(() => {
        if (i18n.language !== locale) {
            i18n.changeLanguage(locale);
        }
    }, [locale]);

    return <I18nextProvider i18n={instance}>{children}</I18nextProvider>;
}
