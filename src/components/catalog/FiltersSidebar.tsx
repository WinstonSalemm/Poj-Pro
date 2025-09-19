"use client";

import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { resolveCategoryKey } from "@/constants/categorySeo";

export type ExtinguisherType = 'op' | 'ou' | 'mpp' | 'recharge';
export type FireClass = 'A' | 'B' | 'C' | 'E';

export type FiltersState = {
  minPrice?: number;
  maxPrice?: number;
  type?: ExtinguisherType;
  volumes?: string[]; // e.g. ['2','3','5','10','25']
  classes?: FireClass[];
  availability?: 'in' | 'out';
  // Hoses specific
  diameters?: string[]; // ['51','66','77']
  lengths?: string[]; // ['10','20','30']
  // Cabinets specific
  mounts?: Array<'surface' | 'recessed'>;
  sections?: Array<'one' | 'two'>;
  window?: boolean;
  // PPE specific
  ppeKinds?: string[]; // ['helmet','goggles','respirator','gloves','clothing','kit']
  // Fire alarms specific
  alarmKinds?: string[]; // ['panel','detector','sounder','beacon']
};

export type SortKey = "relevance" | "priceAsc" | "priceDesc" | "nameAsc" | "nameDesc";

export default function FiltersSidebar({
  total,
  filters,
  setFilters,
  sort,
  setSort,
  className,
  rawCategory,
}: {
  total: number;
  filters: FiltersState;
  setFilters: (next: FiltersState) => void;
  sort: SortKey;
  setSort: (s: SortKey) => void;
  className?: string;
  rawCategory: string;
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

  const showExtinguisherType = useMemo(() => {
    const norm = (rawCategory || '').replace(/_/g, '-');
    const key = resolveCategoryKey(norm);
    return key === 'fire-extinguishers' || norm === 'ognetushiteli';
  }, [rawCategory]);
  const key = useMemo(() => resolveCategoryKey((rawCategory || '').replace(/_/g, '-')) || (rawCategory || '').replace(/_/g, '-'), [rawCategory]);
  const showHoses = key === 'fire-hoses';
  const showPPE = key === 'ppe';
  const showAlarms = key === 'fire-alarms';

  return (
    <aside className={className ?? "w-full md:w-64 shrink-0"} aria-label="Filters sidebar">
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="mb-4">
          <div className="text-sm text-gray-500">{t("filters.total", "Всего")}</div>
          <div className="text-xl font-semibold text-brand">{total}</div>
        </div>

        <div className="space-y-4">
          {/* Type (only for fire extinguishers category) */}
          {showExtinguisherType && (
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
          )}

          {/* Hoses: diameter and length */}
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
                          aria-label={`D${d}`}
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
                          aria-label={`L${l}`}
                        />
                        <span className="text-gray-700">{l}м</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          

          {/* PPE kinds */}
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

          {/* Fire alarms kinds */}
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

          {/* Fire classes (only for extinguishers) */}
          {showExtinguisherType && (
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
          )}

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
                    name="availability"
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
                  name="availability"
                  checked={!filters.availability}
                  onChange={() => setFilters({ ...filters, availability: undefined })}
                  className="h-4 w-4 text-brand focus:ring-brand/30 border-gray-300"
                />
                <span className="text-gray-700">{t('filters.availability.all', 'Все')}</span>
              </label>
            </div>
          </div>

          
        </div>
      </div>
    </aside>
  );
}
