import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * TypeORM DataSource for CLI commands (migrations, etc.)
 * This is separate from the NestJS TypeORM configuration
 */
export const AppDataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'pos_db',
    entities: [
        __dirname + '/../order/entities/*.orm.entity{.ts,.js}',
        __dirname + '/../product/entities/*.orm.entity{.ts,.js}',
        __dirname + '/../discount/entities/*.orm.entity{.ts,.js}',
    ],
    migrations: [__dirname + '/migrations/*{.ts,.js}'],
    synchronize: false,
    logging: process.env.DB_LOGGING === 'true',
    ssl: process.env.DB_SSL === 'true'
        ? {
            rejectUnauthorized: false,
        }
        : undefined,
});
