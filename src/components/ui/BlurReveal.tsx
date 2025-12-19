// components/ui/BlurReveal.tsx
'use client';

import { useEffect, useState } from 'react';
import clsx from 'clsx';

export default function BlurReveal({
  children,
  delay = 0,
}: {
  children: React.ReactNode;
  delay?: number;
}) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setShow(true));
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <div
      className={clsx(
        'transition-all duration-700 ease-out will-change-[opacity,filter,transform]',
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
