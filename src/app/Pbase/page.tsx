import dynamic from 'next/dynamic';
import styles from './Pbase.module.css';

// Dynamically import the client component
const StatsClient = dynamic(() => import('./StatsClient'));

export default function PbasePage() {
  return (
    <main className={styles.container}>
      <h1 className={styles.title}>Статистика пользователей</h1>
      <StatsClient />
    </main>
  );
}
