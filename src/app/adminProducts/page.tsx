'use client';

// Prevent indexing of this hidden admin route
export const metadata = {
  robots: { index: false, follow: false },
};

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminGate from '@/components/admin/AdminGate';
import SupplyForm from '@/components/admin/SupplyForm';
import { toast } from 'react-hot-toast';

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

export default function AdminProductsPage() {
  const [supplies, setSupplies] = useState<Supply[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingSupply, setEditingSupply] = useState<Supply | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const router = useRouter();

  // Fetch supplies from API
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

  // Handle form submission for both create and update
  const handleSubmit = async (data: Omit<Supply, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }) => {
    try {
      setIsSubmitting(true);
      const isEdit = !!data.id;
      const token = localStorage.getItem('adminToken');
      
      let response;
      
      if (isEdit) {
        // Update existing supply
        response = await fetch(`/api/supplies/${data.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'x-admin-token': token || '',
          },
          body: JSON.stringify(data),
        });
      } else {
        // Create new supply
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
      
      // Update local state
      if (isEdit) {
        setSupplies(supplies.map(s => s.id === data.id ? result : s));
        toast.success('Поставка успешно обновлена');
      } else {
        setSupplies([...supplies, result]);
        toast.success('Поставка успешно создана');
      }
      
      // Reset form
      setShowForm(false);
      setEditingSupply(null);
      await fetchSupplies(); // Refresh the list to ensure consistency
    } catch (error) {
      console.error('Error saving supply:', error);
      toast.error('Произошла ошибка при сохранении');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle delete supply
  const handleDelete = async (id: string) => {
    if (!confirm('Вы уверены, что хотите удалить эту поставку? Это действие нельзя отменить.')) return;
    try {
      setDeletingId(id);
      const token = localStorage.getItem('adminToken') || '';
      if (!token) {
        toast.error('Не авторизовано: отсутствует токен администратора.');
        return;
      }
      const response = await fetch(`/api/supplies/${id}`, {
        method: 'DELETE',
        headers: { 'x-admin-token': token },
        cache: 'no-store',
      });
      if (!response.ok) {
        let message = '';
        try {
          const j: { message?: string } = await response.json();
          message = j?.message || '';
        } catch {
          try { message = await response.text(); } catch { message = ''; }
        }
        toast.error(message || 'Не удалось удалить поставку');
        return;
      }
      setSupplies(supplies.filter(supply => supply.id !== id));
      toast.success('Поставка успешно удалена');
    } catch (error) {
      console.error('Error deleting supply:', error);
      toast.error('Не удалось удалить поставку');
    } finally {
      setDeletingId(null);
    }
  };

  // Handle edit button click
  const handleEdit = (supply: Supply) => {
    setEditingSupply(supply);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle form cancel
  const handleCancel = () => {
    setShowForm(false);
    setEditingSupply(null);
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <AdminGate>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Управление поставками</h1>
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
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Название
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Дата прибытия
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Статус
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Позиций
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Обновлено
                    </th>
                    <th scope="col" className="relative px-6 py-3">
                      <span className="sr-only">Действия</span>
                    </th>
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
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                            скоро
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          supply.status === 'arrived' ? 'bg-green-100 text-green-800' :
                          supply.status === 'in_transit' ? 'bg-[#660000] text-white' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {supply.status === 'arrived' ? 'Доставлена' :
                           supply.status === 'in_transit' ? 'В пути' : 'Запланирована'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {supply.items.length}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(supply.updatedAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          type="button"
                          onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleEdit(supply); }}
                          className="text-[#660000] hover:text-[#7a1a1a] mr-4"
                        >
                          Редактировать
                        </button>
                        <button
                          type="button"
                          onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDelete(supply.id); }}
                          disabled={deletingId === supply.id}
                          className="text-red-600 hover:text-red-900 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {deletingId === supply.id ? 'Удаляем…' : 'Удалить'}
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
