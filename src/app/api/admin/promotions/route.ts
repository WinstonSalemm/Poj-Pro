import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/requireAdmin";
import { serializeJSON } from "@/lib/json";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

type I18nInput = {
  locale: string;
  title: string;
  summary?: string | null;
  description?: string | null;
};

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9а-яё\s-_]/gi, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
}

export async function GET() {
  try {
    const authError = await requireAdmin();
    if (authError) return authError;

    const rows = await prisma.promotion.findMany({
      include: {
        i18n: true,
      },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    });

    const data = rows.map((row) => ({
      id: row.id,
      slug: row.slug,
      image: row.image,
      isActive: row.isActive,
      startsAt: row.startsAt,
      endsAt: row.endsAt,
      sortOrder: row.sortOrder,
      ctaUrl: row.ctaUrl,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      i18n: row.i18n,
      title: row.i18n.find((t) => t.locale === "ru")?.title || row.i18n[0]?.title || row.slug,
    }));

    return NextResponse.json(serializeJSON({ success: true, data }), { status: 200 });
  } catch (error) {
    console.error("[admin/promotions][GET] error", error);
    return NextResponse.json({ success: false, message: "Failed to fetch promotions" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authError = await requireAdmin();
    if (authError) return authError;

    const body = await request.json();
    const {
      slug: rawSlug,
      image,
      imageData,
      isActive = true,
      startsAt,
      endsAt,
      sortOrder = 0,
      ctaUrl,
      i18n,
    } = body as {
      slug?: string;
      image?: string | null;
      imageData?: string | null;
      isActive?: boolean;
      startsAt?: string | null;
      endsAt?: string | null;
      sortOrder?: number;
      ctaUrl?: string | null;
      i18n?: I18nInput[];
    };

    const ruTitle = i18n?.find((x) => x.locale === "ru")?.title || i18n?.[0]?.title;
    const slug = (rawSlug?.trim() || (ruTitle ? slugify(ruTitle) : "")).trim();
    if (!slug) {
      return NextResponse.json({ success: false, message: "slug or title is required" }, { status: 400 });
    }
    if (!i18n?.length || !i18n.some((x) => x.title?.trim())) {
      return NextResponse.json({ success: false, message: "At least one localized title is required" }, { status: 400 });
    }

    const created = await prisma.promotion.create({
      data: {
        slug,
        image: image || null,
        imageData: imageData ? Buffer.from(imageData, "base64") : undefined,
        isActive: Boolean(isActive),
        startsAt: startsAt ? new Date(startsAt) : null,
        endsAt: endsAt ? new Date(endsAt) : null,
        sortOrder: Number(sortOrder) || 0,
        ctaUrl: ctaUrl || null,
        i18n: {
          create: i18n
            .filter((x) => x.title?.trim())
            .map((x) => ({
              locale: x.locale,
              title: x.title.trim(),
              summary: x.summary || null,
              description: x.description || null,
            })),
        },
      },
      include: { i18n: true },
    });

    return NextResponse.json(serializeJSON({ success: true, data: created }), { status: 201 });
  } catch (error) {
    console.error("[admin/promotions][POST] error", error);
    return NextResponse.json({ success: false, message: "Failed to create promotion" }, { status: 500 });
  }
}
