"use client";

// GA4/GTM/YM safe wrappers

type GtagFn = (command: 'config' | 'event', targetId: string, params?: Record<string, unknown>) => void;

const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
const YM_ID = process.env.NEXT_PUBLIC_YM_ID ? Number(process.env.NEXT_PUBLIC_YM_ID) : undefined;

function pushDataLayer(event: string, payload: Record<string, unknown>) {
  try {
    const w = window as unknown as { dataLayer?: unknown[] };
    w.dataLayer = w.dataLayer || [];
    (w.dataLayer as unknown[]).push({ event, ...payload });
  } catch {}
}

export function trackAddToCart(params: {
  item_id: string | number;
  item_name?: string;
  price?: number;
  quantity?: number;
  currency?: string;
}) {
  const { item_id, item_name, price, quantity = 1, currency = 'UZS' } = params;
  try {
    const w = window as unknown as { gtag?: GtagFn; ym?: (id: number, method: string, ...args: unknown[]) => void };
    if (GA_ID && typeof w.gtag === 'function') {
      w.gtag('event', 'add_to_cart', {
        currency,
        value: (Number(price) || 0) * quantity,
        items: [
          { item_id: String(item_id), item_name: item_name || String(item_id), price: Number(price) || 0, quantity },
        ],
      });
    }
    pushDataLayer('add_to_cart', { item_id: String(item_id), item_name, price, quantity, currency });
    if (YM_ID && typeof w.ym === 'function') {
      w.ym(YM_ID, 'reachGoal', 'add_to_cart');
    }
  } catch {}
}

export function trackBeginCheckout(params: { value: number; currency?: string; items?: Array<{ id: string | number; name?: string; price?: number; quantity?: number; }> }) {
  const { value, currency = 'UZS', items = [] } = params;
  try {
    const w = window as unknown as { gtag?: GtagFn; ym?: (id: number, method: string, ...args: unknown[]) => void };
    if (GA_ID && typeof w.gtag === 'function') {
      w.gtag('event', 'begin_checkout', {
        currency,
        value: Number(value) || 0,
        items: items.map(it => ({ item_id: String(it.id), item_name: it.name || String(it.id), price: Number(it.price) || 0, quantity: it.quantity || 1 })),
      });
    }
    pushDataLayer('begin_checkout', { value: Number(value) || 0, currency });
    if (YM_ID && typeof w.ym === 'function') {
      w.ym(YM_ID, 'reachGoal', 'begin_checkout');
    }
  } catch {}
}

export function trackPurchase(params: { transaction_id: string; value: number; currency?: string; items?: Array<{ id: string | number; name?: string; price?: number; quantity?: number; }>; }) {
  const { transaction_id, value, currency = 'UZS', items = [] } = params;
  try {
    const w = window as unknown as { gtag?: GtagFn; ym?: (id: number, method: string, ...args: unknown[]) => void };
    if (GA_ID && typeof w.gtag === 'function') {
      w.gtag('event', 'purchase', {
        transaction_id,
        currency,
        value: Number(value) || 0,
        items: items.map(it => ({ item_id: String(it.id), item_name: it.name || String(it.id), price: Number(it.price) || 0, quantity: it.quantity || 1 })),
      });
    }
    pushDataLayer('purchase', { transaction_id, value: Number(value) || 0, currency });
    if (YM_ID && typeof w.ym === 'function') {
      w.ym(YM_ID, 'reachGoal', 'purchase');
    }
  } catch {}
}
