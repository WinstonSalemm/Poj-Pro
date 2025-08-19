"use client";

import { useTranslation } from '@/i18n/useTranslation';
import { useCart } from '@/context/CartContext';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// --- helpers ---

// Format price as currency
const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'UZS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

export default function CartPage() {
  const { t, i18n } = useTranslation();
  const { status } = useSession();
  const router = useRouter();

  const {
    state: { items },
    updateQuantity,
    removeItem,
    clearCart,
  } = useCart();

  const [, setCheckoutOpen] = useState(false);

  // Localized overrides for names/images by current language
  const [localized, setLocalized] = useState<Record<string | number, { name: string; image: string }>>({});

  useEffect(() => {
    if (!items.length) {
      setLocalized({});
      return;
    }

    const controller = new AbortController();
    const load = async () => {
      try {
        const raw = (i18n?.language || 'ru').toLowerCase();
        const lang = raw === 'eng' ? 'en' : raw === 'uzb' ? 'uz' : raw.startsWith('en') ? 'en' : raw.startsWith('uz') ? 'uz' : 'ru';
        const uniqueIds = Array.from(new Set(items.map((it) => String(it.id))));
        const results = await Promise.all(
          uniqueIds.map(async (id) => {
            try {
              const res = await fetch(`/api/products/${encodeURIComponent(id)}?locale=${encodeURIComponent(lang)}`, { signal: controller.signal });
              if (!res.ok) throw new Error('bad');
              const json = await res.json();
              const data = json?.data || {};
              const name = data.title || '';
              const image = Array.isArray(data.images) && data.images[0] ? data.images[0] : '';
              return [id, { name, image }] as const;
            } catch {
              return [id, { name: '', image: '' }] as const;
            }
          })
        );
        const map: Record<string | number, { name: string; image: string }> = {};
        for (const [id, val] of results) map[id] = val;
        setLocalized(map);
      } catch (e: unknown) {
        const err = e as { name?: string } | undefined;
        if (err?.name !== 'AbortError') {
          console.error('Failed to load localized cart items', e);
        }
      }
    };
    load();
    return () => controller.abort();
  }, [items, i18n?.language]);

  // ШТОРКА загрузки (как на других страницах)
  const [bootLoading, setBootLoading] = useState(true);
  useEffect(() => {
    const tm = setTimeout(() => setBootLoading(false), 800);
    return () => clearTimeout(tm);
  }, []);

  // Calculate total
  const total = items.reduce((sum, item) => sum + (Number(item.price) * item.qty), 0);
  const formattedTotal = formatPrice(total);

  const handleQuantityChange = (id: string | number, newQty: number) => {
    updateQuantity(id, newQty);
  };

  // === Модалки ===
  // 1) Подтверждение очистки корзины
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);
  const openClearModal = () => setIsClearModalOpen(true);
  const closeClearModal = () => setIsClearModalOpen(false);
  const confirmClearCart = () => {
    clearCart();
    setIsClearModalOpen(false);
  };

  // 2) Подтверждение удаления одного товара
  const [removeModalId, setRemoveModalId] = useState<number | null>(null);
  const openRemoveModal = (id: number) => setRemoveModalId(id);
  const closeRemoveModal = () => setRemoveModalId(null);
  const confirmRemoveOne = () => {
    if (removeModalId !== null) removeItem(removeModalId);
    setRemoveModalId(null);
  };

  // заменили window.confirm на открытие модалки
  const handleRemove = (id: number) => {
    openRemoveModal(id);
  };

  const handleCheckout = () => {
    if (status === 'unauthenticated') {
      const callbackUrl = encodeURIComponent(window.location.pathname);
      router.push(`/login?callbackUrl=${callbackUrl}`);
      return;
    }
    setCheckoutOpen(true);
  };

  const showSkeleton = bootLoading;

  if (!showSkeleton && items.length === 0) {
    // Пустая корзина (уже после шторки)
    return (
      <main className="container mx-auto mt-[100px] py-12 px-4 text-center relative">
        {/* ШТОРКА */}
        {bootLoading && (
          <div className="fixed inset-0 z-[60] bg-white text-black flex flex-col items-center justify-center animate-fadeIn">
            <div className="text-2xl font-semibold tracking-wide mb-6">...</div>
            <div className="w-[240px] h-[6px] rounded-full bg-black/10 overflow-hidden">
              <div className="h-full w-1/3 animate-slideBar rounded-full bg-black/70" />
            </div>
          </div>
        )}

        <h1 className="text-3xl font-bold !text-[#660000] mb-4">{t('cart.title') || 'Your Cart'}</h1>
        <div className="bg-white rounded-lg shadow-md p-8 max-w-2xl mx-auto">
          <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.3 4.6c-.3.6-.1 1.3.5 1.7.6.4 1.3.4 1.8 0L12 14m0 0l3.4 5.3c.5.4 1.2.4 1.8 0 .6-.4.8-1.1.5-1.7L17 13m-5 0h5m-5 0H7" />
          </svg>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            {t('cart.emptyTitle') || 'Your cart is empty'}
          </h2>
          <p className="text-gray-600 mb-6">
            {t('cart.emptyDescription') || "Looks like you haven't added any products to your cart yet."}
          </p>
          <Link href="/catalog" className="inline-block bg-[#660000] !text-white px-6 py-2 rounded-md hover:bg-[#8B0000] transition-colors">
            {t('cart.continueShopping') || 'Continue Shopping'}
          </Link>
        </div>

        {/* keyframes */}
        <style jsx global>{keyframesCss}</style>
      </main>
    );
  }

  const cartTotal = total;
  const currency = 'UZS';

  return (
    <main className="container mx-auto py-8 px-4 relative">
      {/* ШТОРКА (белая) */}
      {bootLoading && (
        <div className="fixed inset-0 z-[60] bg-white text-black flex flex-col items-center justify-center animate-fadeIn">
          <div className="text-2xl font-semibold tracking-wide mb-6">...</div>
          <div className="w-[240px] h-[6px] rounded-full bg-black/10 overflow-hidden">
            <div className="h-full w-1/3 animate-slideBar rounded-full bg-black/70" />
          </div>
        </div>
      )}

      <h1 className={`text-3xl font-bold !text-[#660000] mb-8 transition-opacity duration-500 ${bootLoading ? 'opacity-0' : 'opacity-100'}`}>
        {t('cart.title') || 'Your Cart'}
      </h1>

      <div className={`flex flex-col mt-[100px] lg:flex-row gap-8 transition-opacity duration-500 ${bootLoading ? 'opacity-0' : 'opacity-100'}`}>
        {/* Cart Items */}
        <div className="lg:w-2/3">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {/* header для десктопа */}
            <div className="hidden md:grid grid-cols-12 bg-gray-100 p-4 text-sm font-medium text-gray-600 uppercase">
              <div className="col-span-5 !text-[#660000]">{t('cart.product') || 'Product'}</div>
              <div className="col-span-2 text-center !text-[#660000]">{t('cart.price') || 'Price'}</div>
              <div className="col-span-3 text-center !text-[#660000]">{t('cart.quantity') || 'Quantity'}</div>
              <div className="col-span-2 text-right !text-[#660000]">{t('cart.total') || 'Total'}</div>
            </div>

            {/* список товаров / скелетоны */}
            {showSkeleton ? (
              <div className="divide-y divide-gray-200">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="p-4">
                    <div className="flex flex-col md:grid md:grid-cols-12 gap-4 items-center">
                      <div className="flex items-center space-x-4 col-span-5 w-full">
                        <div className="w-5 h-5 rounded shimmer" />
                        <div className="relative w-20 h-20 shimmer rounded" />
                        <div className="h-4 w-40 shimmer rounded" />
                      </div>
                      <div className="col-span-2 h-4 w-20 shimmer rounded" />
                      <div className="col-span-3 h-8 w-28 shimmer rounded" />
                      <div className="col-span-2 h-4 w-24 shimmer rounded self-stretch" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {items.map((item, idx) => {

                  return (
                    <div
                      key={item.id}
                      className="p-4 animate-in-up"
                      style={{ animationDelay: `${idx * 0.06}s`, animationFillMode: 'backwards' }}
                    >
                      <div className="flex flex-col md:grid md:grid-cols-12 gap-4 items-center">
                        {/* Product Info */}
                        <div className="flex items-center space-x-4 col-span-5 w-full">
                          <button
                            onClick={() => handleRemove(item.id)}
                            className="text-gray-400 hover:text-red-500 transition-colors"
                            aria-label={t('cart.remove') || 'Remove item'}
                          >
                            ✕
                          </button>

                          <div className="relative h-20 w-20 rounded-md overflow-hidden bg-gray-100">
                            {(localized[item.id]?.image || item.image) ? (
                              <Image
                                src={localized[item.id]?.image || item.image}
                                alt={localized[item.id]?.name || item.name || (t('cart.product') || 'Product')}
                                fill
                                sizes="80px"
                                className="object-contain p-1"
                              />
                            ) : (
                              <div className="w-20 h-20 bg-gray-200 rounded flex items-center justify-center text-gray-500 text-xs text-center p-2">
                                {t('cart.noImage') || 'No Image'}
                              </div>
                            )}
                          </div>

                          <div>
                            <h3 className="font-medium text-gray-900 text-sm sm:text-base">{localized[item.id]?.name || item.name || (t('cart.product') || 'Product')}</h3>
                            {/* Removed description as it's not in CartItem type */}
                          </div>
                        </div>

                        {/* Price */}
                        <div className="text-center text-gray-700 col-span-2">
                          <span className="font-medium">
                            {formatPrice(item.price)}
                          </span>
                        </div>

                        {/* Quantity */}
                        <div className="flex items-center justify-center col-span-3">
                          <div className="flex items-center border border-gray-300 rounded-md">
                            <button onClick={() => handleQuantityChange(item.id, item.qty - 1)} className="!text-[#660000] cursor-pointer px-3 py-1">-</button>
                            <span className="w-12 text-center !text-[#660000]">{item.qty}</span>
                            <button onClick={() => handleQuantityChange(item.id, item.qty + 1)} className="!text-[#660000] cursor-pointer px-3 py-1">+</button>
                          </div>
                        </div>

                        {/* Total */}
                        <div className="text-xl font-bold text-right !text-[#660000]">
                          {formatPrice(item.price * item.qty)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="mt-4 flex flex-col sm:flex-row justify-between gap-3">
            <Link href="/catalog" className="!text-[#660000] hover:!text-[#8B0000] font-medium flex items-center justify-center">
              ← {t('cart.continueShopping') || 'Continue Shopping'}
            </Link>

            {/* Кнопка открывает модалку очистки */}
            <button
              onClick={openClearModal}
              className="!text-[#660000] hover:!text-[#8B0000] text-sm font-medium"
            >
              {t('cart.clearCart') || 'Clear Shopping Cart'}
            </button>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:w-1/3">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold !text-[#660000] mb-4">
              {t('cart.orderSummary') || 'Order Summary'}
            </h2>
            {showSkeleton ? (
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="h-4 w-20 shimmer rounded" />
                  <span className="h-4 w-24 shimmer rounded" />
                </div>
                <div className="border-t pt-4">
                  <div className="flex justify-between">
                    <span className="h-5 w-16 shimmer rounded" />
                    <span className="h-5 w-24 shimmer rounded" />
                  </div>
                </div>
                <div className="pt-2">
                  <div className="h-10 w-full shimmer rounded-md" />
                </div>
                <div className="pt-2 space-y-2">
                  <div className="h-10 w-full shimmer rounded-md" />
                  <div className="h-10 w-full shimmer rounded-md" />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="!text-[#929292]">{t('cart.subtotal') || 'Subtotal'}</span>
                  <span className="!text-[#929292] font-medium">
                    {Math.round(cartTotal).toLocaleString('ru-UZ')} {currency}
                  </span>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between font-semibold text-lg">
                    <span className="!text-[#000000]">{t('cart.total') || 'Total'}</span>
                    <span className="!text-[#660000]">
                      {Math.round(cartTotal).toLocaleString('ru-UZ')} {currency}
                    </span>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={handleCheckout}
                    className="w-full bg-[#660000] text-white py-3 px-4 rounded-md hover:bg-[#8B0000] transition-colors font-medium disabled:opacity-70 disabled:cursor-not-allowed"
                    disabled={status === 'loading'}
                  >
                    {status === 'loading'
                      ? t('cart.loading') || 'Loading...'
                      : status === 'authenticated'
                        ? t('cart.checkout') || 'Proceed to Checkout'
                        : t('cart.loginToCheckout') || 'Login to Checkout'}
                  </button>
                </div>

                <div className="pt-2">
                  <a
                    href="tel:+9989099309101"
                    className="block w-full text-center border border-[#660000] !text-[#660000] py-3 px-4 rounded-md hover:bg-[#660000] hover:!text-white transition-colors font-medium"
                  >
                    +998 90 (99) 309 10 01
                  </a>
                </div>

                <div className="pt-2">
                  <a
                    href="https://t.me/Pro_security_uz"
                    target="_blank"
                    rel="noopener noreferrer"
                    title={t("footer.social.telegramTitle")}
                    className="block w-full text-center border border-[#660000] !text-[#660000] py-3 px-4 rounded-md hover:bg-[#660000] hover:!text-white transition-colors font-medium"
                  >
                    Telegram
                  </a>
                </div>

                <div className="text-center text-sm text-gray-500 mt-4">
                  <p>{t('cart.shippingNote') || 'Shipping & taxes calculated at checkout'}</p>
                </div>
              </div>
            )}
          </div>

          {/* <div className="mt-6 border border-gray-200 rounded-lg p-6">
            <h3 className="font-medium !text-[#660000] mb-2">
              {t('cart.needHelp') || 'Need help or have questions?'}
            </h3>
            <p className="text-sm !text-[#660000] mb-4">
              {t('cart.contactUs') || 'Call Customer Service at'}
              <a href="tel:+9989099309101" className="!text-[#660000] hover:underline ml-1">
                +998 90 (99) 309 10 01
              </a>
            </p>
            <p className="text-sm !text-[#660000]">{t('cart.returnPolicy') || 'See our return policy'}</p>
          </div> */}
        </div>
      </div>

      {/* Модалка подтверждения очистки корзины */}
      {isClearModalOpen && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 backdrop-blur-[2px]"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-2xl shadow-xl w-[90%] max-w-md p-6 border border-gray-200 animate-in-up"
               style={{ animationDelay: '0s', animationFillMode: 'backwards' }}>
            <h4 className="text-lg font-semibold !text-[#660000] mb-2">Точно удалить все товары?</h4>
            <p className="!text-[#660000] mb-6">Это действие очистит вашу корзину полностью.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-end">
              <button
                onClick={closeClearModal}
                className="w-full sm:w-auto px-4 py-2 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 !text-[#660000]"
              >
                Отмена
              </button>
              <button
                onClick={confirmClearCart}
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-[#660000] text-white hover:bg-[#8B0000]"
              >
                Удалить
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Модалка подтверждения удаления одного товара */}
      {removeModalId !== null && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 backdrop-blur-[2px]"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-2xl shadow-xl w-[90%] max-w-md p-6 border border-gray-200 animate-in-up"
               style={{ animationDelay: '0s', animationFillMode: 'backwards' }}>
            <h4 className="text-lg font-semibold !text-[#660000] mb-2">Удалить этот товар из корзины?</h4>
            <p className="!text-[#660000] mb-6">Действие нельзя будет отменить.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-end">
              <button
                onClick={closeRemoveModal}
                className="w-full sm:w-auto px-4 py-2 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 !text-[#660000]"
              >
                Отмена
              </button>
              <button
                onClick={confirmRemoveOne}
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-[#660000] text-white hover:bg-[#8B0000]"
              >
                Удалить
              </button>
            </div>
          </div>
        </div>
      )}

      {/* keyframes — как на остальных страницах */}
      <style jsx global>{keyframesCss}</style>
    </main>
  );
}

const keyframesCss = `
@keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
.animate-fadeIn { animation: fadeIn .25s ease-out }

@keyframes slideBar {
  0% { transform: translateX(-120%) }
  60% { transform: translateX(160%) }
  100% { transform: translateX(160%) }
}
.animate-slideBar { animation: slideBar 1.2s ease-in-out infinite }

@keyframes inUp {
  0% { opacity: 0; transform: translateY(16px) }
  100% { opacity: 1; transform: translateY(0) }
}
.animate-in-up { animation: inUp .6s cubic-bezier(.22,.61,.36,1) both }

.shimmer {
  position: relative;
  background: linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 37%, #f3f4f6 63%);
  background-size: 400% 100%;
  animation: shimmerMove 1.2s ease-in-out infinite;
}
@keyframes shimmerMove {
  0% { background-position: 100% 0 }
  100% { background-position: 0 0 }
}
`;
