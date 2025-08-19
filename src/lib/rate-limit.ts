// Simple in-memory store for rate limiting
interface RateLimitStore {
  [key: string]: { count: number; resetAt: number };
}

// Simple in-memory store
const store: RateLimitStore = {};

// Clean up old entries every hour
setInterval(() => {
  const now = Date.now();
  Object.keys(store).forEach(key => {
    if (store[key].resetAt < now) {
      delete store[key];
    }
  });
}, 60 * 60 * 1000); // Run every hour

type Options = {
  interval?: number; // Time window in milliseconds
  uniqueTokens?: number; // Max unique IPs to track
};

export const rateLimit = (options?: Options) => {
  const interval = options?.interval || 60 * 1000; // 1 minute by default
  const uniqueTokens = options?.uniqueTokens || 1000; // Max 1000 unique IPs to track

  return {
    check: async (limit: number, token: string): Promise<{ headers: Headers; isRateLimited: boolean }> => {
      const now = Date.now();
      const resetAt = now + interval;
      
      // Initialize or get token data
      if (!store[token]) {
        // If we've reached max unique tokens, reject
        if (Object.keys(store).length >= uniqueTokens) {
          const headers = new Headers();
          headers.set('X-RateLimit-Limit', limit.toString());
          headers.set('X-RateLimit-Remaining', '0');
          headers.set('Retry-After', '60');
          return { headers, isRateLimited: true };
        }
        
        store[token] = { count: 1, resetAt };
      } else if (store[token].resetAt < now) {
        // Reset counter if window has passed
        store[token] = { count: 1, resetAt };
      } else {
        // Increment counter
        store[token].count += 1;
      }
      
      const currentUsage = store[token].count;
      const isRateLimited = currentUsage > limit;
      
      // Set headers
      const headers = new Headers();
      headers.set('X-RateLimit-Limit', limit.toString());
      headers.set('X-RateLimit-Remaining', Math.max(0, limit - currentUsage).toString());
      
      if (isRateLimited) {
        headers.set('Retry-After', '60');
      }
      
      return { headers, isRateLimited };
    },
  };
};

// Default rate limiter: 100 requests per minute per IP
export const limiter = rateLimit({
  interval: 60 * 1000, // 1 minute
  uniqueTokens: 1000, // Max 1000 unique IPs
});
