import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Каталог оборудования для пожарной безопасности в Ташкенте | POJ-PRO.UZ',
  description: 'Купите огнетушители, пожарные рукава, сигнализации и другое противопожарное оборудование. Широкий ассортимент, доставка по Ташкенту.',
};

export default function CatalogLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
