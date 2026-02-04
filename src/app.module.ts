import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HealthService } from './common/health/health.service';
import { getDatabaseConfig } from './config/database.config';
import appConfig from './config/app.config';

// Feature Modules
import { OrdersModule } from './modules/orders';

@Module({
  imports: [
    // Configuration Module
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig],
      envFilePath: ['.env.local', '.env'],
    }),
    // TypeORM Module (Singleton Pattern)
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: getDatabaseConfig,
      inject: [ConfigService],
    }),
    // Feature Modules
    OrdersModule,
  ],
  controllers: [AppController],
  providers: [AppService, HealthService],
})
export class AppModule { }
