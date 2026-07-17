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
    <div className={`flex w-full min-w-0 flex-col gap-2 ${className}`}>
      <div className="flex h-11 w-full min-w-0 items-stretch overflow-hidden rounded-lg border border-gray-300 bg-white shadow-sm">
        <button
          type="button"
          aria-label={t("cart.decreaseQuantity") || "Decrease quantity"}
          onClick={() => { dec(); applyIfInCart(); }}
          className="flex w-10 shrink-0 items-center justify-center text-xl !text-[#660000] hover:bg-gray-100 disabled:opacity-50 sm:w-11"
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
          className="min-w-0 flex-1 text-center text-base font-medium outline-none !text-[#660000] focus:ring-2 focus:ring-[#660000]/40"
          aria-label={t("cart.quantity") || "Quantity"}
        />
        <button
          type="button"
          aria-label={t("cart.increaseQuantity") || "Increase quantity"}
          onClick={() => { inc(); applyIfInCart(); }}
          className="flex w-10 shrink-0 items-center justify-center text-xl !text-[#660000] hover:bg-gray-100 sm:w-11"
        >
          +
        </button>
      </div>

      <AddToCartButton productId={productId} quantity={qty} className="h-11 w-full min-w-0 max-w-full rounded-lg text-sm sm:text-base" />
    </div>
  );
}
