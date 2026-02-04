import { DataSource } from 'typeorm';
import { ProductOrmEntity } from '../product/entities/product.orm.entity';
import { randomUUID } from 'crypto';

/**
 * Seed Products
 * Create test products for development and testing
 */
export async function seedProducts(dataSource: DataSource): Promise<ProductOrmEntity[]> {
    const productRepo = dataSource.getRepository(ProductOrmEntity);

    // Check if products already exist
    const existingCount = await productRepo.count();
    if (existingCount > 0) {
        console.log(`Products already seeded (${existingCount} products found)`);
        return await productRepo.find();
    }

    // Create test products
    const products = [
        {
            id: randomUUID(),
            name: 'Pad Thai',
            description: 'Thai fried noodles with shrimp, peanuts, and lime',
            price: '120.00',
            currency: 'THB',
            category: 'Main Course',
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
            deletedAt: null,
        },
        {
            id: randomUUID(),
            name: 'Tom Yum Soup',
            description: 'Spicy and sour Thai soup with shrimp',
            price: '150.00',
            currency: 'THB',
            category: 'Soup',
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
            deletedAt: null,
        },
        {
            id: randomUUID(),
            name: 'Green Curry',
            description: 'Thai green curry with chicken and vegetables',
            price: '180.00',
            currency: 'THB',
            category: 'Main Course',
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
            deletedAt: null,
        },
        {
            id: randomUUID(),
            name: 'Mango Sticky Rice',
            description: 'Sweet sticky rice with ripe mango and coconut cream',
            price: '80.00',
            currency: 'THB',
            category: 'Dessert',
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
            deletedAt: null,
        },
        {
            id: randomUUID(),
            name: 'Thai Iced Tea',
            description: 'Sweet and creamy Thai tea served over ice',
            price: '50.00',
            currency: 'THB',
            category: 'Beverage',
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
            deletedAt: null,
        },
        {
            id: randomUUID(),
            name: 'Som Tam (Papaya Salad)',
            description: 'Spicy green papaya salad with tomatoes and peanuts',
            price: '90.00',
            currency: 'THB',
            category: 'Salad',
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
            deletedAt: null,
        },
        {
            id: randomUUID(),
            name: 'Massaman Curry',
            description: 'Rich and mild curry with beef, potatoes, and peanuts',
            price: '200.00',
            currency: 'THB',
            category: 'Main Course',
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
            deletedAt: null,
        },
        {
            id: randomUUID(),
            name: 'Spring Rolls',
            description: 'Crispy vegetable spring rolls with sweet chili sauce',
            price: '70.00',
            currency: 'THB',
            category: 'Appetizer',
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
            deletedAt: null,
        },
    ];

    const savedProducts = await productRepo.save(products);
    console.log(`✅ Seeded ${savedProducts.length} products successfully`);

    return savedProducts;
}
