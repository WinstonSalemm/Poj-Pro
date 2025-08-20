import type { Decimal } from '@prisma/client/runtime/library';

export function serializeJSON<T>(v: T): T {
  return JSON.parse(
    JSON.stringify(v, (_k, val) => {
      // Decimal
      if (
        val &&
        typeof val === 'object' &&
        typeof (val as { toString?: () => string }).toString === 'function' &&
        (val as { constructor?: { name?: string } }).constructor?.name === 'Decimal'
      ) {
        const n = Number((val as unknown as Decimal).toString());
        return Number.isFinite(n) ? n : (val as { toString: () => string }).toString();
      }
      // BigInt
      if (typeof val === 'bigint') return Number(val);
      return val;
    })
  );
}
