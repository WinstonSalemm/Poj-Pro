"use client";

import { useState } from 'react';
import Link from 'next/link';

// Types and constants can be shared or passed as props
const SIZ_SUBCATEGORIES = [
  "siz_zashita_golovy",
  "siz_zashita_dyhaniya",
  "siz_zashita_glaz",
  "siz_zashita_ruk",
  "siz_odezhda",
  "siz_komplekty",
] as const;

const fallbackName = (key: string) =>
  key.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

// The client component for the modal
export default function SizCategoryModal({ sizCard, labels }: { sizCard: React.ReactNode; labels: Record<string, string> }) {
  const [showSizSubs, setShowSizSubs] = useState(false);

  return (
    <>
      <button type="button" onClick={() => setShowSizSubs(true)} className="block">
        {sizCard}
      </button>

      {showSizSubs && (
        <div
          className="fixed inset-0 z-[1050] bg-black/40 backdrop-blur-[1px] flex items-center justify-center p-4"
          onClick={() => setShowSizSubs(false)}
          aria-modal="true"
          role="dialog"
        >
          <div
            className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-semibold mb-4">
              {labels['ppe'] || fallbackName('ppe')}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {SIZ_SUBCATEGORIES.map((sub) => (
                <Link
                  key={sub}
                  href={`/catalog?category=${encodeURIComponent(sub)}`}
                  onClick={() => setShowSizSubs(false)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 hover:border-[#e63946] hover:bg-[#f8f9fa] transition-colors text-left"
                >
                  {labels[sub] || fallbackName(sub)}
                </Link>
              ))}
            </div>

            <button
              onClick={() => setShowSizSubs(false)}
              aria-label="Close"
              className="absolute -top-3 -right-3 h-9 w-9 rounded-full bg-white border border-gray-200 shadow hover:shadow-md hover:scale-105 transition"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </>
  );
}
