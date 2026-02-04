'use client';

import { useEffect, useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';

const MotionDiv = dynamic(() => import('framer-motion').then(mod => mod.motion.div));
const MotionImg = dynamic(() => import('framer-motion').then(mod => mod.motion.img));
const MotionButton = dynamic(() => import('framer-motion').then(mod => mod.motion.button));
import { useTranslation } from '@/i18n/useTranslation';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { trackAdsRegistration } from '@/components/analytics/events';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  // We no longer use callbackUrl for redirects after success; always go home
  const callbackUrl = '/';
  const { t } = useTranslation();

  // Google Ads: конверсия "Регистрация" по загрузке страницы регистрации
  useEffect(() => {
    try {
      trackAdsRegistration();
    } catch {
      // аналитика не должна ломать страницу
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError(t('auth.registerPage.errors.passwordLength'));
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), email: email.toLowerCase().trim(), password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || t('auth.registerPage.errors.generic'));
      }

      // Auto login после регистрации
      const result = await signIn('credentials', {
        redirect: false,
        email: email.toLowerCase().trim(),
        password,
      });

      if (result?.error) {
        router.push(`/login`);
      } else {
        router.push('/');
        router.refresh();
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : t('auth.registerPage.errors.generic'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-full flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="absolute top-4 right-4">
        <LanguageSwitcher />
      </div>
      <MotionDiv
        className="sm:mx-auto sm:w-full sm:max-w-md text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Лого */}
        <MotionImg
          src="/OtherPics/logo.svg"
          alt="POJ PRO"
          className="mx-auto h-16 w-auto"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        />

        <h2 className="mt-6 text-center text-3xl font-extrabold text-[#660000]">
          {t('auth.registerPage.title')}
        </h2>
      </MotionDiv>

      <MotionDiv
        className="mt-8 sm:mx-auto sm:w-full sm:max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >

        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {error && (
            <div className="mb-4 rounded-md bg-red-50 p-4">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-[#660000]">
                {t('auth.registerPage.name')}
              </label>
              <div className="mt-1">
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="!text-[#000] block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-[#660000] focus:ring-[#660000] sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[#660000]">
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
                  className="!text-[#000] block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-[#660000] focus:ring-[#660000] sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[#660000]">
                {t('auth.registerPage.password')}
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="!text-[#000] block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-[#660000] focus:ring-[#660000] sm:text-sm"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-sm">
                <span className="text-gray-600">{t('auth.registerPage.haveAccount')}</span>
                <Link
                  href={`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`}
                  className="font-medium !text-[#660000] hover:text-[#7a1a1a] ml-1"
                >
                  {t('auth.registerPage.signIn')}
                </Link>
              </div>
            </div>

            <div>
              <MotionButton
                type="submit"
                disabled={isLoading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`flex w-full justify-center rounded-md border border-transparent bg-[#660000] py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-[#7a1a1a] focus:outline-none focus:ring-2 focus:ring-[#660000] focus:ring-offset-2 ${
                  isLoading ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {isLoading ? t('auth.registerPage.registering') : t('auth.registerPage.register')}
              </MotionButton>
            </div>
          </form>
        </div>
      </MotionDiv>
    </div>
  );
}
