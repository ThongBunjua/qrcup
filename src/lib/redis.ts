import { Redis } from '@upstash/redis';

const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

// Returns the Redis client. If credentials are not present, we will gracefully log
// and fallback, allowing the app to start even without Upstash variables immediately.
export const getRedisClient = (): Redis | null => {
  if (!redisUrl || !redisToken) {
    console.warn('Upstash Redis environment variables are missing. Cache is disabled.');
    return null;
  }
  
  return new Redis({
    url: redisUrl,
    token: redisToken,
  });
};

export const redis = getRedisClient();
