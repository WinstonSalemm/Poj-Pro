// src/lib/events.ts
import { trackEvent, ymReachGoal } from "./analytics";

// Obёртки под самые частые события
export function evAddToCart({ id, name, price }: { id: string|number; name: string; price: number; }) {
  trackEvent("add_to_cart", {
    currency: "UZS",
    value: price,
    items: [{ item_id: String(id), item_name: name, price }],
  });
  ymReachGoal("add_to_cart", { id, name, price });
}

export function evBeginCheckout(total: number) {
  trackEvent("begin_checkout", { currency: "UZS", value: total });
  ymReachGoal("begin_checkout", { total });
}

export function evPurchase({ orderId, value }: { orderId: string; value: number; }) {
  trackEvent("purchase", { transaction_id: orderId, currency: "UZS", value });
  ymReachGoal("purchase", { orderId, value });
}
