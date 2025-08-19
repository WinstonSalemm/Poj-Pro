'use client';

import { useEffect, useMemo, useState } from 'react';
import AdminGate from '@/components/admin/AdminGate';
import { toast } from 'react-hot-toast';

type ProductRow = {
  id: string;
  slug: string;
  title: string;
  price: number;
  stock: number;
  isActive: boolean;
  category?: { id: string; slug: string; name?: string } | null;
  images: string[];
};

const emptyForm = {
  id: '' as string | undefined,
  slug: '',
  title: '',
  price: 0,
  stock: 0,
  categorySlug: '' as string | undefined,
  imagesCsv: ''
};

type FormState = typeof emptyForm;

export default function AdminProductsPage() {
  const [rows, setRows] = useState<ProductRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [q, setQ] = useState('');
  const [form, setForm] = useState<FormState>(emptyForm);

  const token = useMemo(() => {
    if (typeof window === 'undefined') return '';
    return localStorage.getItem('adminToken') || '';
  }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return rows;
    return rows.filter((r) =>
      r.slug.toLowerCase().includes(s) || r.title.toLowerCase().includes(s)
    );
  }, [q, rows]);

  const reload = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/products');
      const json = await res.json();
      if (!json.success) throw new Error(json.message || 'failed');
      setRows(json.data as ProductRow[]);
    } catch (e) {
      console.error(e);
      toast.error('Не удалось загрузить товары');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reload();
  }, []);

  const onEdit = (p: ProductRow) => {
    setForm({
      id: p.id,
      slug: p.slug,
      title: p.title,
      price: p.price ?? 0,
      stock: p.stock ?? 0,
      categorySlug: p.category?.slug,
      imagesCsv: (p.images || []).join(',')
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => setForm(emptyForm);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const base = {
        slug: form.slug.trim(),
        title: form.title.trim(),
        price: Number(form.price) || 0,
        stock: Number(form.stock) || 0,
        categorySlug: form.categorySlug?.trim() || undefined,
        images: form.imagesCsv
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
      };

      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        'x-admin-token': token,
      };

      if (form.id) {
        const res = await fetch(`/api/admin/products/${form.id}` , {
          method: 'PUT',
          headers,
          body: JSON.stringify(base),
        });
        if (!res.ok) throw new Error('update failed');
        toast.success('Товар обновлён');
      } else {
        const res = await fetch('/api/admin/products', {
          method: 'POST',
          headers,
          body: JSON.stringify(base),
        });
        if (!res.ok) throw new Error('create failed');
        toast.success('Товар создан');
      }
      resetForm();
      await reload();
    } catch (e) {
      console.error(e);
      toast.error('Ошибка сохранения товара');
    } finally {
      setSubmitting(false);
    }
  };

  const onDelete = async (id: string) => {
    if (!confirm('Удалить товар?')) return;
    try {
      const res = await fetch(`/api/admin/products/${id}` , {
        method: 'DELETE',
        headers: { 'x-admin-token': token },
      });
      if (!res.ok) throw new Error('delete failed');
      toast.success('Товар удалён');
      await reload();
    } catch (e) {
      console.error(e);
      toast.error('Ошибка удаления товара');
    }
  };

  return (
    <AdminGate>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Управление товарами</h1>
        </div>

        <form onSubmit={onSubmit} className="bg-white shadow rounded-lg p-6 mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
            <input
              value={form.slug}
              onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
              className="w-full rounded border border-gray-300 px-3 py-2"
              placeholder="acm-210e-bt"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Название (ru)</label>
            <input
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              className="w-full rounded border border-gray-300 px-3 py-2"
              placeholder="Название товара"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Цена</label>
            <input
              type="number"
              value={form.price}
              onChange={(e) => setForm((f) => ({ ...f, price: Number(e.target.value) }))}
              className="w-full rounded border border-gray-300 px-3 py-2"
              min={0}
              step={1}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Количество (stock)</label>
            <input
              type="number"
              value={form.stock}
              onChange={(e) => setForm((f) => ({ ...f, stock: Number(e.target.value) }))}
              className="w-full rounded border border-gray-300 px-3 py-2"
              min={0}
              step={1}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Категория (slug)</label>
            <input
              value={form.categorySlug || ''}
              onChange={(e) => setForm((f) => ({ ...f, categorySlug: e.target.value }))}
              className="w-full rounded border border-gray-300 px-3 py-2"
              placeholder="audio-systems"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Изображения (через запятую)</label>
            <input
              value={form.imagesCsv}
              onChange={(e) => setForm((f) => ({ ...f, imagesCsv: e.target.value }))}
              className="w-full rounded border border-gray-300 px-3 py-2"
              placeholder="/public/ProductImages/ACM-210E-BT.png, /public/ProductImages/ACM-210E-BT-2.png"
            />
          </div>
          <div className="md:col-span-2 flex gap-3 justify-end">
            {form.id && (
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 rounded border border-gray-300 text-gray-700"
                disabled={submitting}
              >
                Отменить
              </button>
            )}
            <button
              type="submit"
              className="px-4 py-2 rounded bg-[#660000] text-white disabled:opacity-60"
              disabled={submitting}
            >
              {form.id ? 'Сохранить изменения' : 'Создать товар'}
            </button>
          </div>
        </form>

        <div className="bg-white shadow rounded-lg">
          <div className="p-4 flex items-center justify-between gap-4 border-b">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Поиск по названию или slug"
              className="w-full max-w-md rounded border border-gray-300 px-3 py-2"
            />
          </div>
          {loading ? (
            <div className="p-8 text-center text-gray-600">Загрузка...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Название</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Slug</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Цена</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Кол-во</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Категория</th>
                    <th className="px-4 py-2" />
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filtered.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2">
                        <div className="text-sm font-medium text-gray-900">{p.title}</div>
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-600">{p.slug}</td>
                      <td className="px-4 py-2 text-sm text-gray-600">{p.price?.toLocaleString('ru-RU')}</td>
                      <td className="px-4 py-2 text-sm text-gray-600">{p.stock}</td>
                      <td className="px-4 py-2 text-sm text-gray-600">{p.category?.name || '-'}</td>
                      <td className="px-4 py-2 text-right whitespace-nowrap">
                        <button
                          onClick={() => onEdit(p)}
                          className="text-[#660000] hover:text-[#7a1a1a] mr-3"
                        >
                          Редактировать
                        </button>
                        <button
                          onClick={() => onDelete(p.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Удалить
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminGate>
  );
}
