'use client';

import { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { useTranslation } from '@/i18n/useTranslation';

interface AddToCartButtonProps {
  productId: string | number;
  quantity?: number;
  className?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export function AddToCartButton({ 
  productId,
  quantity = 1,
  className = '',
  variant = 'default',
  size = 'md'
}: AddToCartButtonProps) {
  const { t, i18n } = useTranslation();
  const { addItem, isInCart, updateQuantity } = useCart();
  const [isAdding, setIsAdding] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const variantClasses = {
    default: 'bg-[#660000] text-white hover:bg-[#8B0000]',
    outline: 'bg-transparent text-[#660000] border-2 border-[#660000] hover:bg-[#F8F0F0]',
    ghost: 'bg-transparent text-[#660000] hover:bg-[#F8F0F0]',
  };

  const sizeClasses = {
    sm: 'text-sm px-3 py-1.5',
    md: 'text-base px-4 py-2',
    lg: 'text-lg px-6 py-3',
  };

  const handleClick = async () => {
    if (isAdding) return;
    
    setIsAdding(true);
    
    try {
      // Fetch product details for current language (map our i18n codes to API)
      const raw = (i18n?.language || 'ru').toLowerCase();
      const lang = raw === 'eng' ? 'en' : raw === 'uzb' ? 'uz' : raw.startsWith('en') ? 'en' : raw.startsWith('uz') ? 'uz' : 'ru';
      const res = await fetch(`/api/products/${encodeURIComponent(String(productId))}?locale=${encodeURIComponent(lang)}`);
      if (!res.ok) throw new Error(`Failed to load product ${productId}`);
      const json = await res.json();
      const data = json?.data || {};
      const title: string = (data.title as string) || String(productId);
      const price: number = typeof data.price === 'number' ? data.price : 0;
      const image: string = Array.isArray(data.images) && data.images[0]
        ? data.images[0]
        : '/OtherPics/product2photo.jpg';

      // Add to cart (initial add is qty 1 or increments by 1)
      addItem(productId, price, title, image);

      // If a specific quantity greater than 1 is requested, set it explicitly
      if (typeof quantity === 'number' && quantity > 1) {
        updateQuantity(productId, quantity);
      }

      // Notify globally for cart pulse (+N) near the cart icon
      try {
        const delta = typeof quantity === 'number' && quantity > 1 ? quantity : 1;
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('cart:add', { detail: { delta } }));
        }
      } catch {}
      setIsSuccess(true);
      
      // Reset success state after 2 seconds
      setTimeout(() => {
        setIsSuccess(false);
      }, 2000);
    } catch (error) {
      console.error('Failed to add to cart:', error);
    } finally {
      setIsAdding(false);
    }
  };

  const buttonText = isSuccess 
    ? t('cart.addedToCart') || 'Added!'
    : isInCart(productId)
      ? t('cart.inCart') || 'In Cart'
      : t('cart.addToCart') || 'Add to Cart';

  return (
    <button
      onClick={handleClick}
      disabled={isAdding || isSuccess || isInCart(productId)}
      className={`
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${className}
        rounded-md font-medium transition-all duration-200 flex items-center justify-center
        ${isAdding ? 'opacity-75 cursor-not-allowed' : ''}
        ${isSuccess ? 'bg-green-600 hover:bg-green-700' : ''}
        ${isInCart(productId) ? 'bg-gray-400 hover:bg-gray-400 cursor-default' : ''}
      `}
      aria-label={t('cart.addToCart') || 'Add to cart'}
    >
      {isAdding ? (
        <>
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          {t('cart.adding') || 'Adding...'}
        </>
      ) : isSuccess ? (
        <>
          <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          {buttonText}
        </>
      ) : isInCart(productId) ? (
        <>
          <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          {buttonText}
        </>
      ) : (
        <>
          <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          {buttonText}
        </>
      )}
    </button>
  );
}

export default AddToCartButton;
