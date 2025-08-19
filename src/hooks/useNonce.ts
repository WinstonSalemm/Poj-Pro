'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export const useNonce = (): string | null => {
  const [nonce, setNonce] = useState<string | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    // This will only run on the client side
    const metaTag = document.querySelector<HTMLMetaElement>('meta[property="csp-nonce"]');
    if (metaTag) {
      setNonce(metaTag.content);
    }
  }, [pathname]);

  return nonce;
};
