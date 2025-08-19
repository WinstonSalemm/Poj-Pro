'use client';

import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useEffect, useRef, useState } from 'react';

export function CartIcon() {
  const { getCartItems } = useCart();
  const [itemCount, setItemCount] = useState(0);
  const [isMounted, setIsMounted] = useState(false);
  const [pulse, setPulse] = useState<{ amount: number; visible: boolean }>({ amount: 0, visible: false });
  const pulseTimerRef = useRef<number | null>(null);

  // Avoid hydration mismatch by only showing the cart count after mount
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Update cart count when it changes
  useEffect(() => {
    const items = getCartItems();
    const count = items.reduce((total, item) => total + item.qty, 0);
    setItemCount(count);
  }, [getCartItems]);

  // Listen for global add-to-cart events to show +N pulse
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as { delta?: number } | undefined;
      const delta = typeof detail?.delta === 'number' && detail.delta > 0 ? detail.delta : 1;
      setPulse({ amount: delta, visible: true });
      if (pulseTimerRef.current) window.clearTimeout(pulseTimerRef.current);
      pulseTimerRef.current = window.setTimeout(() => {
        setPulse((p) => ({ ...p, visible: false }));
      }, 1200);
    };
    window.addEventListener('cart:add', handler as EventListener);
    return () => {
      window.removeEventListener('cart:add', handler as EventListener);
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
        xmlns="http://www.w3.org/2000/svg" 
        width="24" 
        height="24" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
        className="w-6 h-6"
      >
        <circle cx="9" cy="21" r="1"></circle>
        <circle cx="20" cy="21" r="1"></circle>
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
      </svg>
      
      {isMounted && itemCount > 0 && (
        <span className="absolute -top-2 -right-2 bg-[#660000] text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
          {itemCount > 9 ? '9+' : itemCount}
        </span>
      )}

      {/* Temporary +N pulse near the cart icon (bounce) */}
      {isMounted && pulse.visible && (
        <span
          className="absolute -top-5 -right-4 text-[11px] font-bold text-white bg-green-600 rounded-full px-2 py-0.5 shadow-md animate-bounce"
          style={{ animationDuration: '0.8s' }}
        >
          +{pulse.amount}
        </span>
      )}
    </Link>
  );
}

export default CartIcon;
