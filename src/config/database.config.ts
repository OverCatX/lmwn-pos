import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

export const getDatabaseConfig = (
    configService: ConfigService,
): TypeOrmModuleOptions => {
    const isSSLEnabled = configService.get<string>('DB_SSL', 'false') === 'true';

    return {
        type: 'postgres',
        host: configService.get<string>('DB_HOST', 'localhost'),
        port: configService.get<number>('DB_PORT', 5432),
        username: configService.get<string>('DB_USERNAME', 'postgres'),
        password: configService.get<string>('DB_PASSWORD', 'postgres'),
        database: configService.get<string>('DB_NAME', 'pos_db'),
        entities: [
            __dirname + '/../infrastructure/database/order/entities/*.orm.entity{.ts,.js}',
            __dirname + '/../infrastructure/database/product/entities/*.orm.entity{.ts,.js}',
            __dirname + '/../infrastructure/database/discount/entities/*.orm.entity{.ts,.js}',
        ],
        migrations: [
            __dirname + '/../infrastructure/database/shared/migrations/*{.ts,.js}',
        ],
        synchronize: configService.get<boolean>('DB_SYNCHRONIZE', false), // false in production
        logging: configService.get<boolean>('DB_LOGGING', false),
        // Only set SSL if explicitly enabled
        ...(isSSLEnabled && {
            ssl: {
                rejectUnauthorized: false,
            },
        }),
        extra: {
            max: configService.get<number>('DB_MAX_CONNECTIONS', 10),
        },
    };
};
