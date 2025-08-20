"use client";

import Link from "next/link";
import React from "react";

export type Crumb = {
  name: string;
  href?: string;
};

export default function Breadcrumbs({
  items,
  className,
  includeJsonLd = true,
  basePath = "",
}: {
  items: Crumb[];
  className?: string;
  includeJsonLd?: boolean;
  basePath?: string;
}) {
  const jsonLd = includeJsonLd
    ? {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: items.map((c, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: c.name,
          item: c.href ? `${basePath}${c.href}` : undefined,
        })),
      }
    : null;

  return (
    <nav className={className ?? "flex items-center text-sm text-gray-500 mb-6"} aria-label="Breadcrumb">
      {items.map((c, idx) => (
        <React.Fragment key={idx}>
          {idx > 0 && <span className="mx-2">/</span>}
          {c.href ? (
            <Link href={c.href} className="hover:text-[#660000] transition-colors duration-200">
              {c.name}
            </Link>
          ) : (
            <span className="text-gray-900">{c.name}</span>
          )}
        </React.Fragment>
      ))}
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
    </nav>
  );
}
