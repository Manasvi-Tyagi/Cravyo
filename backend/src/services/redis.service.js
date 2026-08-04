const { createClient } = require('redis');
const config = require('../config');

let client;
let available = false;

function getRedisClient() {
  if (!config.redisUrl) return null;
  if (!client) {
    client = createClient({ url: config.redisUrl });
    client.on('error', (error) => {
      available = false;
      console.error('[Redis]', error.message);
    });
    client.on('ready', () => { available = true; });
    client.on('end', () => { available = false; });
  }
  return client;
}

async function connectRedis() {
  const redis = getRedisClient();
  if (!redis) {
    console.warn('[Redis] REDIS_URL is not configured; cache is disabled');
    return false;
  }
  if (!redis.isOpen) await redis.connect();
  available = true;
  console.log('Redis cache connected');
  return true;
}

function isRedisAvailable() {
  return available && Boolean(client?.isReady);
}

async function getJson(key) {
  if (!isRedisAvailable()) return null;
  try {
    const value = await client.get(key);
    return value ? JSON.parse(value) : null;
  } catch (error) {
    console.error('[Redis] cache read failed:', error.message);
    return null;
  }
}

async function setJson(key, value, ttlSeconds = config.cacheTtlSeconds) {
  if (!isRedisAvailable()) return false;
  try {
    await client.set(key, JSON.stringify(value), { EX: ttlSeconds });
    return true;
  } catch (error) {
    console.error('[Redis] cache write failed:', error.message);
    return false;
  }
}

async function deleteKeys(...keys) {
  if (!isRedisAvailable() || keys.length === 0) return false;
  try {
    await client.del(keys);
    return true;
  } catch (error) {
    console.error('[Redis] cache invalidation failed:', error.message);
    return false;
  }
}

async function deleteByPattern(pattern) {
  if (!isRedisAvailable()) return 0;
  let deleted = 0;
  try {
    for await (const keys of client.scanIterator({ MATCH: pattern, COUNT: 100 })) {
      const batch = Array.isArray(keys) ? keys : [keys];
      if (batch.length) deleted += await client.del(batch);
    }
  } catch (error) {
    console.error('[Redis] pattern invalidation failed:', error.message);
  }
  return deleted;
}

async function closeRedis() {
  if (client?.isOpen) await client.quit();
  available = false;
}

module.exports = {
  connectRedis, getRedisClient, isRedisAvailable,
  getJson, setJson, deleteKeys, deleteByPattern, closeRedis,
};
