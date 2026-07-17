import { NextRequest, NextResponse } from "next/server";
import { getActivePromotions, type AppLocale } from "@/lib/promotions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 60;

function normalizeLocale(raw: string | null): AppLocale {
  const v = (raw ?? "ru").toLowerCase();
  if (v.startsWith("en")) return "en";
  if (v.startsWith("uz")) return "uz";
  return "ru";
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const locale = normalizeLocale(searchParams.get("locale"));
    const limitRaw = searchParams.get("limit");
    const limit = limitRaw ? Math.min(50, Math.max(1, Number(limitRaw) || 12)) : undefined;
    const promotions = await getActivePromotions(locale, { limit });
    return NextResponse.json({ success: true, promotions });
  } catch (error) {
    console.error("[api/promotions][GET] error", error);
    return NextResponse.json({ success: false, promotions: [], message: "Failed to load promotions" }, { status: 500 });
  }
}
