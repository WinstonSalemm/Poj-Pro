import { promises as fs } from 'fs';
import path from 'path';
import { getDictionary, type Locale } from '@/i18n/server';
import { CATEGORIES, CATEGORY_NAMES, CATEGORY_IMAGE_MAP } from '@/constants/categories';
import { CATEGORY_NAME_OVERRIDES, type Lang } from '@/constants/categoryNameOverrides';
import CategoryGridClient from './CategoryGridClient';

type Dictionary = {
  categories?: Record<string, string>;
  [key: string]: any;
};

type CanonLang = 'ru' | 'en' | 'uz';
const LANG_SYNONYMS: Record<CanonLang, readonly string[]> = {
  ru: ['ru', 'rus'],
  en: ['en', 'eng'],
  uz: ['uz', 'uzb'],
};

function normalizeLang(input: string | undefined): CanonLang {
  const v = (input || 'ru').toLowerCase();
  if (v.startsWith('en')) return 'en';
  if (v.startsWith('uz')) return 'uz';
  return 'ru';
}

/** Takes a value by language with key synonyms ('en'|'eng', 'uz'|'uzb') */
function pickByLang<T extends Record<string, any> | undefined>(
  dict: T,
  lang: CanonLang
): any | undefined {
  if (!dict) return undefined;
  for (const k of LANG_SYNONYMS[lang]) {
    if (k in dict && dict[k] != null) return (dict as any)[k];
  }
  return undefined;
}

function prettyFromSlug(slug: string) {
  return slug.replace(/[-_]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export default async function CategoryBlock({ locale }: { locale: Locale }) {
  const dictionary = await getDictionary(locale) as Dictionary;
  const lang = normalizeLang(String(locale));

  const labels: Record<string, string> = {};
  const missingLabels: string[] = [];

  for (const slug of CATEGORIES) {
    // Normalize slug format for consistent lookup
    const normalizedSlug = slug.replace(/_/g, '-');
    const altSlug = slug.replace(/-/g, '_');
    
    // 1) Try manual overrides first (check both formats)
    const override = pickByLang(CATEGORY_NAME_OVERRIDES[slug] || 
                              CATEGORY_NAME_OVERRIDES[normalizedSlug] || 
                              CATEGORY_NAME_OVERRIDES[altSlug] as Partial<Record<Lang, string>>, lang);
    if (override) {
      labels[slug] = override;
      continue;
    }
    
    // 2) Try general constants dictionary
    const constantName = pickByLang(CATEGORY_NAMES[slug] as Partial<Record<string, string>>, lang);
    if (constantName) {
      labels[slug] = constantName;
      continue;
    }
    
    // 3) Try i18n dictionary
    const dictName = dictionary?.categories?.[slug];
    if (dictName) {
      labels[slug] = dictName;
      continue;
    }
    
    // 4) Fallback to pretty slug
    const prettySlug = prettyFromSlug(slug);
    labels[slug] = prettySlug;
    
    // Track missing labels in development
    if (process.env.NODE_ENV !== 'production') {
      missingLabels.push(slug);
    }
  }

  if (process.env.NODE_ENV !== 'production' && missingLabels.length > 0) {
    // eslint-disable-next-line no-console
    console.warn('[CategoryBlock] missing labels for slugs:', missingLabels);
  }

  // Resolve image map
  const imageMap: Record<string, string> = {};
  const dir = path.join(process.cwd(), 'public', 'CatalogImage');
  const placeholderSlugs: string[] = [];

  for (const slug of CATEGORIES) {
    const imageName = CATEGORY_IMAGE_MAP[slug];
    if (imageName) {
      try {
        await fs.access(path.join(dir, imageName));
        imageMap[slug] = `/CatalogImage/${imageName}`;
        continue;
      } catch {}
    }
    
    // Try slug-based assets
    try {
      await fs.access(path.join(dir, `${slug}.webp`));
      imageMap[slug] = `/CatalogImage/${slug}.webp`;
      continue;
    } catch {}
    
    try {
      await fs.access(path.join(dir, `${slug}.png`));
      imageMap[slug] = `/CatalogImage/${slug}.png`;
      continue;
    } catch {}

    // Fallback to remote placeholder with label text; client will render as-is
    const label = labels[slug] || prettyFromSlug(slug);
    imageMap[slug] = `https://placehold.co/160x160?text=${encodeURIComponent(label)}`;
    placeholderSlugs.push(slug);
  }

  if (process.env.NODE_ENV !== 'production' && placeholderSlugs.length > 0) {
    console.warn('[CategoryBlock] Using placeholders for categories:', placeholderSlugs);
  }

  return (
    <CategoryGridClient
      dictionary={dictionary}
      labels={labels}
      imageMap={imageMap}
    />
  );
}
