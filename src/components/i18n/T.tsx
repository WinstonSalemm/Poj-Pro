"use client";
import React from "react";
import { useTranslation } from "@/i18n/useTranslation";

type KnownNS = "translation" | "aboutus";

type TProps<E extends React.ElementType = "span"> = {
  k: string;
  ns?: KnownNS;
  values?: Record<string, unknown>;
  className?: string;
  as?: E;
} & Omit<React.ComponentPropsWithoutRef<E>, "as" | "children">;

export default function T<E extends React.ElementType = "span">(
  { k, ns = "translation", values, className, as }: TProps<E>
) {
  const { t } = useTranslation(ns);
  const Tag = (as || "span") as React.ElementType;
  return <Tag className={className}>{t(k, values)}</Tag>;
}
