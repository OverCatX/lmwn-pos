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

    // Create test products (realistic Thai restaurant menu)
    const products = [
        // Main Courses (hot sellers)
        { id: randomUUID(), name: 'Pad Thai', description: 'Thai fried noodles with shrimp, peanuts, and lime', price: '120.00', currency: 'THB', category: 'Main Course', isActive: true, createdAt: new Date(), updatedAt: new Date(), deletedAt: null },
        { id: randomUUID(), name: 'Green Curry', description: 'Thai green curry with chicken and vegetables', price: '180.00', currency: 'THB', category: 'Main Course', isActive: true, createdAt: new Date(), updatedAt: new Date(), deletedAt: null },
        { id: randomUUID(), name: 'Massaman Curry', description: 'Rich and mild curry with beef, potatoes, and peanuts', price: '200.00', currency: 'THB', category: 'Main Course', isActive: true, createdAt: new Date(), updatedAt: new Date(), deletedAt: null },
        { id: randomUUID(), name: 'Red Curry', description: 'Spicy red curry with pork and bamboo shoots', price: '180.00', currency: 'THB', category: 'Main Course', isActive: true, createdAt: new Date(), updatedAt: new Date(), deletedAt: null },
        { id: randomUUID(), name: 'Pad See Ew', description: 'Stir-fried flat noodles with soy sauce and vegetables', price: '110.00', currency: 'THB', category: 'Main Course', isActive: true, createdAt: new Date(), updatedAt: new Date(), deletedAt: null },
        { id: randomUUID(), name: 'Basil Chicken', description: 'Stir-fried chicken with holy basil and chili', price: '130.00', currency: 'THB', category: 'Main Course', isActive: true, createdAt: new Date(), updatedAt: new Date(), deletedAt: null },
        { id: randomUUID(), name: 'Fried Rice', description: 'Thai fried rice with egg and vegetables', price: '90.00', currency: 'THB', category: 'Main Course', isActive: true, createdAt: new Date(), updatedAt: new Date(), deletedAt: null },

        // Soups
        { id: randomUUID(), name: 'Tom Yum Soup', description: 'Spicy and sour Thai soup with shrimp', price: '150.00', currency: 'THB', category: 'Soup', isActive: true, createdAt: new Date(), updatedAt: new Date(), deletedAt: null },
        { id: randomUUID(), name: 'Tom Kha Gai', description: 'Coconut chicken soup with galangal', price: '140.00', currency: 'THB', category: 'Soup', isActive: true, createdAt: new Date(), updatedAt: new Date(), deletedAt: null },

        // Appetizers
        { id: randomUUID(), name: 'Spring Rolls', description: 'Crispy vegetable spring rolls with sweet chili sauce', price: '70.00', currency: 'THB', category: 'Appetizer', isActive: true, createdAt: new Date(), updatedAt: new Date(), deletedAt: null },
        { id: randomUUID(), name: 'Chicken Satay', description: 'Grilled chicken skewers with peanut sauce', price: '120.00', currency: 'THB', category: 'Appetizer', isActive: true, createdAt: new Date(), updatedAt: new Date(), deletedAt: null },
        { id: randomUUID(), name: 'Fish Cakes', description: 'Thai fish cakes with cucumber relish', price: '100.00', currency: 'THB', category: 'Appetizer', isActive: true, createdAt: new Date(), updatedAt: new Date(), deletedAt: null },

        // Salads
        { id: randomUUID(), name: 'Som Tam (Papaya Salad)', description: 'Spicy green papaya salad with tomatoes and peanuts', price: '90.00', currency: 'THB', category: 'Salad', isActive: true, createdAt: new Date(), updatedAt: new Date(), deletedAt: null },
        { id: randomUUID(), name: 'Larb Gai', description: 'Spicy minced chicken salad with herbs', price: '110.00', currency: 'THB', category: 'Salad', isActive: true, createdAt: new Date(), updatedAt: new Date(), deletedAt: null },

        // Desserts
        { id: randomUUID(), name: 'Mango Sticky Rice', description: 'Sweet sticky rice with ripe mango and coconut cream', price: '80.00', currency: 'THB', category: 'Dessert', isActive: true, createdAt: new Date(), updatedAt: new Date(), deletedAt: null },
        { id: randomUUID(), name: 'Coconut Ice Cream', description: 'Homemade coconut ice cream with peanuts', price: '60.00', currency: 'THB', category: 'Dessert', isActive: true, createdAt: new Date(), updatedAt: new Date(), deletedAt: null },
        { id: randomUUID(), name: 'Thai Custard', description: 'Sweet egg custard with pumpkin', price: '70.00', currency: 'THB', category: 'Dessert', isActive: true, createdAt: new Date(), updatedAt: new Date(), deletedAt: null },

        // Beverages
        { id: randomUUID(), name: 'Thai Iced Tea', description: 'Sweet and creamy Thai tea served over ice', price: '50.00', currency: 'THB', category: 'Beverage', isActive: true, createdAt: new Date(), updatedAt: new Date(), deletedAt: null },
        { id: randomUUID(), name: 'Thai Iced Coffee', description: 'Strong coffee with condensed milk over ice', price: '55.00', currency: 'THB', category: 'Beverage', isActive: true, createdAt: new Date(), updatedAt: new Date(), deletedAt: null },
        { id: randomUUID(), name: 'Coconut Water', description: 'Fresh young coconut water', price: '45.00', currency: 'THB', category: 'Beverage', isActive: true, createdAt: new Date(), updatedAt: new Date(), deletedAt: null },
        { id: randomUUID(), name: 'Lime Juice', description: 'Freshly squeezed lime juice with sugar', price: '40.00', currency: 'THB', category: 'Beverage', isActive: true, createdAt: new Date(), updatedAt: new Date(), deletedAt: null },

        // Special/Seasonal
        { id: randomUUID(), name: 'Pineapple Fried Rice', description: 'Fried rice served in pineapple with cashews', price: '220.00', currency: 'THB', category: 'Main Course', isActive: true, createdAt: new Date(), updatedAt: new Date(), deletedAt: null },
        { id: randomUUID(), name: 'Seafood Platter', description: 'Mixed seafood with spicy sauce', price: '350.00', currency: 'THB', category: 'Main Course', isActive: true, createdAt: new Date(), updatedAt: new Date(), deletedAt: null },
        { id: randomUUID(), name: 'Grilled Fish', description: 'Whole fish grilled with herbs', price: '280.00', currency: 'THB', category: 'Main Course', isActive: true, createdAt: new Date(), updatedAt: new Date(), deletedAt: null },

        // Low sellers (test bottom products)
        { id: randomUUID(), name: 'Durian Sticky Rice', description: 'Sticky rice with durian (seasonal)', price: '150.00', currency: 'THB', category: 'Dessert', isActive: true, createdAt: new Date(), updatedAt: new Date(), deletedAt: null },
        { id: randomUUID(), name: 'Bird Nest Soup', description: 'Premium bird nest soup', price: '500.00', currency: 'THB', category: 'Soup', isActive: true, createdAt: new Date(), updatedAt: new Date(), deletedAt: null },
    ];

    const savedProducts = await productRepo.save(products);
    console.log(`✅ Seeded ${savedProducts.length} products successfully`);

    return savedProducts;
}
