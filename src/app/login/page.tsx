'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';

const MotionImg = dynamic(() => import('framer-motion').then(mod => mod.motion.img));
const MotionH2 = dynamic(() => import('framer-motion').then(mod => mod.motion.h2));
const MotionDiv = dynamic(() => import('framer-motion').then(mod => mod.motion.div));
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  // Always redirect home on success
  const { t } = useTranslation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await signIn('credentials', {
        redirect: false,
        email: email.toLowerCase().trim(),
        password,
      });

      if (result?.error) {
        setError(t('auth.loginPage.errors.invalidCredentials'));
      } else {
        router.push('/');
        router.refresh();
      }
    } catch {
      setError(t('auth.loginPage.errors.generic'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-full flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="absolute top-4 right-4">
        <LanguageSwitcher />
      </div>
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        {/* ЛОГО */}
        <MotionImg
          src="/OtherPics/logo.svg"
          alt="POJ PRO"
          className="mx-auto h-16 w-auto"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        />

        {/* Заголовок */}
        <MotionH2
          className="mt-6 text-center text-3xl font-extrabold text-[#660000]"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          {t('auth.loginPage.title')}
        </MotionH2>
      </div>

      <MotionDiv
        className="mt-8 sm:mx-auto sm:w-full sm:max-w-md"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {error && (
            <div className="mb-4 rounded-md bg-red-50 p-4">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                {t('auth.loginPage.email')}
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="!text-[#000] block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-[#660000] focus:outline-none focus:ring-[#660000] sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                {t('auth.loginPage.password')}
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="!text-[#000] block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-[#660000] focus:outline-none focus:ring-[#660000] sm:text-sm"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-sm">
                <Link
                  href="/register"
                  className="font-medium !text-[#660000] hover:text-[#7a1a1a]"
                >
                  {t('auth.loginPage.noAccount')}
                </Link>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className={`flex w-full justify-center rounded-md border border-transparent bg-[#660000] py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-[#7a1a1a] focus:outline-none focus:ring-2 focus:ring-[#660000] focus:ring-offset-2 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {isLoading ? t('auth.loginPage.signingIn') : t('auth.loginPage.signIn')}
              </button>
            </div>
          </form>
        </div>
      </MotionDiv>
    </div>
  );
}
