'use client';
import { usePathname } from 'next/navigation';
import { JsonLd } from './JsonLd';

interface BreadcrumbItem {
  name: string;
  url: string;
}

interface BreadcrumbJsonLdProps {
  items?: BreadcrumbItem[];
  categoryName?: string;
  siteName?: string;
}

export const BreadcrumbJsonLd: React.FC<BreadcrumbJsonLdProps> = ({
  items = [],
  categoryName,
  siteName = 'POJ PRO'
}) => {
  const pathname = usePathname() || '/';
  
  // Default breadcrumbs
  const defaultItems: BreadcrumbItem[] = [
    { name: siteName, url: '/' },
  ];
  
  // Add category if provided
  if (categoryName) {
    defaultItems.push({
      name: categoryName,
      url: pathname,
    });
  }
  
  // Use provided items or default ones
  const breadcrumbItems = items.length > 0 ? items : defaultItems;
  
  // Generate itemListElement array for JSON-LD
  const itemListElement = breadcrumbItems.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.name,
    item: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}${item.url.startsWith('http') ? new URL(item.url).pathname : item.url}`,
  }));
  
  const breadcrumbJson = {
    '@type': 'BreadcrumbList',
    itemListElement,
  };
  
  return <JsonLd data={breadcrumbJson} type="BreadcrumbList" />;
};
