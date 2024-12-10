import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { sqlConfigService } from "./mysql-config.service";
import { redisClientFactory } from "./redis-config.service";
import { RedisRepository } from "./redis.repository";
import { RedisService } from "@/src/services/helpers/cache/redis-cache-impl";

@Module({
  imports: [
    SequelizeModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: sqlConfigService,
    }),
  ],
  providers: [redisClientFactory, RedisRepository, RedisService],
  exports: [],
})
export class DatabaseModule {}
