# Fullstack Store

Fullstack интернет-магазин на Java 21 и React.

Backend построен на Spring Boot и разделён на два сервиса: `Orders Service` и `Product Service`. Для авторизации используется Keycloak, данные хранятся в PostgreSQL. Все сервисы и инфраструктура запускаются через Docker Compose.

Проект также включает мониторинг и observability-стек на базе Prometheus, Grafana, Loki, Grafana Alloy и Tempo, а сборка и публикация Docker images автоматизированы через GitLab CI/CD.

## Архитектура

```text
                         ┌──────────────────┐
                         │     Frontend     │
                         │  React + Vite    │
                         │      :5173       │
                         └────────┬─────────┘
                                  │
                              REST / JWT
                                  │
                 ┌────────────────┴────────────────┐
                 │                                 │
        ┌────────▼────────┐               ┌────────▼────────┐
        │  Orders Service │               │ Product Service │
        │      :8080      │               │      :8081      │
        └────────┬────────┘               └────────┬────────┘
                 │                                 │
        ┌────────▼────────┐               ┌────────▼────────┐
        │    PostgreSQL   │               │    PostgreSQL   │
        │      :5434      │               │      :5433      │
        └─────────────────┘               └─────────────────┘

                         ┌──────────────────┐
                         │     Keycloak     │
                         │      :8082       │
                         └──────────────────┘
```

Frontend получает JWT через Keycloak и передаёт его backend-сервисам. Backend использует Spring Security и OAuth2 Resource Server для проверки токена.

`Orders Service` отвечает за корзину и заказы, а `Product Service` — за каталог и остатки товаров.

## Что реализовано

### Авторизация

Для управления пользователями используется Keycloak.

Frontend подключается к realm `store` через client `store-frontend`. Backend-сервисы работают как OAuth2 Resource Server и проверяют JWT, выданный Keycloak.

Используются:

* OAuth 2.0
* OpenID Connect
* JWT
* роли пользователей
* Spring Security

### Каталог

Каталог находится в `Product Service`.

Пользователь может получить список товаров, найти нужный товар и открыть его подробную информацию. Для товара доступны цена, рейтинг и текущее количество на складе.

`Product Service` также отвечает за изменение остатков.

### Корзина

Корзина реализована в `Orders Service` и привязана к авторизованному пользователю.

Поддерживаются добавление товара, изменение количества и удаление позиции. На странице корзины отображаются стоимость товаров, доставка и итоговая сумма.

### Заказы

Оформление заказа также выполняется через `Orders Service`.

При создании заказа сервис:

1. проверяет наличие товаров;
2. рассчитывает стоимость позиций;
3. рассчитывает доставку;
4. сохраняет данные заказа;
5. уменьшает остаток товара;
6. очищает корзину.

В текущей версии оплата не подключена к реальному платёжному провайдеру. Доступны варианты банковской карты, СБП и оплаты при получении, но сама транзакция имитируется.

### Данные заказа

В заказе сохраняются данные, необходимые для отображения истории покупки: состав заказа, количество, цена товара на момент покупки, стоимость позиций, доставка и итоговая сумма.

Цена товара фиксируется при создании заказа. Поэтому изменение цены в каталоге не меняет стоимость уже оформленного заказа.

## Backend

### Orders Service

**Port:** `8080`

Сервис отвечает за:

* корзину;
* оформление заказов;
* хранение заказов;
* историю заказов;
* проверку владельца заказа;
* расчёт итоговой стоимости;
* взаимодействие с `Product Service`.

Основные endpoints:

```http
GET    /api/cart
POST   /api/cart
PUT    /api/cart/{productId}
DELETE /api/cart/{productId}

POST   /api/checkout

GET    /api/orders
GET    /api/orders/{id}
```

### Product Service

**Port:** `8081`

Сервис отвечает за каталог товаров и остатки.

Основные endpoints:

```http
GET /api/products
GET /api/products/{id}
```

Также сервис предоставляет операции, необходимые для управления количеством товаров на складе.

## Frontend

Frontend написан на React и TypeScript с использованием Vite.

**Port:** `5173`

Основные страницы:

* каталог;
* корзина;
* оформление заказа;
* результат оформления заказа;
* личный кабинет.

В личном кабинете пользователь может посмотреть свои данные и историю заказов.

Для каждого заказа отображаются его статус, способ и статус оплаты, адрес доставки, состав заказа, количество товаров, цены и итоговая стоимость.

## Хранение данных

Каждый backend-сервис использует собственную PostgreSQL базу.

### Orders PostgreSQL

```text
Database: orders
Host port: 5434
Container port: 5432
```

### Products PostgreSQL

```text
Database: products
Host port: 5433
Container port: 5432
```

Данные хранятся в Docker volumes, поэтому обычный перезапуск контейнеров не удаляет базы данных.

## Keycloak

Keycloak доступен по адресу:

```text
http://localhost:8082
```

Используемый realm:

```text
store
```

Frontend client:

```text
store-frontend
```

Frontend получает токен через Keycloak. Backend проверяет JWT перед обработкой защищённых запросов.

## Observability

Для мониторинга приложения и инфраструктуры используется отдельный observability-стек:

```text
Prometheus
    │
    ├── application metrics
    ├── HTTP metrics
    ├── JVM metrics
    └── HikariCP metrics

Loki
    │
    └── application / container logs

Tempo
    │
    └── distributed traces

        ↓

     Grafana
```

### Prometheus

```text
http://localhost:9090
```

Spring Boot приложения публикуют метрики через:

```text
/actuator/prometheus
```

Собираются стандартные метрики Spring Boot, HTTP, JVM и HikariCP, а также бизнес-метрики приложения.

### Loki

```text
http://localhost:3100
```

Loki используется для хранения и поиска логов приложений и Docker-контейнеров.

### Grafana Alloy

Alloy используется как collector.

В текущей конфигурации он получает:

* Docker logs;
* OTLP traces.

### Tempo

```text
http://localhost:3200
```

Tempo используется для хранения traces.

OTLP endpoints:

```text
gRPC: 4317
HTTP: 4318
```

### Grafana

```text
http://localhost:3000
```

В Grafana подключены:

* Prometheus;
* Loki;
* Tempo.

Dashboard проекта загружается автоматически при запуске инфраструктуры.

## Структура проекта

```text
fullstack-store/
│
├── backend/
│   └── ...
│
├── product-service/
│   └── ...
│
├── frontend/
│   └── ...
│
├── infra/
│   ├── alloy/
│   ├── grafana/
│   ├── keycloak/
│   ├── loki/
│   ├── prometheus/
│   └── tempo/
│
├── docker-compose.yml
├── .gitignore
├── .gitlab-ci.yml
└── README.md
```

## Запуск

### Требования

Перед запуском должны быть установлены:

* Docker;
* Docker Compose;
* Java 21;
* Maven;
* Node.js;
* npm.

### Запуск через Docker Compose

```bash
docker compose up -d --build
```

Проверить состояние контейнеров:

```bash
docker compose ps
```

Посмотреть логи:

```bash
docker compose logs -f orders-service
```

Остановить проект:

```bash
docker compose down
```

Перезапустить отдельный сервис:

```bash
docker compose restart orders-service
```

После изменения frontend можно пересобрать только его:

```bash
docker compose up -d --build frontend
```

## Локальная разработка

Backend-сервисы можно собрать и проверить отдельно.

### Orders Service

```bash
cd backend
mvn test
```

### Product Service

```bash
cd product-service
mvn test
```

### Frontend

```bash
cd frontend
npm install
npm run build
```

## CI/CD

Для CI/CD используется GitLab CI/CD.

Pipeline выполняет следующие этапы:

1. запуск backend-тестов;
2. проверка сборки frontend;
3. сборка Docker images;
4. публикация images в GitLab Container Registry.

Используются три основных image:

```text
orders-service
product-service
frontend
```

Для images используются два типа тегов:

```text
<commit-sha>
latest
```

`latest` используется для основной ветки, а SHA позволяет однозначно определить версию конкретной сборки.

Развёртывание в Kubernetes пока не включено в pipeline.

## Безопасность

Конфигурационные файлы с секретами не должны попадать в Git.

В `.gitignore` исключены:

```text
application.yml
application.yaml
application-*.yml
application-*.yaml
realm.json
.env
```

Секреты, необходимые CI/CD, должны храниться в GitLab CI/CD Variables.

## Технологии

### Backend

* Java 21
* Spring Boot
* Spring MVC
* Spring Data JPA
* Hibernate
* Spring Security
* OAuth2 Resource Server
* PostgreSQL
* Maven

### Frontend

* React
* TypeScript
* Vite

### Infrastructure

* Docker
* Docker Compose
* Keycloak
* Prometheus
* Grafana
* Loki
* Grafana Alloy
* Tempo

### CI/CD

* GitLab CI/CD
* GitLab Container Registry

## Roadmap

Следующие изменения планируется добавить отдельно:

* Kubernetes;
* Helm;
* Kubernetes Secrets;
* API Gateway;
* Kafka;
* асинхронное взаимодействие между сервисами;
* интеграцию с реальным платёжным провайдером;
* уведомления о заказах;
* Grafana Alerts;
* горизонтальное масштабирование;
* production deployment.
