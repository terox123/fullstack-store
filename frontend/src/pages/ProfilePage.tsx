import { useEffect, useState } from 'react';

import keycloak from '../auth/keycloak';


import {
    getOrders
} from '../api/api';

import type { Order } from '../types/orders';


export default function ProfilePage() {

    const [orders, setOrders] =
        useState<Order[]>([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState<string | null>(null);


    const token =
        keycloak.tokenParsed;


    useEffect(() => {

        async function load() {

            try {

                setLoading(true);

                setError(null);

                const data =
                    await getOrders();

                setOrders(data);

            } catch (error) {

                console.error(error);

                setError(
                    'Не удалось загрузить заказы'
                );

            } finally {

                setLoading(false);
            }
        }


        if (keycloak.authenticated) {
            load();
        }

    }, []);


    if (!token) {

        return (
            <main className="content">

                <h1>
                    Личный кабинет
                </h1>

                <p>
                    Необходимо войти в аккаунт.
                </p>

            </main>
        );
    }


    return (

        <main className="profile-page">

            <div className="profile-header">

                <button
                    className="back-button"
                    onClick={() =>
                        window.history.back()
                    }
                >
                    ← Назад
                </button>

                <h1>
                    Личный кабинет
                </h1>

            </div>


            <section className="profile-section">

                <h2>
                    Личная информация
                </h2>


                <div className="profile-info-grid">

                    <div className="profile-field">

                        <span>
                            Имя
                        </span>

                        <strong>
                            {token.given_name ||
                                '—'}
                        </strong>

                    </div>


                    <div className="profile-field">

                        <span>
                            Фамилия
                        </span>

                        <strong>
                            {token.family_name ||
                                '—'}
                        </strong>

                    </div>


                    <div className="profile-field">

                        <span>
                            Username
                        </span>

                        <strong>
                            {token.preferred_username ||
                                '—'}
                        </strong>

                    </div>


                    <div className="profile-field">

                        <span>
                            Email
                        </span>

                        <strong>
                            {token.email ||
                                '—'}
                        </strong>

                    </div>


                    <div className="profile-field">

                        <span>
                            Email подтверждён
                        </span>

                        <strong>
                            {token.email_verified
                                ? 'Да'
                                : 'Нет'}
                        </strong>

                    </div>

                </div>

            </section>


            <section className="profile-section">

                <div className="section-title">

                    <h2>
                        Мои заказы
                    </h2>

                    <span>
                        {orders.length}
                    </span>

                </div>


                {loading && (

                    <div className="page-center-small">
                        Загрузка заказов...
                    </div>

                )}


                {error && (

                    <div className="error-box">
                        {error}
                    </div>

                )}


                {!loading &&
                    !error &&
                    orders.length === 0 && (

                        <div className="empty-profile">

                            <h3>
                                Заказов пока нет
                            </h3>

                            <p>
                                Здесь появятся ваши заказы
                            </p>

                        </div>

                    )}


                {!loading &&
                    !error &&
                    orders.length > 0 && (

                        <div className="orders-list">

                            {orders.map(order => (

                                <article
                                    className="order-card"
                                    key={order.id}
                                >

                                    <div className="order-card-header">

                                        <div>

                                            <h3>
                                                Заказ №{order.id}
                                            </h3>

                                            <span>
                                                {formatDate(
                                                    order.createdAt
                                                )}
                                            </span>

                                        </div>


                                        <div className="order-status">

                                            {formatStatus(
                                                order.status
                                            )}

                                        </div>

                                    </div>


                                    <div className="order-items">

                                        {order.items.map(
                                            (item, index) => (

                                                <div
                                                    className="order-item"
                                                    key={`${order.id}-${item.productId}-${index}`}
                                                >

                                                    <img
                                                        src={
                                                            item.imageUrl ||
                                                            ''
                                                        }
                                                        alt={
                                                            item.productName
                                                        }
                                                    />


                                                    <div className="order-item-info">

                                                        <strong>
                                                            {item.productName}
                                                        </strong>

                                                        <span>
                                                            {item.quantity}
                                                            {' × '}
                                                            €
                                                            {item.unitPrice.toFixed(2)}
                                                        </span>

                                                    </div>


                                                    <strong>
                                                        €
                                                        {item.totalPrice.toFixed(2)}
                                                    </strong>

                                                </div>

                                            )
                                        )}

                                    </div>


                                    <div className="order-card-footer">

                                        <div>

                                            <span>
                                                Оплата
                                            </span>

                                            <strong>
                                                {formatPayment(
                                                    order.paymentMethod
                                                )}
                                            </strong>

                                        </div>


                                        <div>

                                            <span>
                                                Статус оплаты
                                            </span>

                                            <strong>
                                                {formatPaymentStatus(
                                                    order.paymentStatus
                                                )}
                                            </strong>

                                        </div>


                                        <div>

                                            <span>
                                                Доставка
                                            </span>

                                            <strong>
                                                {order.deliveryPrice === 0
                                                    ? 'Бесплатно'
                                                    : `€${order.deliveryPrice.toFixed(2)}`
                                                }
                                            </strong>

                                        </div>


                                        <div className="order-total">

                                            <span>
                                                Итого
                                            </span>

                                            <strong>
                                                €
                                                {order.totalPrice.toFixed(2)}
                                            </strong>

                                        </div>

                                    </div>


                                    <div className="order-address">

                                        <span>
                                            Адрес доставки
                                        </span>

                                        <strong>
                                            {order.country},
                                            {' '}
                                            {order.city},
                                            {' '}
                                            {order.address}
                                            {order.apartment
                                                ? `, кв. ${order.apartment}`
                                                : ''
                                            }
                                        </strong>

                                    </div>

                                </article>

                            ))}

                        </div>

                    )}

            </section>

        </main>
    );
}


function formatDate(
    value: string
): string {

    return new Date(value)
        .toLocaleString(
            'ru-RU'
        );
}


function formatStatus(
    status: string
): string {

    const values: Record<string, string> = {

        CREATED: 'Создан',

        PROCESSING: 'В обработке',

        SHIPPED: 'Отправлен',

        DELIVERED: 'Доставлен',

        CANCELLED: 'Отменён'
    };

    return values[status] || status;
}


function formatPayment(
    payment: string
): string {

    const values: Record<string, string> = {

        CARD: 'Банковская карта',

        SBP: 'СБП',

        AT_SHOP: 'Оплата при получении',

        CASH_ON_DELIVERY:
            'Наличные при получении'
    };

    return values[payment] || payment;
}


function formatPaymentStatus(
    status: string
): string {

    const values: Record<string, string> = {

        PAID: 'Оплачено',

        PENDING: 'Ожидает оплаты',

        FAILED: 'Ошибка оплаты'
    };

    return values[status] || status;
}