'use client';

import { useState, useMemo, useEffect } from 'react';
import { format } from 'date-fns';
import { ru as dfRu } from 'date-fns/locale/ru';
import { enUS } from 'date-fns/locale/en-US';
import { uz as dfUz } from 'date-fns/locale/uz';
import { useTranslation } from 'next-i18next';

interface SupplyItem {
  name: string;
  quantity: number;
  supplier?: string;
  notes?: string;
}

interface SupplyCardProps {
  id: string;
  title: string;
  etaDate?: string;  // Made optional with ?
  status: 'planned' | 'in_transit' | 'arrived';
  items: SupplyItem[];
  onDelete?: (id: string) => void;
  onEdit?: (id: string) => void;
  isAdmin?: boolean;
}

export default function SupplyCard({
  id,
  title,
  etaDate,
  status,
  items,
  onDelete,
  onEdit,
  isAdmin = false,
}: SupplyCardProps) {
  const { t } = useTranslation();
  const { i18n } = useTranslation('translation');
  const [showItems, setShowItems] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [formattedDate, setFormattedDate] = useState('');

  const date = useMemo(() => etaDate ? new Date(etaDate) : null, [etaDate]);
  const isFuture = date ? date > new Date() : false;

  // date-fns locale mapping
  const dfLocale = useMemo(() => {
    const lang = (i18n.language || 'ru').toLowerCase();
    if (lang.startsWith('ru')) return dfRu;
    if (lang.startsWith('uz')) return dfUz;
    return enUS;
  }, [i18n.language]);

  useEffect(() => {
    if (date) {
      const formatString = i18n.language === 'ru' ? 'dd MMMM yyyy' : 'MMMM d, yyyy';
      setFormattedDate(format(date, formatString, { locale: dfLocale }));
    } else {
      setFormattedDate(t('supplies.noDate', 'No date specified'));
    }
  }, [date, dfLocale, i18n.language, t]);

  const getStatusLabel = () => {
    switch (status) {
      case 'planned':
        return t('supplies.status.planned');
      case 'in_transit':
        return t('supplies.status.in_transit');
      case 'arrived':
        return t('supplies.status.arrived');
      default:
        return status;
    }
  };

  const statusClasses: Record<SupplyCardProps['status'], string> = {
    planned: 'bg-yellow-100 text-yellow-800',
    in_transit: 'bg-[#660000] text-[white]',
    arrived: 'bg-green-100 text-green-800',
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.(id);
    setShowDeleteConfirm(false);
  };

  const handleCancelDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteConfirm(false);
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit?.(id);
  };

  return (
    <div
      className="relative bg-white border border-gray-200 rounded-lg shadow transition-all mb-4 hover:shadow-lg hover:-translate-y-0.5 cursor-pointer !text-[#660000]"
      onClick={() => setShowItems((s) => !s)}
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 px-4 py-4 bg-gray-50 border-b border-gray-200">
        <h3 className="m-0 text-[1.1rem] font-semibold text-black md:mr-4">
          {title}
        </h3>

        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={`text-xs font-semibold px-2 py-1 rounded-full whitespace-nowrap ${statusClasses[status]}`}
          >
            {getStatusLabel()}
          </span>

          <span className="text-sm text-gray-600 flex items-center gap-1">
            {formattedDate}
            {isFuture && (
              <span className="ml-1 bg-amber-100 text-amber-800 text-[0.7rem] px-1.5 py-0.5 rounded">
                {t('soon', 'скоро')}
              </span>
            )}
          </span>

          {isAdmin && (
            <div
              className="flex items-center gap-2 ml-2"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="text-sm px-2 py-1 rounded hover:bg-gray-200"
                onClick={handleEditClick}
                aria-label={t('admin.edit', 'Редактировать')}
                type="button"
              >
                ✏️
              </button>
              <button
                className="text-sm px-2 py-1 rounded text-red-500 hover:bg-red-100"
                onClick={handleDeleteClick}
                aria-label={t('admin.delete', 'Удалить')}
                type="button"
              >
                🗑️
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-4">
        <div className="flex items-center justify-between mb-3 text-sm text-gray-600">

          <button
            className="text-sm px-2 py-1 rounded hover:bg-blue-50 !text-[#660000]"
            onClick={(e) => {
              e.stopPropagation();
              setShowItems((s) => !s);
            }}
            aria-expanded={showItems}
            aria-controls={`items-${id}`}
            type="button"
          >
            {showItems ? t('supplies.items.hideItems') : t('supplies.items.showItems')}
          </button>
        </div>

        {showItems && (
          <div id={`items-${id}`} className="mt-3 overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-gray-50 text-gray-700">
                  <th className="text-left px-3 py-2 border-b border-gray-200 font-semibold">
                    {t('supplies.items.name')}
                  </th>
                  <th className="text-left px-3 py-2 border-b border-gray-200 font-semibold">
                    {t('supplies.items.quantity')}
                  </th>
                  <th className="text-left px-3 py-2 border-b border-gray-200 font-semibold">
                    {t('supplies.items.supplier')}
                  </th>
                  <th className="text-left px-3 py-2 border-b border-gray-200 font-semibold">
                    {t('supplies.items.notes')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => {
                  const isTons =
                    typeof item.notes === 'string' &&
                    /тонн|ton/i.test(item.notes);
                  const unit =
                    isTons ? '' : t('units.pcs', { defaultValue: 'шт' });

                  return (
                    <tr key={idx} className="border-b border-gray-200 last:border-b-0">
                      <td className="px-3 py-2">{item.name}</td>
                      <td className="px-3 py-2">
                        {item.quantity} {unit}
                      </td>
                      <td className="px-3 py-2 text-gray-700">
                        {item.supplier || '-'}
                      </td>
                      <td className="px-3 py-2 text-gray-700">
                        {item.notes || '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete confirmation overlay */}
      {showDeleteConfirm && (
        <div
          className="absolute inset-0 bg-white/95 backdrop-blur-[1px] rounded-lg z-10 flex flex-col items-center justify-center p-5 text-center"
          onClick={(e) => e.stopPropagation()}
          role="alertdialog"
          aria-labelledby="delete-confirmation-title"
        >
          <p id="delete-confirmation-title" className="mb-4 text-black">
            {t('supplies.admin.confirmDelete')}
          </p>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleCancelDelete}
              className="px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300"
            >
              {t('supplies.admin.cancel')}
            </button>
            <button
              type="button"
              onClick={handleConfirmDelete}
              autoFocus
              className="px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600"
            >
              {t('supplies.admin.deleteSupply')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
