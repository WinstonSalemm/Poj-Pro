"use client";

import { useEffect } from "react";
import { evViewItem } from "@/lib/analytics/dataLayer";

interface Props {
  id: string | number;
  name?: string;
  price?: number;
  currency?: string;
}

export default function ProductViewTracker({ id, name, price, currency = "UZS" }: Props) {
  useEffect(() => {
    if (!id) return;
    try {
      evViewItem({ item_id: id, item_name: name, price, currency });
    } catch {}
  }, [id, name, price, currency]);

  return null;
}
