export interface CartItem {

    id: number;

    productId: number;

    productName: string;

    imageUrl: string;

    unitPrice: number;

    quantity: number;

    totalPrice: number;
}


export interface CartResponse {

    items: CartItem[];

    subtotal: number;

    deliveryPrice: number;

    totalPrice: number;
}

export interface UserProfile {
    username: string;

    email: string;

    firstName: string;

    lastname: string;

    emailVerified: boolean;



}