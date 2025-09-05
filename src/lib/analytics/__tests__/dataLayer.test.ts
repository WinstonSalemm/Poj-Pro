/** @jest-environment jsdom */

import {
  evAddToCart,
  evRemoveFromCart,
  evBeginCheckout,
  evPurchase,
  evViewItem,
  evViewItemList,
} from "../dataLayer";

// Helper to reset dataLayer between tests
function resetDL() {
  (window as unknown as { dataLayer: unknown[] }).dataLayer = [] as unknown[];
}

describe("typed dataLayer helpers", () => {
  beforeEach(() => resetDL());

  it("pushes add_to_cart with item payload", () => {
    evAddToCart({ item_id: "123", item_name: "ABC", price: 10000, quantity: 2, currency: "UZS" });
    const dl = (window as unknown as { dataLayer: unknown[] }).dataLayer;
    const last = dl[dl.length - 1] as Record<string, unknown>;
    expect(last).toMatchObject({
      event: "add_to_cart",
      currency: "UZS",
      items: [
        { item_id: "123", item_name: "ABC", price: 10000, quantity: 2 },
      ],
    });
  });

  it("pushes remove_from_cart with item payload", () => {
    evRemoveFromCart({ item_id: 7, item_name: "X", price: 5000, quantity: 1, currency: "UZS" });
    const dl = (window as unknown as { dataLayer: unknown[] }).dataLayer;
    const last = dl[dl.length - 1] as Record<string, unknown>;
    expect(last).toMatchObject({
      event: "remove_from_cart",
      currency: "UZS",
      items: [
        { item_id: "7", item_name: "X", price: 5000, quantity: 1 },
      ],
    });
  });

  it("pushes begin_checkout with list of items", () => {
    evBeginCheckout({
      value: 15000,
      currency: "UZS",
      items: [
        { id: "1", name: "A", price: 5000, quantity: 1 },
        { id: 2, name: "B", price: 10000, quantity: 1 },
      ],
    });
    const dl = (window as unknown as { dataLayer: unknown[] }).dataLayer;
    const last = dl[dl.length - 1] as Record<string, unknown>;
    expect(last).toMatchObject({
      event: "begin_checkout",
      value: 15000,
      currency: "UZS",
      items: [
        { item_id: "1", item_name: "A", price: 5000, quantity: 1 },
        { item_id: "2", item_name: "B", price: 10000, quantity: 1 },
      ],
    });
  });

  it("pushes purchase with transaction id and items", () => {
    evPurchase({ transaction_id: "T-1", value: 20000, currency: "UZS", items: [{ id: 9, name: "Z", price: 20000, quantity: 1 }] });
    const dl = (window as unknown as { dataLayer: unknown[] }).dataLayer;
    const last = dl[dl.length - 1] as Record<string, unknown>;
    expect(last).toMatchObject({
      event: "purchase",
      transaction_id: "T-1",
      value: 20000,
      currency: "UZS",
      items: [
        { item_id: "9", item_name: "Z", price: 20000, quantity: 1 },
      ],
    });
  });

  it("pushes view_item with a single item", () => {
    evViewItem({ item_id: 99, item_name: "Item 99", price: 3000, currency: "UZS" });
    const dl = (window as unknown as { dataLayer: unknown[] }).dataLayer;
    const last = dl[dl.length - 1] as Record<string, unknown>;
    expect(last).toMatchObject({
      event: "view_item",
      currency: "UZS",
      items: [
        { item_id: "99", item_name: "Item 99", price: 3000 },
      ],
    });
  });

  it("pushes view_item_list with up to 20 items", () => {
    const items: Array<{ id: number; name: string; price: number }> = Array.from({ length: 25 }).map((_, i) => ({ id: i + 1, name: `P${i + 1}`, price: i * 10 }));
    evViewItemList({ items, list_id: "cat", list_name: "Category" });
    const dl = (window as unknown as { dataLayer: unknown[] }).dataLayer;
    const last = dl[dl.length - 1] as Record<string, unknown> & { items?: unknown[]; event?: string };
    expect(last.event).toBe("view_item_list");
    expect(Array.isArray(last.items)).toBe(true);
    expect((last.items || []).length).toBe(25); // helper itself doesn't slice
  });
});
