import { safeJson, getBaseUrl } from '@/lib/api';

// Resolve API base URL dynamically to respect deployment host (Railway, preview URLs, etc.)
async function getApiUrl(path: string): Promise<string> {
  const base = await getBaseUrl();
  return `${base.replace(/\/$/, '')}/api${path}`;
}

// Interface for category data
export interface Category {
  id: string;
  slug: string;
  name: string;
  description?: string;
  image?: string; // URL изображения
  imageData?: string; // Base64 encoded image data (для отображения из базы)
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
    const url = await getApiUrl('/categories');
    console.log('[categories] GET', url);
    const response = await fetch(url, {
      cache: 'no-store', // temporary: bypass caching for debugging
      // next: { revalidate: 0 },
    });
    console.log('[categories] status', response.status, response.statusText);
    const ct = response.headers.get('content-type') || '';
    console.log('[categories] content-type', ct);
    
    if (!response.ok) {
      const body = await response.text().catch(() => '');
      console.error('[categories] non-OK body first bytes:', body.slice(0, 200));
      throw new Error(`Failed to fetch categories: ${response.status} ${response.statusText}`);
    }
    
    console.log('[categories] parsing JSON ...');
    const data = await safeJson<{ categories: Category[] }>(response);
    console.log('[categories] Parsed categories data:', Array.isArray(data?.categories) ? `length=${data.categories.length}` : typeof data);
    return data?.categories || [];
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
}

// Get a single category by slug
export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  try {
    const url = await getApiUrl(`/categories/${encodeURIComponent(slug)}`);
    console.log('[category] GET', url);
    const response = await fetch(url, {
      cache: 'no-store',
    });
    console.log('[category] status', response.status, response.statusText);
    
    if (!response.ok) {
      return null;
    }
    
    console.log('[category] parsing JSON ...');
    const item = await safeJson<Category>(response);
    console.log('[category] parsed id/slug:', (item as any)?.id, (item as any)?.slug);
    return item;
  } catch (error) {
    console.error(`Error fetching category ${slug}:`, error);
    return null;
  }
}

// Get categories by parent ID
export async function getCategoriesByParent(parentId: string | null): Promise<Category[]> {
  try {
    const url = await getApiUrl('/categories' + (parentId ? `?parentId=${encodeURIComponent(parentId)}` : '?parentId=null'));
    console.log('[categoriesByParent] GET', url);
    const response = await fetch(url, {
      cache: 'no-store',
    });
    console.log('[categoriesByParent] status', response.status, response.statusText);
    
    if (!response.ok) {
      const body = await response.text().catch(() => '');
      console.error('[categoriesByParent] non-OK body first bytes:', body.slice(0, 200));
      throw new Error('Failed to fetch categories');
    }
    
    console.log('[categoriesByParent] parsing JSON ...');
    const data = await safeJson<Category[]>(response);
    console.log('[categoriesByParent] parsed length:', Array.isArray(data) ? data.length : 'n/a');
    return data || [];
  } catch (error) {
    console.error('Error fetching categories by parent:', error);
    return [];
  }
}

// Get all categories as a tree structure
export async function getCategoryTree(): Promise<Category[]> {
  try {
    const url = await getApiUrl('/categories/tree');
    console.log('[categoryTree] GET', url);
    const response = await fetch(url, { cache: 'no-store' });
    console.log('[categoryTree] status', response.status, response.statusText);
    
    if (!response.ok) {
      const body = await response.text().catch(() => '');
      console.error('[categoryTree] non-OK body first bytes:', body.slice(0, 200));
      throw new Error('Failed to fetch category tree');
    }
    
    console.log('[categoryTree] parsing JSON ...');
    const data = await safeJson<Category[]>(response);
    console.log('[categoryTree] parsed length:', Array.isArray(data) ? data.length : 'n/a');
    return data || [];
  } catch (error) {
    console.error('Error fetching category tree:', error);
    return [];
  }
}

// Get breadcrumbs for a category
export async function getCategoryBreadcrumbs(slug: string): Promise<Category[]> {
  try {
    const url = await getApiUrl(`/categories/${encodeURIComponent(slug)}/breadcrumbs`);
    console.log('[categoryBreadcrumbs] GET', url);
    const response = await fetch(url, { cache: 'no-store' });
    console.log('[categoryBreadcrumbs] status', response.status, response.statusText);
    
    if (!response.ok) {
      return [];
    }
    
    console.log('[categoryBreadcrumbs] parsing JSON ...');
    const data = await safeJson<Category[]>(response);
    console.log('[categoryBreadcrumbs] parsed length:', Array.isArray(data) ? data.length : 'n/a');
    return data || [];
  } catch (error) {
    console.error(`Error fetching breadcrumbs for category ${slug}:`, error);
    return [];
  }
}
