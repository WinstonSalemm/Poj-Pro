"use client";

import React from "react";

interface Item {
  id: string | number;
  name: string;
  price: number;
  quantity: number;
}

interface Props {
  currency?: string;
  total: number;
  items: Item[];
  onCheckout: () => void;
  className?: string;
}

export default function OrderSummary({ currency = "UZS", total, items, onCheckout, className = "" }: Props) {
  return (
    <aside className={`bg-white border border-gray-200 rounded-2xl p-6 shadow-sm lg:sticky lg:top-24 ${className}`}>
      <h2 className="text-lg font-semibold !text-[#660000] mb-4">Order Summary</h2>
      <div className="space-y-3">
        <div className="flex justify-between text-sm text-gray-500">
          <span>Items</span>
          <span>{items.reduce((s, it) => s + it.quantity, 0)}</span>
        </div>
        <div className="border-t border-gray-200 pt-3 flex justify-between font-semibold text-lg">
          <span className="text-black">Total</span>
          <span className="text-[#660000]">{Math.round(total).toLocaleString('ru-UZ')} {currency}</span>
        </div>
        <button
          onClick={onCheckout}
          className="w-full h-11 rounded-lg bg-[#660000] text-white hover:bg-[#8B0000] transition-colors disabled:opacity-70"
        >
          Proceed to Checkout
        </button>
      </div>
    </aside>
  );
}
