'use client';

import { useState, useRef, useEffect } from 'react';
import AdminGate from '@/components/admin/AdminGate';
import { toast } from 'react-hot-toast';
import { useRouter, useSearchParams } from 'next/navigation';
import { Upload, X, Plus, Trash2 } from 'lucide-react';

type Language = 'ru' | 'eng' | 'uzb';

interface ProductFormData {
  slug: string;
  brand: string;
  price: number;
  stock: number;
  currency: string;
  categorySlug: string;
  images: string[];
  i18n: {
    ru: { title: string; summary: string; description: string };
    eng: { title: string; summary: string; description: string };
    uzb: { title: string; summary: string; description: string };
  };
  specs: {
    ru: Record<string, string>;
    eng: Record<string, string>;
    uzb: Record<string, string>;
  };
}

const emptyForm: ProductFormData = {
  slug: '',
  brand: '',
  price: 0,
  stock: 0,
  currency: 'UZS',
  categorySlug: '',
  images: [],
  i18n: {
    ru: { title: '', summary: '', description: '' },
    eng: { title: '', summary: '', description: '' },
    uzb: { title: '', summary: '', description: '' },
  },
  specs: {
    ru: {},
    eng: {},
    uzb: {},
  },
};

export default function AddProductPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const productId = searchParams.get('id');
  const isEditMode = !!productId;

  const [form, setForm] = useState<ProductFormData>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(isEditMode);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [specKeys, setSpecKeys] = useState<string[]>([]);
  const [categories, setCategories] = useState<Array<{ id: string; slug: string; name: string | null }>>([]);
  const [isCreatingNewCategory, setIsCreatingNewCategory] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(true);

  const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') || '' : '';

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

  // Определяем режим создания новой категории при загрузке товара для редактирования
  useEffect(() => {
    if (isEditMode && form.categorySlug && categories.length > 0) {
      const exists = categories.some((c) => c.slug === form.categorySlug);
      setIsCreatingNewCategory(!exists);
    }
  }, [isEditMode, form.categorySlug, categories]);

  // Загрузка данных товара для редактирования
  useEffect(() => {
    if (!isEditMode || !productId) return;

    const loadProduct = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/admin/products/${productId}`, {
          headers: { 'x-admin-token': token },
        });

        if (!response.ok) {
          throw new Error('Не удалось загрузить товар');
        }

        const data = await response.json();
        if (!data.success || !data.data) {
          throw new Error('Товар не найден');
        }

        const product = data.data;

        // Преобразуем specs из формата { key: { ru: "...", eng: "...", uzb: "..." } }
        // в формат { ru: { key: "..." }, eng: { key: "..." }, uzb: { key: "..." } }
        const transformedSpecs: Record<Language, Record<string, string>> = {
          ru: {},
          eng: {},
          uzb: {},
        };

        if (product.specs && typeof product.specs === 'object') {
          Object.entries(product.specs as Record<string, Record<Language, string>>).forEach(([key, value]) => {
            if (value && typeof value === 'object') {
              transformedSpecs.ru[key] = value.ru || '';
              transformedSpecs.eng[key] = value.eng || '';
              transformedSpecs.uzb[key] = value.uzb || '';
            }
          });
        }

        // Заполняем форму
        setForm({
          slug: product.slug || '',
          brand: product.brand || '',
          price: product.price || 0,
          stock: product.stock || 0,
          currency: product.currency || 'UZS',
          categorySlug: product.categorySlug || '',
          images: product.images || [],
          i18n: product.i18n || {
            ru: { title: '', summary: '', description: '' },
            eng: { title: '', summary: '', description: '' },
            uzb: { title: '', summary: '', description: '' },
          },
          specs: transformedSpecs,
        });

        // Устанавливаем ключи характеристик
        if (product.specs && typeof product.specs === 'object' && Object.keys(product.specs).length > 0) {
          setSpecKeys(Object.keys(product.specs));
        }
      } catch (error) {
        console.error('Load product error:', error);
        toast.error(error instanceof Error ? error.message : 'Ошибка загрузки товара');
        router.push('/admin-products');
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [isEditMode, productId, token, router]);

  // Загрузка изображений на сервер
  const uploadFiles = async (files: FileList | File[]) => {
    if (!files || files.length === 0) return;

    setUploadingImages(true);
    try {
      const formData = new FormData();
      const fileArray = Array.from(files);

      console.log('[Frontend] Starting upload for files:', fileArray.map(f => ({
        name: f.name,
        size: f.size,
        type: f.type,
      })));

      fileArray.forEach((file) => {
        if (file.type.startsWith('image/')) {
          formData.append('files', file);
        }
      });

      if (formData.getAll('files').length === 0) {
        toast.error('Выберите изображения для загрузки');
        return;
      }

      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        headers: {
          'x-admin-token': token,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = 'Ошибка загрузки изображений';
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.message || errorMessage;
        } catch {
          // Если ответ не JSON, используем стандартное сообщение
          if (response.status === 404) {
            errorMessage = 'API для загрузки файлов не найден. Проверьте настройки сервера.';
          } else if (response.status === 401) {
            errorMessage = 'Не авторизован. Проверьте пароль администратора.';
          }
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('[Frontend] Upload response:', data);

      if (!data.success) {
        throw new Error(data.message || 'Ошибка загрузки изображений');
      }

      const uploadedPaths = data.data?.paths || [];
      console.log('[Frontend] Uploaded paths:', uploadedPaths);

      setForm((prev) => ({
        ...prev,
        images: [...prev.images, ...uploadedPaths],
      }));

      toast.success(`Загружено ${uploadedPaths.length} изображений`);
    } catch (error) {
      console.error('[Frontend] Image upload error:', error);
      toast.error(error instanceof Error ? error.message : 'Ошибка загрузки изображений');
    } finally {
      setUploadingImages(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    await uploadFiles(files);
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      await uploadFiles(files);
    }
  };

  const removeImage = (index: number) => {
    setForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  // Управление характеристиками
  const addSpecKey = () => {
    const key = prompt('Введите название характеристики (например: "Мощность", "Вес"):');
    if (key && !specKeys.includes(key)) {
      setSpecKeys([...specKeys, key]);
    }
  };

  const removeSpecKey = (key: string) => {
    setSpecKeys(specKeys.filter((k) => k !== key));
    setForm((prev) => {
      const newSpecs = { ...prev.specs };
      Object.keys(newSpecs).forEach((lang) => {
        delete newSpecs[lang as Language][key];
      });
      return { ...prev, specs: newSpecs };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Валидация
    if (!form.slug.trim()) {
      toast.error('Slug обязателен');
      return;
    }

    if (!form.i18n.ru.title.trim()) {
      toast.error('Название на русском обязательно');
      return;
    }

    // Проверка длины полей (максимум 191 символ для VARCHAR в MySQL)
    const maxLength = 191;
    const checkLength = (text: string, fieldName: string, lang: string) => {
      if (text && text.length > maxLength) {
        toast(`${fieldName} (${lang}) будет обрезан до ${maxLength} символов`, {
          icon: '⚠️',
          duration: 3000,
        });
      }
    };

    // Проверяем все поля на всех языках
    ['ru', 'eng', 'uzb'].forEach((lang) => {
      const l = lang as Language;
      if (form.i18n[l].title) checkLength(form.i18n[l].title, 'Название', lang);
      if (form.i18n[l].summary) checkLength(form.i18n[l].summary, 'Краткое описание', lang);
      if (form.i18n[l].description) checkLength(form.i18n[l].description, 'Описание', lang);
    });

    setSubmitting(true);
    try {
      // Формируем specs в правильном формате
      const formattedSpecs: Record<string, Record<Language, string>> = {};
      specKeys.forEach((key) => {
        formattedSpecs[key] = {
          ru: form.specs.ru[key] || '',
          eng: form.specs.eng[key] || '',
          uzb: form.specs.uzb[key] || '',
        };
      });

      // Удаляем specs из payload, если он пустой
      const hasSpecs = Object.keys(formattedSpecs).length > 0;

      const payload = {
        slug: form.slug.trim(),
        brand: form.brand.trim() || undefined,
        price: form.price || 0,
        stock: form.stock || 0,
        currency: form.currency || 'UZS',
        categorySlug: form.categorySlug.trim() || undefined,
        images: form.images,
        i18n: {
          ru: form.i18n.ru,
          eng: form.i18n.eng,
          uzb: form.i18n.uzb,
        },
        ...(hasSpecs ? { specs: formattedSpecs } : {}),
      };

      // Логирование для отладки
      console.log('[AddProduct] Payload:', JSON.stringify(payload, null, 2));

      const url = isEditMode
        ? `/api/admin/products/full/${productId}`
        : '/api/admin/products/full';
      const method = isEditMode ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': token,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      console.log('[AddProduct] Response:', { status: response.status, data });

      if (!response.ok || !data.success) {
        const errorMsg = data.message || data.error || `Ошибка ${isEditMode ? 'обновления' : 'создания'} товара`;
        console.error('[AddProduct] Error response:', data);
        throw new Error(errorMsg);
      }

      toast.success(`Товар успешно ${isEditMode ? 'обновлён' : 'создан'}!`);
      router.push('/admin/products');
    } catch (error) {
      console.error('Submit error:', error);
      toast.error(error instanceof Error ? error.message : 'Ошибка создания товара');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <AdminGate>
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-gray-300 border-t-[#660000] rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Загрузка данных товара...</p>
            </div>
          </div>
        </div>
      </AdminGate>
    );
  }

  return (
    <AdminGate>
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="text-[#660000] hover:text-[#7a1a1a] mb-4"
          >
            ← Назад к списку товаров
          </button>
          <h1 className="text-3xl font-bold text-gray-900">
            {isEditMode ? 'Редактировать товар' : 'Добавить новый товар'}
          </h1>
          <p className="text-gray-600 mt-2">
            {isEditMode ? 'Измените нужные поля и сохраните' : 'Заполните все поля для создания товара'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white shadow-lg rounded-lg p-6 space-y-8">
          {/* Основная информация */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Основная информация</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Slug <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.slug}
                  onChange={(e) => setForm((prev) => ({ ...prev, slug: e.target.value }))}
                  className="w-full rounded border border-gray-300 px-3 py-2 focus:border-[#660000] !text-[#660000] focus:ring-2 focus:ring-[#660000]/20"
                  placeholder="acm-210e-bt"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Уникальный идентификатор товара (латиница, дефисы)</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Бренд</label>
                <input
                  type="text"
                  value={form.brand}
                  onChange={(e) => setForm((prev) => ({ ...prev, brand: e.target.value }))}
                  className="w-full rounded border border-gray-300 px-3 py-2 focus:border-[#660000] !text-[#660000] focus:ring-2 focus:ring-[#660000]/20"
                  placeholder="POJ PRO"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Цена</label>
                <input
                  type="number"
                  value={form.price}
                  onChange={(e) => setForm((prev) => ({ ...prev, price: Number(e.target.value) }))}
                  className="w-full rounded border border-gray-300 px-3 py-2 focus:border-[#660000] focus:ring-2 !text-[#660000] focus:ring-[#660000]/20"
                  min={0}
                  step={0.01}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Количество (stock)</label>
                <input
                  type="number"
                  value={form.stock}
                  onChange={(e) => setForm((prev) => ({ ...prev, stock: Number(e.target.value) }))}
                  className="w-full rounded border border-gray-300 px-3 py-2 focus:border-[#660000] !text-[#660000] focus:ring-2 focus:ring-[#660000]/20"
                  min={0}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Валюта</label>
                <select
                  value={form.currency}
                  onChange={(e) => setForm((prev) => ({ ...prev, currency: e.target.value }))}
                  className="w-full rounded border border-gray-300 px-3 py-2 focus:border-[#660000] !text-[#660000] focus:ring-2 focus:ring-[#660000]/20"
                >
                  <option value="UZS">UZS (сум)</option>
                  <option value="USD">USD (доллар)</option>
                  <option value="EUR">EUR (евро)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Категория</label>

                {/* Переключатель режима */}
                <div className="flex gap-4 mb-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="categoryMode"
                      checked={!isCreatingNewCategory}
                      onChange={() => {
                        setIsCreatingNewCategory(false);
                        if (categories.length > 0) {
                          setForm((prev) => ({ ...prev, categorySlug: categories[0].slug }));
                        } else {
                          setForm((prev) => ({ ...prev, categorySlug: '' }));
                        }
                      }}
                      className="text-[#660000] focus:ring-[#660000]"
                    />
                    <span className="text-sm text-gray-700">Выбрать существующую</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="categoryMode"
                      checked={isCreatingNewCategory}
                      onChange={() => {
                        setIsCreatingNewCategory(true);
                        setForm((prev) => ({ ...prev, categorySlug: '' }));
                      }}
                      className="text-[#660000] focus:ring-[#660000]"
                    />
                    <span className="text-sm text-gray-700">Создать новую</span>
                  </label>
                </div>

                {/* Выбор существующей категории */}
                {!isCreatingNewCategory ? (
                  <select
                    value={form.categorySlug}
                    onChange={(e) => setForm((prev) => ({ ...prev, categorySlug: e.target.value }))}
                    className="w-full rounded border border-gray-300 px-3 py-2 focus:border-[#660000] !text-[#660000] focus:ring-2 focus:ring-[#660000]/20"
                    disabled={loadingCategories}
                  >
                    {loadingCategories ? (
                      <option>Загрузка категорий...</option>
                    ) : categories.length === 0 ? (
                      <option value="">Нет категорий</option>
                    ) : (
                      <>
                        <option value="">-- Выберите категорию --</option>
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.slug}>
                            {cat.name || cat.slug}
                          </option>
                        ))}
                      </>
                    )}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={form.categorySlug}
                    onChange={(e) => setForm((prev) => ({ ...prev, categorySlug: e.target.value }))}
                    className="w-full rounded border border-gray-300 px-3 py-2 focus:border-[#660000] !text-[#660000] focus:ring-2 focus:ring-[#660000]/20"
                    placeholder="ognetushiteli"
                  />
                )}
              </div>
            </div>
          </section>

          {/* Изображения */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Изображения</h2>
            <div className="space-y-4">
              {/* Зона загрузки файлов */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`relative border-2 border-dashed rounded-lg transition-all ${isDragging
                  ? 'border-[#660000] bg-[#660000]/10 scale-[1.02]'
                  : 'border-gray-300 hover:border-[#660000] hover:bg-gray-50'
                  }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className="flex flex-col items-center justify-center gap-3 w-full p-12 cursor-pointer"
                >
                  <div className={`p-4 rounded-full ${isDragging ? 'bg-[#660000]/20' : 'bg-gray-100'}`}>
                    <Upload className={`w-10 h-10 ${isDragging ? 'text-[#660000]' : 'text-[#660000]'}`} />
                  </div>
                  <div className="text-center space-y-1">
                    <span className={`text-lg font-medium block ${isDragging ? 'text-[#660000]' : 'text-[#660000]'}`}>
                      {uploadingImages
                        ? 'Загрузка изображений...'
                        : isDragging
                          ? 'Отпустите файлы для загрузки'
                          : 'Нажмите или перетащите изображения сюда'}
                    </span>
                    <span className="text-sm text-gray-500 block">
                      {uploadingImages
                        ? 'Пожалуйста, подождите'
                        : 'Поддерживаются форматы: JPG, PNG, GIF, WEBP'}
                    </span>
                  </div>
                </label>
              </div>

              {/* Поле для ввода путей к изображениям (опционально) */}
              <details className="text-sm">
                <summary className="cursor-pointer text-gray-600 hover:text-gray-900">
                  Ручной ввод путей к изображениям (опционально)
                </summary>
                <div className="mt-2">
                  <input
                    type="text"
                    value={form.images.join(', ')}
                    onChange={(e) => {
                      const paths = e.target.value.split(',').map((s) => s.trim()).filter(Boolean);
                      setForm((prev) => ({ ...prev, images: paths }));
                    }}
                    className="w-full rounded border border-gray-300 px-3 py-2 focus:border-[#660000] focus:ring-2 focus:ring-[#660000]/20"
                    placeholder="/ProductImages/product1.png, /ProductImages/product2.png"
                  />
                </div>
              </details>

              {/* Превью изображений */}
              {form.images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {form.images.map((img, index) => (
                    <div key={`${img}-${index}`} className="relative group">
                      <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                        <img
                          src={`${img}?t=${Date.now()}`}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/OtherPics/product2photo.jpg';
                          }}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <div className="mt-1 text-xs text-gray-500 truncate" title={img}>
                        {img.split('/').pop()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Переводы для всех языков */}
          {(['ru', 'eng', 'uzb'] as Language[]).map((lang) => (
            <section key={lang} className="border-t pt-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                {lang === 'ru' ? 'Русский' : lang === 'eng' ? 'English' : "O'zbek"}
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Название {lang === 'ru' && <span className="text-red-500">*</span>}
                  </label>
                  <input
                    type="text"
                    value={form.i18n[lang].title}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        i18n: {
                          ...prev.i18n,
                          [lang]: { ...prev.i18n[lang], title: e.target.value },
                        },
                      }))
                    }
                    className="w-full rounded border border-gray-300 px-3 py-2 focus:border-[#660000] text-[#660000] focus:ring-2 focus:ring-[#660000]/20"
                    placeholder={lang === 'ru' ? 'Название товара' : lang === 'eng' ? 'Product name' : 'Mahsulot nomi'}
                    required={lang === 'ru'}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Краткое описание</label>
                  <textarea
                    value={form.i18n[lang].summary}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        i18n: {
                          ...prev.i18n,
                          [lang]: { ...prev.i18n[lang], summary: e.target.value },
                        },
                      }))
                    }
                    rows={2}
                    className="w-full rounded border border-gray-300 px-3 py-2 focus:border-[#660000] text-[#660000] focus:ring-2 focus:ring-[#660000]/20"
                    placeholder={lang === 'ru' ? 'Краткое описание товара' : lang === 'eng' ? 'Short description' : 'Qisqa tavsif'}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Полное описание</label>
                  <textarea
                    value={form.i18n[lang].description}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        i18n: {
                          ...prev.i18n,
                          [lang]: { ...prev.i18n[lang], description: e.target.value },
                        },
                      }))
                    }
                    rows={6}
                    className="w-full rounded border border-gray-300 px-3 py-2 focus:border-[#660000] text-[#660000] focus:ring-2 focus:ring-[#660000]/20"
                    placeholder={lang === 'ru' ? 'Подробное описание товара' : lang === 'eng' ? 'Full description' : 'To\'liq tavsif'}
                  />
                </div>
              </div>
            </section>
          ))}

          {/* Характеристики */}
          <section className="border-t pt-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Характеристики</h2>
              <button
                type="button"
                onClick={addSpecKey}
                className="flex items-center gap-2 px-3 py-1.5 bg-[#660000] text-white rounded hover:bg-[#7a1a1a] transition-colors"
              >
                <Plus className="w-4 h-4" />
                Добавить характеристику
              </button>
            </div>

            {specKeys.length === 0 ? (
              <p className="text-gray-500 text-sm">Нажмите &quot;Добавить характеристику&quot; для создания</p>
            ) : (
              <div className="space-y-4">
                {specKeys.map((key) => (
                  <div key={key} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium text-gray-900">{key}</h3>
                      <button
                        type="button"
                        onClick={() => removeSpecKey(key)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {(['ru', 'eng', 'uzb'] as Language[]).map((lang) => (
                        <div key={lang}>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            {lang === 'ru' ? 'RU' : lang === 'eng' ? 'ENG' : 'UZB'}
                          </label>
                          <input
                            type="text"
                            value={(form.specs[lang] && form.specs[lang][key]) || ''}
                            onChange={(e) =>
                              setForm((prev) => ({
                                ...prev,
                                specs: {
                                  ...prev.specs,
                                  [lang]: { ...(prev.specs[lang] || {}), [key]: e.target.value },
                                },
                              }))
                            }
                            className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-[#660000] text-[#660000] focus:ring-1 focus:ring-[#660000]/20"
                            placeholder={`Значение для ${lang}`}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Кнопки действий */}
          <div className="flex items-center justify-end gap-4 pt-6 border-t">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-2 rounded border border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={submitting || loading}
              className="px-6 py-2 rounded bg-[#660000] text-white hover:bg-[#7a1a1a] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting
                ? (isEditMode ? 'Сохранение...' : 'Создание...')
                : (isEditMode ? 'Сохранить изменения' : 'Создать товар')}
            </button>
          </div>
        </form>
      </div>
    </AdminGate>
  );
}

