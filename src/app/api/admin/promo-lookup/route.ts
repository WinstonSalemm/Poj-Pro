import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/requireAdmin";
import { serializeJSON } from "@/lib/json";
import { PERSONAL_PROMO_DISCOUNT_PERCENT } from "@/lib/personalPromo";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const revalidate = 0;

function normalizeCode(raw: string): string {
  return raw.trim().toUpperCase().replace(/[\s\-_.]/g, "");
}

export async function GET(request: NextRequest) {
  try {
    const authError = await requireAdmin();
    if (authError) return authError;

    const raw = request.nextUrl.searchParams.get("code") || "";
    const code = normalizeCode(raw);

    if (!code || code.length < 3) {
      return NextResponse.json(
        { ok: false, error: "Введите промокод (минимум 3 символа)" },
        { status: 400 },
      );
    }

    const user = await prisma.user.findFirst({
      where: { personalPromoCode: code },
      select: {
        id: true,
        name: true,
        email: true,
        personalPromoCode: true,
        createdAt: true,
        isAdmin: true,
        _count: { select: { orders: true } },
      },
    });

    if (user?.personalPromoCode) {
      const promo = await prisma.promoCode.findUnique({
        where: { code: user.personalPromoCode },
        select: {
          id: true,
          discount: true,
          isActive: true,
          usedCount: true,
          description: true,
        },
      });

      return NextResponse.json(
        serializeJSON({
          ok: true,
          found: true,
          code: user.personalPromoCode,
          discount: promo?.discount ?? PERSONAL_PROMO_DISCOUNT_PERCENT,
          isActive: promo?.isActive ?? true,
          usedCount: promo?.usedCount ?? 0,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            createdAt: user.createdAt,
            isAdmin: user.isAdmin,
            ordersCount: user._count.orders,
          },
        }),
      );
    }

    // Fallback: code exists in PromoCode but not linked as personal (legacy/manual)
    const promoOnly = await prisma.promoCode.findUnique({
      where: { code },
      select: {
        id: true,
        code: true,
        discount: true,
        isActive: true,
        usedCount: true,
        description: true,
        createdAt: true,
      },
    });

    if (promoOnly) {
      return NextResponse.json(
        serializeJSON({
          ok: true,
          found: true,
          code: promoOnly.code,
          discount: promoOnly.discount,
          isActive: promoOnly.isActive,
          usedCount: promoOnly.usedCount,
          user: null,
          note: promoOnly.description || "Промокод найден в общей базе (без привязки к пользователю)",
        }),
      );
    }

    return NextResponse.json({
      ok: true,
      found: false,
      code,
      message: "Промокод не найден",
    });
  } catch (error) {
    console.error("Promo lookup error:", error);
    return NextResponse.json(
      { ok: false, error: "Ошибка при поиске промокода" },
      { status: 500 },
    );
  }
}
