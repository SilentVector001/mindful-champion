
import { prisma } from '@/lib/db';

export class ApiCache {
  static async get(key: string): Promise<any | null> {
    try {
      const cached = await prisma.apiCache.findUnique({
        where: { cacheKey: key }
      });

      if (!cached) return null;
      
      // Check if expired
      if (new Date() > cached.expiresAt) {
        await prisma.apiCache.delete({ where: { id: cached.id } });
        return null;
      }

      return cached.data;
    } catch (error) {
      console.error(`Cache get error for key ${key}:`, error);
      return null;
    }
  }

  static async set(key: string, data: any, expirationMinutes: number = 30): Promise<void> {
    try {
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + expirationMinutes);

      await prisma.apiCache.upsert({
        where: { cacheKey: key },
        update: { data, expiresAt },
        create: { cacheKey: key, data, expiresAt }
      });
    } catch (error) {
      console.error(`Cache set error for key ${key}:`, error);
    }
  }

  static async invalidate(keyPattern: string): Promise<void> {
    try {
      await prisma.apiCache.deleteMany({
        where: {
          cacheKey: {
            contains: keyPattern
          }
        }
      });
    } catch (error) {
      console.error(`Cache invalidation error for pattern ${keyPattern}:`, error);
    }
  }

  static async cleanup(): Promise<void> {
    try {
      await prisma.apiCache.deleteMany({
        where: {
          expiresAt: {
            lt: new Date()
          }
        }
      });
    } catch (error) {
      console.error('Cache cleanup error:', error);
    }
  }
}
