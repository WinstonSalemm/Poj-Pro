import styles from './page.module.css';
import Card from '@/components/ui/Card/Card';
import { loadSupplies } from '@/lib/supplies';

export const dynamic = 'force-static';
export const revalidate = 60;

export const metadata = {
  title: 'Поставки — POJ PRO',
  description: 'Скоро приедут: актуальные поставки и партии.',
  alternates: { canonical: 'https://www.poj-pro.uz/supplies' },
};

export default async function SuppliesPage() {
  const items = await loadSupplies();
  return (
    <main className="container">
      <div className={styles.wrap}>
        <h1>Поставки</h1>
        <div className={styles.grid}>
          {items.map((s) => (
            <Card key={s.id} className={styles.card}>
              <div className={styles.head}>
                <div className={styles.supplier}>{s.supplier ?? 'Поставщик'}</div>
                <div className={styles.eta}>{s.eta ? `ETA: ${new Date(s.eta).toLocaleDateString('ru-RU')}` : 'ETA —'}</div>
              </div>
              {s.note && <div>{s.note}</div>}
              <ul className={styles.lines}>
                {s.lines.map((l, i) => (
                  <li key={i}>
                    {l.name} — {l.qty}
                    {l.unit ? ` ${l.unit}` : ''}
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      </div>
    </main>
  );
}
