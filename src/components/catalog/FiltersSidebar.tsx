"use client";

import { useMemo } from "react";
import { useTranslation } from "react-i18next";

export type ExtinguisherType = 'op' | 'ou' | 'mpp' | 'recharge';
export type FireClass = 'A' | 'B' | 'C' | 'E';

export type FiltersState = {
  minPrice?: number;
  maxPrice?: number;
  type?: ExtinguisherType;
  volumes?: string[]; // e.g. ['2','3','5','10','25']
  classes?: FireClass[];
  availability?: 'in' | 'out';
};

export type SortKey = "relevance" | "priceAsc" | "priceDesc" | "nameAsc" | "nameDesc";

export default function FiltersSidebar({
  total,
  filters,
  setFilters,
  sort,
  setSort,
  className,
}: {
  total: number;
  filters: FiltersState;
  setFilters: (next: FiltersState) => void;
  sort: SortKey;
  setSort: (s: SortKey) => void;
  className?: string;
}) {
  const { t } = useTranslation('translation');
  const ranges = useMemo(
    () => [
      { id: "p1", label: t("filters.price.lt500k", "< 500 000"), from: 0, to: 500_000 },
      { id: "p2", label: t("filters.price.between500k2m", "500 000 – 2 000 000"), from: 500_000, to: 2_000_000 },
      { id: "p3", label: t("filters.price.gt2m", "> 2 000 000"), from: 2_000_000, to: Infinity },
    ],
    [t]
  );

  return (
    <aside className={className ?? "w-full md:w-64 shrink-0"} aria-label="Filters sidebar">
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="mb-4">
          <div className="text-sm text-gray-500">{t("filters.total", "Всего")}</div>
          <div className="text-xl font-semibold text-brand">{total}</div>
        </div>

        <div className="space-y-4">
          {/* Type */}
          <div>
            <div className="font-medium text-gray-800 mb-2">{t('filters.type.title', 'Тип')}</div>
            <div className="space-y-2" role="group" aria-label={t('filters.type.aria', 'Тип огнетушителя')}>
              {([
                { key: 'op', label: t('filters.type.op', 'ОП (порошковый)') },
                { key: 'ou', label: t('filters.type.ou', 'ОУ (углекислотный)') },
                { key: 'mpp', label: t('filters.type.mpp', 'МПП (модульный)') },
                { key: 'recharge', label: t('filters.type.recharge', 'Перезарядка') },
              ] as { key: ExtinguisherType; label: string }[]).map((opt) => (
                <label key={opt.key} className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="radio"
                    name="extinguisher-type"
                    value={opt.key}
                    checked={filters.type === opt.key}
                    onChange={() => setFilters({ ...filters, type: opt.key })}
                    className="h-4 w-4 text-brand focus:ring-brand/30 border-gray-300"
                  />
                  <span className="text-gray-700">{opt.label}</span>
                </label>
              ))}
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="radio"
                  name="extinguisher-type"
                  checked={!filters.type}
                  onChange={() => setFilters({ ...filters, type: undefined })}
                  className="h-4 w-4 text-brand focus:ring-brand/30 border-gray-300"
                />
                <span className="text-gray-700">{t('filters.type.all', 'Все')}</span>
              </label>
            </div>
          </div>

          <div>
            <div className="font-medium text-gray-800 mb-2">{t("filters.sort.title", "Сортировка")}</div>
            <div className="space-y-2">
              {(
                [
                  { key: "relevance", label: t("filters.sort.relevance", "По релевантности") },
                  { key: "priceAsc", label: t("filters.sort.priceAsc", "Цена: по возрастанию") },
                  { key: "priceDesc", label: t("filters.sort.priceDesc", "Цена: по убыванию") },
                  { key: "nameAsc", label: t("filters.sort.nameAsc", "Название: A–Z") },
                  { key: "nameDesc", label: t("filters.sort.nameDesc", "Название: Z–A") },
                ] as { key: SortKey; label: string }[]
              ).map((opt) => (
                <label key={opt.key} className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="radio"
                    name="sort"
                    value={opt.key}
                    checked={sort === opt.key}
                    onChange={() => setSort(opt.key)}
                    className="h-4 w-4 text-brand focus:ring-brand/30 border-gray-300"
                  />
                  <span className="text-gray-700">{opt.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <div className="font-medium text-gray-800 mb-2">{t("filters.price.title", "Цена")}</div>
            <div className="space-y-2">
              {ranges.map((r) => {
                const checked = filters.minPrice === r.from && filters.maxPrice === r.to;
                return (
                  <label key={r.id} className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="radio"
                      name="price"
                      checked={!!checked}
                      onChange={() => setFilters({ ...filters, minPrice: r.from, maxPrice: r.to })}
                      className="h-4 w-4 text-brand focus:ring-brand/30 border-gray-300"
                    />
                    <span className="text-gray-700">{r.label}</span>
                  </label>
                );
              })}
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="radio"
                  name="price"
                  checked={!filters.minPrice && !filters.maxPrice}
                  onChange={() => setFilters({ ...filters, minPrice: undefined, maxPrice: undefined })}
                  className="h-4 w-4 text-brand focus:ring-brand/30 border-gray-300"
                />
                <span className="text-gray-700">{t("filters.price.all", "Все")}</span>
              </label>
            </div>
          </div>

          {/* Fire classes */}
          <div>
            <div className="font-medium text-gray-800 mb-2">{t('filters.fireclass.title', 'Класс пожара')}</div>
            <div className="flex flex-wrap gap-2" role="group" aria-label="Класс пожара">
              {(['A', 'B', 'C', 'E'] as const).map((c) => {
                const checked = Array.isArray(filters.classes) && filters.classes.includes(c);
                return (
                  <label key={c} className="inline-flex items-center gap-1 text-sm cursor-pointer border border-gray-300 rounded-full px-2 py-1">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(e) => {
                        const next = new Set(filters.classes || []);
                        if (e.target.checked) next.add(c); else next.delete(c);
                        setFilters({ ...filters, classes: Array.from(next) as FireClass[] });
                      }}
                      className="h-4 w-4 text-brand focus:ring-brand/30 border-gray-300"
                      aria-label={`Класс ${c}`}
                    />
                    <span className="text-gray-700">{c}</span>
                  </label>
                );
              })}
            </div>
          </div>

          
        </div>
      </div>
    </aside>
  );
}
