// Allow importing JSON files as modules
declare module '*.json' {
  const value: Record<string, unknown>;
  export default value;
}

// Type for translation files
declare module '@/locales/*/translation.json' {
  const value: Record<string, unknown>;
  export default value;
}
