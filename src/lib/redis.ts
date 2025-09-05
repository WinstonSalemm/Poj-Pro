import Redis from 'ioredis';

export const cacheKeys = {
  products: (locale: string) => `products:${locale}`,
  category: (locale: string) => `categories:${locale}`,
  // Add other cache keys as needed
};

const isBuild = process.env.NEXT_PHASE === 'phase-production-build' || process.env.DISABLE_REDIS === '1';
const mem = new Map<string, {v:string; exp:number}>();
const memGet = (k:string) => { const x=mem.get(k); return x && x.exp>Date.now() ? x.v : null; };
const memSet = (k:string,v:string,ttl=60)=>{ mem.set(k,{v,exp:Date.now()+ttl*1000}); };

let client: Redis | null = null;
function getRedis() {
  if (isBuild) return null;
  const url = process.env.REDIS_URL;
  if (!url) return null;
  if (!client) {
    client = new Redis(url, {
      maxRetriesPerRequest: 1,
      retryStrategy: () => null,
      enableOfflineQueue: false,
    }).on('error', () => {});
  }
  return client;
}

export async function cacheGet(key: string) {
  const r = getRedis();
  if (!r) return memGet(key);
  try { return await r.get(key); } catch { return memGet(key); }
}

export async function cacheSet(key: string, val: string, ttl=60) {
  if (isBuild) return;
  const redis = getRedis();
  if (redis) {
    await redis.set(key, val, 'EX', ttl);
  } else {
    memSet(key, val, ttl);
  }
}

export async function cacheDel(key: string) {
  if (isBuild) return;
  const redis = getRedis();
  if (redis) {
    await redis.del(key);
  } else {
    mem.delete(key);
  }
}

