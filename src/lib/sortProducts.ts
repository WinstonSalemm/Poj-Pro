// src/lib/sortProducts.ts
type Item = { id?: string | number; name?: string; title?: string };

const OP_ORDER = [2, 3, 4, 5, 6, 8, 10, 25, 30, 35, 40, 50, 70, 100];

const norm = (s: string) =>
  s.toLowerCase().replace(/ё/g, "е").replace(/\s+/g, " ").trim();

function parseGroupAndSize(p: Item) {
  const text = norm(`${p.name ?? ""} ${p.title ?? ""} ${p.id ?? ""}`);

  // сначала ловим перезарядку
  if (text.includes("перезаряд")) {
    return { group: "recharge" as const, size: NaN, key: text };
  }

  // ОП
  const mOP = text.match(/\b(оп|op)\s*[-–—]?\s*(\d+(?:[.,]\d+)?)/i);
  if (mOP) {
    const size = parseFloat(mOP[2].replace(",", "."));
    return { group: "op" as const, size, key: text };
  }

  // ОУ
  const mOU = text.match(/\b(оу|ou)\s*[-–—]?\s*(\d+(?:[.,]\d+)?)/i);
  if (mOU) {
    const size = parseFloat(mOU[2].replace(",", "."));
    return { group: "ou" as const, size, key: text };
  }

  // МПП
  const mMPP =
    text.match(/\bмпп\s*[-–—]?\s*(\d+(?:[.,]\d+)?)/i) ||
    text.match(/\bmpp\s*[-–—]?\s*(\d+(?:[.,]\d+)?)/i);
  if (mMPP) {
    const size = parseFloat(mMPP[mMPP.length - 1].replace(",", "."));
    return { group: "mpp" as const, size, key: text };
  }

  return { group: "other" as const, size: NaN, key: text };
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
      return A.key.localeCompare(B.key, undefined, { numeric: true });
    }

    // внутри ОУ и МПП → по числу
    if ((A.group === "ou" || A.group === "mpp")) {
      if (Number.isFinite(A.size) && Number.isFinite(B.size) && A.size !== B.size) {
        return A.size - B.size;
      }
      return A.key.localeCompare(B.key, undefined, { numeric: true });
    }

    // остальное
    return A.key.localeCompare(B.key, undefined, { numeric: true });
  });
}
