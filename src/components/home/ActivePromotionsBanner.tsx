import { getActivePromotions } from "@/lib/promotions";
import PromotionsGridClient from "@/components/promotions/PromotionsGridClient";
import type { PromotionCard } from "@/types/promotion";

type Props = {
  locale: string;
};

export default async function ActivePromotionsBanner({ locale }: Props) {
  const lang = locale === "en" || locale === "uz" ? locale : "ru";
  let promotions: PromotionCard[] = [];
  try {
    promotions = await getActivePromotions(lang, { limit: 4 });
  } catch (error) {
    console.error("[ActivePromotionsBanner] failed to load promotions", error);
  }

  return <PromotionsGridClient locale={lang} promotions={promotions} preview showHeader />;
}
