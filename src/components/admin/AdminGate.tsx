'use client';

import { useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminGate({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  // Next инлайнит значение во время сборки
  const ADMIN_PASSWORD =
    process.env.NEXT_PUBLIC_ADMIN_PASSWORD ?? 'admin-ship-2025';

  useEffect(() => {
    // проверка токена только на клиенте
    try {
      const token = localStorage.getItem('adminToken');
      setIsAuthenticated(token === ADMIN_PASSWORD);
    } catch {
      setIsAuthenticated(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      localStorage.setItem('adminToken', password);
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('Неверный пароль');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    setIsAuthenticated(false);
    router.push('/');
  };

  // Loading state
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <div className="w-10 h-10 rounded-full border-4 border-gray-300 border-t-[#660000] animate-spin" />
        <p className="text-gray-700">Проверка доступа...</p>
      </div>
    );
  }

  // Login form
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-5">
        <div className="w-full max-w-md bg-white border border-gray-200 shadow rounded-lg p-6 text-center">
          <h2 className="text-xl font-semibold text-black mb-6">
            Вход в панель администратора
          </h2>

          <form onSubmit={handleLogin} className="flex flex-col gap-4 text-left">
            <div>
              <label
                htmlFor="password"
                className="block mb-2 font-medium text-sm text-gray-700"
              >
                Пароль администратора
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Введите пароль"
                required
                className="w-full rounded border border-gray-300 px-3 py-2 text-base bg-white outline-none focus:border-[#660000] focus:ring-2 focus:ring-[#660000]/20"
              />
              {error && (
                <div className="text-red-500 text-sm mt-2">{error}</div>
              )}
            </div>

            <button
              type="submit"
              className="mt-1 inline-flex items-center justify-center rounded bg-[#660000] text-white px-4 py-2 font-medium hover:opacity-90 transition"
            >
              Войти
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Admin area
  return (
    <div>
      <div className="flex items-center justify-between px-6 py-4 !bg-[#660000] text-white mb-8">
        <h1 className="m-0 text-lg font-semibold">Панель администратора</h1>
        <button
          onClick={handleLogout}
          className="rounded bg-white/10 hover:bg-white/20 px-3 py-1.5 text-sm font-medium"
        >
          Выйти
        </button>
      </div>
      {children}
    </div>
  );
}
