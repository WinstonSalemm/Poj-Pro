'use client';

import { useEffect, useMemo, useState } from 'react';
import AdminGate from '@/components/admin/AdminGate';
import SupplyForm from '@/components/admin/SupplyForm';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import { CATEGORIES } from '@/constants/categories';

// -------------------- Shared types --------------------
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

interface SupplyItem {
  name: string;
  quantity: number;
  supplier?: string;
  notes?: string;
}

interface Supply {
  id: string;
  title: string;
  etaDate: string;
  status: 'planned' | 'in_transit' | 'arrived';
  items: SupplyItem[];
  createdAt: string;
  updatedAt: string;
}

// -------------------- Users tab types --------------------
type UserRow = {
  id: string;
  name: string | null;
  email: string;
  isAdmin: boolean;
  createdAt: string;
  _count: { orders: number };
  orders: Array<{
    id: string;
    total: number;
    status: string;
    createdAt: string;
    _count: { items: number };
  }>;
};

// -------------------- Products tab --------------------
function ProductsTab() {
  const [rows, setRows] = useState<ProductRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [q, setQ] = useState('');
  const [form, setForm] = useState({
    id: '' as string | undefined,
    slug: '',
    title: '',
    price: 0,
    stock: 0,
    categorySlug: '' as string | undefined,
    imagesCsv: ''
  });

  // Category input mode: styled select or custom text input
  const [categoryInputMode, setCategoryInputMode] = useState<'select' | 'custom'>('select');

  // Note: read admin token at the time of action to avoid stale value
  const getAdminToken = () => (typeof window !== 'undefined' ? localStorage.getItem('adminToken') || '' : '');

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

  const resetForm = () => setForm({ id: undefined, slug: '', title: '', price: 0, stock: 0, categorySlug: undefined, imagesCsv: '' });

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
        'x-admin-token': getAdminToken(),
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
      setDeletingId(null);
    }
  };

  const onDelete = async (id: string) => {
    if (!confirm('Удалить товар?')) return;
    try {
      setSubmitting(true);
      setDeletingId(id);
      const token = getAdminToken();
      if (!token) {
        toast.error('Не авторизовано: отсутствует токен администратора. Введите пароль админа и повторите.');
        return;
      }
      const res = await fetch(`/api/admin/products/${id}` , {
        method: 'DELETE',
        headers: { 'x-admin-token': token },
        cache: 'no-store',
      });
      if (!res.ok) {
        if (res.status === 401) {
          toast.error('Не авторизовано. Войдите как администратор и попробуйте снова.');
        } else if (res.status === 404) {
          toast.error('Товар не найден или уже удалён');
        } else {
          // Try JSON, then plain text
          let message = '';
          try {
            const j: { message?: string } = await res.json();
            message = j?.message || '';
          } catch {
            try {
              message = await res.text();
            } catch {
              message = '';
            }
          }
          toast.error(message || 'Ошибка удаления товара');
        }
        return;
      }
      toast.success('Товар удалён');
      resetForm();
      await reload();
    } catch (e) {
      console.error(e);
      toast.error('Ошибка удаления товара');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <form onSubmit={onSubmit} className="bg-white shadow rounded-lg p-6 mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
          <input
            value={form.slug}
            onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
            className="w-full rounded border border-gray-300 px-3 py-2 !text-[#660000] placeholder:!text-[#660000] focus:border-[#660000] focus:ring-2 focus:ring-[#660000]/20"
            placeholder="acm-210e-bt"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Название (ru)</label>
          <input
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            className="w-full !text-[#660000] rounded border border-gray-300 px-3 py-2"
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
            className="w-full rounded !text-[#660000] border border-gray-300 px-3 py-2"
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
            className="w-full rounded border !text-[#660000] border-gray-300 px-3 py-2"
            min={0}
            step={1}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Категория (slug)</label>
          {categoryInputMode === 'select' ? (
            <div className="flex gap-2">
              <select
                value={form.categorySlug || ''}
                onChange={(e) => setForm((f) => ({ ...f, categorySlug: e.target.value }))}
                className="w-full rounded border !text-[#660000] border-gray-300 px-3 py-2 bg-white cursor-pointer focus:border-[#660000] focus:ring-2 focus:ring-[#660000]/20"
              >
                <option value="">— выбрать категорию —</option>
                {CATEGORIES.map((slug) => (
                  <option key={slug} value={slug}>{slug}</option>
                ))}
              </select>
              <button
                type="button"
                className="px-3 py-2 rounded border border-gray-300 text-gray-700 cursor-pointer hover:bg-gray-50"
                onClick={() => setCategoryInputMode('custom')}
              >
                Новая…
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <input
                value={form.categorySlug || ''}
                onChange={(e) => setForm((f) => ({ ...f, categorySlug: e.target.value }))}
                className="w-full rounded border !text-[#660000] border-gray-300 px-3 py-2"
                placeholder="новая категория (slug)"
              />
              <button
                type="button"
                className="px-3 py-2 rounded border border-gray-300 text-gray-700 cursor-pointer hover:bg-gray-50"
                onClick={() => setCategoryInputMode('select')}
              >
                Список
              </button>
            </div>
          )}
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Изображения (через запятую)</label>
          <input
            value={form.imagesCsv}
            onChange={(e) => setForm((f) => ({ ...f, imagesCsv: e.target.value }))}
            className="w-full rounded border !text-[#660000] border-gray-300 px-3 py-2"
            placeholder="/public/ProductImages/ACM-210E-BT.png, /public/ProductImages/ACM-210E-BT-2.png"
          />
        </div>
        <div className="md:col-span-2 flex gap-3 justify-end">
          {form.id && (
            <>
              <button
                type="button"
                onClick={() => onDelete(form.id!)}
                className="px-4 py-2 rounded border cursor-pointer border-red-300 text-red-700 hover:bg-red-50"
                disabled={submitting}
              >
                Удалить продукт
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 rounded border cursor-pointer border-gray-300 text-gray-700"
                disabled={submitting}
              >
                Отменить
              </button>
            </>
          )}
          <button
            type="submit"
            className="px-4 py-2 rounded bg-[#660000] text-white cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
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
            className="w-full max-w-md rounded border !text-[#660000] border-gray-300 px-3 py-2"
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
                        type="button"
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); onEdit(p); }}
                        className="text-[#660000] hover:text-[#7a1a1a] mr-3"
                      >
                        Редактировать
                      </button>
                      <button
                        type="button"
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDelete(p.id); }}
                        disabled={deletingId === p.id || submitting}
                        className="text-red-600 hover:text-red-800 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {deletingId === p.id ? 'Удаляем…' : 'Удалить'}
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
  );
}

// -------------------- Supplies tab --------------------
function SuppliesTab() {
  const [supplies, setSupplies] = useState<Supply[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingSupply, setEditingSupply] = useState<Supply | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchSupplies = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/supplies');
      if (!response.ok) {
        throw new Error('Failed to fetch supplies');
      }
      const data = await response.json();
      setSupplies(data);
    } catch (error) {
      console.error('Error fetching supplies:', error);
      toast.error('Не удалось загрузить список поставок');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSupplies();
  }, []);

  const handleSubmit = async (data: Omit<Supply, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }) => {
    try {
      setIsSubmitting(true);
      const isEdit = !!data.id;
      const token = localStorage.getItem('adminToken');

      let response;

      if (isEdit) {
        response = await fetch(`/api/supplies/${data.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'x-admin-token': token || '',
          },
          body: JSON.stringify(data),
        });
      } else {
        response = await fetch('/api/supplies', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-admin-token': token || '',
          },
          body: JSON.stringify(data),
        });
      }

      if (!response.ok) {
        throw new Error(isEdit ? 'Failed to update supply' : 'Failed to create supply');
      }

      const result = await response.json();

      if (isEdit) {
        setSupplies(supplies.map(s => s.id === data.id ? result : s));
        toast.success('Поставка успешно обновлена');
      } else {
        setSupplies([...supplies, result]);
        toast.success('Поставка успешно создана');
      }

      setShowForm(false);
      setEditingSupply(null);
      await fetchSupplies();
    } catch (error) {
      console.error('Error saving supply:', error);
      toast.error('Произошла ошибка при сохранении');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Вы уверены, что хотите удалить эту поставку? Это действие нельзя отменить.')) return;
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`/api/supplies/${id}`, {
        method: 'DELETE',
        headers: { 'x-admin-token': token || '' },
      });
      if (!response.ok) throw new Error('Failed to delete supply');

      setSupplies(supplies.filter(s => s.id !== id));
      toast.success('Поставка успешно удалена');
    } catch (error) {
      console.error('Error deleting supply:', error);
      toast.error('Не удалось удалить поставку');
    }
  };

  const handleEdit = (supply: Supply) => {
    setEditingSupply(supply);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingSupply(null);
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900">Поставки</h2>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="bg-[#660000] hover:bg-[#7a1a1a] text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
          >
            + Добавить поставку
          </button>
        )}
      </div>

      {showForm && (
        <div className="mb-8">
          <SupplyForm
            initialData={editingSupply || undefined}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isSubmitting={isSubmitting}
          />
        </div>
      )}

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-2 text-gray-600">Загрузка поставок...</p>
          </div>
        ) : supplies.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500">Нет доступных поставок</p>
            <button
              onClick={() => setShowForm(true)}
              className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Создать первую поставку
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Название</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Дата прибытия</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Статус</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Позиций</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Обновлено</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" />
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {supplies.map((supply) => (
                  <tr key={supply.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{supply.title}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatDate(supply.etaDate)}</div>
                      {new Date(supply.etaDate) > new Date() && (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">скоро</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        supply.status === 'arrived' ? 'bg-green-100 text-green-800' :
                        supply.status === 'in_transit' ? 'bg-[#660000] text-white' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {supply.status === 'arrived' ? 'Доставлена' : supply.status === 'in_transit' ? 'В пути' : 'Запланирована'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{supply.items.length}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(supply.updatedAt)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button onClick={() => handleEdit(supply)} className="text-[#660000] hover:text-[#7a1a1a] mr-4">Редактировать</button>
                      <button onClick={() => handleDelete(supply.id)} className="text-red-600 hover:text-red-900">Удалить</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// -------------------- Users tab --------------------
function UsersTab() {
  const [rows, setRows] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const reload = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/users', { cache: 'no-cache' });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || `HTTP ${res.status}`);
      }
      const data: UserRow[] = await res.json();
      setRows(data);
    } catch (e: any) {
      console.error(e);
      setError(e?.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { reload(); }, []);

  if (loading) return <div className="p-8 text-center text-gray-600">Загрузка пользователей...</div>;
  if (error) return (
    <div className="p-8 text-center">
      <div className="text-red-600 mb-2">{error}</div>
      <div className="text-gray-600">Войдите через аккаунт администратора, затем обновите страницу.</div>
    </div>
  );

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
        <h2 className="text-lg leading-6 font-medium text-gray-900">Пользователи</h2>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">Сводка по зарегистрированным пользователям и их заказам</p>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Пользователь</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Регистрация</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Заказов</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Недавние заказы</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {rows.map((u) => (
              <tr key={u.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{u.name || 'Без имени'}</div>
                  <div className="text-sm text-gray-500">{u.isAdmin ? 'Admin' : 'User'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{u.email}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{u._count.orders}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="space-y-1">
                    {u.orders.length > 0 ? (
                      u.orders.map((o) => (
                        <div key={o.id} className="text-sm text-gray-900">
                          <span className="font-medium">{o.total.toLocaleString('ru-RU', { style: 'currency', currency: 'USD' })}</span>
                          <span className="text-gray-500"> • {new Date(o.createdAt).toLocaleDateString()}</span>
                          <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            o.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                            o.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>{o.status}</span>
                        </div>
                      ))
                    ) : (
                      <span className="text-sm text-gray-500">Нет заказов</span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// -------------------- Console page with tabs --------------------
export default function AdminConsoleStandalone() {
  const tabs = [
    { key: 'products', label: 'Товары', node: <ProductsTab /> },
    { key: 'supplies', label: 'Поставки', node: <SuppliesTab /> },
    { key: 'users', label: 'Пользователи', node: <UsersTab /> },
  ] as const;

  const [active, setActive] = useState<typeof tabs[number]['key']>('products');

  return (
    <AdminGate>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Единая админ-панель</h1>
          <div className="text-sm text-gray-600 space-x-3">
            <Link className="underline hover:no-underline" href="/admin">Пользователи (NextAuth)</Link>
            <Link className="underline hover:no-underline" href="/admin/orders/last">Заказы</Link>
          </div>
        </div>

        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setActive(t.key)}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                  active === t.key
                    ? 'border-[#660000] text-[#660000]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {t.label}
              </button>
            ))}
          </nav>
        </div>

        {tabs.find((t) => t.key === active)?.node}
      </div>
    </AdminGate>
  );
}
