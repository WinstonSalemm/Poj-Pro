declare module '@/lib/analytics' {
  export function usePageView(): void;
  export function trackEvent(
    action: string,
    category: string,
    label?: string,
    value?: number
  ): void;
  export function trackError(error: Error, context?: Record<string, unknown>): void;
  export function trackWebVitals(metric: {
    id: string;
    name: string;
    label: string;
    value: number;
  }): void;
}

declare global {
  interface Window {
    gtag: (command: string, ...args: unknown[]) => void;
    ym?: (id: number, event: string, ...args: unknown[]) => void;
  }
}
