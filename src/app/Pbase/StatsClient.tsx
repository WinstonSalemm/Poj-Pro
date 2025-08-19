'use client';

import useSWR from 'swr';
import { useEffect } from 'react';
import styles from './Pbase.module.css';
import { UsersMetrics } from '@/types/users';

const HEARTBEAT_INTERVAL = 60 * 1000; // 60 seconds

// Enhanced fetcher with error handling
const fetcher = async (url: string): Promise<UsersMetrics> => {
  const response = await fetch(url);
  if (!response.ok) {
    const error = new Error('An error occurred while fetching the data.') as Error & { status?: number };
    // Attach extra info to the error object
    error.status = response.status;
    throw error;
  }
  return response.json();
};

const sendHeartbeat = async () => {
  try {
    // @ts-expect-error - window.userId will be injected from auth context
    const userId = typeof window !== 'undefined' ? window.userId : null;
    if (userId) {
      const response = await fetch('/api/users/heartbeat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });
      
      if (!response.ok) {
        throw new Error(`Heartbeat failed with status: ${response.status}`);
      }
    }
  } catch (error) {
    console.error('Heartbeat failed:', error);
  }
};

export default function StatsClient() {
  const { data, error, isLoading, isValidating } = useSWR<UsersMetrics>(
    '/api/metrics/users',
    fetcher,
    {
      refreshInterval: 5000, // 5 seconds
      revalidateOnFocus: true,
      dedupingInterval: 1000, // 1 second
      errorRetryCount: 3,
      errorRetryInterval: 5000,
    }
  );

  // Set up heartbeat effect
  useEffect(() => {
    // Send initial heartbeat
    sendHeartbeat();
    
    // Set up interval for subsequent heartbeats
    const intervalId = setInterval(sendHeartbeat, HEARTBEAT_INTERVAL);
    
    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  // Format the last updated time
  const lastUpdated = data?.refreshedAt 
    ? new Date(data.refreshedAt).toLocaleString() 
    : 'загрузка...';

  // Show error state
  if (error) {
    return (
      <div role="alert" aria-live="polite">
        <div className={styles.error}>
          Ошибка загрузки данных. Пожалуйста, обновите страницу.
          {process.env.NODE_ENV === 'development' && (
            <div className={styles.errorDetails}>
              {error.message}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Show loading state
  if (isLoading) {
    return (
      <div role="status" aria-live="polite">
        <div className={styles.metricsGrid}>
          {[1, 2].map((i) => (
            <div key={i} className={styles.metricCard}>
              <div className={styles.metricValue}>—</div>
              <div className={styles.metricLabel}>
                {i === 1 ? 'Сейчас онлайн' : 'Всего зарегистрировано'}
              </div>
            </div>
          ))}
        </div>
        <div className={styles.updatedAt}>Загрузка...</div>
      </div>
    );
  }

  // Show data
  return (
    <div role="status" aria-live="polite">
      <div className={styles.metricsGrid}>
        <div className={styles.metricCard}>
          <div className={styles.metricValue}>
            {data?.online ?? '—'}
          </div>
          <div className={styles.metricLabel}>Сейчас онлайн</div>
        </div>
        
        <div className={styles.metricCard}>
          <div className={styles.metricValue}>
            {data?.total ?? '—'}
          </div>
          <div className={styles.metricLabel}>Всего зарегистрировано</div>
        </div>
      </div>
      
      <div className={styles.updatedAt}>
        {isValidating ? 'Обновление...' : `Обновлено: ${lastUpdated}`}
      </div>
    </div>
  );
}
