"use client";

import { useMemo, useState } from 'react';
import styles from './page.module.css';
import type { DocItem } from '@/types/content';

type Props = { allDocs: DocItem[]; categories: string[] };

export default function DocumentsClient({ allDocs, categories }: Props) {
  const [q, setQ] = useState('');
  const [cat, setCat] = useState<string>('');

  const filtered = useMemo(() => allDocs.filter(d => {
    const okQ = !q || (d.title?.toLowerCase().includes(q.toLowerCase()));
    const okC = !cat || d.category === cat;
    return okQ && okC;
  }), [q, cat, allDocs]);

  return (
    <div>
      <div className={styles.controls}>
        <input placeholder="Поиск…" value={q} onChange={e=>setQ(e.target.value)} />
        <select value={cat} onChange={e=>setCat(e.target.value)}>
          <option value="">Все категории</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      <div className={styles.grid}>
        {filtered.map(d => (
          <div key={d.id} className={styles.card}>
            <div className={styles.title}>{d.title}</div>
            <div className={styles.meta}>{d.category ?? '—'} · {d.sizeKb ? `${d.sizeKb} KB` : '—'}</div>
            <div className={styles.actions}>
              <a href={d.href} target="_blank" rel="noopener noreferrer" className={styles.link}>Открыть</a>
              <a href={d.href} download className={styles.link}>Скачать</a>
            </div>
          </div>
        ))}
        {filtered.length === 0 && <div>Нет документов</div>}
      </div>
    </div>
  );
}
