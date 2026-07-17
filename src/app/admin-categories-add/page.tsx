"use client";

import { useState, useRef, useEffect } from "react";
import AdminGate from "@/components/admin/AdminGate";
import { toast } from "react-hot-toast";
import { Upload, X, Trash2 } from "lucide-react";

type Language = "ru" | "eng" | "uzb";

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

function CategoryThumb({ src, alt }: { src: string | null; alt: string }) {
  const [broken, setBroken] = useState(false);

  useEffect(() => {
    setBroken(false);
  }, [src]);

  if (!src || broken) {
    return (
      <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">
        Нет фото
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className="h-full w-full object-cover"
      onError={() => setBroken(true)}
    />
  );
}

const emptyForm: CategoryFormData = {
  slug: "",
  image: "",
  i18n: { ru: "", eng: "", uzb: "" },
};

export default function AdminCategoriesAddPage() {
  const [form, setForm] = useState<CategoryFormData>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [categoryImage, setCategoryImage] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const token = typeof window !== "undefined" ? localStorage.getItem("adminToken") || "" : "";

  if (typeof window !== "undefined") {
    const w = window as typeof window & { __categoryImageData?: string };
    if (!w.__categoryImageData) w.__categoryImageData = "";
  }

  const ALLOWED_IMAGE_TYPES = new Set([
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/avif",
    "image/gif",
    "image/svg+xml",
  ]);

  const isAllowedImageFile = (file: File) => {
    if (file.type && ALLOWED_IMAGE_TYPES.has(file.type)) return true;
    const name = (file.name || "").toLowerCase();
    return /\.(jpe?g|png|webp|avif|gif|svg)$/.test(name);
  };

  const reloadCategories = async () => {
    try {
      setLoadingCategories(true);
      const res = await fetch("/api/admin/categories", {
        headers: { "x-admin-token": token },
      });
      const json = await res.json();
      if (json.success && json.data) {
        setCategories(json.data);
      }
    } catch (e) {
      console.error("Failed to load categories:", e);
      toast.error("Не удалось загрузить категории");
    } finally {
      setLoadingCategories(false);
    }
  };

  useEffect(() => {
    reloadCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const resetForm = () => {
    setForm(emptyForm);
    setCategoryImage("");
    const w = window as typeof window & { __categoryImageData?: string };
    w.__categoryImageData = "";
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const openCreate = () => {
    resetForm();
    setShowForm(true);
  };

  const handleImageSelect = async (file: File) => {
    if (!isAllowedImageFile(file)) {
      toast.error("Недопустимый формат. JPG, PNG, WEBP, AVIF, GIF, SVG");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Максимум 5MB");
      return;
    }

    try {
      setUploadingImage(true);
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          resolve(result.split(",")[1]);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      setCategoryImage(base64);
      const w = window as typeof window & { __categoryImageData?: string };
      w.__categoryImageData = base64;
      toast.success("Изображение загружено");
    } catch (error) {
      console.error("Error reading image:", error);
      toast.error("Ошибка при загрузке изображения");
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemoveImage = () => {
    setCategoryImage("");
    const w = window as typeof window & { __categoryImageData?: string };
    w.__categoryImageData = "";
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.slug.trim()) {
      toast.error("Slug обязателен");
      return;
    }
    if (!/^[a-z0-9]+(?:[-_][a-z0-9]+)*$/.test(form.slug)) {
      toast.error("Slug: только латиница, цифры, дефисы и подчёркивания");
      return;
    }
    if (!form.i18n.ru.trim() || !form.i18n.eng.trim() || !form.i18n.uzb.trim()) {
      toast.error("Заполните название на RU, ENG и UZB");
      return;
    }

    setSubmitting(true);
    try {
      const w = window as typeof window & { __categoryImageData?: string };
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

      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-token": token,
        },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Ошибка при создании категории");
      }

      toast.success("Категория создана");
      resetForm();
      setShowForm(false);
      await reloadCategories();
    } catch (error) {
      console.error("Error creating category:", error);
      toast.error(error instanceof Error ? error.message : "Ошибка при создании категории");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCategory = async (categoryId: string, categorySlug: string) => {
    if (!confirm(`Удалить категорию "${categorySlug}"?`)) return;
    try {
      const res = await fetch(`/api/admin/categories?id=${categoryId}`, {
        method: "DELETE",
        headers: { "x-admin-token": token },
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Ошибка при удалении категории");
      }
      toast.success("Категория удалена");
      await reloadCategories();
    } catch (error) {
      console.error("Error deleting category:", error);
      toast.error(error instanceof Error ? error.message : "Ошибка при удалении категории");
    }
  };

  return (
    <AdminGate>
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#660000]">Категории</h1>
            <p className="mt-1 text-sm text-gray-600">Список категорий каталога</p>
          </div>
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex min-h-10 items-center justify-center rounded-xl bg-[#660000] px-4 text-sm font-semibold text-white hover:bg-[#8B0000]"
          >
            Добавить категорию
          </button>
        </div>

        {loadingCategories ? (
          <p className="text-gray-600">Загрузка…</p>
        ) : categories.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center text-gray-600">
            Категорий нет. Добавьте первую.
          </p>
        ) : (
          <div className="space-y-3">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-[0_4px_16px_rgba(102,0,0,0.04)] transition hover:border-[#660000]/25"
              >
                <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
                  <CategoryThumb src={cat.image} alt={cat.i18n.ru || cat.slug} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-medium text-gray-900">{cat.i18n.ru || "—"}</div>
                  <div className="mt-1">
                    <span className="rounded bg-gray-100 px-2 py-0.5 font-mono text-xs text-gray-600">
                      {cat.slug}
                    </span>
                  </div>
                  <div className="mt-1 space-x-2 text-xs text-gray-500">
                    {cat.i18n.eng ? <span>EN: {cat.i18n.eng}</span> : null}
                    {cat.i18n.uzb ? <span>UZ: {cat.i18n.uzb}</span> : null}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleDeleteCategory(cat.id, cat.slug)}
                  className="rounded-lg p-2 text-gray-400 transition hover:bg-red-50 hover:text-red-600"
                  title="Удалить категорию"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        )}

        {showForm ? (
          <div
            className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/40 p-4"
            onClick={() => !submitting && setShowForm(false)}
          >
            <div
              className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white p-5 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-4 flex items-start justify-between gap-3">
                <h2 className="text-xl font-bold text-[#660000]">Новая категория</h2>
                <button
                  type="button"
                  onClick={() => !submitting && setShowForm(false)}
                  className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50"
                >
                  Закрыть
                </button>
              </div>

              <form onSubmit={handleSubmit} className="grid gap-4">
                <label className="grid gap-1 text-sm font-medium text-gray-900">
                  <span>Slug (идентификатор) *</span>
                  <input
                    type="text"
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: e.target.value })}
                    placeholder="fire-extinguishers"
                    className="rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder:text-gray-400 focus:border-[#660000] focus:outline-none focus:ring-2 focus:ring-[#660000]/20"
                    disabled={submitting}
                  />
                  <span className="text-xs font-normal text-gray-500">
                    Только латинские буквы, цифры, дефисы и подчёркивания
                  </span>
                </label>

                <div className="grid gap-2 text-sm font-medium text-gray-900">
                  <span>Изображение категории</span>
                  {categoryImage ? (
                    <div className="relative w-36 overflow-hidden rounded-2xl border border-[#660000]/15 bg-[#F8F9FA]">
                      <img
                        src={`data:image/png;base64,${categoryImage}`}
                        alt="Preview"
                        className="h-36 w-full object-contain"
                      />
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="absolute right-2 top-2 rounded-full bg-white/90 p-1 text-gray-700 shadow hover:text-red-600"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <div
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          fileInputRef.current?.click();
                        }
                      }}
                      onClick={() => !uploadingImage && fileInputRef.current?.click()}
                      onDragOver={(e) => {
                        e.preventDefault();
                        setDragOver(true);
                      }}
                      onDragLeave={() => setDragOver(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setDragOver(false);
                        const file = e.dataTransfer.files[0];
                        if (file) handleImageSelect(file);
                      }}
                      className={`cursor-pointer rounded-2xl border-2 border-dashed px-4 py-8 text-center transition-colors ${
                        dragOver
                          ? "border-[#660000] bg-[#fff9f8]"
                          : "border-gray-300 hover:border-[#660000]/50 hover:bg-[#fff9f8]"
                      } ${uploadingImage ? "pointer-events-none opacity-60" : ""}`}
                    >
                      <Upload className="mx-auto mb-2 h-9 w-9 text-[#660000]/70" />
                      <p className="text-sm font-medium text-gray-800">
                        {uploadingImage ? "Загрузка…" : "Перетащите фото или нажмите для выбора"}
                      </p>
                      <p className="mt-1 text-xs font-normal text-gray-500">
                        JPG, PNG, WEBP, AVIF, GIF, SVG · до 5MB
                      </p>
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={submitting || uploadingImage}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageSelect(file);
                    }}
                  />
                </div>

                <div className="grid gap-3 rounded-2xl border border-gray-200 p-3">
                  <p className="text-sm font-semibold text-[#660000]">Названия *</p>
                  {([
                    ["ru", "Название RU"],
                    ["eng", "Название ENG"],
                    ["uzb", "Название UZB"],
                  ] as const).map(([lang, label]) => (
                    <label key={lang} className="grid gap-1 text-sm font-medium text-gray-900">
                      <span>{label}</span>
                      <input
                        type="text"
                        value={form.i18n[lang as Language]}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            i18n: { ...form.i18n, [lang]: e.target.value },
                          })
                        }
                        className="rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder:text-gray-400 focus:border-[#660000] focus:outline-none focus:ring-2 focus:ring-[#660000]/20"
                        disabled={submitting}
                      />
                    </label>
                  ))}
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex min-h-10 flex-1 items-center justify-center rounded-xl bg-[#660000] px-4 text-sm font-semibold text-white hover:bg-[#8B0000] disabled:opacity-60"
                  >
                    {submitting ? "Создание…" : "Создать категорию"}
                  </button>
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={() => setShowForm(false)}
                    className="inline-flex min-h-10 flex-1 items-center justify-center rounded-xl border border-gray-300 px-4 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-60"
                  >
                    Отмена
                  </button>
                </div>
              </form>
            </div>
          </div>
        ) : null}
      </div>
    </AdminGate>
  );
}
