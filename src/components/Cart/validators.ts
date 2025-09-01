export function isNotEmpty(v: string): boolean {
  return !!v && v.trim().length > 0;
}

export function isEmail(v: string): boolean {
  if (!v) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());
}

// Lightweight UZ phone format: +998 99 123 45 67
export function formatUzPhone(input: string): string {
  const digits = input.replace(/\D+/g, "");
  let out = "+998";
  let idx = 0;
  const src = digits.startsWith("998") ? digits.slice(3) : digits;
  // country prefix fixed
  if (src.length > 0) out += " " + src.slice(idx, (idx += Math.min(2, src.length)));
  if (src.length > 2) out += " " + src.slice(idx, (idx += Math.min(3, src.length - idx)));
  if (src.length > 5) out += " " + src.slice(idx, (idx += Math.min(2, src.length - idx)));
  if (src.length > 7) out += " " + src.slice(idx, (idx += Math.min(2, src.length - idx)));
  return out;
}
