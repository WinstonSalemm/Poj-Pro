"use client";

import { useState } from "react";
import type { ChangeEvent } from "react";
import { useCart } from "@/context/CartContext";
import { useTranslation } from "@/i18n/useTranslation";
import AddToCartButton from "@/components/Cart/AddToCartButton";

interface Props {
  productId: string | number;
  className?: string;
}

export default function QuantityAddToCart({ productId, className = "" }: Props) {
  const { t } = useTranslation();
  const { getItemQuantity, updateQuantity, isInCart } = useCart();
  const initial = Math.max(1, getItemQuantity(productId) || 1);
  const [qty, setQty] = useState<number>(initial);

  const dec = () => setQty((q) => Math.max(1, q - 1));
  const inc = () => setQty((q) => Math.min(999, q + 1));
  const onInput = (e: ChangeEvent<HTMLInputElement>) => {
    const v = parseInt(e.target.value.replace(/[^0-9]/g, ""), 10);
    if (isNaN(v)) setQty(1);
    else setQty(Math.min(999, Math.max(1, v)));
  };

  // If already in cart, allow changing quantity directly here
  const applyIfInCart = () => {
    if (isInCart(productId)) {
      updateQuantity(productId, qty);
    }
  };

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <div className="inline-flex w-full h-11 items-stretch rounded-lg border border-gray-300 overflow-hidden shadow-sm bg-white">
        <button
          type="button"
          aria-label={t("cart.decreaseQuantity") || "Decrease quantity"}
          onClick={() => { dec(); applyIfInCart(); }}
          className="w-11 flex items-center justify-center text-xl !text-[#660000] hover:bg-gray-100 disabled:opacity-50"
          disabled={qty <= 1}
        >
          −
        </button>
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          value={qty}
          onChange={(e) => { onInput(e); applyIfInCart(); }}
          className="flex-1 min-w-0 text-center text-base font-medium outline-none !text-[#660000] focus:ring-2 focus:ring-[#660000]/40"
          aria-label={t("cart.quantity") || "Quantity"}
        />
        <button
          type="button"
          aria-label={t("cart.increaseQuantity") || "Increase quantity"}
          onClick={() => { inc(); applyIfInCart(); }}
          className="w-11 flex items-center justify-center text-xl !text-[#660000] hover:bg-gray-100"
        >
          +
        </button>
      </div>

      <AddToCartButton productId={productId} quantity={qty} className="w-full h-11 rounded-lg" />
    </div>
  );
}
