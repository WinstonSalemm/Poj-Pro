import Image from "next/image";
import { IMG_SIZES } from '@/lib/imageSizes';
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getLocale } from "@/lib/api";
import Breadcrumbs from "@/components/Breadcrumbs/Breadcrumbs";
import PurchaseCard from "@/components/PurchaseCard/PurchaseCard";
import Tabs from "@/components/Tabs/Tabs";
import Card from "@/components/ui/Card/Card";
import styles from "./ProductPage.module.css";

export const dynamic = "force-dynamic";
export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{category:string; id:string}> }) {
  const pr = await params;
  const p = await getProduct(pr);
  const title = p?.name || p?.title || "Товар";
  const desc = p?.short_description || "Качественное противопожарное оборудование";
  const url = `https://www.poj-pro.uz/catalog/${pr.category}/${pr.id}`;
  return {
    title: `${title} — POJ PRO`,
    description: desc,
    alternates: { canonical: url },
    openGraph: { title, description: desc, url, type: "product" },
  };
}

export default async function ProductPage({ params }:{ params: Promise<{category:string; id:string}> }) {
  const pr = await params;
  const product = await getProduct(pr);
  if (!product) notFound();

  const crumbs = [
    { href: "/", label: "Главная" },
    { href: "/catalog", label: "Каталог" },
    { href: `/catalog/${pr.category}`, label: product.categoryName ?? "Категория" },
    { href: `#`, label: product.name ?? product.title ?? "Товар" },
  ];

  return (
    <main className="container">
      <Breadcrumbs items={crumbs} />
      <BreadcrumbsJsonLd items={[
        { name: "Главная", item: "https://www.poj-pro.uz/" },
        { name: "Каталог", item: "https://www.poj-pro.uz/catalog" },
        { name: product.categoryName ?? "Категория", item: `https://www.poj-pro.uz/catalog/${pr.category}` },
        { name: product.name ?? product.title ?? "Товар", item: `https://www.poj-pro.uz/catalog/${pr.category}/${pr.id}` },
      ]} />
      <div className={styles.grid}>
        <Card className={styles.gallery}>
          <div className="aspect-square">
            <Image
              src={product.image || "/OtherPics/product2photo.jpg"}
              alt={product.name || product.title || "Product"}
              fill
              sizes={IMG_SIZES.pdp}
              priority
            />
          </div>
        </Card>

        <div className={styles.side}>
          <PurchaseCard price={product.price} onAdd={() => { /* TODO add to cart */ }} />
        </div>
      </div>

      <Tabs
        tabs={[
          { id: "desc", label: "Описание", content: <div dangerouslySetInnerHTML={{ __html: product.description ?? "—" }} /> },
          { id: "specs", label: "Характеристики", content: <SpecsTable specs={product.characteristics} /> },
          { id: "docs", label: "Документы", content: <DocsList docs={product.documents} /> },
        ]}
      />

      <ProductJsonLd p={product} />
    </main>
  );
}

function SpecsTable({ specs }:{ specs?: Record<string,string>|Array<{key:string;value:string}> }) {
  if (!specs) return <div>—</div>;
  const entries = Array.isArray(specs) ? specs.map(s=>[s.key, s.value]) : Object.entries(specs);
  return (
    <table className={styles.table}>
      <tbody>
        {entries.map(([k,v])=> (
          <tr key={k}><th>{k}</th><td>{v}</td></tr>
        ))}
      </tbody>
    </table>
  );
}
function DocsList({ docs }:{ docs?: Array<{title:string; href:string}> }) {
  if (!docs?.length) return <div>Документы не прикреплены</div>;
  return (
    <ul className={styles.docs}>
      {docs.map(d=> <li key={d.href}><a href={d.href} target="_blank" rel="noopener noreferrer">{d.title}</a></li>)}
    </ul>
  );
}

async function getProduct(params:{category:string; id:string}) {
  const locale = await getLocale();
  const dbProduct = await prisma.product.findUnique({
    where: { slug: params.id },
    include: {
      category: { select: { name: true, slug: true } },
      i18n: { where: { locale }, select: { title: true, summary: true, description: true } },
    },
  });
  if (!dbProduct) return null;

  let image = "/OtherPics/product2photo.jpg";
  if (typeof dbProduct.images === "string" && dbProduct.images.trim()) {
    try {
      const parsed = JSON.parse(dbProduct.images);
      if (Array.isArray(parsed) && parsed[0]) image = parsed[0];
      else image = dbProduct.images;
    } catch { image = dbProduct.images; }
  }
  const price = dbProduct.price != null ? Number(dbProduct.price as unknown as string) : undefined;
  return {
    id: dbProduct.id,
    title: dbProduct.i18n[0]?.title || dbProduct.slug,
    name: dbProduct.i18n[0]?.title || dbProduct.slug,
    short_description: dbProduct.i18n[0]?.summary || undefined,
    description: dbProduct.i18n[0]?.description || undefined,
    image,
    price,
    documents: undefined as Array<{title:string; href:string}> | undefined,
    characteristics: dbProduct.specs as Record<string,string> | undefined,
    categoryName: dbProduct.category?.name,
  };
}

function BreadcrumbsJsonLd({ items }:{items: {name:string; item:string}[]}) {
  const data = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, idx) => ({ "@type":"ListItem", position: idx+1, name: it.name, item: it.item }))
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(data)}} />;
}

type PDPJson = {
  name?: string;
  title?: string;
  image?: string;
  short_description?: string;
  description?: string;
  price?: string | number;
};

function ProductJsonLd({ p }:{ p:PDPJson }) {
  const data = {
    "@context": "https://schema.org/",
    "@type": "Product",
    name: p?.name || p?.title,
    image: p?.image ? [p.image] : undefined,
    description: p?.short_description || p?.description,
    offers: p?.price ? {
      "@type":"Offer",
      priceCurrency:"UZS",
      price:String(p.price).replace(/[^\d]/g,'') || undefined,
      availability:"https://schema.org/InStock",
      url: undefined
    } : undefined
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(data)}} />;
}
