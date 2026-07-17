"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { toast } from "react-hot-toast";
import AdminGate from "@/components/admin/AdminGate";

type I18nRow = {
  locale: string;
  title: string;
  summary?: string | null;
  description?: string | null;
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
  image: string;
  isActive: boolean;
  startsAt: string;
  endsAt: string;
  sortOrder: number;
  ctaUrl: string;
  titleRu: string;
  summaryRu: string;
  descriptionRu: string;
  titleEn: string;
  summaryEn: string;
  descriptionEn: string;
  titleUz: string;
  summaryUz: string;
  descriptionUz: string;
};

const emptyForm = (): FormState => ({
  slug: "",
  image: "",
  isActive: true,
  startsAt: "",
  endsAt: "",
  sortOrder: 0,
  ctaUrl: "",
  titleRu: "",
  summaryRu: "",
  descriptionRu: "",
  titleEn: "",
  summaryEn: "",
  descriptionEn: "",
  titleUz: "",
  summaryUz: "",
  descriptionUz: "",
});

function toDateInput(value: string | null | undefined): string {
  if (!value) return "";
  return value.slice(0, 10);
}

export default function AdminPromotionsPage() {
  const [items, setItems] = useState<PromotionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm());
  const [showForm, setShowForm] = useState(false);

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
    setForm({
      id: row.id,
      slug: row.slug,
      image: row.image || "",
      isActive: row.isActive,
      startsAt: toDateInput(row.startsAt),
      endsAt: toDateInput(row.endsAt),
      sortOrder: row.sortOrder ?? 0,
      ctaUrl: row.ctaUrl || "",
      titleRu: ru?.title || row.title || "",
      summaryRu: ru?.summary || "",
      descriptionRu: ru?.description || "",
      titleEn: en?.title || "",
      summaryEn: en?.summary || "",
      descriptionEn: en?.description || "",
      titleUz: uz?.title || "",
      summaryUz: uz?.summary || "",
      descriptionUz: uz?.description || "",
    });
    setShowForm(true);
  };

  const onUpload = async (file: File | null) => {
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("files", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const json = await res.json();
      if (!json.success) throw new Error(json.message || "upload failed");
      const url = json.data?.images?.[0]?.url as string | undefined;
      if (!url) throw new Error("no url");
      setForm((prev) => ({ ...prev, image: url }));
      toast.success("Фото загружено");
    } catch (e) {
      console.error(e);
      toast.error("Не удалось загрузить фото");
    } finally {
      setUploading(false);
    }
  };

  const onSave = async () => {
    if (!form.titleRu.trim()) {
      toast.error("Укажите заголовок (RU)");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        slug: form.slug.trim() || undefined,
        image: form.image || null,
        isActive: form.isActive,
        startsAt: form.startsAt || null,
        endsAt: form.endsAt || null,
        sortOrder: Number(form.sortOrder) || 0,
        ctaUrl: form.ctaUrl.trim() || null,
        i18n: [
          {
            locale: "ru",
            title: form.titleRu.trim(),
            summary: form.summaryRu.trim() || null,
            description: form.descriptionRu.trim() || null,
          },
          ...(form.titleEn.trim()
            ? [
                {
                  locale: "eng",
                  title: form.titleEn.trim(),
                  summary: form.summaryEn.trim() || null,
                  description: form.descriptionEn.trim() || null,
                },
              ]
            : []),
          ...(form.titleUz.trim()
            ? [
                {
                  locale: "uzb",
                  title: form.titleUz.trim(),
                  summary: form.summaryUz.trim() || null,
                  description: form.descriptionUz.trim() || null,
                },
              ]
            : []),
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
                {items.map((row) => (
                  <tr key={row.id} className="border-t border-gray-100">
                    <td className="px-3 py-2">
                      <div className="relative h-12 w-12 overflow-hidden rounded-lg bg-gray-100">
                        {row.image ? (
                          <Image src={row.image} alt="" fill className="object-cover" unoptimized />
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
                ))}
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
                <label className="grid gap-1 text-sm">
                  <span>Заголовок (RU) *</span>
                  <input
                    className="rounded-lg border border-gray-300 px-3 py-2"
                    value={form.titleRu}
                    onChange={(e) => setForm((p) => ({ ...p, titleRu: e.target.value }))}
                  />
                </label>
                <label className="grid gap-1 text-sm">
                  <span>Краткое описание (RU)</span>
                  <textarea
                    className="rounded-lg border border-gray-300 px-3 py-2"
                    rows={2}
                    value={form.summaryRu}
                    onChange={(e) => setForm((p) => ({ ...p, summaryRu: e.target.value }))}
                  />
                </label>
                <label className="grid gap-1 text-sm">
                  <span>Полное описание (RU)</span>
                  <textarea
                    className="rounded-lg border border-gray-300 px-3 py-2"
                    rows={4}
                    value={form.descriptionRu}
                    onChange={(e) => setForm((p) => ({ ...p, descriptionRu: e.target.value }))}
                  />
                </label>

                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="grid gap-1 text-sm">
                    <span>Дата старта</span>
                    <input
                      type="date"
                      className="rounded-lg border border-gray-300 px-3 py-2"
                      value={form.startsAt}
                      onChange={(e) => setForm((p) => ({ ...p, startsAt: e.target.value }))}
                    />
                  </label>
                  <label className="grid gap-1 text-sm">
                    <span>Дата окончания</span>
                    <input
                      type="date"
                      className="rounded-lg border border-gray-300 px-3 py-2"
                      value={form.endsAt}
                      onChange={(e) => setForm((p) => ({ ...p, endsAt: e.target.value }))}
                    />
                  </label>
                </div>

                <label className="grid gap-1 text-sm">
                  <span>Slug</span>
                  <input
                    className="rounded-lg border border-gray-300 px-3 py-2"
                    value={form.slug}
                    onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))}
                    placeholder="auto from title if empty"
                  />
                </label>
                <label className="grid gap-1 text-sm">
                  <span>CTA ссылка (опционально)</span>
                  <input
                    className="rounded-lg border border-gray-300 px-3 py-2"
                    value={form.ctaUrl}
                    onChange={(e) => setForm((p) => ({ ...p, ctaUrl: e.target.value }))}
                    placeholder="/catalog или https://..."
                  />
                </label>
                <label className="grid gap-1 text-sm">
                  <span>Порядок</span>
                  <input
                    type="number"
                    className="rounded-lg border border-gray-300 px-3 py-2"
                    value={form.sortOrder}
                    onChange={(e) => setForm((p) => ({ ...p, sortOrder: Number(e.target.value) || 0 }))}
                  />
                </label>
                <label className="inline-flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) => setForm((p) => ({ ...p, isActive: e.target.checked }))}
                  />
                  Активна
                </label>

                <div className="grid gap-2 text-sm">
                  <span>Фото</span>
                  {form.image ? (
                    <div className="relative h-36 w-full overflow-hidden rounded-xl bg-gray-100">
                      <Image src={form.image} alt="" fill className="object-cover" unoptimized />
                    </div>
                  ) : null}
                  <input
                    type="file"
                    accept="image/*"
                    disabled={uploading}
                    onChange={(e) => onUpload(e.target.files?.[0] || null)}
                  />
                </div>

                <details className="rounded-xl border border-gray-200 p-3">
                  <summary className="cursor-pointer font-medium">EN / UZ (опционально)</summary>
                  <div className="mt-3 grid gap-3">
                    <input
                      className="rounded-lg border border-gray-300 px-3 py-2"
                      placeholder="Title EN"
                      value={form.titleEn}
                      onChange={(e) => setForm((p) => ({ ...p, titleEn: e.target.value }))}
                    />
                    <textarea
                      className="rounded-lg border border-gray-300 px-3 py-2"
                      placeholder="Summary EN"
                      rows={2}
                      value={form.summaryEn}
                      onChange={(e) => setForm((p) => ({ ...p, summaryEn: e.target.value }))}
                    />
                    <textarea
                      className="rounded-lg border border-gray-300 px-3 py-2"
                      placeholder="Description EN"
                      rows={3}
                      value={form.descriptionEn}
                      onChange={(e) => setForm((p) => ({ ...p, descriptionEn: e.target.value }))}
                    />
                    <input
                      className="rounded-lg border border-gray-300 px-3 py-2"
                      placeholder="Title UZ"
                      value={form.titleUz}
                      onChange={(e) => setForm((p) => ({ ...p, titleUz: e.target.value }))}
                    />
                    <textarea
                      className="rounded-lg border border-gray-300 px-3 py-2"
                      placeholder="Summary UZ"
                      rows={2}
                      value={form.summaryUz}
                      onChange={(e) => setForm((p) => ({ ...p, summaryUz: e.target.value }))}
                    />
                    <textarea
                      className="rounded-lg border border-gray-300 px-3 py-2"
                      placeholder="Description UZ"
                      rows={3}
                      value={form.descriptionUz}
                      onChange={(e) => setForm((p) => ({ ...p, descriptionUz: e.target.value }))}
                    />
                  </div>
                </details>
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
