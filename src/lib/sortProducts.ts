// src/lib/sortProducts.ts
type Item = { id?: string | number; name?: string; title?: string; slug?: string };

const OP_ORDER = [2, 3, 4, 5, 6, 8, 10, 25, 30, 35, 40, 50, 70, 100];

const norm = (s: string) =>
  s.toLowerCase().replace(/ё/g, "е").replace(/\s+/g, " ").trim();

function parseGroupAndSize(p: Item) {
  // Locale-invariant text: prefer slug, then id. Avoid using translated title/name
  const textSlug = norm(`${p.slug ?? ""}`);
  const textId = norm(`${p.id ?? ""}`);
  const textFallback = norm(`${p.title ?? ""} ${p.name ?? ""}`);
  const text = textSlug || textId || textFallback;

  // сначала ловим перезарядку (по slug не всегда видно) — проверим и fallback‑текст
  // поддержка разных языков/транслитераций: перезарядка / perezaryad(ka) / peresaryad(ka) / recharge / qayta zaryad / заправка / refill
  const rechargeText = (textSlug || textFallback);
  const isRecharge = (
    /перезаряд/i.test(rechargeText) ||
    /perezaryad/i.test(rechargeText) ||
    /perezaryadka/i.test(rechargeText) ||
    /peresaryad/i.test(rechargeText) ||
    /peresaryadka/i.test(rechargeText) ||
    /recharge/i.test(rechargeText) ||
    /qayta\s*zaryad/i.test(rechargeText) ||
    /заправк/i.test(rechargeText) ||
    /refill/i.test(rechargeText)
  );
  if (isRecharge) {
    return { group: "recharge" as const, size: NaN, key: textSlug || textId || rechargeText };
  }

  // ОП (powder extinguishers)
  const mOP = (textSlug || text).match(/\b(оп|op)\s*[-–—]?\s*(\d+(?:[.,]\d+)?)/i);
  if (mOP) {
    const size = parseFloat(mOP[2].replace(",", "."));
    return { group: "op" as const, size, key: textSlug || textId || text };
  }

  // ОУ / OU (CO2)
  const mOU = (textSlug || text).match(/\b(оу|ou)\s*[-–—]?\s*(\d+(?:[.,]\d+)?)/i);
  if (mOU) {
    const size = parseFloat(mOU[2].replace(",", "."));
    return { group: "ou" as const, size, key: textSlug || textId || text };
  }

  // МПП / MPP (modules)
  const forMPP = textSlug || text;
  const mMPP =
    forMPP.match(/\bмпп\s*[-–—]?\s*(\d+(?:[.,]\d+)?)/i) ||
    forMPP.match(/\bmpp\s*[-–—]?\s*(\d+(?:[.,]\d+)?)/i);
  if (mMPP) {
    const size = parseFloat(mMPP[mMPP.length - 1].replace(",", "."));
    return { group: "mpp" as const, size, key: textSlug || textId || forMPP };
  }

  return { group: "other" as const, size: NaN, key: textSlug || textId || text };
}

const PRIORITY: Record<string, number> = {
  op: 1,      // сначала ОП
  ou: 2,      // потом ОУ
  mpp: 3,     // потом модули
  other: 4,   // остальное
  recharge: 5 // в самом конце перезарядка
};

export function sortProductsAsc<T extends Item>(arr: T[]): T[] {
  return [...arr].sort((a, b) => {
    const A = parseGroupAndSize(a);
    const B = parseGroupAndSize(b);

    // приоритет групп
    if (PRIORITY[A.group] !== PRIORITY[B.group]) {
      return PRIORITY[A.group] - PRIORITY[B.group];
    }

    // внутри ОП → по списку OP_ORDER
    if (A.group === "op" && B.group === "op") {
      const ai = Number.isFinite(A.size) ? OP_ORDER.indexOf(A.size) : -1;
      const bi = Number.isFinite(B.size) ? OP_ORDER.indexOf(B.size) : -1;

      if (ai !== bi) {
        if (ai === -1) return 1;
        if (bi === -1) return -1;
        return ai - bi;
      }

      if (Number.isFinite(A.size) && Number.isFinite(B.size) && A.size !== B.size) {
        return A.size - B.size;
      }
      // Tie-breaker must be locale-invariant: compare by slug/id-derived keys only
      return (a.slug ?? `${a.id ?? ""}`).localeCompare((b.slug ?? `${b.id ?? ""}`), undefined, { numeric: true });
    }

    // внутри ОУ и МПП → по числу
    if ((A.group === "ou" || A.group === "mpp")) {
      if (Number.isFinite(A.size) && Number.isFinite(B.size) && A.size !== B.size) {
        return A.size - B.size;
      }
      return (a.slug ?? `${a.id ?? ""}`).localeCompare((b.slug ?? `${b.id ?? ""}`), undefined, { numeric: true });
    }

    // остальное — сравнение по slug/id
    return (a.slug ?? `${a.id ?? ""}`).localeCompare((b.slug ?? `${b.id ?? ""}`), undefined, { numeric: true });
  });
}
