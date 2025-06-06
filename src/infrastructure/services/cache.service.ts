import Redis from 'ioredis';
import { ScoreLevelStats } from '../../domain/value-objects/score-level';

class CacheService {
  private redis: Redis;
  private static instance: CacheService;

  private constructor() {
    this.redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: Number(process.env.REDIS_PORT) || 6379,
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      }
    });

    this.redis.on('error', (err) => {
      console.error('Redis connection error:', err);
    });
  }

  public static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService();
    }
    return CacheService.instance;
  }

  async getScoreLevelStats(): Promise<ScoreLevelStats[] | null> {
    try {
      const cached = await this.redis.get('score_level_stats');
      if (!cached) return null;
      return JSON.parse(cached);
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  async setScoreLevelStats(stats: ScoreLevelStats[]): Promise<void> {
    try {
      await this.redis.set('score_level_stats', JSON.stringify(stats), 'EX', 6000000);
    } catch (error) {
      console.error('Cache set error:', error);
    }
  }

  async clearCache(key?: string): Promise<void> {
    try {
      if (key) {
        await this.redis.del(key);
      } else {
        await this.redis.flushall();
      }
    } catch (error) {
      console.error('Cache clear error:', error);
    }
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const cached = await this.redis.get(key);
      if (!cached) return null;
      return JSON.parse(cached);
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  async set<T>(key: string, value: T, expirationSeconds: number = 300): Promise<void> {
    try {
      await this.redis.set(key, JSON.stringify(value), 'EX', expirationSeconds);
    } catch (error) {
      console.error('Cache set error:', error);
    }
  }
}

export default CacheService;