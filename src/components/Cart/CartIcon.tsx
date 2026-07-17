'use client';

import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useEffect, useRef, useState } from 'react';

export function CartIcon() {
  const { getCartItems } = useCart();
  const [itemCount, setItemCount] = useState(0);
  const [isMounted, setIsMounted] = useState(false);
  const [bumpKey, setBumpKey] = useState(0);
  const [pulse, setPulse] = useState<{ amount: number; visible: boolean }>({ amount: 0, visible: false });
  const prevCountRef = useRef<number | null>(null);
  const pulseTimerRef = useRef<number | null>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Sync count; animate when quantity increases (any add path)
  useEffect(() => {
    const items = getCartItems();
    const count = items.reduce((total, item) => total + item.qty, 0);

    if (prevCountRef.current !== null && count > prevCountRef.current) {
      const delta = count - prevCountRef.current;
      setBumpKey((k) => k + 1);
      setPulse({ amount: delta, visible: true });
      if (pulseTimerRef.current) window.clearTimeout(pulseTimerRef.current);
      pulseTimerRef.current = window.setTimeout(() => {
        setPulse((p) => ({ ...p, visible: false }));
      }, 1000);
    }

    prevCountRef.current = count;
    setItemCount(count);
  }, [getCartItems]);

  useEffect(() => {
    return () => {
      if (pulseTimerRef.current) window.clearTimeout(pulseTimerRef.current);
    };
  }, []);

  return (
    <Link
      href="/cart"
      className="relative flex items-center justify-center text-[#660000] hover:text-[#8B0000] transition-colors"
      aria-label="Shopping Cart"
    >
      <svg
        key={bumpKey ? `icon-${bumpKey}` : 'icon'}
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`w-6 h-6 origin-center ${bumpKey ? 'animate-cart-icon-nudge' : ''}`}
      >
        <circle cx="9" cy="21" r="1"></circle>
        <circle cx="20" cy="21" r="1"></circle>
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
      </svg>

      {isMounted && itemCount > 0 && (
        <span
          key={bumpKey ? `badge-${bumpKey}` : 'badge'}
          className={`absolute -top-2 -right-2 bg-[#660000] text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-sm ${
            bumpKey ? 'animate-cart-badge-pop' : ''
          }`}
        >
          {itemCount > 9 ? '9+' : itemCount}
        </span>
      )}

      {isMounted && pulse.visible && (
        <span className="absolute -top-5 -right-4 pointer-events-none text-[11px] font-bold text-white bg-[#2d8a4e] rounded-full px-2 py-0.5 shadow-md animate-cart-plus-float">
          +{pulse.amount}
        </span>
      )}
    </Link>
  );
}

export default CartIcon;
