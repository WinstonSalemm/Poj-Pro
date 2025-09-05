// src/types/dictionaries.d.ts
declare module '*.json' {
  const value: Record<string, unknown>;

  export default value;
}
