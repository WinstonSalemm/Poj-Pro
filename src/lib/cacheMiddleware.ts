import { NextRequest, NextResponse } from 'next/server';
import { cacheGet, cacheSet, cacheDel } from './redis';

export interface CacheOptions {
  ttl?: number;
  keyGenerator?: (req: NextRequest) => string;
  skipCache?: (req: NextRequest) => boolean;
}

export function withApiCache(options: CacheOptions = {}) {
  return function (handler: (req: NextRequest) => Promise<NextResponse>) {
    return async function (req: NextRequest): Promise<NextResponse> {
      const {
        ttl = 3600,
        keyGenerator = (req) => `api:${req.url}`,
        skipCache = () => false
      } = options;

      // Skip cache for mutations or if explicitly disabled
      if (req.method !== 'GET' || skipCache(req)) {
        return handler(req);
      }

      const cacheKey = keyGenerator(req);
      
      try {
        // Try to get from cache
        const cached = await cacheGet(cacheKey);
        if (cached !== null) {
          // cached is a JSON string; return as-is without double-stringifying
          return new NextResponse(cached, {
            status: 200,
            headers: {
              'Content-Type': 'application/json',
              'X-Cache': 'HIT',
              'Cache-Control': `public, max-age=${ttl}`,
            },
          });
        }

        // Execute handler
        const response = await handler(req);
        
        // Cache successful responses
        if (response.status === 200) {
          const responseData = await response.json();
          await cacheSet(cacheKey, JSON.stringify(responseData), ttl);
          
          return new NextResponse(JSON.stringify(responseData), {
            status: 200,
            headers: {
              'Content-Type': 'application/json',
              'X-Cache': 'MISS',
              'Cache-Control': `public, max-age=${ttl}`,
            },
          });
        }

        return response;
      } catch (error) {
        console.error('Cache middleware error:', error);
        return handler(req);
      }
    };
  };
}

// Database query caching wrapper
export async function cachedQuery<T>(
  key: string,
  queryFn: () => Promise<T>,
  ttl: number = 3600
): Promise<T> {
  const cached = await cacheGet(key);
  if (cached !== null) {
    try {
      return JSON.parse(cached) as T;
    } catch (e) {
      console.error('Failed to parse cached data for key:', key, e);
      // Continue to fetch fresh data if parsing fails
    }
  }
  
  const fresh = await queryFn();
  await cacheSet(key, JSON.stringify(fresh), ttl);
  return fresh;
}

// Prisma query caching helpers
function withPrismaCache<T>(
  model: string,
  operation: string,
  args?: unknown
) {
  const cacheKey = `prisma:${model}:${operation}:${JSON.stringify(args || {})}`;
  
  return {
    cacheKey,
    get: async (): Promise<T | null> => {
      const result = await cacheGet(cacheKey);
      return result ? JSON.parse(result) as T : null;
    },
    set: (data: T, ttl?: number) => cacheSet(cacheKey, JSON.stringify(data), ttl),
    invalidate: () => cacheDel(cacheKey),
  };
}
