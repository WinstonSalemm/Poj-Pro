"use client";
import React from "react";
import { useTranslation } from "@/i18n/useTranslation";

export interface ProductSpecsProps {
  specs: Array<[string, string]>;
  className?: string;
}

function norm(key: string) {
  // keep original key for lookup; allow exact label keys like "Тип"
  // optionally provide a normalized variant
  return key;
}

export default function ProductSpecs({ specs, className }: ProductSpecsProps) {
  const { t } = useTranslation();
  return (
    <div className={className}>
      <div className="border-t border-gray-200">
        <dl className="divide-y divide-gray-200">
          {specs.map(([key, value]) => {
            const label = t(`productSpecs.${norm(key)}`, { defaultValue: key });
            const display = typeof value === 'string' ? value : String(value);
            return (
              <div key={key} className="py-3 sm:grid sm:grid-cols-3 sm:gap-4">
                <dt className="text-sm font-medium text-gray-500">{label}</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">{display}</dd>
              </div>
            );
          })}
        </dl>
      </div>
    </div>
  );
}
