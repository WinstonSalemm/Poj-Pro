"use client";

import { useEffect } from "react";
import {
  trackAdsContact,
  trackAdsRegistration,
  trackAdsMeetingBooking,
  trackAdsPriceRequest,
  trackAdsPageViewSpecial,
} from "@/components/analytics/events";

type AdsConversionType =
  | "contact"
  | "registration"
  | "meetingBooking"
  | "priceRequest"
  | "pageViewSpecial";

interface Props {
  type: AdsConversionType;
}

/**
 * Небольшой клиентский компонент, который просто стреляет
 * нужным Google Ads conversion‑событием при монтировании.
 * Никакого UI не рендерит.
 */
export function AdsConversionOnMount({ type }: Props) {
  useEffect(() => {
    switch (type) {
      case "contact":
        trackAdsContact();
        break;
      case "registration":
        trackAdsRegistration();
        break;
      case "meetingBooking":
        trackAdsMeetingBooking();
        break;
      case "priceRequest":
        trackAdsPriceRequest();
        break;
      case "pageViewSpecial":
        trackAdsPageViewSpecial();
        break;
      default:
        break;
    }
  }, [type]);

  return null;
}

