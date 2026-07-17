import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";

/** Ambiguity-safe alphabet (no 0/O, 1/I/L). */
const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

export const PERSONAL_PROMO_DISCOUNT_PERCENT = 5;
export const PERSONAL_PROMO_LENGTH = 8;

export function generatePersonalPromoCode(length = PERSONAL_PROMO_LENGTH): string {
  const bytes = randomBytes(length);
  let code = "";
  for (let i = 0; i < length; i++) {
    code += ALPHABET[bytes[i]! % ALPHABET.length];
  }
  return code;
}

/**
 * Ensures the user has a unique 8-char personal promo and a matching PromoCode (5%).
 * Safe to call repeatedly (idempotent if code already exists).
 */
export async function ensureUserPersonalPromo(userId: string): Promise<string> {
  const existing = await prisma.user.findUnique({
    where: { id: userId },
    select: { personalPromoCode: true, email: true },
  });

  if (!existing) {
    throw new Error("User not found");
  }

  if (existing.personalPromoCode) {
    await ensurePromoCodeRecord(existing.personalPromoCode, existing.email);
    return existing.personalPromoCode;
  }

  for (let attempt = 0; attempt < 12; attempt++) {
    const code = generatePersonalPromoCode();
    try {
      await prisma.$transaction(async (tx) => {
        await tx.user.update({
          where: { id: userId },
          data: { personalPromoCode: code },
        });
        await tx.promoCode.upsert({
          where: { code },
          create: {
            code,
            description: `Personal 5% registration promo (${existing.email})`,
            discount: PERSONAL_PROMO_DISCOUNT_PERCENT,
            isActive: true,
          },
          update: {
            discount: PERSONAL_PROMO_DISCOUNT_PERCENT,
            isActive: true,
          },
        });
      });
      return code;
    } catch (err: unknown) {
      const codeErr =
        typeof err === "object" && err && "code" in err
          ? (err as { code?: string }).code
          : undefined;
      if (codeErr === "P2002") continue;
      throw err;
    }
  }

  throw new Error("Failed to allocate personal promo code");
}

async function ensurePromoCodeRecord(code: string, email: string | null) {
  await prisma.promoCode.upsert({
    where: { code },
    create: {
      code,
      description: `Personal 5% registration promo (${email || "user"})`,
      discount: PERSONAL_PROMO_DISCOUNT_PERCENT,
      isActive: true,
    },
    update: {
      discount: PERSONAL_PROMO_DISCOUNT_PERCENT,
      isActive: true,
    },
  });
}
