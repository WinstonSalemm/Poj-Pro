// components/ui/BlurReveal.tsx
'use client';

import { useEffect, useState, useRef } from 'react';
import clsx from 'clsx';

export default function BlurReveal({
  children,
  delay = 0,
}: {
  children: React.ReactNode;
  delay?: number;
}) {
  const [show, setShow] = useState(false);
  const [animating, setAnimating] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Use IntersectionObserver for better performance on initial load
    let rafId: number | null = null;
    let timeoutId: NodeJS.Timeout | null = null;
    
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting) {
          rafId = requestAnimationFrame(() => {
            setShow(true);
            // Remove will-change after animation completes to free up resources
            timeoutId = setTimeout(() => {
              setAnimating(false);
            }, 700 + delay);
          });
          observer.disconnect();
        }
      },
      {
        rootMargin: '50px',
        threshold: 0.01,
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      observer.disconnect();
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }
      if (timeoutId !== null) {
        clearTimeout(timeoutId);
      }
    };
  }, [delay]);

  return (
    <div
      ref={containerRef}
      className={clsx(
        // Use only transform and opacity for better performance (GPU-accelerated)
        'transition-[opacity,transform,filter] duration-700 ease-out',
        animating && 'will-change-[opacity,filter,transform]',
        show
          ? 'opacity-100 blur-0 translate-y-0'
          : 'opacity-0 blur-md translate-y-3'
      )}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}
