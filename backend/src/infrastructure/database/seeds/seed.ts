import { AppDataSource } from '../shared/data-source';
import { seedProducts } from './product.seed';
import { seedOrders } from './order.seed';

/**
 * Main Seed Runner
 * Run all seed functions
 */
async function runSeeds() {
    console.log('🌱 Starting database seeding...\n');

    try {
        // Initialize database connection
        await AppDataSource.initialize();
        console.log('✅ Database connected\n');

        // Run seed functions in order
        await seedProducts(AppDataSource);
        await seedOrders(AppDataSource);

        console.log('\n✅ All seeds completed successfully!');
    } catch (error) {
        console.error('❌ Error during seeding:', error);
        process.exit(1);
    } finally {
        // Close database connection
        await AppDataSource.destroy();
        console.log('🔌 Database connection closed');
    }
}

// Run seeds
runSeeds();
