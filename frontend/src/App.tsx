import {
    FormEvent,
    useEffect,
    useState
} from 'react';


import keycloak from './auth/keycloak';


import {
    addToCart,
    checkout,
    getCart,
    getProducts,
    removeFromCart,
    updateCartQuantity
} from './api/api';


import type { Product } from './types/product';
import ProfilePage
    from './pages/ProfilePage';
import type {
    CartResponse
} from './types/carts';

import type {
    Order
} from './types/orders';

import type {
    CheckoutRequest
} from './api/api';


type Page =
    | 'catalog'
    | 'cart'
    | 'checkout'
    | 'success'
    | 'profile';


interface CheckoutForm {

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


const emptyCheckoutForm: CheckoutForm = {

    firstName: '',

    lastName: '',

    phone: '',

    country: '',

    city: '',

    address: '',

    postalCode: '',

    apartment: '',

    paymentMethod: 'CARD'

};


function App() {

    const [products, setProducts] =
        useState<Product[]>([]);


    const [cart, setCart] =
        useState<CartResponse | null>(null);


    const [selectedProduct, setSelectedProduct] =
        useState<Product | null>(null);


    const [page, setPage] =
        useState<Page>('catalog');


    const [search, setSearch] =
        useState('');


    const [loading, setLoading] =
        useState(true);


    const [cartLoading, setCartLoading] =
        useState(false);


    const [checkoutLoading, setCheckoutLoading] =
        useState(false);


    const [error, setError] =
        useState<string | null>(null);


    const [checkoutError, setCheckoutError] =
        useState<string | null>(null);


    const [checkoutForm, setCheckoutForm] =
        useState<CheckoutForm>(
            emptyCheckoutForm
        );


    const [createdOrder, setCreatedOrder] =
        useState<Order | null>(null);


    const [addingProductId, setAddingProductId] =
        useState<number | null>(null);

    async function loadProducts(
        searchValue = ''
    ) {

        try {

            setLoading(true);

            setError(null);


            const data =
                await getProducts(
                    searchValue
                );


            setProducts(data);

        } catch (err) {

            console.error(err);

            setError(
                'Не удалось загрузить товары'
            );

        } finally {

            setLoading(false);
        }
    }


    useEffect(() => {

        loadProducts();

    }, []);


    async function requireLogin(): Promise<boolean> {

        if (keycloak.authenticated) {

            return true;
        }


        await keycloak.login();


        return false;
    }


    async function loadCart() {

        try {

            setCartLoading(true);

            const data =
                await getCart();


            setCart(data);

        } catch (err) {

            console.error(err);

            setError(
                'Не удалось загрузить корзину'
            );

        } finally {

            setCartLoading(false);
        }
    }


    async function handleAddToCart(
        product: Product
    ) {

        try {

            setAddingProductId(
                product.id
            );


            const authenticated =
                await requireLogin();


            if (!authenticated) {

                return;
            }


            await addToCart(
                product.id,
                1
            );


            await loadCart();


            alert(
                `${product.name} добавлен в корзину`
            );

        } catch (err) {

            console.error(err);

            alert(
                err instanceof Error
                    ? err.message
                    : 'Не удалось добавить товар'
            );

        } finally {

            setAddingProductId(null);
        }
    }


    async function handleOpenCart() {

        try {

            const authenticated =
                await requireLogin();


            if (!authenticated) {

                return;
            }


            await loadCart();

            setPage('cart');

        } catch (err) {

            console.error(err);

            setError(
                'Не удалось открыть корзину'
            );
        }
    }


    async function handleIncreaseQuantity(
        productId: number,
        currentQuantity: number
    ) {

        try {

            await updateCartQuantity(
                productId,
                currentQuantity + 1
            );


            await loadCart();

        } catch (err) {

            console.error(err);

            alert(
                err instanceof Error
                    ? err.message
                    : 'Не удалось изменить количество'
            );
        }
    }


    async function handleDecreaseQuantity(
        productId: number,
        currentQuantity: number
    ) {

        try {

            await updateCartQuantity(
                productId,
                currentQuantity - 1
            );


            await loadCart();

        } catch (err) {

            console.error(err);

            alert(
                err instanceof Error
                    ? err.message
                    : 'Не удалось изменить количество'
            );
        }
    }


    async function handleRemoveFromCart(
        productId: number
    ) {

        try {

            await removeFromCart(
                productId
            );


            await loadCart();

        } catch (err) {

            console.error(err);

            alert(
                err instanceof Error
                    ? err.message
                    : 'Не удалось удалить товар'
            );
        }
    }

    async function handleCheckoutStart() {

        if (
            !cart ||
            cart.items.length === 0
        ) {

            return;
        }


        setCheckoutError(null);

        setPage('checkout');
    }


    function handleCheckoutChange(
        field: keyof CheckoutForm,
        value: string
    ) {

        setCheckoutForm(
            current => ({
                ...current,
                [field]: value
            })
        );
    }


    async function handlePlaceOrder(
        event: FormEvent
    ) {

        event.preventDefault();


        try {

            setCheckoutLoading(true);

            setCheckoutError(null);


            const request:
                CheckoutRequest = {
                ...checkoutForm
            };


            const order =
                await checkout(
                    request
                );


            setCreatedOrder(
                order
            );


            setPage('success');


            setCart({
                items: [],

                subtotal: 0,

                deliveryPrice: 0,

                totalPrice: 0
            });


        } catch (err) {

            console.error(err);

            setCheckoutError(
                err instanceof Error
                    ? err.message
                    : 'Не удалось оформить заказ'
            );

        } finally {

            setCheckoutLoading(false);
        }
    }

    function handleLogout() {

        keycloak.logout({
            redirectUri:
            window.location.origin
        });
    }

    async function handleSearch(
        event: FormEvent
    ) {

        event.preventDefault();

        await loadProducts(
            search
        );
    }


    if (loading) {

        return (
            <div className="page-center">

                Загрузка товаров...

            </div>
        );
    }


    if (error) {

        return (
            <div className="page-center">

                <div className="error-box">

                    <p>
                        {error}
                    </p>

                    <button
                        onClick={() =>
                            window.location.reload()
                        }
                    >
                        Повторить
                    </button>

                </div>

            </div>
        );
    }


    return (
        <div className="app">

            <header className="header">

                <div
                    className="logo"
                    onClick={() =>
                        setPage('catalog')
                    }
                >
                    Fullstack Store
                </div>


                <form
                    className="search"
                    onSubmit={handleSearch}
                >

                    <input
                        value={search}

                        onChange={event =>
                            setSearch(
                                event.target.value
                            )
                        }

                        placeholder="Поиск товаров..."
                    />


                    <button
                        type="submit"
                    >
                        Поиск
                    </button>

                </form>


                <div className="header-actions">

                    <button
                        className="cart-header-button"
                        onClick={
                            handleOpenCart
                        }
                    >
                         Корзина

                        {cart &&
                            cart.items.length > 0 && (
                                <span className="cart-count">

                                    {cart.items.reduce(
                                        (
                                            sum,
                                            item
                                        ) =>
                                            sum +
                                            item.quantity,
                                        0
                                    )}

                                </span>
                            )}

                    </button>


                    {keycloak.authenticated ? (
                        <>
                            <button
                                className="profile-header-button"
                                onClick={() => setPage('profile')}
                            >
                                👤{' '}
                                {keycloak.tokenParsed?.preferred_username ||
                                    keycloak.tokenParsed?.email ||
                                    'Профиль'}
                            </button>

                            <button onClick={handleLogout}>
                                Выйти
                            </button>
                        </>
                    ) : (
                        <button onClick={() => keycloak.login()}>
                            Войти
                        </button>
                    )}

                </div>

            </header>


            {page === 'catalog' && (

                <main className="content">

                    <div className="catalog-header">

                        <div>

                            <h1>
                                Все товары
                            </h1>

                            <p>
                                Выберите товар
                                и добавьте его
                                в корзину
                            </p>

                        </div>

                    </div>


                    {products.length === 0 ? (

                        <div className="empty">

                            Товары не найдены

                        </div>

                    ) : (

                        <div className="products-grid">

                            {products.map(
                                product => (

                                    <article
                                        className="product-card"
                                        key={product.id}
                                    >

                                        <div
                                            className="product-image-wrapper"
                                            onClick={() =>
                                                setSelectedProduct(
                                                    product
                                                )
                                            }
                                        >

                                            <img
                                                className="product-image"

                                                src={
                                                    product.imageUrl
                                                }

                                                alt={
                                                    product.name
                                                }
                                            />

                                        </div>


                                        <div className="product-info">

                                            <div className="product-brand">
                                                {product.brand}
                                            </div>


                                            <h2
                                                className="product-name"

                                                onClick={() =>
                                                    setSelectedProduct(
                                                        product
                                                    )
                                                }
                                            >
                                                {product.name}
                                            </h2>


                                            <div className="rating">
                                                ★ {
                                                product.rating
                                            }
                                            </div>


                                            <p className="product-price">
                                                €{
                                                product.price.toFixed(
                                                    2
                                                )
                                            }
                                            </p>


                                            <p className="stock">

                                                {product.stock > 0
                                                    ? `В наличии: ${product.stock}`
                                                    : 'Нет в наличии'}

                                            </p>


                                            <button
                                                className="cart-button"

                                                disabled={
                                                    product.stock <= 0 ||
                                                    addingProductId === product.id
                                                }

                                                onClick={() =>
                                                    handleAddToCart(
                                                        product
                                                    )
                                                }
                                            >

                                                {addingProductId ===
                                                product.id

                                                    ? 'Добавление...'

                                                    : 'Добавить в корзину'}

                                            </button>

                                        </div>

                                    </article>

                                )
                            )}

                        </div>

                    )}

                </main>

            )}


            {page === 'cart' && (

                <main className="content">

                    <div className="page-header">

                        <button
                            className="back-button"
                            onClick={() =>
                                setPage('catalog')
                            }
                        >
                            ← Назад
                        </button>

                        <h1>
                            Корзина
                        </h1>

                    </div>


                    {cartLoading ? (

                        <div className="page-center-small">
                            Загрузка корзины...
                        </div>

                    ) : !cart ||
                    cart.items.length === 0 ? (

                        <div className="empty-cart">

                            <div className="empty-cart-icon">

                            </div>

                            <h2>
                                Корзина пуста
                            </h2>

                            <p>
                                Добавьте товары
                                из каталога
                            </p>

                            <button
                                className="primary-button"
                                onClick={() =>
                                    setPage('catalog')
                                }
                            >
                                Вернуться в магазин
                            </button>

                        </div>

                    ) : (

                        <div className="cart-layout">

                            <section className="cart-items">

                                {cart.items.map(
                                    item => (

                                        <article
                                            className="cart-item"
                                            key={item.id}
                                        >

                                            <img
                                                src={item.imageUrl}
                                                alt={item.productName}
                                                className="cart-item-image"
                                            />


                                            <div className="cart-item-main">

                                                <h3>
                                                    {item.productName}
                                                </h3>


                                                <p>
                                                    €{
                                                    item.unitPrice.toFixed(
                                                        2
                                                    )
                                                }
                                                </p>


                                                <div className="quantity-controls">

                                                    <button
                                                        onClick={() =>
                                                            handleDecreaseQuantity(
                                                                item.productId,
                                                                item.quantity
                                                            )
                                                        }
                                                    >
                                                        −
                                                    </button>


                                                    <span>
                                                        {item.quantity}
                                                    </span>


                                                    <button
                                                        onClick={() =>
                                                            handleIncreaseQuantity(
                                                                item.productId,
                                                                item.quantity
                                                            )
                                                        }
                                                    >
                                                        +
                                                    </button>

                                                </div>

                                            </div>


                                            <div className="cart-item-right">

                                                <strong>
                                                    €{
                                                    item.totalPrice.toFixed(
                                                        2
                                                    )
                                                }
                                                </strong>


                                                <button
                                                    className="remove-button"
                                                    onClick={() =>
                                                        handleRemoveFromCart(
                                                            item.productId
                                                        )
                                                    }
                                                >
                                                    Удалить
                                                </button>

                                            </div>

                                        </article>

                                    )
                                )}

                            </section>


                            <aside className="summary">

                                <h2>
                                    Итог
                                </h2>


                                <div className="summary-row">

                                    <span>
                                        Товары
                                    </span>

                                    <strong>
                                        €{
                                        cart.subtotal.toFixed(
                                            2
                                        )
                                    }
                                    </strong>

                                </div>


                                <div className="summary-row">

                                    <span>
                                        Доставка
                                    </span>

                                    <strong>

                                        {cart.deliveryPrice === 0
                                            ? 'Бесплатно'
                                            : `€${cart.deliveryPrice.toFixed(2)}`}

                                    </strong>

                                </div>


                                <div className="summary-total">

                                    <span>
                                        Итого
                                    </span>

                                    <strong>
                                        €{
                                        cart.totalPrice.toFixed(
                                            2
                                        )
                                    }
                                    </strong>

                                </div>


                                <button
                                    className="primary-button full-width"
                                    onClick={
                                        handleCheckoutStart
                                    }
                                >
                                    Перейти к оформлению
                                </button>

                            </aside>

                        </div>

                    )}

                </main>

            )}


            {page === 'checkout' && (

                <main className="content">

                    <div className="page-header">

                        <button
                            className="back-button"
                            onClick={() =>
                                setPage('cart')
                            }
                        >
                            ← Корзина
                        </button>

                        <h1>
                            Оформление заказа
                        </h1>

                    </div>


                    <div className="checkout-layout">

                        <form
                            className="checkout-form"

                            onSubmit={
                                handlePlaceOrder
                            }
                        >

                            <section className="checkout-section">

                                <h2>
                                    Данные доставки
                                </h2>


                                <div className="form-grid">

                                    <label>

                                        <span>
                                            Имя
                                        </span>

                                        <input
                                            required

                                            value={
                                                checkoutForm.firstName
                                            }

                                            onChange={event =>
                                                handleCheckoutChange(
                                                    'firstName',
                                                    event.target.value
                                                )
                                            }
                                        />

                                    </label>


                                    <label>

                                        <span>
                                            Фамилия
                                        </span>

                                        <input
                                            required

                                            value={
                                                checkoutForm.lastName
                                            }

                                            onChange={event =>
                                                handleCheckoutChange(
                                                    'lastName',
                                                    event.target.value
                                                )
                                            }
                                        />

                                    </label>


                                    <label>

                                        <span>
                                            Телефон
                                        </span>

                                        <input
                                            required

                                            type="tel"

                                            placeholder="+7..."

                                            value={
                                                checkoutForm.phone
                                            }

                                            onChange={event =>
                                                handleCheckoutChange(
                                                    'phone',
                                                    event.target.value
                                                )
                                            }
                                        />

                                    </label>


                                    <label>

                                        <span>
                                            Страна
                                        </span>

                                        <input
                                            required

                                            value={
                                                checkoutForm.country
                                            }

                                            onChange={event =>
                                                handleCheckoutChange(
                                                    'country',
                                                    event.target.value
                                                )
                                            }
                                        />

                                    </label>


                                    <label>

                                        <span>
                                            Город
                                        </span>

                                        <input
                                            required

                                            value={
                                                checkoutForm.city
                                            }

                                            onChange={event =>
                                                handleCheckoutChange(
                                                    'city',
                                                    event.target.value
                                                )
                                            }
                                        />

                                    </label>


                                    <label className="full-field">

                                        <span>
                                            Адрес
                                        </span>

                                        <input
                                            required

                                            value={
                                                checkoutForm.address
                                            }

                                            onChange={event =>
                                                handleCheckoutChange(
                                                    'address',
                                                    event.target.value
                                                )
                                            }
                                        />

                                    </label>


                                    <label>

                                        <span>
                                            Почтовый индекс
                                        </span>

                                        <input
                                            required

                                            value={
                                                checkoutForm.postalCode
                                            }

                                            onChange={event =>
                                                handleCheckoutChange(
                                                    'postalCode',
                                                    event.target.value
                                                )
                                            }
                                        />

                                    </label>


                                    <label>

                                        <span>
                                            Квартира
                                        </span>

                                        <input
                                            value={
                                                checkoutForm.apartment
                                            }

                                            onChange={event =>
                                                handleCheckoutChange(
                                                    'apartment',
                                                    event.target.value
                                                )
                                            }
                                        />

                                    </label>

                                </div>

                            </section>


                            <section className="checkout-section">

                                <h2>
                                    Способ оплаты
                                </h2>


                                <div className="payment-options">

                                    <label className="payment-option">

                                        <input
                                            type="radio"

                                            name="paymentMethod"

                                            value="CARD"

                                            checked={
                                                checkoutForm.paymentMethod ===
                                                'CARD'
                                            }

                                            onChange={event =>
                                                handleCheckoutChange(
                                                    'paymentMethod',
                                                    event.target.value
                                                )
                                            }
                                        />


                                        <div>

                                            <strong>
                                                Банковская карта
                                            </strong>

                                            <span>
                                                Оплата имитируется
                                                для учебного проекта
                                            </span>

                                        </div>

                                    </label>


                                    <label className="payment-option">

                                        <input
                                            type="radio"

                                            name="paymentMethod"

                                            value="SBP"

                                            checked={
                                                checkoutForm.paymentMethod ===
                                                'SBP'
                                            }

                                            onChange={event =>
                                                handleCheckoutChange(
                                                    'paymentMethod',
                                                    event.target.value
                                                )
                                            }
                                        />


                                        <div>

                                            <strong>
                                                СБП
                                            </strong>

                                            <span>
                                                Оплата имитируется
                                            </span>

                                        </div>

                                    </label>


                                    <label className="payment-option">

                                        <input
                                            type="radio"

                                            name="paymentMethod"

                                            value="CASH_ON_DELIVERY"

                                            checked={
                                                checkoutForm.paymentMethod ===
                                                'CASH_ON_DELIVERY'
                                            }

                                            onChange={event =>
                                                handleCheckoutChange(
                                                    'paymentMethod',
                                                    event.target.value
                                                )
                                            }
                                        />


                                        <div>

                                            <strong>
                                                При получении
                                            </strong>

                                            <span>
                                                Оплата будет
                                                ожидать подтверждения
                                            </span>

                                        </div>

                                    </label>

                                </div>

                            </section>


                            {checkoutError && (

                                <div className="form-error">
                                    {checkoutError}
                                </div>

                            )}


                            <button
                                type="submit"

                                className="primary-button full-width"

                                disabled={
                                    checkoutLoading
                                }
                            >

                                {checkoutLoading
                                    ? 'Создание заказа...'
                                    : 'Подтвердить заказ'}

                            </button>

                        </form>


                        <aside className="summary checkout-summary">

                            <h2>
                                Ваш заказ
                            </h2>


                            {cart &&
                                cart.items.map(
                                    item => (

                                        <div
                                            className="checkout-item"
                                            key={item.id}
                                        >

                                            <span>
                                                {item.productName}
                                                {' '}×{' '}
                                                {item.quantity}
                                            </span>

                                            <strong>
                                                €{
                                                item.totalPrice.toFixed(
                                                    2
                                                )
                                            }
                                            </strong>

                                        </div>

                                    )
                                )}


                            <div className="summary-row">

                                <span>
                                    Товары
                                </span>

                                <strong>
                                    €{
                                    cart?.subtotal.toFixed(
                                        2
                                    )
                                }
                                </strong>

                            </div>


                            <div className="summary-row">

                                <span>
                                    Доставка
                                </span>

                                <strong>

                                    {!cart ||
                                    cart.deliveryPrice === 0

                                        ? 'Бесплатно'

                                        : `€${cart.deliveryPrice.toFixed(2)}`}

                                </strong>

                            </div>


                            <div className="summary-total">

                                <span>
                                    Итого
                                </span>

                                <strong>
                                    €{
                                    cart?.totalPrice.toFixed(
                                        2
                                    )
                                }
                                </strong>

                            </div>

                        </aside>

                    </div>

                </main>

            )}

            {page === 'profile' && (
                <ProfilePage />
            )}
            {page === 'success' &&
                createdOrder && (

                    <main className="content">

                        <div className="success-page">

                            <div className="success-icon">
                                ✓
                            </div>


                            <h1>
                                Заказ создан
                            </h1>


                            <p className="success-description">

                                Спасибо за покупку.
                                Ваш заказ успешно
                                создан.

                            </p>


                            <div className="order-number">

                                Заказ №
                                {createdOrder.id}

                            </div>


                            <div className="success-card">

                                <div className="summary-row">

                                    <span>
                                        Статус
                                    </span>

                                    <strong>
                                        {createdOrder.status}
                                    </strong>

                                </div>


                                <div className="summary-row">

                                    <span>
                                        Способ оплаты
                                    </span>

                                    <strong>

                                        {createdOrder.paymentMethod ===
                                        'CARD'

                                            ? 'Банковская карта'

                                            : createdOrder.paymentMethod ===
                                            'SBP'

                                                ? 'СБП'

                                                : 'При получении'}

                                    </strong>

                                </div>


                                <div className="summary-row">

                                    <span>
                                        Статус оплаты
                                    </span>

                                    <strong>

                                        {createdOrder.paymentStatus ===
                                        'PAID'

                                            ? 'Оплачено'

                                            : 'Ожидает оплаты'}

                                    </strong>

                                </div>


                                <div className="summary-row">

                                    <span>
                                        Доставка
                                    </span>

                                    <strong>
                                        {createdOrder.city},
                                        {' '}
                                        {createdOrder.address}
                                    </strong>

                                </div>


                                <div className="summary-total">

                                    <span>
                                        Итого
                                    </span>

                                    <strong>
                                        €{
                                        createdOrder.totalPrice.toFixed(
                                            2
                                        )
                                    }
                                    </strong>

                                </div>

                            </div>


                            <div className="success-actions">

                                <button
                                    className="secondary-button"
                                    onClick={() =>
                                        setPage('catalog')
                                    }
                                >
                                    Продолжить покупки
                                </button>


                                <button
                                    className="primary-button"
                                    onClick={() =>
                                        setPage('cart')
                                    }
                                >
                                    Открыть корзину
                                </button>

                            </div>

                        </div>

                    </main>

                )}


            {selectedProduct && (

                <div
                    className="modal-overlay"

                    onClick={() =>
                        setSelectedProduct(null)
                    }
                >

                    <div
                        className="modal"

                        onClick={event =>
                            event.stopPropagation()
                        }
                    >

                        <button
                            className="modal-close"

                            onClick={() =>
                                setSelectedProduct(
                                    null
                                )
                            }
                        >
                            ×
                        </button>


                        <img
                            className="modal-image"

                            src={
                                selectedProduct.imageUrl
                            }

                            alt={
                                selectedProduct.name
                            }
                        />


                        <div className="modal-content">

                            <div className="product-brand">
                                {selectedProduct.brand}
                            </div>


                            <h2>
                                {selectedProduct.name}
                            </h2>


                            <div className="rating">
                                ★ {
                                selectedProduct.rating
                            }
                            </div>


                            <p>
                                {
                                    selectedProduct.description
                                }
                            </p>


                            <div className="modal-price">
                                €{
                                selectedProduct.price.toFixed(
                                    2
                                )
                            }
                            </div>


                            <button
                                className="cart-button"

                                disabled={
                                    selectedProduct.stock <=
                                    0
                                }

                                onClick={() => {

                                    handleAddToCart(
                                        selectedProduct
                                    );

                                    setSelectedProduct(
                                        null
                                    );

                                }}
                            >
                                Добавить в корзину
                            </button>

                        </div>

                    </div>

                </div>

            )}

        </div>
    );
}


export default App;