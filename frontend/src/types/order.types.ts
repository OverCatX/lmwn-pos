/**
 * Order Status Enum - matches backend OrderStatus
 */
export enum OrderStatus {
    PENDING = 'PENDING',
    CONFIRMED = 'CONFIRMED',
    PREPARING = 'PREPARING',
    READY = 'READY',
    COMPLETED = 'COMPLETED',
    CANCELLED = 'CANCELLED',
}

/**
 * Discount Type Enum - matches backend DiscountType
 */
export enum DiscountType {
    PERCENTAGE = 'PERCENTAGE',
    FIXED_AMOUNT = 'FIXED_AMOUNT',
}

/**
 * Order Item interface
 */
export interface OrderItem {
    id: string;
    productId: string;
    productName?: string;
    quantity: number;
    unitPrice: string;
    subtotal: string;
    discountAmount: string;
    total: string;
}

/**
 * Order interface
 */
export interface Order {
    id: string;
    orderNumber: string;
    status: OrderStatus;
    items: OrderItem[];
    subtotal: string;
    discountAmount: string;
    discountAppliedAt?: string | null;
    tax: string;
    total: string;
    createdBy?: string;
    createdAt: string;
    updatedAt: string;
    completedAt?: string;
}

/**
 * Paginated Order Response
 */
export interface PaginatedOrderResponse {
    data: Order[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

/**
 * Create Order Request
 */
export interface CreateOrderRequest {
    items: {
        productId: string;
        quantity: number;
    }[];
    createdBy?: string;
}

/**
 * Update Order Status Request
 */
export interface UpdateOrderStatusRequest {
    status: OrderStatus;
}

/**
 * Apply Discount Request
 */
export interface ApplyDiscountRequest {
    discountType: DiscountType;
    discountValue: number;
    discountCode?: string;
}
