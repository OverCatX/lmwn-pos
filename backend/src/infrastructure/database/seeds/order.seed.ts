import { DataSource } from 'typeorm';
import { randomUUID } from 'crypto';
import { OrderOrmEntity } from '../order/entities/order.orm.entity';
import { OrderItemOrmEntity } from '../order/entities/order-item.orm.entity';
import { ProductOrmEntity } from '../product/entities/product.orm.entity';
import { AuditLogOrmEntity } from '../shared/entities/audit-log.orm.entity';
import { OrderStatus } from '../../../domain/order';

function toDate(value: unknown): Date {
    if (value instanceof Date) return value;
    if (typeof value === 'string' || typeof value === 'number') return new Date(value);
    throw new Error('Invalid date value');
}

/**
 * Seed Orders with realistic scenarios
 * Creates 100 orders across 30 days with various statuses and discounts
 */
export async function seedOrders(dataSource: DataSource): Promise<void> {
    const orderRepo = dataSource.getRepository(OrderOrmEntity);
    const orderItemRepo = dataSource.getRepository(OrderItemOrmEntity);
    const productRepo = dataSource.getRepository(ProductOrmEntity);
    const auditRepo = dataSource.getRepository(AuditLogOrmEntity);

    const existingCount = await orderRepo.count();
    if (existingCount >= 50) {
        console.log(`Orders already seeded (${existingCount} orders found)`);
        return;
    }

    const products = await productRepo.find({ where: { isActive: true } });
    if (products.length === 0) {
        throw new Error('No products found. Run product seed first.');
    }

    const staff = 'staff-demo-001';
    const manager = 'manager-demo-002';

    // Popular products (will appear more in orders)
    const popularProducts = products.filter(p =>
        ['Pad Thai', 'Green Curry', 'Tom Yum Soup', 'Fried Rice', 'Thai Iced Tea',
            'Basil Chicken', 'Mango Sticky Rice'].includes(p.name)
    );

    // Normal products
    const normalProducts = products.filter(p =>
        ['Red Curry', 'Pad See Ew', 'Tom Kha Gai', 'Chicken Satay',
            'Fish Cakes', 'Coconut Ice Cream', 'Thai Iced Coffee'].includes(p.name)
    );

    // Rare products (low sellers)
    const rareProducts = products.filter(p =>
        ['Spring Rolls', 'Som Tam (Papaya Salad)', 'Larb Gai',
            'Durian Sticky Rice', 'Bird Nest Soup', 'Thai Custard',
            'Coconut Water', 'Lime Juice'].includes(p.name)
    );

    const baseDate = new Date('2026-01-06T00:00:00Z'); // Start 30 days ago
    const ordersToCreate = 100;
    const createdOrders: OrderOrmEntity[] = [];

    for (let i = 0; i < ordersToCreate; i++) {
        const daysOffset = Math.floor((i / ordersToCreate) * 30);
        const hoursOffset = Math.floor(Math.random() * 12) + 9;
        const minutesOffset = Math.floor(Math.random() * 60);

        const orderDate = new Date(baseDate);
        orderDate.setDate(orderDate.getDate() + daysOffset);
        orderDate.setHours(hoursOffset, minutesOffset, 0, 0);

        // Determine status (realistic distribution)
        let status: OrderStatus;
        const statusRandom = Math.random();
        const isToday = daysOffset >= 29;

        if (isToday) {
            if (statusRandom < 0.3) status = OrderStatus.PENDING;
            else if (statusRandom < 0.5) status = OrderStatus.CONFIRMED;
            else if (statusRandom < 0.7) status = OrderStatus.PREPARING;
            else if (statusRandom < 0.85) status = OrderStatus.READY;
            else status = OrderStatus.COMPLETED;
        } else {
            if (statusRandom < 0.85) status = OrderStatus.COMPLETED;
            else status = OrderStatus.CANCELLED;
        }

        // Determine items (1-5 items per order)
        const itemCount = Math.floor(Math.random() * 4) + 1;
        const orderItems: { product: ProductOrmEntity; quantity: number }[] = [];

        for (let j = 0; j < itemCount; j++) {
            let product: ProductOrmEntity;
            const productRandom = Math.random();

            if (productRandom < 0.6 && popularProducts.length > 0) {
                product = popularProducts[Math.floor(Math.random() * popularProducts.length)];
            } else if (productRandom < 0.9 && normalProducts.length > 0) {
                product = normalProducts[Math.floor(Math.random() * normalProducts.length)];
            } else if (rareProducts.length > 0) {
                product = rareProducts[Math.floor(Math.random() * rareProducts.length)];
            } else {
                product = products[Math.floor(Math.random() * products.length)];
            }

            const existingItem = orderItems.find(item => item.product.id === product.id);
            if (existingItem) {
                existingItem.quantity += 1;
            } else {
                orderItems.push({
                    product,
                    quantity: Math.floor(Math.random() * 3) + 1,
                });
            }
        }

        // Create order
        const order = new OrderOrmEntity();
        order.id = randomUUID();

        // Generate order number: ORD-YYYY-MMDD-XXX
        const year = orderDate.getFullYear();
        const month = String(orderDate.getMonth() + 1).padStart(2, '0');
        const day = String(orderDate.getDate()).padStart(2, '0');
        const random = String(Math.floor(Math.random() * 1000)).padStart(3, '0');
        order.orderNumber = `ORD-${year}-${month}${day}-${random}`;

        order.status = status;
        order.createdBy = Math.random() > 0.8 ? manager : staff;
        order.createdAt = orderDate;
        order.updatedAt = orderDate;

        let subtotal = 0;
        const items: OrderItemOrmEntity[] = [];

        for (const itemData of orderItems) {
            const item = new OrderItemOrmEntity();
            item.id = randomUUID();
            item.orderId = order.id;
            item.productId = itemData.product.id;
            item.productName = itemData.product.name;
            item.quantity = itemData.quantity;
            item.unitPrice = itemData.product.price;
            item.currency = itemData.product.currency;

            const itemSubtotal = parseFloat(itemData.product.price) * itemData.quantity;
            item.subtotal = itemSubtotal.toFixed(2);
            item.discountAmount = '0.00';
            item.total = itemSubtotal.toFixed(2);

            subtotal += itemSubtotal;
            items.push(item);
        }

        order.subtotal = subtotal.toFixed(2);
        order.currency = 'THB';

        // Apply discount (30% chance for COMPLETED orders, 10% for others)
        const discountChance = status === OrderStatus.COMPLETED ? 0.3 : 0.1;
        const hasDiscount = Math.random() < discountChance;

        if (hasDiscount) {
            const discountType = Math.random() < 0.7 ? 'PERCENTAGE' : 'FIXED_AMOUNT';
            let discountAmount = 0;

            if (discountType === 'PERCENTAGE') {
                const percentages = [5, 10, 15, 20];
                const discountPercent = percentages[Math.floor(Math.random() * percentages.length)];
                discountAmount = subtotal * (discountPercent / 100);
            } else {
                const fixedAmounts = [30, 50, 100];
                discountAmount = fixedAmounts[Math.floor(Math.random() * fixedAmounts.length)];
                discountAmount = Math.min(discountAmount, subtotal * 0.5);
            }

            order.discountAmount = discountAmount.toFixed(2);
            order.discountAppliedAt = new Date(orderDate.getTime() + 120000);
        } else {
            order.discountAmount = '0.00';
            order.discountAppliedAt = null;
        }

        const netBeforeTax = subtotal - parseFloat(order.discountAmount);
        const tax = netBeforeTax * 0.07;
        order.tax = tax.toFixed(2);
        order.total = (netBeforeTax + tax).toFixed(2);

        if (status === OrderStatus.COMPLETED) {
            const completionTime = Math.floor(Math.random() * 30) + 10;
            order.completedAt = new Date(orderDate.getTime() + completionTime * 60000);
        } else {
            order.completedAt = null;
        }

        const savedOrder = await orderRepo.save(order);
        await orderItemRepo.save(items);
        createdOrders.push(savedOrder);

        // Create audit logs
        const auditLog = new AuditLogOrmEntity();
        auditLog.id = randomUUID();
        auditLog.entityType = 'order';
        auditLog.entityId = savedOrder.id;
        auditLog.action = 'created';
        auditLog.oldValue = null;
        auditLog.newValue = {
            orderNumber: savedOrder.orderNumber,
            status: savedOrder.status,
            itemsCount: items.length,
            total: parseFloat(savedOrder.total),
            subtotal: parseFloat(savedOrder.subtotal),
            tax: parseFloat(savedOrder.tax),
        };
        auditLog.changedBy = order.createdBy;
        auditLog.changedAt = orderDate;
        await auditRepo.save(auditLog);

        if (hasDiscount) {
            const discountLog = new AuditLogOrmEntity();
            discountLog.id = randomUUID();
            discountLog.entityType = 'order';
            discountLog.entityId = savedOrder.id;
            discountLog.action = 'discount_applied';
            discountLog.oldValue = { discount: 0 };
            discountLog.newValue = {
                amount: parseFloat(order.discountAmount),
            };
            discountLog.changedBy = order.createdBy;
            discountLog.changedAt = savedOrder.discountAppliedAt ? toDate(savedOrder.discountAppliedAt) : orderDate;
            await auditRepo.save(discountLog);
        }

        if (status === OrderStatus.COMPLETED && Math.random() > 0.5) {
            const statusLog = new AuditLogOrmEntity();
            statusLog.id = randomUUID();
            statusLog.entityType = 'order';
            statusLog.entityId = savedOrder.id;
            statusLog.action = 'status_changed';
            statusLog.oldValue = { status: OrderStatus.PENDING };
            statusLog.newValue = { status: OrderStatus.COMPLETED };
            statusLog.changedBy = order.createdBy;
            statusLog.changedAt = savedOrder.completedAt ? toDate(savedOrder.completedAt) : orderDate;
            await auditRepo.save(statusLog);
        }

        if (status === OrderStatus.CANCELLED) {
            const statusLog = new AuditLogOrmEntity();
            statusLog.id = randomUUID();
            statusLog.entityType = 'order';
            statusLog.entityId = savedOrder.id;
            statusLog.action = 'status_changed';
            statusLog.oldValue = { status: OrderStatus.PENDING };
            statusLog.newValue = { status: OrderStatus.CANCELLED };
            statusLog.changedBy = order.createdBy;
            statusLog.changedAt = orderDate;
            await auditRepo.save(statusLog);
        }
    }

    console.log(`✅ Seeded ${createdOrders.length} orders successfully`);
    console.log(`   - COMPLETED: ${createdOrders.filter(o => o.status === OrderStatus.COMPLETED).length}`);
    console.log(`   - PENDING: ${createdOrders.filter(o => o.status === OrderStatus.PENDING).length}`);
    console.log(`   - CONFIRMED: ${createdOrders.filter(o => o.status === OrderStatus.CONFIRMED).length}`);
    console.log(`   - PREPARING: ${createdOrders.filter(o => o.status === OrderStatus.PREPARING).length}`);
    console.log(`   - READY: ${createdOrders.filter(o => o.status === OrderStatus.READY).length}`);
    console.log(`   - CANCELLED: ${createdOrders.filter(o => o.status === OrderStatus.CANCELLED).length}`);
    console.log(`   - With Discount: ${createdOrders.filter(o => parseFloat(o.discountAmount) > 0).length}`);
}
