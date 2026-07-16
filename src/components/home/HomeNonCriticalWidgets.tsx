'use client';

import dynamic from 'next/dynamic';

const MiniUpdateModalLazy = dynamic(
  () => import('@/components/MiniUpdateModal/MiniUpdateModal'),
  { ssr: false },
);
const AdsConversionOnMountLazy = dynamic(
  () => import('@/components/analytics/AdsConversionOnMount').then((mod) => mod.AdsConversionOnMount),
  { ssr: false },
);

export default function HomeNonCriticalWidgets() {
  return (
    <>
      <MiniUpdateModalLazy />
      <AdsConversionOnMountLazy type="pageViewSpecial" />
    </>
  );
}
