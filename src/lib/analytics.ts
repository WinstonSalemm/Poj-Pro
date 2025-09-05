export const GA_ID = process.env.NEXT_PUBLIC_GA_ID || "";
export const YM_ID = process.env.NEXT_PUBLIC_YM_ID || "";
export const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID || "";

export const isProd = process.env.NODE_ENV === "production";
export const analyticsEnabled = isProd && (!!GA_ID || !!YM_ID || !!GTM_ID);

// ---- GA4 ----
declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    ym?: (...args: unknown[]) => void;
  }
}

export function gaPageView(url: string) {
  if (!analyticsEnabled || !GA_ID || typeof window === "undefined") return;
  window.gtag?.("config", GA_ID, { page_path: url });
}

export function trackEvent(
  name: string,
  params: Record<string, unknown> = {}
) {
  if (!analyticsEnabled || !GA_ID || typeof window === "undefined") return;
  window.gtag?.("event", name, params);
}

// ---- Yandex Metrica ----
export function ymReachGoal(goal: string, params?: Record<string, unknown>) {
  if (!analyticsEnabled || !YM_ID || typeof window === "undefined") return;
  const id = Number(YM_ID);
  // reachGoal безопасен, даже если не определён — проверим ym
  window.ym?.(id, "reachGoal", goal, params);
}

// ---- Web Vitals / custom timing ----
export function trackWebVitals({
  id,
  name,
  label,
  value,
}: {
  id: string;
  name: string;
  label: string;
  value: number;
}) {
  if (!analyticsEnabled || typeof window === "undefined") return;
  // Send to GA if available
  if (GA_ID && typeof window.gtag === "function") {
    window.gtag("event", name, {
      event_category: label === "web-vital" ? "Web Vitals" : "Performance",
      value: Math.round(name === "CLS" ? value * 1000 : value),
      event_label: id,
      non_interaction: true,
    } as Record<string, unknown>);
  }
  // Optionally reflect to Yandex as a goal
  if (YM_ID && typeof window.ym === "function") {
    const num = Number(YM_ID);
    window.ym(num, "reachGoal", name, { id, label, value });
  }
}
