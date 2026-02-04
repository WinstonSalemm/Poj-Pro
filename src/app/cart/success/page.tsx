"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { trackPurchase, trackAdsMeetingBooking } from "@/components/analytics/events";

export default function CartSuccessPage() {
  const search = useSearchParams();
  const orderId = search.get("orderId") || "";
  const totalStr = search.get("total") || "0";
  const total = Number(totalStr) || 0;

  useEffect(() => {
    if (!orderId) return;
    const key = `purchase_sent_${orderId}`;
    const already = sessionStorage.getItem(key);
    if (!already) {
      try {
        trackPurchase({ transaction_id: orderId, value: total, currency: "UZS", items: [] });
      } catch {}
      sessionStorage.setItem(key, "1");
    }
  }, [orderId, total]);

  // Google Ads: "Запись на встречу" — используем страницу успешного заказа как точку конверсии
  useEffect(() => {
    if (!orderId) return;
    try {
      const key = `ads_meeting_booking_${orderId}`;
      if (!sessionStorage.getItem(key)) {
        trackAdsMeetingBooking();
        sessionStorage.setItem(key, "1");
      }
    } catch {
      // аналитика не должна ломать страницу
    }
  }, [orderId]);

  return (
    <main className="container-section mt-[100px] py-12">
      <div className="max-w-xl mx-auto bg-white border border-gray-200 rounded-2xl p-8 text-center">
        <svg className="w-12 h-12 text-green-600 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
        <h1 className="text-2xl font-semibold !text-[#660000] mb-1">Order placed</h1>
        <p className="text-gray-600 mb-4">Order ID: {orderId || "—"}</p>
        <p className="text-gray-700 mb-6">Total: {Math.round(total).toLocaleString('ru-UZ')} UZS</p>
        <Link href="/catalog" className="inline-flex px-6 h-11 items-center justify-center rounded-lg bg-[#660000] text-white hover:bg-[#8B0000]">Continue shopping</Link>
      </div>
    </main>
  );
}
