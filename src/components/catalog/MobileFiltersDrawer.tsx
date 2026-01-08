"use client";

import { useMemo } from "react";
import { useTranslation } from "@/i18n/useTranslation";
import type { FiltersState, SortKey } from "./FiltersSidebar";
import { resolveCategoryKey } from "@/constants/categorySeo";

export default function MobileFiltersDrawer({
  open,
  onClose,
  total,
  filters,
  setFilters,
  sort,
  setSort,
  rawCategory,
}: {
  open: boolean;
  onClose: () => void;
  total: number;
  filters: FiltersState;
  setFilters: (next: FiltersState) => void;
  sort: SortKey;
  setSort: (s: SortKey) => void;
  rawCategory: string;
}) {
  const { t } = useTranslation('translation');
  const categoryKey = useMemo(() => resolveCategoryKey((rawCategory || '').replace(/_/g, '-')) || (rawCategory || '').replace(/_/g, '-'), [rawCategory]);
  const showExtinguisherType = categoryKey === 'fire-extinguishers' || (rawCategory || '').replace(/_/g, '-') === 'ognetushiteli';
  const showHoses = categoryKey === 'fire-hoses';
  const showPPE = categoryKey === 'ppe';
  const showAlarms = categoryKey === 'fire-alarms';

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
          <div className="font-semibold text-[#660000]">{t('filters.open', 'Фильтр')}</div>
          <button onClick={onClose} className="text-gray-600 hover:text-gray-900">✕</button>
        </div>

        <div className="p-4 space-y-6 overflow-y-auto h-[calc(100%-56px)]">
          {/* Type (extinguishers) */}
          {showExtinguisherType && (
            <div>
              <div className="font-medium text-gray-800 mb-2">{t('filters.type.title', 'Тип')}</div>
              <div className="space-y-2" role="group" aria-label={t('filters.type.aria', 'Тип огнетушителя')}>
                {([
                  { key: 'op', label: t('filters.type.op', 'ОП (порошковый)') },
                  { key: 'ou', label: t('filters.type.ou', 'ОУ (углекислотный)') },
                  { key: 'mpp', label: t('filters.type.mpp', 'МПП (модульный)') },
                  { key: 'recharge', label: t('filters.type.recharge', 'Перезарядка') },
                ] as const).map((opt) => (
                  <label key={opt.key} className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="radio"
                      name="m-extinguisher-type"
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
                    name="m-extinguisher-type"
                    checked={!filters.type}
                    onChange={() => setFilters({ ...filters, type: undefined })}
                    className="h-4 w-4 text-brand focus:ring-brand/30 border-gray-300"
                  />
                  <span className="text-gray-700">{t('filters.type.all', 'Все')}</span>
                </label>
              </div>
            </div>
          )}

          {/* Hoses */}
          {showHoses && (
            <div>
              <div className="font-medium text-gray-800 mb-2">{t('filters.hoses.title', 'Рукава')}</div>
              <div className="mb-3">
                <div className="text-sm text-gray-700 mb-1">{t('filters.hoses.diameter.title', 'Диаметр')}</div>
                <div className="flex flex-wrap gap-2">
                  {(['51','66','77'] as const).map((d) => {
                    const checked = (filters.diameters || []).includes(d);
                    return (
                      <label key={d} className="inline-flex items-center gap-1 text-sm cursor-pointer border border-gray-300 rounded-full px-2 py-1">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(e) => {
                            const next = new Set(filters.diameters || []);
                            if (e.target.checked) next.add(d); else next.delete(d);
                            setFilters({ ...filters, diameters: Array.from(next) });
                          }}
                          className="h-4 w-4 text-brand focus:ring-brand/30 border-gray-300"
                        />
                        <span className="text-gray-700">{d}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-700 mb-1">{t('filters.hoses.length.title', 'Длина')}</div>
                <div className="flex flex-wrap gap-2">
                  {(['10','20','30'] as const).map((l) => {
                    const checked = (filters.lengths || []).includes(l);
                    return (
                      <label key={l} className="inline-flex items-center gap-1 text-sm cursor-pointer border border-gray-300 rounded-full px-2 py-1">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(e) => {
                            const next = new Set(filters.lengths || []);
                            if (e.target.checked) next.add(l); else next.delete(l);
                            setFilters({ ...filters, lengths: Array.from(next) });
                          }}
                          className="h-4 w-4 text-brand focus:ring-brand/30 border-gray-300"
                        />
                        <span className="text-gray-700">{l}м</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          

          {/* PPE */}
          {showPPE && (
            <div>
              <div className="font-medium text-gray-800 mb-2">{t('filters.ppe.title', 'СИЗ')}</div>
              <div className="flex flex-wrap gap-2">
                {([
                  { k: 'helmet', l: t('filters.ppe.helmet', 'Каски') },
                  { k: 'goggles', l: t('filters.ppe.goggles', 'Очки/Щитки') },
                  { k: 'respirator', l: t('filters.ppe.respirator', 'Респираторы') },
                  { k: 'gloves', l: t('filters.ppe.gloves', 'Перчатки') },
                  { k: 'clothing', l: t('filters.ppe.clothing', 'Одежда') },
                  { k: 'kit', l: t('filters.ppe.kit', 'Комплекты') },
                ] as const).map(({ k, l }) => {
                  const checked = (filters.ppeKinds || []).includes(k);
                  return (
                    <label key={k} className="inline-flex items-center gap-1 text-sm cursor-pointer border border-gray-300 rounded-full px-2 py-1">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) => {
                          const next = new Set(filters.ppeKinds || []);
                          if (e.target.checked) next.add(k); else next.delete(k);
                          setFilters({ ...filters, ppeKinds: Array.from(next) });
                        }}
                        className="h-4 w-4 text-brand focus:ring-brand/30 border-gray-300"
                      />
                      <span className="text-gray-700">{l}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* Alarms */}
          {showAlarms && (
            <div>
              <div className="font-medium text-gray-800 mb-2">{t('filters.alarm.title', 'Сигнализация')}</div>
              <div className="flex flex-wrap gap-2">
                {([
                  { k: 'panel', l: t('filters.alarm.panel', 'Панели') },
                  { k: 'detector', l: t('filters.alarm.detector', 'Извещатели') },
                  { k: 'sounder', l: t('filters.alarm.sounder', 'Оповещатели') },
                  { k: 'beacon', l: t('filters.alarm.beacon', 'Маяки/Свето') },
                ] as const).map(({ k, l }) => {
                  const checked = (filters.alarmKinds || []).includes(k);
                  return (
                    <label key={k} className="inline-flex items-center gap-1 text-sm cursor-pointer border border-gray-300 rounded-full px-2 py-1">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) => {
                          const next = new Set(filters.alarmKinds || []);
                          if (e.target.checked) next.add(k); else next.delete(k);
                          setFilters({ ...filters, alarmKinds: Array.from(next) });
                        }}
                        className="h-4 w-4 text-brand focus:ring-brand/30 border-gray-300"
                      />
                      <span className="text-gray-700">{l}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* Сортировка */}
          <div>
            <div className="font-medium text-gray-800 mb-2">{t('filters.sort.title', 'Сортировка')}</div>
            <div className="space-y-2">
              {(
                [
                  { key: "relevance", label: t('filters.sort.relevance', 'По релевантности') },
                  { key: "priceAsc", label: t('filters.sort.priceAsc', 'Цена: по возрастанию') },
                  { key: "priceDesc", label: t('filters.sort.priceDesc', 'Цена: по убыванию') },
                  { key: "nameAsc", label: t('filters.sort.nameAsc', 'Название: A–Z') },
                  { key: "nameDesc", label: t('filters.sort.nameDesc', 'Название: Z–A') },
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
            <div className="font-medium text-gray-800 mb-2">{t('filters.price.title', 'Цена')}</div>
            <div className="space-y-2">
              {[
                { id: "p1", label: t('filters.price.lt500k', '< 500 000'), from: 0, to: 500_000 },
                { id: "p2", label: t('filters.price.between500k2m', '500 000 – 2 000 000'), from: 500_000, to: 2_000_000 },
                { id: "p3", label: t('filters.price.gt2m', '> 2 000 000'), from: 2_000_000, to: Infinity },
              ].map((r) => {
                const checked = filters.minPrice === r.from && filters.maxPrice === r.to;
                return (
                  <label key={r.id} className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="radio"
                      name="m-price"
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
                  name="m-price"
                  checked={!filters.minPrice && !filters.maxPrice}
                  onChange={() => setFilters({ ...filters, minPrice: undefined, maxPrice: undefined })}
                  className="h-4 w-4 text-brand focus:ring-brand/30 border-gray-300"
                />
                <span className="text-gray-700">{t('filters.price.all', 'Все')}</span>
              </label>
            </div>
          </div>

          {/* Availability */}
          <div>
            <div className="font-medium text-gray-800 mb-2">{t('filters.availability.title', 'Наличие')}</div>
            <div className="space-y-2">
              {([
                { k: 'in', l: t('filters.availability.in', 'В наличии') },
                { k: 'out', l: t('filters.availability.out', 'Под заказ') },
              ] as const).map(({ k, l }) => (
                <label key={k} className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="radio"
                    name="m-availability"
                    checked={filters.availability === k}
                    onChange={() => setFilters({ ...filters, availability: k })}
                    className="h-4 w-4 text-brand focus:ring-brand/30 border-gray-300"
                  />
                  <span className="text-gray-700">{l}</span>
                </label>
              ))}
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="radio"
                  name="m-availability"
                  checked={!filters.availability}
                  onChange={() => setFilters({ ...filters, availability: undefined })}
                  className="h-4 w-4 text-brand focus:ring-brand/30 border-gray-300"
                />
                <span className="text-gray-700">{t('filters.availability.all', 'Все')}</span>
              </label>
            </div>
          </div>

          <div className="pt-2">
            <button onClick={onClose} className="btn-primary w-full">{t('filters.apply', { defaultValue: 'Показать {{count}}', count: total })}</button>
          </div>
        </div>
      </div>
    </div>
  );
}
