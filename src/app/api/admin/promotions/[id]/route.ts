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

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authError = await requireAdmin();
    if (authError) return authError;

    const { id } = await params;
    const row = await prisma.promotion.findUnique({
      where: { id },
      include: { i18n: true },
    });
    if (!row) {
      return NextResponse.json({ success: false, message: "Not found" }, { status: 404 });
    }
    return NextResponse.json(serializeJSON({ success: true, data: row }));
  } catch (error) {
    console.error("[admin/promotions/[id]][GET] error", error);
    return NextResponse.json({ success: false, message: "Failed to fetch promotion" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authError = await requireAdmin();
    if (authError) return authError;

    const { id } = await params;
    const body = await request.json();
    const {
      slug,
      image,
      imageData,
      isActive,
      startsAt,
      endsAt,
      sortOrder,
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

    const existing = await prisma.promotion.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ success: false, message: "Not found" }, { status: 404 });
    }

    const updated = await prisma.$transaction(async (tx) => {
      if (i18n?.length) {
        for (const row of i18n) {
          if (!row.title?.trim()) continue;
          await tx.promotionI18n.upsert({
            where: {
              promotionId_locale: {
                promotionId: id,
                locale: row.locale,
              },
            },
            create: {
              promotionId: id,
              locale: row.locale,
              title: row.title.trim(),
              summary: row.summary || null,
              description: row.description || null,
            },
            update: {
              title: row.title.trim(),
              summary: row.summary || null,
              description: row.description || null,
            },
          });
        }
      }

      return tx.promotion.update({
        where: { id },
        data: {
          ...(slug !== undefined ? { slug: slug.trim() } : {}),
          ...(image !== undefined ? { image } : {}),
          ...(imageData !== undefined
            ? { imageData: imageData ? Buffer.from(imageData, "base64") : null }
            : {}),
          ...(isActive !== undefined ? { isActive: Boolean(isActive) } : {}),
          ...(startsAt !== undefined ? { startsAt: startsAt ? new Date(startsAt) : null } : {}),
          ...(endsAt !== undefined ? { endsAt: endsAt ? new Date(endsAt) : null } : {}),
          ...(sortOrder !== undefined ? { sortOrder: Number(sortOrder) || 0 } : {}),
          ...(ctaUrl !== undefined ? { ctaUrl } : {}),
        },
        include: { i18n: true },
      });
    });

    return NextResponse.json(serializeJSON({ success: true, data: updated }));
  } catch (error) {
    console.error("[admin/promotions/[id]][PATCH] error", error);
    return NextResponse.json({ success: false, message: "Failed to update promotion" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authError = await requireAdmin();
    if (authError) return authError;

    const { id } = await params;
    await prisma.promotion.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[admin/promotions/[id]][DELETE] error", error);
    return NextResponse.json({ success: false, message: "Failed to delete promotion" }, { status: 500 });
  }
}
