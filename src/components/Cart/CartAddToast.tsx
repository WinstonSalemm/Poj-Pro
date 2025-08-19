"use client";

import { useEffect, useRef, useState } from "react";

export default function CartAddToast() {
  const [visible, setVisible] = useState(false);
  const [amount, setAmount] = useState<number>(0);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as { delta?: number } | undefined;
      const delta = typeof detail?.delta === "number" && detail.delta > 0 ? detail.delta : 1;
      setAmount(delta);
      setVisible(true);
      if (timerRef.current) window.clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(() => setVisible(false), 1500);
    };
    window.addEventListener("cart:add", handler as EventListener);
    return () => {
      window.removeEventListener("cart:add", handler as EventListener);
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, []);

  // Offscreen when hidden, slide down when visible
  return (
    <div
      aria-live="polite"
      className={`pointer-events-none fixed left-1/2 z-[1100] -translate-x-1/2 transition-transform duration-300 ease-out ${
        visible ? "translate-y-[76px]" : "-translate-y-20"
      }`}
      style={{ top: 0 }}
    >
      <div className="rounded-full bg-green-600 px-4 py-2 text-white shadow-lg ring-1 ring-black/10">
        <span className="text-sm font-semibold">+{amount}</span>
      </div>
    </div>
  );
}
