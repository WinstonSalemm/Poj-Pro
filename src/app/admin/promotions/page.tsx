"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { toast } from "react-hot-toast";
import { Upload, X } from "lucide-react";
import AdminGate from "@/components/admin/AdminGate";

type LocaleKey = "ru" | "en" | "uz";

type I18nRow = {
  locale: string;
  title: string;
  summary?: string | null;
  description?: string | null;
  image?: string | null;
};

type PromotionRow = {
  id: string;
  slug: string;
  image: string | null;
  isActive: boolean;
  startsAt: string | null;
  endsAt: string | null;
  sortOrder: number;
  ctaUrl: string | null;
  title: string;
  i18n: I18nRow[];
};

type FormState = {
  id?: string;
  slug: string;
  isActive: boolean;
  startsAt: string;
  endsAt: string;
  sortOrder: number;
  ctaUrl: string;
  titleRu: string;
  summaryRu: string;
  descriptionRu: string;
  imageRu: string;
  titleEn: string;
  summaryEn: string;
  descriptionEn: string;
  imageEn: string;
  titleUz: string;
  summaryUz: string;
  descriptionUz: string;
  imageUz: string;
};

const emptyForm = (): FormState => ({
  slug: "",
  isActive: true,
  startsAt: "",
  endsAt: "",
  sortOrder: 0,
  ctaUrl: "",
  titleRu: "",
  summaryRu: "",
  descriptionRu: "",
  imageRu: "",
  titleEn: "",
  summaryEn: "",
  descriptionEn: "",
  imageEn: "",
  titleUz: "",
  summaryUz: "",
  descriptionUz: "",
  imageUz: "",
});

const IMAGE_SLOTS: Array<{ key: LocaleKey; label: string; field: "imageRu" | "imageEn" | "imageUz" }> = [
  { key: "ru", label: "RU", field: "imageRu" },
  { key: "en", label: "ENG", field: "imageEn" },
  { key: "uz", label: "UZB", field: "imageUz" },
];

function toDateInput(value: string | null | undefined): string {
  if (!value) return "";
  return value.slice(0, 10);
}

function pickPreviewImage(row: PromotionRow): string | null {
  const ru = row.i18n.find((x) => x.locale === "ru")?.image;
  const en = row.i18n.find((x) => x.locale === "eng" || x.locale === "en")?.image;
  const uz = row.i18n.find((x) => x.locale === "uzb" || x.locale === "uz")?.image;
  return ru || en || uz || row.image || null;
}

export default function AdminPromotionsPage() {
  const [items, setItems] = useState<PromotionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLocale, setUploadingLocale] = useState<LocaleKey | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm());
  const [showForm, setShowForm] = useState(false);
  const [dragOverLocale, setDragOverLocale] = useState<LocaleKey | null>(null);
  const fileInputRefs = useRef<Record<LocaleKey, HTMLInputElement | null>>({
    ru: null,
    en: null,
    uz: null,
  });

  const reload = async () => {
    try {
      const res = await fetch("/api/admin/promotions");
      const json = await res.json();
      if (!json.success) throw new Error(json.message || "failed");
      setItems(json.data as PromotionRow[]);
    } catch (e) {
      console.error(e);
      toast.error("Не удалось загрузить акции");
    }
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await reload();
      setLoading(false);
    };
    load();
  }, []);

  const openCreate = () => {
    setForm(emptyForm());
    setShowForm(true);
  };

  const openEdit = (row: PromotionRow) => {
    const ru = row.i18n.find((x) => x.locale === "ru");
    const en = row.i18n.find((x) => x.locale === "eng" || x.locale === "en");
    const uz = row.i18n.find((x) => x.locale === "uzb" || x.locale === "uz");
    const legacy = row.image || "";
    setForm({
      id: row.id,
      slug: row.slug,
      isActive: row.isActive,
      startsAt: toDateInput(row.startsAt),
      endsAt: toDateInput(row.endsAt),
      sortOrder: row.sortOrder ?? 0,
      ctaUrl: row.ctaUrl || "",
      titleRu: ru?.title || row.title || "",
      summaryRu: ru?.summary || "",
      descriptionRu: ru?.description || "",
      imageRu: ru?.image || legacy,
      titleEn: en?.title || "",
      summaryEn: en?.summary || "",
      descriptionEn: en?.description || "",
      imageEn: en?.image || legacy,
      titleUz: uz?.title || "",
      summaryUz: uz?.summary || "",
      descriptionUz: uz?.description || "",
      imageUz: uz?.image || legacy,
    });
    setShowForm(true);
  };

  const onUpload = async (locale: LocaleKey, file: File | null) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Выберите изображение");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Максимум 5MB");
      return;
    }
    setUploadingLocale(locale);
    try {
      const fd = new FormData();
      fd.append("files", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const json = await res.json();
      if (!json.success) throw new Error(json.message || "upload failed");
      const url = json.data?.images?.[0]?.url as string | undefined;
      if (!url) throw new Error("no url");
      const field = IMAGE_SLOTS.find((s) => s.key === locale)?.field;
      if (!field) return;
      setForm((prev) => ({ ...prev, [field]: url }));
      toast.success(`Фото ${locale.toUpperCase()} загружено`);
    } catch (e) {
      console.error(e);
      toast.error("Не удалось загрузить фото");
    } finally {
      setUploadingLocale(null);
      const input = fileInputRefs.current[locale];
      if (input) input.value = "";
    }
  };

  const clearImage = (locale: LocaleKey) => {
    const field = IMAGE_SLOTS.find((s) => s.key === locale)?.field;
    if (!field) return;
    setForm((prev) => ({ ...prev, [field]: "" }));
  };

  const onSave = async () => {
    if (!form.titleRu.trim() || !form.titleEn.trim() || !form.titleUz.trim()) {
      toast.error("Заполните название на RU, ENG и UZB");
      return;
    }
    if (!form.summaryRu.trim() || !form.summaryEn.trim() || !form.summaryUz.trim()) {
      toast.error("Заполните краткое описание на RU, ENG и UZB");
      return;
    }
    if (!form.descriptionRu.trim() || !form.descriptionEn.trim() || !form.descriptionUz.trim()) {
      toast.error("Заполните полное описание на RU, ENG и UZB");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        slug: form.slug.trim() || undefined,
        image: form.imageRu || form.imageEn || form.imageUz || null,
        isActive: form.isActive,
        startsAt: form.startsAt || null,
        endsAt: form.endsAt || null,
        sortOrder: Number(form.sortOrder) || 0,
        ctaUrl: form.ctaUrl.trim() || null,
        i18n: [
          {
            locale: "ru",
            title: form.titleRu.trim(),
            summary: form.summaryRu.trim(),
            description: form.descriptionRu.trim(),
            image: form.imageRu || null,
          },
          {
            locale: "eng",
            title: form.titleEn.trim(),
            summary: form.summaryEn.trim(),
            description: form.descriptionEn.trim(),
            image: form.imageEn || null,
          },
          {
            locale: "uzb",
            title: form.titleUz.trim(),
            summary: form.summaryUz.trim(),
            description: form.descriptionUz.trim(),
            image: form.imageUz || null,
          },
        ],
      };

      const res = await fetch(form.id ? `/api/admin/promotions/${form.id}` : "/api/admin/promotions", {
        method: form.id ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.message || "save failed");
      toast.success(form.id ? "Акция обновлена" : "Акция создана");
      setShowForm(false);
      setForm(emptyForm());
      await reload();
    } catch (e) {
      console.error(e);
      toast.error("Не удалось сохранить акцию");
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async (id: string) => {
    if (!confirm("Удалить акцию?")) return;
    try {
      const res = await fetch(`/api/admin/promotions/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!json.success) throw new Error(json.message || "delete failed");
      toast.success("Акция удалена");
      await reload();
    } catch (e) {
      console.error(e);
      toast.error("Не удалось удалить");
    }
  };

  return (
    <AdminGate>
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-bold text-[#660000]">Акции</h1>
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex min-h-10 items-center justify-center rounded-xl bg-[#660000] px-4 text-sm font-semibold text-white hover:bg-[#8B0000]"
          >
            Добавить акцию
          </button>
        </div>

        {loading ? (
          <p className="text-gray-600">Загрузка…</p>
        ) : items.length === 0 ? (
          <p className="rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center text-gray-600">
            Пока нет акций. Добавьте первую.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-3 py-2">Фото</th>
                  <th className="px-3 py-2">Название</th>
                  <th className="px-3 py-2">Срок</th>
                  <th className="px-3 py-2">Статус</th>
                  <th className="px-3 py-2" />
                </tr>
              </thead>
              <tbody>
                {items.map((row) => {
                  const preview = pickPreviewImage(row);
                  return (
                    <tr key={row.id} className="border-t border-gray-100">
                      <td className="px-3 py-2">
                        <div className="relative h-12 w-12 overflow-hidden rounded-lg bg-gray-100">
                          {preview ? (
                            <Image src={preview} alt="" fill className="object-cover" unoptimized />
                          ) : null}
                        </div>
                      </td>
                      <td className="px-3 py-2 font-medium text-gray-900">{row.title}</td>
                      <td className="px-3 py-2 text-gray-600">
                        {toDateInput(row.startsAt) || "—"} → {toDateInput(row.endsAt) || "—"}
                      </td>
                      <td className="px-3 py-2">
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                            row.isActive ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {row.isActive ? "Активна" : "Выкл"}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-right">
                        <button type="button" onClick={() => openEdit(row)} className="mr-2 text-[#660000] hover:underline">
                          Изменить
                        </button>
                        <button type="button" onClick={() => onDelete(row.id)} className="text-red-600 hover:underline">
                          Удалить
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {showForm ? (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/40 p-4">
            <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-5 shadow-xl">
              <h2 className="mb-4 text-xl font-bold text-[#660000]">
                {form.id ? "Редактировать акцию" : "Новая акция"}
              </h2>

              <div className="grid gap-3">
                <div className="grid gap-3 rounded-2xl border border-gray-200 p-3">
                  <p className="text-sm font-semibold text-[#660000]">Название *</p>
                  <label className="grid gap-1 text-sm font-medium text-gray-900">
                    <span>Название RU</span>
                    <input
                      className="rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder:text-gray-400"
                      value={form.titleRu}
                      onChange={(e) => setForm((p) => ({ ...p, titleRu: e.target.value }))}
                    />
                  </label>
                  <label className="grid gap-1 text-sm font-medium text-gray-900">
                    <span>Название ENG</span>
                    <input
                      className="rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder:text-gray-400"
                      value={form.titleEn}
                      onChange={(e) => setForm((p) => ({ ...p, titleEn: e.target.value }))}
                    />
                  </label>
                  <label className="grid gap-1 text-sm font-medium text-gray-900">
                    <span>Название UZB</span>
                    <input
                      className="rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder:text-gray-400"
                      value={form.titleUz}
                      onChange={(e) => setForm((p) => ({ ...p, titleUz: e.target.value }))}
                    />
                  </label>
                </div>

                <div className="grid gap-3 rounded-2xl border border-gray-200 p-3">
                  <p className="text-sm font-semibold text-[#660000]">Краткое описание *</p>
                  <label className="grid gap-1 text-sm font-medium text-gray-900">
                    <span>Краткое описание RU</span>
                    <textarea
                      className="rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder:text-gray-400"
                      rows={2}
                      value={form.summaryRu}
                      onChange={(e) => setForm((p) => ({ ...p, summaryRu: e.target.value }))}
                    />
                  </label>
                  <label className="grid gap-1 text-sm font-medium text-gray-900">
                    <span>Краткое описание ENG</span>
                    <textarea
                      className="rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder:text-gray-400"
                      rows={2}
                      value={form.summaryEn}
                      onChange={(e) => setForm((p) => ({ ...p, summaryEn: e.target.value }))}
                    />
                  </label>
                  <label className="grid gap-1 text-sm font-medium text-gray-900">
                    <span>Краткое описание UZB</span>
                    <textarea
                      className="rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder:text-gray-400"
                      rows={2}
                      value={form.summaryUz}
                      onChange={(e) => setForm((p) => ({ ...p, summaryUz: e.target.value }))}
                    />
                  </label>
                </div>

                <div className="grid gap-3 rounded-2xl border border-gray-200 p-3">
                  <p className="text-sm font-semibold text-[#660000]">Полное описание *</p>
                  <label className="grid gap-1 text-sm font-medium text-gray-900">
                    <span>Полное описание RU</span>
                    <textarea
                      className="rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder:text-gray-400"
                      rows={3}
                      value={form.descriptionRu}
                      onChange={(e) => setForm((p) => ({ ...p, descriptionRu: e.target.value }))}
                    />
                  </label>
                  <label className="grid gap-1 text-sm font-medium text-gray-900">
                    <span>Полное описание ENG</span>
                    <textarea
                      className="rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder:text-gray-400"
                      rows={3}
                      value={form.descriptionEn}
                      onChange={(e) => setForm((p) => ({ ...p, descriptionEn: e.target.value }))}
                    />
                  </label>
                  <label className="grid gap-1 text-sm font-medium text-gray-900">
                    <span>Полное описание UZB</span>
                    <textarea
                      className="rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder:text-gray-400"
                      rows={3}
                      value={form.descriptionUz}
                      onChange={(e) => setForm((p) => ({ ...p, descriptionUz: e.target.value }))}
                    />
                  </label>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="grid gap-1 text-sm font-medium text-gray-900">
                    <span>Дата старта</span>
                    <input
                      type="date"
                      className="rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder:text-gray-400"
                      value={form.startsAt}
                      onChange={(e) => setForm((p) => ({ ...p, startsAt: e.target.value }))}
                    />
                  </label>
                  <label className="grid gap-1 text-sm font-medium text-gray-900">
                    <span>Дата окончания</span>
                    <input
                      type="date"
                      className="rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder:text-gray-400"
                      value={form.endsAt}
                      onChange={(e) => setForm((p) => ({ ...p, endsAt: e.target.value }))}
                    />
                  </label>
                </div>

                <label className="grid gap-1 text-sm font-medium text-gray-900">
                  <span>Slug</span>
                  <input
                    className="rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder:text-gray-400"
                    value={form.slug}
                    onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))}
                    placeholder="auto from title if empty"
                  />
                </label>
                <label className="grid gap-1 text-sm font-medium text-gray-900">
                  <span>CTA ссылка</span>
                  <input
                    className="rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder:text-gray-400"
                    value={form.ctaUrl}
                    onChange={(e) => setForm((p) => ({ ...p, ctaUrl: e.target.value }))}
                    placeholder="/catalog или https://..."
                  />
                </label>
                <label className="grid gap-1 text-sm font-medium text-gray-900">
                  <span>Порядок</span>
                  <input
                    type="number"
                    className="rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder:text-gray-400"
                    value={form.sortOrder}
                    onChange={(e) => setForm((p) => ({ ...p, sortOrder: Number(e.target.value) || 0 }))}
                  />
                </label>
                <label className="inline-flex items-center gap-2 text-sm font-medium text-gray-900">
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) => setForm((p) => ({ ...p, isActive: e.target.checked }))}
                  />
                  Активна
                </label>

                <div className="grid gap-3 rounded-2xl border border-gray-200 p-3">
                  <div>
                    <p className="text-sm font-semibold text-[#660000]">Фото акции по языкам</p>
                    <p className="mt-0.5 text-xs text-gray-500">
                      Загрузите отдельное изображение для RU, ENG и UZB — на сайте покажется фото выбранного языка.
                    </p>
                  </div>

                  {IMAGE_SLOTS.map(({ key, label, field }) => {
                    const imageUrl = form[field];
                    const uploading = uploadingLocale === key;
                    const dragOver = dragOverLocale === key;
                    return (
                      <div key={key} className="grid gap-2 text-sm font-medium text-gray-900">
                        <span>Фото {label}</span>
                        {imageUrl ? (
                          <div className="relative overflow-hidden rounded-2xl border border-[#660000]/15 bg-[#F8F9FA]">
                            <div className="relative h-36 w-full">
                              <Image src={imageUrl} alt={`Фото ${label}`} fill className="object-cover" unoptimized />
                            </div>
                            <div className="flex items-center justify-between gap-2 border-t border-gray-100 bg-white px-3 py-2">
                              <button
                                type="button"
                                disabled={Boolean(uploadingLocale)}
                                onClick={() => fileInputRefs.current[key]?.click()}
                                className="rounded-lg px-3 py-1.5 text-sm font-medium text-[#660000] hover:bg-[#fff9f8] disabled:opacity-60"
                              >
                                {uploading ? "Загрузка…" : "Заменить"}
                              </button>
                              <button
                                type="button"
                                disabled={Boolean(uploadingLocale)}
                                onClick={() => clearImage(key)}
                                className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-red-600 disabled:opacity-60"
                              >
                                <X size={14} />
                                Удалить
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                fileInputRefs.current[key]?.click();
                              }
                            }}
                            onClick={() => !uploadingLocale && fileInputRefs.current[key]?.click()}
                            onDragOver={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setDragOverLocale(key);
                            }}
                            onDragLeave={(e) => {
                              e.preventDefault();
                              setDragOverLocale(null);
                            }}
                            onDrop={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setDragOverLocale(null);
                              onUpload(key, e.dataTransfer.files?.[0] || null);
                            }}
                            className={`cursor-pointer rounded-2xl border-2 border-dashed px-4 py-6 text-center transition-colors ${
                              dragOver
                                ? "border-[#660000] bg-[#fff9f8]"
                                : "border-gray-300 bg-white hover:border-[#660000]/50 hover:bg-[#fff9f8]"
                            } ${uploadingLocale ? "pointer-events-none opacity-60" : ""}`}
                          >
                            <Upload className="mx-auto mb-2 h-8 w-8 text-[#660000]/70" />
                            <p className="text-sm font-medium text-gray-800">
                              {uploading ? "Загрузка…" : `Фото ${label}: перетащите или выберите`}
                            </p>
                            <p className="mt-1 text-xs text-gray-500">JPG, PNG, WEBP · до 5MB</p>
                          </div>
                        )}
                        <input
                          ref={(el) => {
                            fileInputRefs.current[key] = el;
                          }}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          disabled={Boolean(uploadingLocale)}
                          onChange={(e) => onUpload(key, e.target.files?.[0] || null)}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="mt-5 flex gap-2">
                <button
                  type="button"
                  disabled={saving}
                  onClick={onSave}
                  className="inline-flex min-h-10 flex-1 items-center justify-center rounded-xl bg-[#660000] px-4 text-sm font-semibold text-white hover:bg-[#8B0000] disabled:opacity-60"
                >
                  {saving ? "Сохранение…" : "Сохранить"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="inline-flex min-h-10 flex-1 items-center justify-center rounded-xl border border-gray-300 px-4 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Отмена
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </AdminGate>
  );
}
