import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getContentType(url: string): string {
  if (url.endsWith(".png")) return "image/png";
  if (url.endsWith(".jpg") || url.endsWith(".jpeg")) return "image/jpeg";
  if (url.endsWith(".webp")) return "image/webp";
  if (url.endsWith(".avif")) return "image/avif";
  if (url.endsWith(".gif")) return "image/gif";
  return "image/jpeg";
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "Image ID required" }, { status: 400 });
    }

    const promo = await prisma.promotion.findFirst({
      where: { id },
      select: { imageData: true, image: true },
    });

    if (promo?.imageData) {
      const buffer = Buffer.from(promo.imageData);
      return new NextResponse(buffer, {
        headers: {
          "Content-Type": getContentType(promo.image || ""),
          "Cache-Control": "public, max-age=31536000, immutable",
        },
      });
    }

    return NextResponse.json({ error: "Image not found" }, { status: 404 });
  } catch (error) {
    console.error("[api/promotions/image][GET] error:", error);
    return NextResponse.json({ error: "Failed to load image" }, { status: 500 });
  }
}
