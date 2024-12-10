import { Inject, Injectable, OnModuleDestroy } from "@nestjs/common";
import { Redis } from "ioredis";

@Injectable()
export class RedisRepository implements OnModuleDestroy {
  constructor(@Inject("REDIS_CLIENT") private readonly redisClient: Redis) {}

  onModuleDestroy(): void {
    this.redisClient.disconnect();
  }

  getRedisClient() {
    return this.redisClient;
  }

  async get(key: string): Promise<string | null> {
    return this.redisClient.get(key);
  }

  async set(key: string, value: string): Promise<void> {
    await this.redisClient.set(key, value);
  }

  async delete(key: string): Promise<void> {
    await this.redisClient.del(key);
  }

  async setWithExpiry(
    key: string,
    value: string,
    expiryInSec: number
  ): Promise<void> {
    await this.redisClient.set(key, value, "EX", expiryInSec);
  }

  async keys(pattern: string) {
    return this.redisClient.keys(pattern);
  }
}
