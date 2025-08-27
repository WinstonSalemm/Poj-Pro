import Link from "next/link";
import styles from "./Breadcrumbs.module.css";

export type Crumb = { href: string; label: string };

export default function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav className={styles.wrap} aria-label="Breadcrumb">
      <ol className={styles.list}>
        {items.map((c, i) => (
          <li
            key={c.href}
            className={styles.item}
            aria-current={i === items.length - 1 ? "page" : undefined}
          >
            {i < items.length - 1 ? <Link href={c.href}>{c.label}</Link> : <span>{c.label}</span>}
          </li>
        ))}
      </ol>
    </nav>
  );
}
