'use client';

import React, { createContext, useContext, useReducer, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';

type CartItem = {
  id: string | number;
  qty: number;
  price: number;
  name: string;
  image: string;
};

type CartState = {
  items: CartItem[];
};

type CartAction =
  | { 
      type: 'ADD_ITEM'; 
      payload: { 
        id: string | number; 
        price: number;
        name: string;
        image: string;
      } 
    }
  | { type: 'REMOVE_ITEM'; payload: { id: string | number } }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string | number; qty: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'LOAD_CART'; payload: CartState }
  | { type: 'INIT_STORED'; payload: CartState };

interface ProductData {
  id: string | number;
  name: string;
  description: string;
  short_description: string;
  price: number;
  category: string;
  image: string;
  images: string[];
  characteristics: Record<string, string>;
  sku: string;
  in_stock: boolean;
  rating: number;
  reviews_count: number;
  [key: string]: unknown;
}

const CartContext = createContext<{
  state: CartState;
  addItem: (id: string | number, price: number, name: string, image: string) => void;
  removeItem: (id: string | number) => void;
  updateQuantity: (id: string | number, qty: number) => void;
  clearCart: () => void;
  getItemQuantity: (id: string | number) => number;
  getCartTotal: () => number;
  getCartItems: () => CartItem[];
  isInCart: (id: string | number) => boolean;
  getProductById: (id: string | number) => Promise<ProductData | null>;
} | null>(null);

// Load cart from localStorage
const loadCartFromStorage = (): CartState | null => {
  if (typeof window === 'undefined') return null;
  
  try {
    const savedCart = localStorage.getItem('cart');
    if (!savedCart) return null;
    const parsed = JSON.parse(savedCart);
    // Migration: older versions may have saved an array directly
    if (Array.isArray(parsed)) {
      return {
        items: parsed.map((it: any) => ({
          id: it.id,
          qty: typeof it.qty === 'number' ? it.qty : (typeof it.quantity === 'number' ? it.quantity : 1),
          price: typeof it.price === 'number' ? it.price : Number(it.price) || 0,
          name: typeof it.name === 'string' ? it.name : '',
          image: typeof it.image === 'string' ? it.image : ''
        }))
      } as CartState;
    }
    if (parsed && typeof parsed === 'object') {
      // If structure is { items: [...] } use it; otherwise treat as empty
      if (Array.isArray(parsed.items)) {
        return {
          items: parsed.items.map((it: any) => ({
            id: it.id,
            qty: typeof it.qty === 'number' ? it.qty : (typeof it.quantity === 'number' ? it.quantity : 1),
            price: typeof it.price === 'number' ? it.price : Number(it.price) || 0,
            name: typeof it.name === 'string' ? it.name : '',
            image: typeof it.image === 'string' ? it.image : ''
          }))
        } as CartState;
      }
    }
    return null;
  } catch (error) {
    console.error('Failed to load cart from storage', error);
    return null;
  }
};

// Save cart to localStorage
const saveCartToStorage = (cart: CartState) => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem('cart', JSON.stringify(cart));
  } catch (error) {
    console.error('Failed to save cart to storage', error);
  }
};

// (removed unused parsePrice helper)

// Cache for products by language
const productsCache = new Map<string, ProductData[]>();

// Type for API product response
interface ApiProduct {
  id: string | number;
  title?: string;
  description?: string;
  summary?: string;
  price?: number;
  category?: { name?: string };
  images?: string[];
  sku?: string;
}

// Function to fetch products from API
const fetchProducts = async (locale: string): Promise<ProductData[]> => {
  try {
    const response = await fetch(`/api/products?locale=${locale}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch products: ${response.statusText}`);
    }
    const data = await response.json();
    if (!data.success || !Array.isArray(data.data?.products)) {
      throw new Error('Failed to fetch products: Invalid response format');
    }
    
    // Map API response to ProductData type
    return data.data.products.map((product: ApiProduct) => ({
      id: product.id,
      name: product.title || '',
      description: product.description || '',
      short_description: product.summary || '',
      price: typeof product.price === 'number' ? product.price : 0,
      category: product.category?.name || '',
      image: product.images?.[0] || '',
      images: product.images || [],
      characteristics: {},
      sku: product.sku || '',
      in_stock: true,
      rating: 0,
      reviews_count: 0
    }));
  } catch (error) {
    console.error(`Error loading products for locale ${locale}:`, error);
    return [];
  }
};

// Function to get a single product by ID
const getProductById = async (id: string | number): Promise<ProductData | null> => {
  try {
    const response = await fetch(`/api/products/${id}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch product: ${response.statusText}`);
    }
    const data = await response.json();
    if (!data.success) {
      throw new Error('Failed to fetch product: Invalid response format');
    }
    
    const product = data.data;
    return {
      id: product.id,
      name: product.title || '',
      description: product.description || '',
      short_description: product.summary || '',
      price: typeof product.price === 'number' ? product.price : 0,
      category: product.category?.name || '',
      image: product.images?.[0] || '',
      images: product.images || [],
      characteristics: {},
      sku: product.sku || '',
      in_stock: true,
      rating: 0,
      reviews_count: 0
    };
  } catch (error) {
    console.error(`Error loading product with ID ${id}:`, error);
    return null;
  }
};

// Cart reducer
const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'ADD_ITEM':
      return {
        ...state,
        items: state.items.some(item => item.id === action.payload.id)
          ? state.items.map(item =>
              item.id === action.payload.id
                ? { ...item, qty: item.qty + 1 }
                : item
            )
          : [
              ...state.items, 
              { 
                id: action.payload.id, 
                qty: 1, 
                price: action.payload.price,
                name: action.payload.name,
                image: action.payload.image
              }
            ]
      };
      
    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter(item => item.id !== action.payload.id),
      };
      
    case 'UPDATE_QUANTITY':
      return {
        ...state,
        items: state.items.map(item =>
          item.id === action.payload.id ? { ...item, qty: action.payload.qty } : item
        ).filter(item => item.qty > 0)
      };

    case 'CLEAR_CART':
      return {
        ...state,
        items: []
      };

    case 'LOAD_CART':
    case 'INIT_STORED':
      return {
        ...state,
        items: action.payload.items || []
      };

    default:
      return state;
  }
};

export function CartProvider({ children }: { children: React.ReactNode }) {
  // Initialize from localStorage synchronously on first client render
  const [state, dispatch] = useReducer(
    cartReducer,
    undefined as unknown as CartState,
    () => (typeof window !== 'undefined' ? (loadCartFromStorage() ?? { items: [] }) : { items: [] })
  );
  const { i18n } = useTranslation();
  const currentLang = i18n.language;
  const hydratedRef = useRef(false);
  const lastMutationWasClear = useRef(false);
  const lastLangRef = useRef<string | null>(null);

  // After mount, mark hydration complete and reconcile with storage if needed
  useEffect(() => {
    const saved = loadCartFromStorage();
    if (saved) {
      dispatch({ type: 'INIT_STORED', payload: saved });
    }
    hydratedRef.current = true;
  }, []);
  // (no effect-based INIT; reducer initializer handles it)

  // Load products for the current language
  useEffect(() => {
    const loadProductsForLanguage = async () => {
      if (!currentLang) return;
      
      if (!productsCache.has(currentLang)) {
        const products = await fetchProducts(currentLang);
        productsCache.set(currentLang, products);
      }
    };
    
    loadProductsForLanguage();
  }, [currentLang]);

  // Persist cart state whenever it changes (but only after hydration)
  useEffect(() => {
    if (!hydratedRef.current) return;
    // Avoid overwriting a previously saved, non-empty cart with empty state unless it was an explicit clear
    if (state.items.length === 0 && !lastMutationWasClear.current) return;
    saveCartToStorage(state);
    lastMutationWasClear.current = false;
  }, [state]);

  // (removed language-change refresh to restore previous behavior)

  // Cart actions
  const addItem = useCallback((id: string | number, price: number, name: string, image: string) => {
    dispatch({ 
      type: 'ADD_ITEM', 
      payload: { 
        id, 
        price,
        name,
        image
      } 
    });
  }, []);

  const removeItem = useCallback((id: string | number) => {
    dispatch({ type: 'REMOVE_ITEM', payload: { id } });
  }, []);

  const updateQuantity = useCallback((id: string | number, qty: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id, qty } });
  }, []);

  const clearCart = useCallback(() => {
    dispatch({ type: 'CLEAR_CART' });
    lastMutationWasClear.current = true;
  }, []);

  const getItemQuantity = useCallback((id: string | number): number => {
    return state.items.find(item => item.id === id)?.qty || 0;
  }, [state.items]);

  const getCartTotal = useCallback((): number => {
    return state.items.reduce((total, item) => total + (item.price * item.qty), 0);
  }, [state.items]);

  const getCartItems = useCallback((): CartItem[] => {
    return [...state.items];
  }, [state.items]);

  const isInCart = useCallback((id: string | number): boolean => {
    return state.items.some(item => item.id === id);
  }, [state.items]);

  const contextValue = {
    state,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    getItemQuantity,
    getCartTotal,
    getCartItems,
    isInCart,
    getProductById,
  };

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
