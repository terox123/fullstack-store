export type OrderStatus =
    | 'CREATED'
    | 'PROCESSING'
    | 'SHIPPED'
    | 'DELIVERED'
    | 'CANCELLED';

export type PaymentMethod =
    | 'CARD'
    | 'SBP'
    | 'AT_SHOP'
    | 'CASH_ON_DELIVERY';

export type PaymentStatus =
    | 'PAID'
    | 'PENDING'
    | 'FAILED';


export interface OrderItem {

    productId: number;

    productName: string;

    imageUrl: string | null;

    unitPrice: number;

    quantity: number;

    totalPrice: number;
}


export interface Order {

    id: number;

    ownerEmail: string;

    status: OrderStatus;

    paymentMethod: PaymentMethod;

    paymentStatus: PaymentStatus;

    firstName: string;

    lastName: string;

    phone: string;

    country: string;

    city: string;

    address: string;

    postalCode: string;

    apartment?: string | null;

    subtotal: number;

    deliveryPrice: number;

    totalPrice: number;

    createdAt: string;

    items: OrderItem[];
}