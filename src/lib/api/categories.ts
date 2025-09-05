import { SITE_URL } from '@/lib/site';
import { safeJson } from '@/lib/api';

// Base URL for API requests
const API_BASE_URL = `${SITE_URL}/api`;

// Interface for category data
export interface Category {
  id: string;
  slug: string;
  name: string;
  description?: string;
  image?: string;
  parentId: string | null;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  // Localized fields
  translations?: {
    [key: string]: {
      name: string;
      description?: string;
      slug: string;
    };
  };
}

// Get all categories
export async function getAllCategories(): Promise<Category[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/categories`, {
      next: { revalidate: 3600 }, // Revalidate every hour
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch categories');
    }
    
    const data = await safeJson<{ categories: Category[] }>(response);
    return data?.categories || [];
  } catch (error) {
    if (typeof process === 'undefined' || process.env.NODE_ENV !== 'production') {
      console.error('Error fetching categories:', error);
    }
    return [];
  }
}

// Get a single category by slug
export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/categories/${slug}`, {
      next: { revalidate: 3600 },
    });
    
    if (!response.ok) {
      return null;
    }
    
    return await safeJson<Category>(response);
  } catch (error) {
    if (typeof process === 'undefined' || process.env.NODE_ENV !== 'production') {
      console.error(`Error fetching category ${slug}:`, error);
    }
    return null;
  }
}

// Get categories by parent ID
export async function getCategoriesByParent(parentId: string | null): Promise<Category[]> {
  try {
    const url = parentId 
      ? `${API_BASE_URL}/categories?parentId=${parentId}`
      : `${API_BASE_URL}/categories?parentId=null`;
    
    const response = await fetch(url, {
      next: { revalidate: 3600 },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch categories');
    }
    
    const data = await safeJson<Category[]>(response);
    return data || [];
  } catch (error) {
    if (typeof process === 'undefined' || process.env.NODE_ENV !== 'production') {
      console.error('Error fetching categories by parent:', error);
    }
    return [];
  }
}

// Get all categories as a tree structure
export async function getCategoryTree(): Promise<Category[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/categories/tree`, {
      next: { revalidate: 3600 },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch category tree');
    }
    
    const data = await safeJson<Category[]>(response);
    return data || [];
  } catch (error) {
    if (typeof process === 'undefined' || process.env.NODE_ENV !== 'production') {
      console.error('Error fetching category tree:', error);
    }
    return [];
  }
}

// Get breadcrumbs for a category
export async function getCategoryBreadcrumbs(slug: string): Promise<Category[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/categories/${slug}/breadcrumbs`, {
      next: { revalidate: 3600 },
    });
    
    if (!response.ok) {
      return [];
    }
    
    const data = await safeJson<Category[]>(response);
    return data || [];
  } catch (error) {
    if (typeof process === 'undefined' || process.env.NODE_ENV !== 'production') {
      console.error(`Error fetching breadcrumbs for category ${slug}:`, error);
    }
    return [];
  }
}
