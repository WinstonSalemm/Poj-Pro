"use client";

import type { FiltersState, SortKey } from "./FiltersSidebar";

export default function MobileFiltersDrawer({
  open,
  onClose,
  total,
  filters,
  setFilters,
  sort,
  setSort,
}: {
  open: boolean;
  onClose: () => void;
  total: number;
  filters: FiltersState;
  setFilters: (next: FiltersState) => void;
  sort: SortKey;
  setSort: (s: SortKey) => void;
}) {
  return (
    <div className={`fixed inset-0 z-[70] ${open ? '' : 'pointer-events-none'}`} aria-hidden={!open}>
      {/* backdrop */}
      <div
        onClick={onClose}
        className={`absolute inset-0 bg-black/30 transition-opacity ${open ? 'opacity-100' : 'opacity-0'}`}
      />
      {/* panel */}
      <div
        className={`absolute right-0 top-0 h-full w-[85%] max-w-sm bg-white shadow-xl border-l border-gray-200 transition-transform ${open ? 'translate-x-0' : 'translate-x-full'}`}
        role="dialog"
        aria-modal="true"
      >
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div className="font-semibold text-[#660000]">Фильтры и сортировка</div>
          <button onClick={onClose} className="text-gray-600 hover:text-gray-900">✕</button>
        </div>

        <div className="p-4 space-y-6 overflow-y-auto h-[calc(100%-56px)]">
          {/* Сортировка */}
          <div>
            <div className="font-medium text-gray-800 mb-2">Сортировка</div>
            <div className="space-y-2">
              {(
                [
                  { key: "relevance", label: "По релевантности" },
                  { key: "priceAsc", label: "Цена: по возрастанию" },
                  { key: "priceDesc", label: "Цена: по убыванию" },
                  { key: "nameAsc", label: "Название: A–Z" },
                  { key: "nameDesc", label: "Название: Z–A" },
                ] as { key: SortKey; label: string }[]
              ).map((opt) => (
                <label key={opt.key} className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="radio"
                    name="m-sort"
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

          {/* Цена */}
          <div>
            <div className="font-medium text-gray-800 mb-2">Цена</div>
            <div className="space-y-2">
              {[
                { id: "p1", label: "< 500 000", from: 0, to: 500_000 },
                { id: "p2", label: "500 000 – 2 000 000", from: 500_000, to: 2_000_000 },
                { id: "p3", label: "> 2 000 000", from: 2_000_000, to: Infinity },
              ].map((r) => {
                const checked = filters.minPrice === r.from && filters.maxPrice === r.to;
                return (
                  <label key={r.id} className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="radio"
                      name="m-price"
                      checked={!!checked}
                      onChange={() => setFilters({ minPrice: r.from, maxPrice: r.to })}
                      className="h-4 w-4 text-brand focus:ring-brand/30 border-gray-300"
                    />
                    <span className="text-gray-700">{r.label}</span>
                  </label>
                );
              })}
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="radio"
                  name="m-price"
                  checked={!filters.minPrice && !filters.maxPrice}
                  onChange={() => setFilters({})}
                  className="h-4 w-4 text-brand focus:ring-brand/30 border-gray-300"
                />
                <span className="text-gray-700">Все</span>
              </label>
            </div>
          </div>

          <div className="pt-2">
            <button onClick={onClose} className="btn-primary w-full">Показать {total}</button>
          </div>
        </div>
      </div>
    </div>
  );
}
