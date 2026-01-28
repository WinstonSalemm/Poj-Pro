'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import AdminGate from '@/components/admin/AdminGate';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { Edit, ArrowLeft, Archive } from 'lucide-react';

type ProductRow = {
  id: string;
  slug: string;
  title: string;
  price: number;
  stock: number;
  currency: string;
  brand: string | null;
  isActive: boolean;
  createdAt: string;
  category?: { id: string; slug: string; name?: string } | null;
  images: string[];
};

type ApiResponse = {
  success: boolean;
  data: ProductRow[];
  count: number;
  message?: string;
};

export default function AdminNewProductsPage() {
  const router = useRouter();
  const [rows, setRows] = useState<ProductRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [movingId, setMovingId] = useState<string | null>(null);
  const [movingAll, setMovingAll] = useState(false);
  const [q, setQ] = useState('');

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
      const res = await fetch('/api/admin/products/new', {
        headers: { 'x-admin-token': token },
      });
      const json = await res.json() as ApiResponse;
      if (!json.success) throw new Error(json.message || 'failed');
      setRows(json.data);
    } catch (e) {
      console.error(e);
      toast.error('Не удалось загрузить новые товары');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reload();
  }, [token]);

  const moveToMain = async (id: string, title: string) => {
    if (!confirm(`Перевести товар "${title}" в основную массу?\n\nТовар больше не будет отображаться в блоке "Новые товары".`)) {
      return;
    }

    try {
      setMovingId(id);
      const res = await fetch(`/api/admin/products/new/${id}/move-to-main`, {
        method: 'POST',
        headers: { 'x-admin-token': token },
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.message || 'Ошибка перевода товара');
      }

      toast.success('Товар переведён в основную массу');
      await reload();
    } catch (e) {
      console.error(e);
      toast.error(e instanceof Error ? e.message : 'Ошибка перевода товара');
    } finally {
      setMovingId(null);
    }
  };

  const moveAllToMain = async () => {
    const count = filtered.length;
    if (count === 0) {
      toast.error('Нет товаров для перевода');
      return;
    }

    if (!confirm(`Перевести все ${count} товар(ов) в основную массу?\n\nВсе товары больше не будут отображаться в блоке "Новые товары".`)) {
      return;
    }

    try {
      setMovingAll(true);
      const res = await fetch('/api/admin/products/new/move-all-to-main', {
        method: 'POST',
        headers: { 'x-admin-token': token },
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.message || 'Ошибка перевода товаров');
      }

      toast.success(`Переведено товаров в основную массу: ${json.count}`);
      await reload();
    } catch (e) {
      console.error(e);
      toast.error(e instanceof Error ? e.message : 'Ошибка перевода товаров');
    } finally {
      setMovingAll(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <AdminGate>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="text-[#660000] hover:text-[#7a1a1a]"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Новые товары</h1>
              <p className="text-sm text-gray-600 mt-1">
                Товары, созданные за последние 14 дней ({rows.length} шт.)
              </p>
            </div>
          </div>
          <Link
            href="/admin-products"
            className="px-4 py-2 rounded border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Все товары
          </Link>
        </div>

        <div className="bg-white shadow rounded-lg mb-6">
          <div className="p-4 flex items-center justify-between gap-4 border-b">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Поиск по названию или slug"
              className="w-full max-w-md rounded border border-gray-300 px-3 py-2"
            />
            <div className="flex items-center gap-2">
              <button
                onClick={moveAllToMain}
                disabled={loading || movingAll || filtered.length === 0}
                className="px-4 py-2 rounded border border-orange-300 bg-orange-50 text-orange-700 hover:bg-orange-100 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                title="Перевести все товары в основную массу"
              >
                {movingAll ? 'Перевод...' : 'Убрать все в массу'}
              </button>
              <button
                onClick={reload}
                disabled={loading}
                className="px-4 py-2 rounded border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-60"
              >
                {loading ? 'Загрузка...' : 'Обновить'}
              </button>
            </div>
          </div>

          {loading ? (
            <div className="p-8 text-center text-gray-600">Загрузка...</div>
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              {q ? 'Товары не найдены' : 'Новых товаров нет'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Название
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Slug
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Цена
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Кол-во
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Категория
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Создан
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      Действия
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filtered.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {p.images && p.images.length > 0 && (
                            <img
                              src={p.images[0]}
                              alt={p.title}
                              className="w-10 h-10 object-cover rounded border border-gray-200"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = '/OtherPics/product2photo.jpg';
                              }}
                            />
                          )}
                          <div>
                            <div className="text-sm font-medium text-gray-900">{p.title}</div>
                            {p.brand && (
                              <div className="text-xs text-gray-500">{p.brand}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{p.slug}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {p.price?.toLocaleString('ru-RU')} {p.currency}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{p.stock}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {p.category?.name || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {formatDate(p.createdAt)}
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          <a
                            href={`/admin-products-add?id=${p.id}`}
                            className="inline-flex items-center gap-1 text-[#660000] hover:text-[#7a1a1a]"
                            title="Редактировать"
                          >
                            <Edit className="w-4 h-4" />
                            <span className="hidden sm:inline">Редактировать</span>
                          </a>
                          <button
                            onClick={() => moveToMain(p.id, p.title)}
                            disabled={movingId === p.id}
                            className="inline-flex items-center gap-1 text-orange-600 hover:text-orange-800 disabled:opacity-60"
                            title="Перевести в основную массу"
                          >
                            <Archive className="w-4 h-4" />
                            <span className="hidden sm:inline">
                              {movingId === p.id ? 'Перевод...' : 'В основную массу'}
                            </span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {!loading && filtered.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Совет:</strong> После редактирования и проверки товаров используйте кнопку
              &quot;В основную массу&quot;, чтобы они больше не отображались в блоке &quot;Новые товары&quot; на сайте.
            </p>
          </div>
        )}
      </div>
    </AdminGate>
  );
}
