"use client";

import { useTranslation } from '@/i18n/useTranslation';
import { useCart } from '@/context/CartContext';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { trackBeginCheckout } from '@/components/analytics/events';
import { evRemoveFromCart } from '@/lib/analytics/dataLayer';

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

// Normalize image URLs: ensure leading slash for local files, strip public/ prefix
const normalizeImageUrl = (u?: string): string => {
  if (!u) return '';
  let s = String(u).trim();
  if (!s) return '';
  // keep external/data/blob URLs as-is
  if (/^(https?:|data:|blob:)/i.test(s)) return s;
  // strip leading ./ and public/ prefixes
  s = s.replace(/^\.\/+/, '');
  s = s.replace(/^public[\\/]/i, '');
  if (!s.startsWith('/')) s = '/' + s;
  return s;
};

const PLACEHOLDER_IMG = '/OtherPics/product2photo.jpg';

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

  // Runtime i18n fallback for RU/UZ if keys are missing in JSON (component scope)
  const ruMap: Record<string, string> = {
    'cart.clearConfirmTitle': 'Удалить все товары?',
    'cart.clearConfirmText': 'Это действие полностью очистит вашу корзину.',
    'cart.removeConfirmTitle': 'Удалить этот товар из корзины?',
    'cart.removeConfirmText': 'Действие нельзя будет отменить.',
    'cart.cancel': 'Отмена',
    'cart.delete': 'Удалить',
  };
  const uzMap: Record<string, string> = {
    'cart.clearConfirmTitle': 'Barcha mahsulotlarni o‘chirilsinmi?',
    'cart.clearConfirmText': 'Bu amal savatchangizdagi barcha mahsulotlarni o‘chiradi.',
    'cart.removeConfirmTitle': 'Ushbu mahsulot savatchadan o‘chirilsinmi?',
    'cart.removeConfirmText': 'Bu amalni bekor qilib bo‘lmaydi.',
    'cart.cancel': 'Bekor qilish',
    'cart.delete': 'O‘chirish',
  };
  const trCart = (key: string, def: string): string => {
    const out = t(key, { defaultValue: def }) as string;
    if (out && out !== key && out !== def) return out;
    const raw = (i18n?.language || 'ru').toLowerCase();
    if (raw.startsWith('ru')) return ruMap[key] || def;
    if (raw.startsWith('uz') || raw === 'uzb') return uzMap[key] || def;
    return def;
  };

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
              const existing = items.find((it) => String(it.id) === String(id));
              const name = (data.title as string) || existing?.name || String(id);
              const image = normalizeImageUrl(
                (Array.isArray(data.images) && data.images[0])
                  ? data.images[0]
                  : (existing?.image || PLACEHOLDER_IMG)
              );
              return [id, { name, image }] as const;
            } catch {
              const existing = items.find((it) => String(it.id) === String(id));
              return [
                id,
                {
                  name: existing?.name || String(id),
                  image: normalizeImageUrl(existing?.image || PLACEHOLDER_IMG),
                },
              ] as const;
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
  }, [items, i18n?.language, t]);

  // ШТОРКА загрузки (как на других страницах)
  const [bootLoading, setBootLoading] = useState(true);
  useEffect(() => {
    const tm = setTimeout(() => setBootLoading(false), 800);
    return () => clearTimeout(tm);
  }, []);

  // Calculate total
  const total = items.reduce((sum, item) => sum + (Number(item.price) * item.qty), 0);

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
  const [removeModalId, setRemoveModalId] = useState<string | number | null>(null);
  const openRemoveModal = (id: string | number) => setRemoveModalId(id);
  const closeRemoveModal = () => setRemoveModalId(null);
  const confirmRemoveOne = () => {
    if (removeModalId !== null) {
      try {
        const it = items.find(x => String(x.id) === String(removeModalId));
        if (it) {
          evRemoveFromCart({
            item_id: it.id,
            item_name: localized[it.id]?.name || it.name,
            price: Number(it.price) || undefined,
            quantity: it.qty || 1,
            currency: 'UZS',
          });
        }
      } catch {}
      removeItem(removeModalId);
    }
    setRemoveModalId(null);
  };

  // заменили window.confirm на открытие модалки
  const handleRemove = (id: string | number) => {
    openRemoveModal(id);
  };

  const handleCheckout = () => {
    if (status === 'unauthenticated') {
      const callbackUrl = encodeURIComponent(window.location.pathname);
      router.push(`/login?callbackUrl=${callbackUrl}`);
      return;
    }
    // Analytics: begin_checkout
    try {
      trackBeginCheckout({
        value: total,
        currency: 'UZS',
        items: items.map(it => ({ id: it.id, name: localized[it.id]?.name || it.name, price: it.price, quantity: it.qty })),
      });
    } catch {}
    setCheckoutOpen(true);
  };

  const showSkeleton = bootLoading;

  if (!showSkeleton && items.length === 0) {
    // Пустая корзина (уже после шторки)
    return (
      <main className="container-section mt-[100px] py-12 text-center relative">
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
          <Link href="/catalog" className="btn-primary inline-flex px-6 py-2">
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
    <main className="container-section py-8 relative">
      {/* ШТОРКА (белая) */}
      {bootLoading && (
        <div className="fixed inset-0 z-[60] bg-white text-black flex flex-col items-center justify-center animate-fadeIn">
          <div className="text-2xl font-semibold tracking-wide mb-6">...</div>
          <div className="w-[240px] h-[6px] rounded-full bg-black/10 overflow-hidden">
            <div className="h-full w-1/3 animate-slideBar rounded-full bg-black/70" />
          </div>
        </div>
      )}

      <h1 className={`text-3xl font-bold text-brand mb-8 transition-opacity duration-500 ${bootLoading ? 'opacity-0' : 'opacity-100'}`}>
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
                            {normalizeImageUrl(localized[item.id]?.image || item.image) ? (
                              <img
                                src={normalizeImageUrl(localized[item.id]?.image || item.image)}
                                alt={localized[item.id]?.name || item.name || (t('cart.product') || 'Product')}
                                className="absolute inset-0 w-full h-full object-contain p-1"
                                loading="lazy"
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
                        <div className="text-[15px] font-bold text-right !text-[#660000]">
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
            <Link href="/catalog" className="text-brand hover:text-[#8B0000] font-medium flex items-center justify-center">
              ← {t('cart.continueShopping') || 'Continue Shopping'}
            </Link>

            {/* Кнопка открывает модалку очистки */}
            <button
              onClick={openClearModal}
              className="btn-ghost text-sm"
            >
              {t('cart.clearCart') || 'Clear Shopping Cart'}
            </button>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:w-1/3">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-brand mb-4">
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
                    className="btn-primary w-full py-3 px-4 disabled:opacity-70 disabled:cursor-not-allowed"
                    disabled={status === 'loading'}
                    data-testid="cart-checkout-button"
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
                    href="tel:+998712536616"
                    className="btn-ghost w-full border-brand text-brand hover:bg-brand hover:text-white"
                  >
                    +998 71 253 66 16
                  </a>
                </div>

                <div className="pt-2">
                  <a
                    href="https://t.me/Pro_security_uz"
                    target="_blank"
                    rel="noopener noreferrer"
                    title={t("footer.social.telegramTitle")}
                    className="btn-ghost w-full border-brand text-brand hover:bg-brand hover:text-white"
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
            <h4 className="text-lg font-semibold !text-[#660000] mb-2">{trCart('cart.clearConfirmTitle', 'Clear all items?')}</h4>
            <p className="!text-[#660000] mb-6">{trCart('cart.clearConfirmText', 'This action will remove all items from your cart.')}</p>

            <div className="flex flex-col sm:flex-row gap-3 justify-end">
              <button
                onClick={closeClearModal}
                className="w-full sm:w-auto px-4 py-2 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 !text-[#660000]"
              >
                {trCart('cart.cancel', 'Cancel')}

              </button>
              <button
                onClick={confirmClearCart}
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-[#660000] text-white hover:bg-[#8B0000]"
              >
                {trCart('cart.delete', 'Delete')}

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
            <h4 className="text-lg font-semibold !text-[#660000] mb-2">{trCart('cart.removeConfirmTitle', 'Remove this item from the cart?')}</h4>
            <p className="!text-[#660000] mb-6">{trCart('cart.removeConfirmText', 'This action cannot be undone.')}</p>

            <div className="flex flex-col sm:flex-row gap-3 justify-end">
              <button
                onClick={closeRemoveModal}
                className="w-full sm:w-auto px-4 py-2 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 !text-[#660000]"
              >
                {trCart('cart.cancel', 'Cancel')}

              </button>
              <button
                onClick={confirmRemoveOne}
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-[#660000] text-white hover:bg-[#8B0000]"
              >
                {trCart('cart.delete', 'Delete')}

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
