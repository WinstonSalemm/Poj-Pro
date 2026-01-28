'use client';

import { useEffect, useMemo, useState } from 'react';
import AdminGate from '@/components/admin/AdminGate';
import { toast } from 'react-hot-toast';

type PopularProductRow = {
  id: string;
  productId: string;
  order: number;
  product: {
    id: string;
    slug: string;
    title: string;
    price: number;
    image: string | null;
    category: { slug: string; name: string | null } | null;
  };
};

type ProductRow = {
  id: string;
  slug: string;
  title: string;
  price: number;
  image: string | null;
  category: { slug: string; name: string | null } | null;
};

export default function AdminPopularProductsPage() {
  const [popularProducts, setPopularProducts] = useState<PopularProductRow[]>([]);
  const [allProducts, setAllProducts] = useState<ProductRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  const token = useMemo(() => {
    if (typeof window === 'undefined') return '';
    return localStorage.getItem('adminToken') || '';
  }, []);

  const filteredProducts = useMemo(() => {
    const s = searchQuery.trim().toLowerCase();
    if (!s) return allProducts;
    return allProducts.filter(
      (p) =>
        p.slug.toLowerCase().includes(s) ||
        p.title.toLowerCase().includes(s) ||
        p.category?.slug.toLowerCase().includes(s)
    );
  }, [searchQuery, allProducts]);

  const reloadPopular = async () => {
    try {
      const res = await fetch('/api/admin/popular-products');
      const json = await res.json();
      if (!json.success) throw new Error(json.message || 'failed');
      setPopularProducts(json.data as PopularProductRow[]);
    } catch (e) {
      console.error(e);
      toast.error('Не удалось загрузить популярные товары');
    }
  };

  const reloadAllProducts = async () => {
    try {
      const res = await fetch('/api/admin/products');
      const json = await res.json();
      if (!json.success) throw new Error(json.message || 'failed');
      
      // Преобразуем данные для отображения
      const products = (json.data as any[]).map((p) => {
        // Обрабатываем images - может быть массивом строк или JSON строкой
        let images: string[] = [];
        if (Array.isArray(p.images)) {
          images = p.images;
        } else if (typeof p.images === 'string') {
          try {
            const parsed = JSON.parse(p.images);
            images = Array.isArray(parsed) ? parsed : [];
          } catch {
            images = [];
          }
        }
        
        return {
          id: p.id,
          slug: p.slug,
          title: p.title,
          price: p.price ?? 0,
          image: images.length > 0 ? images[0] : null,
          category: p.category,
        };
      });
      
      setAllProducts(products);
    } catch (e) {
      console.error(e);
      toast.error('Не удалось загрузить товары');
    }
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await Promise.all([reloadPopular(), reloadAllProducts()]);
      setLoading(false);
    };
    load();
  }, []);

  const onDelete = async (id: string) => {
    if (!confirm('Удалить товар из популярных?')) return;
    try {
      const res = await fetch(`/api/admin/popular-products/${id}`, {
        method: 'DELETE',
        headers: { 'x-admin-token': token },
      });
      if (!res.ok) throw new Error('delete failed');
      toast.success('Товар удалён из популярных');
      await reloadPopular();
    } catch (e) {
      console.error(e);
      toast.error('Ошибка удаления товара');
    }
  };

  const onAdd = async (productId: string) => {
    try {
      setSubmitting(true);
      const res = await fetch('/api/admin/popular-products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': token,
        },
        body: JSON.stringify({ productId }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.message || 'failed');
      toast.success('Товар добавлен в популярные');
      setShowAddModal(false);
      setSearchQuery('');
      await reloadPopular();
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || 'Ошибка добавления товара');
    } finally {
      setSubmitting(false);
    }
  };

  const onReorder = async (items: PopularProductRow[]) => {
    try {
      const res = await fetch('/api/admin/popular-products', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': token,
        },
        body: JSON.stringify({
          items: items.map((item, index) => ({ id: item.id, order: index })),
        }),
      });
      if (!res.ok) throw new Error('reorder failed');
      toast.success('Порядок обновлён');
      await reloadPopular();
    } catch (e) {
      console.error(e);
      toast.error('Ошибка обновления порядка');
    }
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    const newItems = [...popularProducts];
    [newItems[index - 1], newItems[index]] = [newItems[index], newItems[index - 1]];
    setPopularProducts(newItems);
    onReorder(newItems);
  };

  const moveDown = (index: number) => {
    if (index === popularProducts.length - 1) return;
    const newItems = [...popularProducts];
    [newItems[index], newItems[index + 1]] = [newItems[index + 1], newItems[index]];
    setPopularProducts(newItems);
    onReorder(newItems);
  };

  // Фильтруем товары, которые уже в популярных
  const availableProducts = filteredProducts.filter(
    (p) => !popularProducts.some((pp) => pp.productId === p.id)
  );

  return (
    <AdminGate>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Популярные товары</h1>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-[#660000] text-white rounded-lg hover:bg-[#8B0000] transition-colors"
          >
            + Добавить товар
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#660000]"></div>
          </div>
        ) : popularProducts.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-500">Популярные товары не добавлены</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="mt-4 px-4 py-2 bg-[#660000] text-white rounded-lg hover:bg-[#8B0000] transition-colors"
            >
              Добавить первый товар
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Порядок
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Изображение
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Товар
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Цена
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Категория
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Действия
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {popularProducts.map((pp, index) => (
                  <tr key={pp.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => moveUp(index)}
                          disabled={index === 0}
                          className="p-1 disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Вверх"
                        >
                          ↑
                        </button>
                        <span className="text-sm font-medium text-gray-900">{index + 1}</span>
                        <button
                          onClick={() => moveDown(index)}
                          disabled={index === popularProducts.length - 1}
                          className="p-1 disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Вниз"
                        >
                          ↓
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {pp.product.image ? (
                        <img
                          src={pp.product.image}
                          alt={pp.product.title}
                          className="h-16 w-16 object-cover rounded"
                        />
                      ) : (
                        <div className="h-16 w-16 bg-gray-200 rounded flex items-center justify-center text-gray-400 text-xs">
                          Нет фото
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{pp.product.title}</div>
                      <div className="text-sm text-gray-500">{pp.product.slug}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {pp.product.price.toLocaleString('ru-RU')} UZS
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {pp.product.category?.name || pp.product.category?.slug || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => onDelete(pp.id)}
                        className="text-red-600 hover:text-red-900"
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

        {/* Модальное окно для добавления товара */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] flex flex-col">
              <div className="px-6 py-4 border-b flex justify-between items-center">
                <h2 className="text-xl font-bold">Выберите товар</h2>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setSearchQuery('');
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              <div className="px-6 py-4 flex-1 overflow-y-auto">
                <input
                  type="text"
                  placeholder="Поиск товара..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4"
                />
                {availableProducts.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    {searchQuery ? 'Товары не найдены' : 'Все товары уже добавлены'}
                  </p>
                ) : (
                  <div className="space-y-2">
                    {availableProducts.map((product) => (
                      <div
                        key={product.id}
                        className="flex items-center gap-4 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                        onClick={() => onAdd(product.id)}
                      >
                        {product.image && (
                          <img
                            src={product.image}
                            alt={product.title}
                            className="h-16 w-16 object-cover rounded"
                          />
                        )}
                        <div className="flex-1">
                          <div className="font-medium">{product.title}</div>
                          <div className="text-sm text-gray-500">{product.slug}</div>
                          <div className="text-sm text-gray-700">
                            {product.price.toLocaleString('ru-RU')} UZS
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onAdd(product.id);
                          }}
                          disabled={submitting}
                          className="px-4 py-2 bg-[#660000] text-white rounded-lg hover:bg-[#8B0000] transition-colors disabled:opacity-50"
                        >
                          {submitting ? 'Добавление...' : 'Добавить'}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminGate>
  );
}
