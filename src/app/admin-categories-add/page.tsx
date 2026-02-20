'use client';

import { useState, useRef, useEffect } from 'react';
import AdminGate from '@/components/admin/AdminGate';
import { toast } from 'react-hot-toast';
import { Upload, X, Trash2 } from 'lucide-react';

type Language = 'ru' | 'eng' | 'uzb';

interface CategoryFormData {
  slug: string;
  image: string;
  i18n: {
    ru: string;
    eng: string;
    uzb: string;
  };
}

interface Category {
  id: string;
  slug: string;
  name: string | null;
  image: string | null;
  i18n: { ru: string; eng: string; uzb: string };
}

const emptyForm: CategoryFormData = {
  slug: '',
  image: '',
  i18n: {
    ru: '',
    eng: '',
    uzb: '',
  },
};

export default function AdminCategoriesAddPage() {
  const [form, setForm] = useState<CategoryFormData>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [categoryImage, setCategoryImage] = useState<string>('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [activeLang, setActiveLang] = useState<Language>('ru');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') || '' : '';

  // Глобальное хранилище для base64 данных изображений
  if (typeof window !== 'undefined') {
    const w = window as typeof window & {
      __categoryImageData?: string;
    };
    if (!w.__categoryImageData) {
      w.__categoryImageData = '';
    }
  }

  const ALLOWED_IMAGE_TYPES = new Set([
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/avif',
    'image/gif',
    'image/svg+xml',
  ]);

  const isAllowedImageFile = (file: File) => {
    if (file.type && ALLOWED_IMAGE_TYPES.has(file.type)) return true;
    const name = (file.name || '').toLowerCase();
    return /\.(jpe?g|png|webp|avif|gif|svg)$/.test(name);
  };

  // Загрузка списка категорий
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoadingCategories(true);
        const res = await fetch('/api/admin/categories', {
          headers: { 'x-admin-token': token },
        });
        const json = await res.json();
        if (json.success && json.data) {
          setCategories(json.data);
        }
      } catch (e) {
        console.error('Failed to load categories:', e);
        toast.error('Не удалось загрузить категории');
      } finally {
        setLoadingCategories(false);
      }
    };
    loadCategories();
  }, [token]);

  const handleImageSelect = async (file: File) => {
    if (!isAllowedImageFile(file)) {
      toast.error('Недопустимый формат изображения. Разрешены: JPG, PNG, WEBP, AVIF, GIF, SVG');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Размер изображения не должен превышать 5MB');
      return;
    }

    try {
      setUploadingImage(true);
      
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          const base64Data = result.split(',')[1];
          resolve(base64Data);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      setCategoryImage(base64);
      
      const w = window as typeof window & {
        __categoryImageData?: string;
      };
      w.__categoryImageData = base64;

      toast.success('Изображение загружено');
    } catch (error) {
      console.error('Error reading image:', error);
      toast.error('Ошибка при загрузке изображения');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleDropImage = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      handleImageSelect(file);
    }
  };

  const handleRemoveImage = () => {
    setCategoryImage('');
    const w = window as typeof window & {
      __categoryImageData?: string;
    };
    w.__categoryImageData = '';
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.slug.trim()) {
      toast.error('Slug обязателен');
      return;
    }

    const slugRegex = /^[a-z0-9]+(?:[-_][a-z0-9]+)*$/;
    if (!slugRegex.test(form.slug)) {
      toast.error('Slug должен содержать только латинские буквы, цифры, дефисы и подчёркивания');
      return;
    }

    const hasTranslation = form.i18n.ru || form.i18n.eng || form.i18n.uzb;
    if (!hasTranslation) {
      toast.error('Требуется хотя бы одно название на русском, английском или узбекском');
      return;
    }

    setSubmitting(true);

    try {
      const w = window as typeof window & {
        __categoryImageData?: string;
      };

      const payload = {
        slug: form.slug.trim(),
        image: form.image || null,
        imageData: categoryImage || w.__categoryImageData || null,
        i18n: {
          ru: form.i18n.ru.trim(),
          eng: form.i18n.eng.trim(),
          uzb: form.i18n.uzb.trim(),
        },
      };

      console.log('[admin-categories-add] Sending payload:', {
        ...payload,
        imageData: payload.imageData ? `base64 (${payload.imageData.length} chars)` : null,
      });

      const res = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': token,
        },
        body: JSON.stringify(payload),
      });

      console.log('[admin-categories-add] Response status:', res.status);

      const json = await res.json();

      console.log('[admin-categories-add] Response JSON:', json);

      if (!res.ok || !json.success) {
        throw new Error(json.message || 'Ошибка при создании категории');
      }

      toast.success('Категория успешно создана!');
      
      setForm(emptyForm);
      setCategoryImage('');
      w.__categoryImageData = '';
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      // Перезагружаем список категорий
      const loadRes = await fetch('/api/admin/categories', {
        headers: { 'x-admin-token': token },
      });
      const loadJson = await loadRes.json();
      if (loadJson.success && loadJson.data) {
        setCategories(loadJson.data);
      }
    } catch (error) {
      console.error('Error creating category:', error);
      toast.error(error instanceof Error ? error.message : 'Ошибка при создании категории');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCategory = async (categoryId: string, categorySlug: string) => {
    if (!confirm(`Вы уверены, что хотите удалить категорию "${categorySlug}"?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/categories?id=${categoryId}`, {
        method: 'DELETE',
        headers: {
          'x-admin-token': token,
        },
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.message || 'Ошибка при удалении категории');
      }

      toast.success('Категория удалена');
      
      // Перезагружаем список
      const loadRes = await fetch('/api/admin/categories', {
        headers: { 'x-admin-token': token },
      });
      const loadJson = await loadRes.json();
      if (loadJson.success && loadJson.data) {
        setCategories(loadJson.data);
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error('Ошибка при удалении категории');
    }
  };

  const langLabels: Record<Language, string> = {
    ru: 'Русский',
    eng: 'English',
    uzb: 'Oʻzbekcha',
  };

  return (
    <AdminGate>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            Добавление категорий
          </h1>

          {/* Форма добавления категории */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl text-[#660000] font-semibold mb-4">Новая категория</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Slug */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Slug (идентификатор) *
                </label>
                <input
                  type="text"
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  placeholder="fire-extinguishers"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 text-[#660000] focus:border-transparent"
                  disabled={submitting}
                />
                <p className="mt-1 text-xs text-gray-500">
                  Только латинские буквы, цифры, дефисы и подчёркивания
                </p>
              </div>

              {/* Изображение */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Изображение категории
                </label>
                
                {categoryImage ? (
                  <div className="relative w-32 h-32 border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                    <img
                      src={`data:image/png;base64,${categoryImage}`}
                      alt="Preview"
                      className="w-full h-full object-contain"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    onDrop={handleDropImage}
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-red-900 transition-colors"
                  >
                    {uploadingImage ? (
                      <div className="text-gray-500">Загрузка...</div>
                    ) : (
                      <>
                        <Upload className="mx-auto h-12 w-12 text-gray-400 mb-2 " />
                        <p className="text-sm text-gray-600 ">
                          Перетащите изображение или кликните для выбора
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          JPG, PNG, WEBP, AVIF, GIF, SVG (макс. 5MB)
                        </p>
                      </>
                    )}
                  </div>
                )}
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImageSelect(file);
                  }}
                  className="hidden"
                  disabled={submitting || uploadingImage}
                />
              </div>

              {/* Названия на языках */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Названия *
                </label>
                
                {/* Переключатель языков */}
                <div className="flex gap-2 mb-3">
                  {(['ru', 'eng', 'uzb'] as Language[]).map((lang) => (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => setActiveLang(lang)}
                      className={`px-3 py-1 text-sm rounded-md transition-colors ${
                        activeLang === lang
                          ? 'bg-red-900 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {langLabels[lang]}
                    </button>
                  ))}
                </div>

                {/* Поля для каждого языка */}
                {(['ru', 'eng', 'uzb'] as Language[]).map((lang) => (
                  <div
                    key={lang}
                    className={`mb-3 p-4 border rounded-md ${
                      activeLang === lang ? 'border-red-900 bg-red-50' : 'border-gray-200'
                    }`}
                  >
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {langLabels[lang]}
                    </label>
                    <input
                      type="text"
                      value={form.i18n[lang]}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          i18n: { ...form.i18n, [lang]: e.target.value },
                        })
                      }
                      placeholder={`Название на ${langLabels[lang].toLowerCase()}`}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-900 text-[#660000] focus:border-transparent"
                      disabled={submitting}
                    />
                  </div>
                ))}
                
                <p className="mt-1 text-xs text-gray-500">
                  * Требуется хотя бы одно название
                </p>
              </div>

              {/* Кнопка отправки */}
              <button
                type="submit"
                disabled={submitting}
                className={`w-full py-3 px-4 rounded-md font-medium text-white transition-colors ${
                  submitting
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-red-900 hover:bg-red-950'
                }`}
              >
                {submitting ? 'Создание...' : 'Создать категорию'}
              </button>
            </form>
          </div>

          {/* Список существующих категорий */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-[#660000] mb-4">
              Существующие категории ({categories.length})
            </h2>

            {loadingCategories ? (
              <div className="text-center text-gray-500 py-8">Загрузка...</div>
            ) : categories.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                Нет категорий. Создайте первую!
              </div>
            ) : (
              <div className="space-y-3">
                {categories.map((cat) => (
                  <div
                    key={cat.id}
                    className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:border-red-200 transition-colors"
                  >
                    {/* Изображение */}
                    <div className="w-16 h-16 flex-shrink-0 bg-gray-50 rounded-md overflow-hidden border border-gray-200">
                      {cat.image ? (
                        <img
                          src={cat.image}
                          alt={cat.i18n.ru || cat.slug}
                          className="w-full h-full object-cover"
                        />
                      ) : cat.i18n.ru ? (
                        <img
                          src={`https://placehold.co/64x64?text=${encodeURIComponent(cat.i18n.ru.charAt(0).toUpperCase())}`}
                          alt={cat.i18n.ru}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                          Нет фото
                        </div>
                      )}
                    </div>

                    {/* Информация */}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 truncate">
                        {cat.i18n.ru || '—'}
                      </div>
                      <div className="text-sm text-gray-500">
                        <span className="font-mono bg-gray-100 px-2 py-0.5 rounded">
                          {cat.slug}
                        </span>
                      </div>
                      <div className="text-xs text-gray-400 mt-1 space-x-2">
                        {cat.i18n.eng && (
                          <span>EN: {cat.i18n.eng}</span>
                        )}
                        {cat.i18n.uzb && (
                          <span>UZ: {cat.i18n.uzb}</span>
                        )}
                      </div>
                    </div>

                    {/* Кнопка удаления */}
                    <button
                      onClick={() => handleDeleteCategory(cat.id, cat.slug)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                      title="Удалить категорию"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminGate>
  );
}
