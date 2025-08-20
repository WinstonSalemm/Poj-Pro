"use client";
import { SeoHead } from "@/components/seo/SeoHead";

export default function SeoMount(props: React.ComponentProps<typeof SeoHead>) {
  return <SeoHead {...props} />;
}
