import NodeCache from 'node-cache';

// TTL in seconds. Keys:
//   SETTINGS  — 10 min (admin rarely changes these)
//   CONTENT   — 10 min
//   CATEGORIES — 10 min
const cache = new NodeCache({ stdTTL: 600, checkperiod: 120, useClones: false });

export const CACHE_KEYS = {
  SETTINGS: 'settings',
  CONTENT: 'content',
  CATEGORIES: 'categories',
};

export const cacheGet = (key) => cache.get(key);
export const cacheSet = (key, value, ttl) => ttl ? cache.set(key, value, ttl) : cache.set(key, value);
export const cacheDel = (key) => cache.del(key);
export const cacheFlush = () => cache.flushAll();

export default cache;
