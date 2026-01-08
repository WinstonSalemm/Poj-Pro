"use client";

import React from 'react';
import { useTranslation } from '@/i18n/useTranslation';
import FAQAccordion from '@/components/seo/FAQAccordion';

export default function FAQSectionClient({ faqKey }: { faqKey: string }) {
  const { t } = useTranslation('common');
  const title = t('faq');
  return (
    <section className="py-12 px-4 max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-center">{title || 'Часто задаваемые вопросы'}</h2>
      <FAQAccordion faqKey={faqKey} jsonLd />
    </section>
  );
}
