import { prisma } from "@/lib/prisma";
import type { PromotionCard } from "@/types/promotion";

export type AppLocale = "ru" | "en" | "uz";

function toDbLocale(locale: AppLocale): "ru" | "eng" | "uzb" {
  if (locale === "en") return "eng";
  if (locale === "uz") return "uzb";
  return "ru";
}

function pickI18n(
  rows: Array<{
    locale: string;
    title: string;
    summary: string | null;
    description: string | null;
    image: string | null;
  }>,
  locale: AppLocale
) {
  const db = toDbLocale(locale);
  return (
    rows.find((r) => r.locale === db) ||
    rows.find((r) => r.locale === "ru") ||
    rows.find((r) => r.locale === locale) ||
    rows[0]
  );
}

function resolveImageUrl(
  localeImage: string | null | undefined,
  fallbackImage: string | null | undefined
): string | null {
  return localeImage || fallbackImage || null;
}

export function isPromotionActiveNow(p: {
  isActive: boolean;
  startsAt: Date | null;
  endsAt: Date | null;
  now?: Date;
}): boolean {
  if (!p.isActive) return false;
  const now = p.now ?? new Date();
  if (p.startsAt && p.startsAt > now) return false;
  if (p.endsAt && p.endsAt < now) return false;
  return true;
}

export async function getActivePromotions(
  locale: AppLocale,
  opts?: { limit?: number }
): Promise<PromotionCard[]> {
  const now = new Date();
  const rows = await prisma.promotion.findMany({
    where: {
      isActive: true,
      AND: [
        { OR: [{ startsAt: null }, { startsAt: { lte: now } }] },
        { OR: [{ endsAt: null }, { endsAt: { gte: now } }] },
      ],
    },
    select: {
      id: true,
      slug: true,
      image: true,
      ctaUrl: true,
      startsAt: true,
      endsAt: true,
      i18n: {
        select: { locale: true, title: true, summary: true, description: true, image: true },
      },
    },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    take: opts?.limit,
  });

  return rows.map((row) => {
    const t = pickI18n(row.i18n, locale);
    return {
      id: row.id,
      slug: row.slug,
      title: t?.title || row.slug,
      summary: t?.summary || "",
      description: t?.description || null,
      imageUrl: resolveImageUrl(t?.image, row.image),
      href: row.ctaUrl,
      startsAt: row.startsAt ? row.startsAt.toISOString() : null,
      endsAt: row.endsAt ? row.endsAt.toISOString() : null,
    };
  });
}
