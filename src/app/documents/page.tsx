import styles from './page.module.css';
import { loadDocuments } from '@/lib/documents';
import type { DocItem } from '@/types/content';
import DocumentsClient from './DocumentsClient';

export const dynamic = 'force-static';
export const revalidate = 60;

export const metadata = {
  title: 'Документы и сертификаты — POJ PRO',
  description: 'Официальные сертификаты, инструкции и нормативы. PDF для скачивания.',
  alternates: { canonical: 'https://www.poj-pro.uz/documents' },
  openGraph: { title: 'Документы', url: 'https://www.poj-pro.uz/documents' }
};

export default async function DocumentsPage() {
  const docs = await loadDocuments();
  const categories = Array.from(new Set(docs.map(d => d.category).filter(Boolean))) as string[];
  return (
    <main className={styles.wrap}>
      <h1>Документы</h1>
      <DocumentsClient allDocs={docs as DocItem[]} categories={categories} />
    </main>
  );
}
