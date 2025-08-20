'use client';

import { useState } from 'react';

interface SupplyItem {
  name: string;
  quantity: number;
  supplier?: string;
  notes?: string;
}

interface SupplyFormProps {
  initialData?: {
    id?: string;
    title: string;
    etaDate: string; // ISO
    status: 'planned' | 'in_transit' | 'arrived';
    items: SupplyItem[];
  };
  onSubmit: (data: {
    id?: string;
    title: string;
    etaDate: string; // ISO
    status: 'planned' | 'in_transit' | 'arrived';
    items: SupplyItem[];
  }) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

export default function SupplyForm({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting,
}: SupplyFormProps) {
  const isEdit = !!initialData?.id;

  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    // показываем в инпуте только дату (YYYY-MM-DD)
    etaDate: initialData?.etaDate ? initialData.etaDate.split('T')[0] : '',
    status: (initialData?.status || 'planned') as 'planned' | 'in_transit' | 'arrived',
  });

  const [items, setItems] = useState<SupplyItem[]>(
    initialData?.items?.length
      ? initialData.items
      : [{ name: '', quantity: 1, supplier: '', notes: '' }]
  );

  const [bulkItems, setBulkItems] = useState('');
  const [showBulkInput, setShowBulkInput] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (errors[name]) {
      const { [name]: _unused1, ...rest } = errors;
      void _unused1; // explicitly mark as used
      setErrors(rest);
    }
  };

  const handleItemChange = (index: number, field: keyof SupplyItem, value: string | number) => {
    const next = [...items];
    next[index] = {
      ...next[index],
      [field]: field === 'quantity'
        ? value === '' ? 0 : Number(value)
        : value,
    };
    setItems(next);

    const key = field === 'name' ? `itemName${index}` : field === 'quantity' ? `itemQuantity${index}` : '';
    if (key && errors[key]) {
      const { [key]: _unused2, ...rest } = errors;
      void _unused2; // explicitly mark as used
      setErrors(rest);
    }
  };

  const addItem = () => setItems(prev => [...prev, { name: '', quantity: 1, supplier: '', notes: '' }]);

  const removeItem = (index: number) => {
    if (items.length <= 1) return;
    const next = [...items];
    next.splice(index, 1);
    setItems(next);
  };

  const handleBulkAdd = () => {
    try {
      const lines = bulkItems.split('\n').map(l => l.trim()).filter(Boolean);
      const next = [...items];
      for (const line of lines) {
        // поддержим и длинное тире, и дефис
        const parts = line.split('—').length > 1 ? line.split('—') : line.split('-');
        const [rawName, rawQty, rawSupplier] = parts.map(p => (p ?? '').trim());
        if (!rawName) continue;

        const qtyMatch = (rawQty || '').match(/(\d+(?:[.,]\d+)?)/);
        const quantity = qtyMatch ? parseFloat(qtyMatch[1].replace(',', '.')) : 1;

        next.push({
          name: rawName,
          quantity: Number.isFinite(quantity) ? quantity : 1,
          supplier: rawSupplier || '',
        });
      }
      setItems(next);
      setBulkItems('');
      setShowBulkInput(false);
    } catch (e) {
      console.error('Bulk parse error', e);
      alert('Ошибка при разборе данных. Проверьте формат.');
    }
  };

  const validate = () => {
    const e: Record<string, string> = {};

    if (!formData.title.trim()) e.title = 'Введите название поставки';
    if (!formData.etaDate) e.etaDate = 'Укажите дату прибытия';
    if (!formData.status) e.status = 'Выберите статус';

    items.forEach((it, i) => {
      if (!it.name.trim()) e[`itemName${i}`] = 'Введите название позиции';
      if (it.quantity <= 0) e[`itemQuantity${i}`] = 'Количество должно быть больше 0';
    });

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const payload = {
        ...(initialData?.id && { id: initialData.id }),
        title: formData.title.trim(),
        etaDate: new Date(formData.etaDate).toISOString(),
        status: formData.status,
        items: items
          .filter(it => it.name.trim() !== '')
          .map(it => ({ ...it, supplier: it.supplier?.trim() || undefined, notes: it.notes?.trim() || undefined })),
      };
      await onSubmit(payload);
    } catch (err) {
      console.error('Submit error', err);
      alert('Произошла ошибка при сохранении. Пожалуйста, попробуйте снова.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-[1000px] mx-auto p-4 !text-[#660000]">
      {/* Card */}
      <div className="bg-white rounded-lg shadow border border-gray-200 p-6 mb-8">
        <h2 className="text-[1.5rem] font-semibold text-black mb-6 pb-3 border-b border-gray-200">
          {isEdit ? 'Редактировать поставку' : 'Добавить новую поставку'}
        </h2>

        {/* Title */}
        <div className="mb-5">
          <label htmlFor="title" className="block mb-2 font-medium text-sm text-gray-700">
            Название поставки *
          </label>
          <input
            id="title"
            name="title"
            type="text"
            value={formData.title}
            onChange={handleChange}
            placeholder="Например: Поставка №1 — Огнеборец"
            className={`w-full rounded border text-sm px-3 py-2 bg-white outline-none transition
              ${errors.title ? 'border-red-500 focus:border-red-500 focus:ring-red-200' : 'border-gray-300 focus:border-[#660000] focus:ring-2 focus:ring-[#660000]/20'}`}
          />
          {errors.title && <span className="text-red-500 text-xs mt-1 block">{errors.title}</span>}
        </div>

        {/* Row: date + status */}
        <div className="flex gap-4 mb-5 max-[768px]:flex-col">
          <div className="flex-1">
            <label htmlFor="etaDate" className="block mb-2 font-medium text-sm text-gray-700">
              Дата прибытия *
            </label>
            <input
              id="etaDate"
              name="etaDate"
              type="date"
              value={formData.etaDate}
              onChange={handleChange}
              className={`w-full rounded border text-sm px-3 py-2 bg-white outline-none transition
                ${errors.etaDate ? 'border-red-500 focus:border-red-500 focus:ring-red-200' : 'border-gray-300 focus:border-[#660000] focus:ring-2 focus:ring-[#660000]/20'}`}
            />
            {errors.etaDate && <span className="text-red-500 text-xs mt-1 block">{errors.etaDate}</span>}
          </div>

          <div className="flex-1">
            <label htmlFor="status" className="block mb-2 font-medium text-sm text-gray-700">
              Статус *
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              className={`w-full rounded border text-sm px-3 py-2 bg-white outline-none transition appearance-none pr-10
                bg-[length:1.25rem_1.25rem] bg-no-repeat bg-[right_0.75rem_center]
                ${errors.status ? 'border-red-500 focus:border-red-500 focus:ring-red-200' : 'border-gray-300 focus:border-[#660000] focus:ring-2 focus:ring-[#660000]/20'}`}
              style={{
                backgroundImage:
                  "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e\")",
              }}
            >
              <option value="planned">Запланирована</option>
              <option value="in_transit">В пути</option>
              <option value="arrived">Доставлена</option>
            </select>
            {errors.status && <span className="text-red-500 text-xs mt-1 block">{errors.status}</span>}
          </div>
        </div>

        {/* Items Section */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="flex items-center justify-between gap-4 flex-wrap mb-4">
            <h3 className="text-[1.125rem] font-semibold text-[#660000] m-0">Позиции в поставке *</h3>
            <div className="flex gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => setShowBulkInput(v => !v)}
                className="px-3 py-2 rounded border text-sm font-medium bg-white border-gray-300 hover:bg-gray-50 text-[#660000] hover:border-[#660000] transition-colors"
              >
                {showBulkInput ? 'Скрыть массовое добавление' : 'Массовое добавление'}
              </button>
              <button
                type="button"
                onClick={addItem}
                className="px-3 py-2 rounded text-sm font-medium bg-[#660000] text-white hover:bg-[#7a1a1a] transition-colors"
              >
                + Добавить позицию
              </button>
            </div>
          </div>

          {showBulkInput && (
            <div className="mb-6 p-4 rounded border border-dashed border-gray-300 bg-gray-50">
              <p className="m-0 mb-3 text-sm italic text-gray-600">
                Введите данные в формате: Наименование — Количество — Поставщик (опционально)
              </p>
              <textarea
                rows={5}
                value={bulkItems}
                onChange={(e) => setBulkItems(e.target.value)}
                placeholder={`ОП-4 — 2400 — Огнеборец
ОУ-2 — 100 — Огнеборец
Порошок — 2 — Огнеборец`}
                className="w-full rounded border border-gray-300 bg-white text-sm px-3 py-2 outline-none focus:border-[#660000] focus:ring-2 focus:ring-[#660000]/20 mb-3"
              />
              <div className="flex gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={handleBulkAdd}
                  className="px-3 py-2 rounded text-sm font-medium bg-[#660000] text-white hover:bg-[#7a1a1a] transition-colors"
                >
                  Добавить позиции
                </button>
                <button
                  type="button"
                  onClick={() => setShowBulkInput(false)}
                  className="px-3 py-2 rounded border text-sm font-medium bg-white border-gray-300 hover:bg-gray-50 text-[#660000] hover:border-[#660000] transition-colors"
                >
                  Отмена
                </button>
              </div>
            </div>
          )}

          {/* Items list */}
          <div className="mt-4 rounded border border-gray-200 overflow-hidden">
            {items.map((item, index) => (
              <div
                key={index}
                className="grid grid-cols-[2fr_110px_1.5fr_1.5fr_40px] max-[1024px]:grid-cols-[1fr_90px_1fr_1fr_40px] gap-3 p-3 border-b border-gray-200 bg-white items-start relative max-[768px]:grid-cols-1"
              >
                {/* name */}
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">Наименование *</label>
                  <input
                    type="text"
                    value={item.name}
                    onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                    placeholder="Например: ОП-4"
                    className={`w-full rounded border text-sm px-3 py-2 bg-white outline-none transition
                      ${errors[`itemName${index}`]
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-200'
                        : 'border-gray-300 focus:border-[#660000] focus:ring-2 focus:ring-[#660000]/20'}`}
                  />
                  {errors[`itemName${index}`] && (
                    <span className="text-red-500 text-xs mt-1 block">{errors[`itemName${index}`]}</span>
                  )}
                </div>

                {/* quantity */}
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">Количество *</label>
                  <input
                    type="number"
                    min={1}
                    value={item.quantity || ''}
                    onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                    className={`w-full rounded border text-sm px-3 py-2 bg-white outline-none transition text-right
                      ${errors[`itemQuantity${index}`]
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-200'
                        : 'border-gray-300 focus:border-[#660000] focus:ring-2 focus:ring-[#660000]/20'}`}
                  />
                  {errors[`itemQuantity${index}`] && (
                    <span className="text-red-500 text-xs mt-1 block">{errors[`itemQuantity${index}`]}</span>
                  )}
                </div>

                {/* supplier */}
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">Поставщик</label>
                  <input
                    type="text"
                    value={item.supplier || ''}
                    onChange={(e) => handleItemChange(index, 'supplier', e.target.value)}
                    placeholder="Например: Огнеборец"
                    className="w-full rounded border border-gray-300 text-sm px-3 py-2 bg-white outline-none focus:border-[#660000] focus:ring-2 focus:ring-[#660000]/20"
                  />
                </div>

                {/* notes */}
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">Примечания</label>
                  <input
                    type="text"
                    value={item.notes || ''}
                    onChange={(e) => handleItemChange(index, 'notes', e.target.value)}
                    placeholder="Например: 20м, красный"
                    className="w-full rounded border border-gray-300 text-sm px-3 py-2 bg-white outline-none focus:border-[#660000] focus:ring-2 focus:ring-[#660000]/20"
                  />
                </div>

                {/* remove */}
                {items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    title="Удалить позицию"
                    className="w-10 h-10 rounded text-red-500 hover:bg-red-100 text-xl leading-none mt-6 justify-self-end"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-200 max-[768px]:flex-col">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="px-4 py-2 rounded border bg-white border-gray-300 text-sm font-medium text-[#660000] hover:border-[#660000] hover:bg-gray-50 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            Отмена
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 rounded text-sm font-medium bg-[#660000] text-white hover:bg-[#7a1a1a] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Сохранение...' : 'Сохранить'}
          </button>
        </div>
      </div>
    </form>
  );
}
