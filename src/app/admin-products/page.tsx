"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import AdminGate from "@/components/admin/AdminGate";
import ProductFormModal from "@/components/admin/ProductFormModal";
import { toast } from "react-hot-toast";

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

function AdminProductsPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [rows, setRows] = useState<ProductRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const token = useMemo(() => {
    if (typeof window === "undefined") return "";
    return localStorage.getItem("adminToken") || "";
  }, []);

  useEffect(() => {
    const edit = searchParams.get("edit");
    const isNew = searchParams.get("new");
    if (edit) {
      setEditId(edit);
      setModalOpen(true);
      router.replace("/admin-products");
    } else if (isNew === "1") {
      setEditId(null);
      setModalOpen(true);
      router.replace("/admin-products");
    }
  }, [searchParams, router]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return rows;
    return rows.filter(
      (r) =>
        r.slug.toLowerCase().includes(s) ||
        r.title.toLowerCase().includes(s) ||
        (r.category?.slug || "").toLowerCase().includes(s)
    );
  }, [q, rows]);

  const reload = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/products");
      const json = await res.json();
      if (!json.success) throw new Error(json.message || "failed");

      const products = (json.data as Array<Record<string, unknown>>).map((p) => {
        let images: string[] = [];
        if (Array.isArray(p.images)) {
          images = p.images as string[];
        } else if (typeof p.images === "string") {
          try {
            const parsed = JSON.parse(p.images);
            images = Array.isArray(parsed) ? parsed : [];
          } catch {
            images = [];
          }
        }
        return {
          id: String(p.id),
          slug: String(p.slug || ""),
          title: String(p.title || p.slug || ""),
          price: Number(p.price) || 0,
          stock: Number(p.stock) || 0,
          isActive: Boolean(p.isActive ?? true),
          category: (p.category as ProductRow["category"]) || null,
          images,
        };
      });

      setRows(products);
    } catch (e) {
      console.error(e);
      toast.error("Не удалось загрузить товары");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reload();
  }, []);

  const openCreate = () => {
    setEditId(null);
    setModalOpen(true);
  };

  const openEdit = (id: string) => {
    setEditId(id);
    setModalOpen(true);
  };

  const onDelete = async (id: string) => {
    if (!confirm("Удалить товар?")) return;
    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: "DELETE",
        headers: { "x-admin-token": token },
      });
      if (!res.ok) throw new Error("delete failed");
      toast.success("Товар удалён");
      await reload();
    } catch (e) {
      console.error(e);
      toast.error("Ошибка удаления товара");
    }
  };

  return (
    <AdminGate>
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#660000]">Товары</h1>
            <p className="mt-1 text-sm text-gray-600">Список товаров каталога</p>
          </div>
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex min-h-10 items-center justify-center rounded-xl bg-[#660000] px-4 text-sm font-semibold text-white hover:bg-[#8B0000]"
          >
            Добавить товар
          </button>
        </div>

        <div className="mb-4">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Поиск по названию, slug, категории…"
            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#660000] focus:outline-none focus:ring-2 focus:ring-[#660000]/20"
          />
        </div>

        {loading ? (
          <p className="text-gray-600">Загрузка…</p>
        ) : filtered.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center text-gray-600">
            Товаров нет. Добавьте первый.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-[0_4px_16px_rgba(102,0,0,0.04)]">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-[#F8F9FA] text-gray-600">
                <tr>
                  <th className="px-3 py-3">Фото</th>
                  <th className="px-3 py-3">Название</th>
                  <th className="px-3 py-3">Slug</th>
                  <th className="px-3 py-3">Категория</th>
                  <th className="px-3 py-3">Цена</th>
                  <th className="px-3 py-3">Stock</th>
                  <th className="px-3 py-3" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((row) => (
                  <tr key={row.id} className="border-t border-gray-100 hover:bg-[#fff9f8]">
                    <td className="px-3 py-3">
                      <div className="relative h-12 w-12 overflow-hidden rounded-lg bg-gray-100">
                        {row.images[0] ? (
                          <Image src={row.images[0]} alt="" fill className="object-cover" unoptimized />
                        ) : null}
                      </div>
                    </td>
                    <td className="px-3 py-3 font-medium text-gray-900">{row.title}</td>
                    <td className="px-3 py-3 font-mono text-xs text-gray-600">{row.slug}</td>
                    <td className="px-3 py-3 text-gray-600">{row.category?.slug || "—"}</td>
                    <td className="px-3 py-3 text-gray-900">{Number(row.price).toLocaleString("ru-RU")}</td>
                    <td className="px-3 py-3 text-gray-900">{row.stock}</td>
                    <td className="px-3 py-3 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => openEdit(row.id)}
                        className="mr-2 text-[#660000] hover:underline"
                      >
                        Изменить
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(row.id)}
                        className="text-red-600 hover:underline"
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

        <ProductFormModal
          open={modalOpen}
          productId={editId}
          onClose={() => {
            setModalOpen(false);
            setEditId(null);
          }}
          onSaved={reload}
        />
      </div>
    </AdminGate>
  );
}

export default function AdminProductsPage() {
  return (
    <Suspense fallback={<p className="p-6 text-center text-gray-600">Загрузка…</p>}>
      <AdminProductsPageInner />
    </Suspense>
  );
}
