declare module '@/lib/analytics' {
  export const GA_ID: string;
  export const YM_ID: string;
  export const isProd: boolean;
  export const analyticsEnabled: boolean;
  export function gaPageView(url: string): void;
  export function trackEvent(name: string, params?: Record<string, unknown>): void;
  export function ymReachGoal(goal: string, params?: Record<string, unknown>): void;
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
