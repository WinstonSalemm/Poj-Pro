'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, SessionProvider } from 'next-auth/react';
import { Search } from 'lucide-react';

type User = {
  id: string;
  name: string | null;
  email: string;
  isAdmin: boolean;
  personalPromoCode: string | null;
  createdAt: string;
  _count: {
    orders: number;
  };
  orders: Array<{
    id: string;
    total: number;
    status: string;
    createdAt: string;
    _count: {
      items: number;
    };
  }>;
};

type PromoLookupResult =
  | {
      ok: true;
      found: true;
      code: string;
      discount: number;
      isActive: boolean;
      usedCount: number;
      user: {
        id: string;
        name: string | null;
        email: string;
        createdAt: string;
        isAdmin: boolean;
        ordersCount: number;
      } | null;
      note?: string;
    }
  | {
      ok: true;
      found: false;
      code: string;
      message: string;
    }
  | {
      ok: false;
      error: string;
    };

function AdminDashboardInner() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [promoQuery, setPromoQuery] = useState('');
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoResult, setPromoResult] = useState<PromoLookupResult | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (status === 'authenticated' && !session?.user?.isAdmin) {
      router.push('/');
      return;
    }

    const fetchUsers = async () => {
      try {
        const response = await fetch('/api/admin/users');
        if (!response.ok) {
          throw new Error('Failed to fetch users');
        }
        const data = await response.json();
        setUsers(data);
      } catch (err) {
        console.error('Error:', err);
        setError('Не удалось загрузить пользователей');
      } finally {
        setLoading(false);
      }
    };

    if (status === 'authenticated' && session?.user?.isAdmin) {
      fetchUsers();
    }
  }, [status, session, router]);

  const handlePromoSearch = async (e?: FormEvent) => {
    e?.preventDefault();
    const code = promoQuery.trim();
    if (!code) {
      setPromoResult({ ok: false, error: 'Введите промокод' });
      return;
    }

    setPromoLoading(true);
    setPromoResult(null);
    try {
      const res = await fetch(`/api/admin/promo-lookup?code=${encodeURIComponent(code)}`);
      const data = (await res.json()) as PromoLookupResult;
      setPromoResult(data);
    } catch {
      setPromoResult({ ok: false, error: 'Не удалось выполнить поиск' });
    } finally {
      setPromoLoading(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#660000] border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-white px-5 py-8 text-center text-red-700">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#660000] sm:text-3xl">Панель управления</h1>
        <p className="mt-1 text-sm text-gray-600">Обзор пользователей, промокодов и заказов</p>
      </div>

      {/* Promo verification */}
      <section className="rounded-2xl border border-[#660000]/15 bg-white p-5 shadow-[0_4px_16px_rgba(102,0,0,0.04)] sm:p-6">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-[#660000]">Проверка промокода</h2>
          <p className="mt-1 text-sm text-gray-500">
            Введите код клиента, чтобы проверить, есть ли он в системе, и кому принадлежит
          </p>
        </div>

        <form onSubmit={handlePromoSearch} className="flex flex-col gap-3 sm:flex-row">
          <input
            type="text"
            value={promoQuery}
            onChange={(e) => setPromoQuery(e.target.value.toUpperCase())}
            placeholder="Например: P69AE7NX"
            maxLength={16}
            autoComplete="off"
            spellCheck={false}
            className="min-h-11 flex-1 rounded-xl border border-gray-300 px-4 font-mono text-sm tracking-wider text-gray-900 placeholder:font-sans placeholder:tracking-normal placeholder:text-gray-400 focus:border-[#660000] focus:outline-none focus:ring-2 focus:ring-[#660000]/20"
          />
          <button
            type="submit"
            disabled={promoLoading}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#660000] px-5 text-sm font-semibold text-white hover:bg-[#8B0000] disabled:opacity-60"
          >
            <Search size={18} />
            {promoLoading ? 'Поиск…' : 'Проверить'}
          </button>
        </form>

        {promoResult ? (
          <div className="mt-4">
            {!promoResult.ok ? (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {promoResult.error}
              </div>
            ) : !promoResult.found ? (
              <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                <span className="font-semibold">Не найден:</span>{' '}
                <span className="font-mono tracking-wider">{promoResult.code}</span>
                <span className="mt-1 block text-amber-800/80">
                  Такого промокода в базе нет. Скидку применять нельзя.
                </span>
              </div>
            ) : (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm text-emerald-950">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex rounded-full bg-emerald-600 px-2.5 py-0.5 text-xs font-semibold text-white">
                    Найден
                  </span>
                  <span className="font-mono text-base font-bold tracking-[0.2em] text-[#660000]">
                    {promoResult.code}
                  </span>
                  <span className="rounded-lg bg-white/80 px-2 py-0.5 text-xs font-semibold text-gray-700">
                    −{promoResult.discount}%
                  </span>
                  <span
                    className={`rounded-lg px-2 py-0.5 text-xs font-medium ${
                      promoResult.isActive
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {promoResult.isActive ? 'Активен' : 'Неактивен'}
                  </span>
                </div>

                {promoResult.user ? (
                  <dl className="mt-3 grid gap-2 sm:grid-cols-2">
                    <div>
                      <dt className="text-xs text-emerald-800/70">Клиент</dt>
                      <dd className="font-medium">
                        {promoResult.user.name || 'Без имени'}
                        {promoResult.user.isAdmin ? (
                          <span className="ml-2 text-xs text-[#660000]">Admin</span>
                        ) : null}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-emerald-800/70">Email</dt>
                      <dd className="break-all font-medium">{promoResult.user.email}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-emerald-800/70">Регистрация</dt>
                      <dd className="font-medium">
                        {new Date(promoResult.user.createdAt).toLocaleDateString('ru-RU')}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-emerald-800/70">Заказов</dt>
                      <dd className="font-medium">{promoResult.user.ordersCount}</dd>
                    </div>
                  </dl>
                ) : (
                  <p className="mt-3 text-emerald-900/80">
                    {promoResult.note || 'Промокод есть в базе, но не привязан к пользователю.'}
                  </p>
                )}
              </div>
            )}
          </div>
        ) : null}
      </section>

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-[0_4px_16px_rgba(102,0,0,0.04)]">
        <div className="border-b border-gray-100 px-4 py-5 sm:px-6">
          <h2 className="text-lg font-semibold text-[#660000]">Пользователи</h2>
          <p className="mt-1 text-sm text-gray-500">
            Зарегистрированные аккаунты, персональные промокоды и заказы
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-[#F8F9FA]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Пользователь
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Промокод
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Регистрация
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Заказы
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Недавние
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-[#fff9f8]">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {user.name || 'Без имени'}
                    </div>
                    <div className="text-xs text-gray-500">
                      {user.isAdmin ? (
                        <span className="font-medium text-[#660000]">Admin</span>
                      ) : (
                        'User'
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {user.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {user.personalPromoCode ? (
                      <button
                        type="button"
                        onClick={async () => {
                          const code = user.personalPromoCode!;
                          setPromoQuery(code);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                          setPromoLoading(true);
                          setPromoResult(null);
                          try {
                            const res = await fetch(
                              `/api/admin/promo-lookup?code=${encodeURIComponent(code)}`,
                            );
                            setPromoResult((await res.json()) as PromoLookupResult);
                          } catch {
                            setPromoResult({ ok: false, error: 'Не удалось выполнить поиск' });
                          } finally {
                            setPromoLoading(false);
                          }
                        }}
                        className="rounded-lg bg-[#fff9f8] px-2 py-1 font-mono text-sm font-semibold tracking-wider text-[#660000] hover:bg-[#660000]/10"
                        title="Проверить этот промокод"
                      >
                        {user.personalPromoCode}
                      </button>
                    ) : (
                      <span className="text-sm text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {new Date(user.createdAt).toLocaleDateString('ru-RU')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {user._count.orders}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-1">
                      {user.orders.length > 0 ? (
                        user.orders.map((order) => (
                          <div key={order.id} className="text-sm text-gray-800">
                            <span className="font-medium">
                              {Number(order.total).toLocaleString('ru-RU')} UZS
                            </span>{' '}
                            <span className="text-gray-500">
                              · {new Date(order.createdAt).toLocaleDateString('ru-RU')}
                            </span>{' '}
                            <span
                              className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                                order.status === 'DELIVERED'
                                  ? 'bg-[#660000]/10 text-[#660000]'
                                  : order.status === 'CANCELLED'
                                    ? 'bg-gray-100 text-gray-600'
                                    : 'bg-[#f4c36b]/25 text-[#4b1300]'
                              }`}
                            >
                              {order.status}
                            </span>
                          </div>
                        ))
                      ) : (
                        <span className="text-sm text-gray-400">Нет заказов</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  return (
    <SessionProvider>
      <AdminDashboardInner />
    </SessionProvider>
  );
}
