// src/lib/analytics/dataLayer.ts
"use client";

import { GTM_ID, isProd } from "@/lib/analytics";

// Consent Mode v2 keys
export type ConsentState = {
  ad_storage: "granted" | "denied";
  ad_user_data?: "granted" | "denied";
  ad_personalization?: "granted" | "denied";
  analytics_storage: "granted" | "denied";
  functionality_storage?: "granted" | "denied";
  personalization_storage?: "granted" | "denied";
  security_storage?: "granted" | "denied";
};

// Common item shape for ecom events
export interface EcomItem {
  id: string | number;
  name?: string;
  category?: string;
  price?: number;
  quantity?: number;
}

export function evSelectItem(p: SelectItemPayload): void {
  const items = p.items?.map(i => ({
    item_id: String(i.id), item_name: i.name, price: i.price, quantity: i.quantity, item_category: i.category,
  })) || [];
  dlPush("select_item", {
    items,
    list_id: p.list_id,
    list_name: p.list_name,
    // Google Ads dynamic remarketing
    ecomm_prodid: items.map(i => i.item_id),
    ecomm_pagetype: "category",
    ecomm_totalvalue: undefined,
  });
}

// Event payloads
export interface ViewItemPayload { item_id: string | number; item_name?: string; price?: number; currency?: string }
export interface ViewItemListPayload { items: EcomItem[]; list_id?: string; list_name?: string }
export interface SelectItemPayload { items: EcomItem[]; list_id?: string; list_name?: string }
export interface AddToCartPayload { item_id: string | number; item_name?: string; price?: number; quantity?: number; currency?: string }
export interface RemoveFromCartPayload { item_id: string | number; item_name?: string; price?: number; quantity?: number; currency?: string }
export interface BeginCheckoutPayload { value?: number; currency?: string; items?: EcomItem[] }
export interface PurchasePayload { transaction_id: string; value?: number; currency?: string; items?: EcomItem[] }
export interface GenerateLeadPayload { value?: number; currency?: string; lead_type?: string }

// Debug toggle: log in dev, but stay quiet during jest tests
const debug = !isProd && process.env.NODE_ENV !== 'test';

function ensureDL(): unknown[] {
  if (typeof window === "undefined") return [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const w = window as any;
  w.dataLayer = w.dataLayer || [];
  return w.dataLayer as unknown[];
}

export function dlPush(event: string, params?: Record<string, unknown>): void {
  if (typeof window === "undefined") return;
  const dl = ensureDL();
  const payload = params ? { event, ...params } : { event };
  dl.push(payload);
  if (debug) {
    console.log("[dataLayer.push]", payload);
  }
}

// Consent Mode helpers
export function consentDefaultDenied(): void {
  if (typeof window === "undefined") return;
  // using gtag consent API if present; otherwise use dataLayer
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const w = window as any;
  const state: ConsentState = {
    ad_storage: "denied",
    analytics_storage: "denied",
    functionality_storage: "denied",
    personalization_storage: "denied",
    security_storage: "granted", // typically allowed for security
  };
  if (typeof w.gtag === "function") {
    w.gtag("consent", "default", state as unknown as Record<string, string>);
  } else {
    ensureDL().push({ event: "consent", "consent.default": state });
  }
  if (debug) console.log("[consent.default]", state);
}

export function consentGrantAll(): void {
  if (typeof window === "undefined") return;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const w = window as any;
  const state: ConsentState = {
    ad_storage: "granted",
    analytics_storage: "granted",
    functionality_storage: "granted",
    personalization_storage: "granted",
    security_storage: "granted",
  };
  if (typeof w.gtag === "function") {
    w.gtag("consent", "update", state as unknown as Record<string, string>);
  } else {
    ensureDL().push({ event: "consent", "consent.update": state });
  }
  if (debug) console.log("[consent.update]", state);
}

// Safe loader ping
export function gtmIsConfigured(): boolean {
  return !!GTM_ID;
}

// Typed events
export function evViewItem(p: ViewItemPayload): void {
  const prodId = String(p.item_id);
  dlPush("view_item", {
    items: [{
      item_id: prodId,
      item_name: p.item_name,
      price: p.price,
    }],
    currency: p.currency,
    // Google Ads dynamic remarketing
    ecomm_prodid: prodId,
    ecomm_pagetype: "product",
    ecomm_totalvalue: p.price,
  });
}

export function evViewItemList(p: ViewItemListPayload): void {
  const items = p.items?.map(i => ({
    item_id: String(i.id), item_name: i.name, price: i.price, quantity: i.quantity, item_category: i.category,
  })) || [];
  dlPush("view_item_list", {
    items,
    list_id: p.list_id,
    list_name: p.list_name,
    // Google Ads dynamic remarketing
    ecomm_prodid: items.map(i => i.item_id),
    ecomm_pagetype: "category",
    ecomm_totalvalue: undefined,
  });
}

export function evAddToCart(p: AddToCartPayload): void {
  const prodId = String(p.item_id);
  dlPush("add_to_cart", {
    items: [{
      item_id: prodId, item_name: p.item_name, price: p.price, quantity: p.quantity,
    }],
    currency: p.currency,
    // Google Ads dynamic remarketing
    ecomm_prodid: prodId,
    ecomm_pagetype: "cart",
    ecomm_totalvalue: p.price && p.quantity ? p.price * p.quantity : p.price,
  });
}

export function evRemoveFromCart(p: RemoveFromCartPayload): void {
  const prodId = String(p.item_id);
  dlPush("remove_from_cart", {
    items: [{
      item_id: prodId, item_name: p.item_name, price: p.price, quantity: p.quantity,
    }],
    currency: p.currency,
    // Google Ads dynamic remarketing
    ecomm_prodid: prodId,
    ecomm_pagetype: "cart",
    ecomm_totalvalue: p.price && p.quantity ? p.price * p.quantity : p.price,
  });
}

export function evBeginCheckout(p: BeginCheckoutPayload): void {
  const items = (p.items||[]).map(i => ({
    item_id: String(i.id), item_name: i.name, price: i.price, quantity: i.quantity, item_category: i.category,
  }));
  dlPush("begin_checkout", {
    value: p.value,
    currency: p.currency,
    items,
    // Google Ads dynamic remarketing
    ecomm_prodid: items.map(i => i.item_id),
    ecomm_pagetype: "cart",
    ecomm_totalvalue: p.value,
  });
}

export function evPurchase(p: PurchasePayload): void {
  const items = (p.items||[]).map(i => ({
    item_id: String(i.id), item_name: i.name, price: i.price, quantity: i.quantity, item_category: i.category,
  }));
  dlPush("purchase", {
    transaction_id: p.transaction_id,
    value: p.value,
    currency: p.currency,
    items,
    // Google Ads dynamic remarketing
    ecomm_prodid: items.map(i => i.item_id),
    ecomm_pagetype: "purchase",
    ecomm_totalvalue: p.value,
  });
}

export function evGenerateLead(p: GenerateLeadPayload): void {
  dlPush("generate_lead", { value: p.value, currency: p.currency, lead_type: p.lead_type });
}
