import keycloak from '../auth/keycloak';

import type { Product } from '../types/product';

import type {
    CartResponse
} from '../types/carts';

import type {
    Order
} from '../types/orders';

import type { UserProfile } from '../types/user';


const ORDER_SERVICE_URL =
    'http://localhost:8080';


const PRODUCT_SERVICE_URL =
    'http://localhost:8081';


async function authenticatedHeaders(): Promise<Headers> {

    const headers =
        new Headers();


    headers.set(
        'Content-Type',
        'application/json'
    );


    if (!keycloak.authenticated) {

        throw new Error(
            'Authentication is required'
        );
    }


    await keycloak.updateToken(30);


    if (!keycloak.token) {

        throw new Error(
            'Access token is unavailable'
        );
    }


    headers.set(
        'Authorization',
        `Bearer ${keycloak.token}`
    );


    return headers;
}


async function parseApiError(
    response: Response
): Promise<string> {

    const text =
        await response.text();


    if (!text) {

        return `Request failed: ${response.status}`;
    }


    try {

        const data =
            JSON.parse(text);


        if (
            Array.isArray(data.fields) &&
            data.fields.length > 0
        ) {

            return data.fields
                .map(
                    (field: {
                        field: string;
                        message: string;
                    }) =>
                        `${field.field}: ${field.message}`
                )
                .join('\n');
        }


        return (
            data.message ||
            data.error ||
            `Request failed: ${response.status}`
        );

    } catch {

        return text;
    }
}

export async function getProducts(
    search?: string
): Promise<Product[]> {

    const url =
        new URL(
            `${PRODUCT_SERVICE_URL}/api/products`
        );


    if (search?.trim()) {

        url.searchParams.set(
            'search',
            search.trim()
        );
    }


    const response =
        await fetch(
            url.toString()
        );


    if (!response.ok) {

        throw new Error(
            `Failed to load products: ${response.status}`
        );
    }


    return response.json();
}


export async function getProduct(
    productId: number
): Promise<Product> {

    const response =
        await fetch(
            `${PRODUCT_SERVICE_URL}/api/products/${productId}`
        );


    if (!response.ok) {

        throw new Error(
            `Failed to load product: ${response.status}`
        );
    }


    return response.json();
}





export async function getCart(): Promise<CartResponse> {

    const headers =
        await authenticatedHeaders();


    const response =
        await fetch(
            `${ORDER_SERVICE_URL}/api/cart`,
            {
                method: 'GET',

                headers
            }
        );


    if (!response.ok) {

        const message =
            await response.text();


        throw new Error(
            message ||
            `Failed to load cart: ${response.status}`
        );
    }


    return response.json();
}


export async function addToCart(
    productId: number,
    quantity: number
): Promise<void> {

    const headers =
        await authenticatedHeaders();


    const response =
        await fetch(
            `${ORDER_SERVICE_URL}/api/cart`,
            {
                method: 'POST',

                headers,

                body: JSON.stringify({
                    productId,
                    quantity
                })
            }
        );


    if (!response.ok) {

        const message =
            await response.text();


        throw new Error(
            message ||
            `Failed to add product to cart: ${response.status}`
        );
    }
}


export async function updateCartQuantity(
    productId: number,
    quantity: number
): Promise<void> {

    const headers =
        await authenticatedHeaders();


    const response =
        await fetch(
            `${ORDER_SERVICE_URL}/api/cart/${productId}`,
            {
                method: 'PUT',

                headers,

                body: JSON.stringify({
                    quantity
                })
            }
        );


    if (!response.ok) {

        const message =
            await response.text();


        throw new Error(
            message ||
            `Failed to update cart: ${response.status}`
        );
    }
}


export async function removeFromCart(
    productId: number
): Promise<void> {

    const headers =
        await authenticatedHeaders();


    const response =
        await fetch(
            `${ORDER_SERVICE_URL}/api/cart/${productId}`,
            {
                method: 'DELETE',

                headers
            }
        );


    if (!response.ok) {

        const message =
            await response.text();


        throw new Error(
            message ||
            `Failed to remove product: ${response.status}`
        );
    }
}




export interface CheckoutRequest {

    firstName: string;

    lastName: string;

    phone: string;

    country: string;

    city: string;

    address: string;

    postalCode: string;

    apartment: string;

    paymentMethod:
        | 'CARD'
        | 'SBP'
        | 'CASH_ON_DELIVERY';
}


export async function checkout(
    request: CheckoutRequest
): Promise<Order> {

    const headers =
        await authenticatedHeaders();


    const response =
        await fetch(
            `${ORDER_SERVICE_URL}/api/checkout`,
            {
                method: 'POST',

                headers,

                body: JSON.stringify(
                    request
                )
            }
        );


    if (!response.ok) {

        throw new Error(
            await parseApiError(response)
        );
    }


    return response.json();
}


export function getCurrentUser(): UserProfile | null {

    const token = keycloak.tokenParsed;

    if (!token) {
        return null;
    }

    return {

        username:
            token.preferred_username ?? '',

        email:
            token.email ?? '',

        firstName:
            token.given_name ?? '',

        lastName:
            token.family_name ?? '',

        emailVerified:
            token.email_verified === true
    };
}

export async function getOrders(): Promise<Order[]> {

    const headers =
        await authenticatedHeaders();

    const response =
        await fetch(
            `${ORDER_SERVICE_URL}/api/orders`,
            {
                method: 'GET',
                headers
            }
        );

    if (!response.ok) {

        const message =
            await response.text();

        throw new Error(
            message ||
            `Failed to load orders: ${response.status}`
        );
    }

    return response.json();
}


export async function getOrder(
    orderId: number
): Promise<Order> {

    const headers =
        await authenticatedHeaders();

    const response =
        await fetch(
            `${ORDER_SERVICE_URL}/api/orders/${orderId}`,
            {
                method: 'GET',
                headers
            }
        );

    if (!response.ok) {

        const message =
            await response.text();

        throw new Error(
            message ||
            `Failed to load order: ${response.status}`
        );
    }

    return response.json();
}

