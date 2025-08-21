// Base type for product characteristics (can have undefined values)
type ProductCharacteristics = {
  [key: string]: string | undefined;
};

// Type for the product data structure based on actual JSON structure
interface ProductData {
  id: number | string; // Can be either number or string
  name: string;
  description: string;
  short_description: string;
  price: string | number; // Can be string (e.g., "1 500 000") or number
  category: string;
  image: string;
  characteristics: ProductCharacteristics;
  sku?: string;
  in_stock?: boolean;
  rating?: number;
  reviews_count?: number;
  images?: string[];
  [key: string]: unknown; // Allow for additional properties
}

// Normalized product type with consistent field types
export interface Product {
  id: string; // Always string
  name: string;
  description: string;
  short_description: string;
  price: number; // Always number
  formattedPrice: string; // Formatted price string
  category: string;
  image: string;
  images: string[]; // Always an array, even if empty
  characteristics: Record<string, string>; // No undefined values
  sku: string;
  in_stock: boolean;
  rating: number;
  reviews_count: number;
  [key: string]: unknown; // Allow for additional properties
}

import { SITE_URL } from '@/lib/site';
import { safeJson } from '@/lib/api';

// Local helper to resolve base URL if not provided by SITE_URL export
// Trim trailing slashes for safe concatenation
function getBaseUrl(): string {
  const fromEnv =
    (typeof process !== 'undefined' && (process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL)) ||
    (typeof process !== 'undefined' && process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '') ||
    '';
  return (fromEnv || '').replace(/\/+$/, '');
}

// Helper function to load products from API with proper typing
async function loadProducts(locale: string): Promise<ProductData[]> {
  // Early fallback: if base URL is empty, avoid network during SSG/CI
  const base = (SITE_URL || getBaseUrl()).replace(/\/+$/, '');
  if (!base) return [];

  try {
    // Fetch products from API (must use absolute URL during SSG)
    const options: RequestInit & { next: { revalidate: number } } = {
      next: { revalidate: 60 },
    };
    const response = await fetch(
      `${base}/api/products?locale=${encodeURIComponent(locale)}`,
      options
    );
    if (!response.ok) {
      return [];
    }
    const data = (await safeJson(response)) as Record<string, unknown>;
    // Keep mapping compatible with data?.data?.products ?? data ?? []
    const container = (data && typeof data === 'object' ? data : {}) as Record<string, unknown>;
    const inner = (container.data && typeof container.data === 'object' ? (container.data as Record<string, unknown>) : undefined);
    const products = ((inner?.products as unknown) ?? (data as unknown) ?? []) as Array<{
      id: string;
      title?: string;
      description?: string;
      summary?: string;
      price?: number;
      category?: { name?: string };
      images?: string[];
      sku?: string;
    }>;

    return Array.isArray(products)
      ? products.map((product) => ({
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
        }))
      : [];
  } catch (error) {
    if (typeof process === 'undefined' || process.env.NODE_ENV !== 'production') {
      console.error(`Error loading products for locale ${locale}:`, error);
    }
    return [];
  }
}

// Type guard to check if the data is a valid ProductData object
function isProductData(data: unknown): data is ProductData {
  if (typeof data !== 'object' || data === null) return false;
  
  const product = data as ProductData;
  return (
    (typeof product.id === 'number' || typeof product.id === 'string') &&
    typeof product.name === 'string' &&
    typeof product.description === 'string' &&
    typeof product.short_description === 'string' &&
    (typeof product.price === 'string' || typeof product.price === 'number') &&
    typeof product.category === 'string' &&
    typeof product.image === 'string' &&
    product.characteristics !== null &&
    typeof product.characteristics === 'object'
  );
}

// Type guard to check if the imported data is a ProductData array
function isProductArray(data: unknown): data is ProductData[] {
  return Array.isArray(data) && data.every(isProductData);
}

// Process and normalize product data
function normalizeProduct(product: ProductData): Product {
  // Convert id to string if it's a number
  const id = typeof product.id === 'number' ? product.id.toString() : product.id;
  
  // Convert price to number if it's a string
  const priceStr = typeof product.price === 'string' 
    ? product.price.replace(/\s+/g, '') // Remove spaces from price strings like "1 500 000"
    : product.price.toString();
  const price = parseFloat(priceStr) || 0;
  
  // Format price with spaces for display
  const formattedPrice = product.price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  
  // Ensure characteristics has no undefined values
  const characteristics = Object.fromEntries(
    Object.entries(product.characteristics || {})
      .filter(([, value]) => value !== undefined && value !== null)
      .map(([key, value]) => [key, String(value)])
  );
  
  return {
    ...product,
    id,
    price,
    formattedPrice,
    images: product.images || [product.image],
    characteristics,
    sku: product.sku || `SKU-${id}`,
    in_stock: product.in_stock ?? true,
    rating: product.rating ?? 0,
    reviews_count: product.reviews_count ?? 0
  };
}

// Process and validate the imported products
function processProducts(products: unknown): Product[] {
  if (!isProductArray(products)) {
    console.warn('Invalid products data format');
    return [];
  }
  
  try {
    return products.map(normalizeProduct);
  } catch (error) {
    if (typeof process === 'undefined' || process.env.NODE_ENV !== 'production') {
      console.error('Error normalizing products:', error);
    }
    return [];
  }
}

export async function getAllProducts(): Promise<Product[]> {
  try {
    // Load all product lists in parallel
    const [ruProducts, enProducts, uzProducts] = await Promise.all([
      loadProducts('ru'),
      loadProducts('en'),
      loadProducts('uz')
    ]);

    // Process each product list
    const processedRu = processProducts(ruProducts);
    const processedEn = processProducts(enProducts);
    const processedUz = processProducts(uzProducts);

    // Combine all products and remove duplicates by ID
    const allProducts = [...processedRu, ...processedEn, ...processedUz];
    const uniqueProducts = Array.from(
      new Map(allProducts.map((p) => [p.id, p])).values()
    );

    return uniqueProducts;
  } catch (error) {
    if (typeof process === 'undefined' || process.env.NODE_ENV !== 'production') {
      console.error('Error loading products:', error);
    }
    return [];
  }
}

export async function getProductById(id: string): Promise<Product | null> {
  const products = await getAllProducts();
  return products.find((p) => p.id === id) || null;
}

export async function getProductsByCategory(category: string): Promise<Product[]> {
  const products = await getAllProducts();
  return products.filter((p) => p.category === category);
}
