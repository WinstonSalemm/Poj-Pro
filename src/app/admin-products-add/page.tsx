"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function RedirectInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const id = searchParams.get("id");
    if (id) {
      router.replace(`/admin-products?edit=${encodeURIComponent(id)}`);
    } else {
      router.replace("/admin-products?new=1");
    }
  }, [router, searchParams]);

  return <p className="p-6 text-center text-gray-600">Открываем список товаров…</p>;
}

/**
 * Legacy route: product create/edit now lives on /admin-products as a modal.
 */
export default function AdminProductsAddRedirectPage() {
  return (
    <Suspense fallback={<p className="p-6 text-center text-gray-600">Открываем список товаров…</p>}>
      <RedirectInner />
    </Suspense>
  );
}
