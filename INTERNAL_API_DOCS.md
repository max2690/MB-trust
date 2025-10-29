# 🔌 Internal API Documentation

Internal API для подключения внешних приложений (мобильные приложения, Telegram боты, интеграции).

## 🔑 Аутентификация

Все запросы к Internal API требуют API ключа.

### Получение API ключа

1. Войдите в админ панель: `/admin-god/api-keys`
2. Нажмите "Создать ключ"
3. Укажите название, описание и права доступа
4. Скопируйте ключ (показывается только один раз!)

### Использование API ключа

Добавьте заголовок в каждый запрос:

```bash
# Вариант 1: X-API-Key
curl -H "X-API-Key: your-api-key" https://your-domain.com/api/v1/orders

# Вариант 2: Bearer token
curl -H "Authorization: Bearer your-api-key" https://your-domain.com/api/v1/orders
```

---

## 📋 Права доступа

Права доступа задаются при создании API ключа:

- `orders:read` - Просмотр заказов
- `orders:write` - Создание заказов
- `executions:read` - Просмотр выполнений
- `executions:write` - Создание/изменение выполнений
- `users:read` - Просмотр пользователей
- `payments:read` - Просмотр платежей
- `*` - Все права доступа

---

## 📡 Endpoints

### Базовый URL

```
https://your-domain.com/api/v1
```

### Orders (Заказы)

#### GET /api/v1/ 【ers

Получить список заказов.

**Параметры запроса:**
- `status` - Фильтр по статусу (ACTIVE, IN_PROGRESS, COMPLETED)
- `platform` - Фильтр по платформе (INSTAGRAM, TELEGRAM, VK, TIKTOK)
- `limit` - Количество записей (по умолчанию 100, максимум 100)
- `offset` - Смещение для пагинации

**Требуемые права:** `orders:read`

**Пример:**
```bash
curl -H "X-API-Key: your-key" \
  "https://your-domain.com/api/v1/orders?status=ACTIVE&limit=50"
```

**Ответ:**
```json
{
  "success": true,
  "data": [
    {
      "id": "order-id",
      "title": "Продвижение товара",
      "description": "Разместить сторис",
      "socialNetwork": "INSTAGRAM",
      "targetAudience": "18-35",
      "deadline": "2024-12-31T23:59:59Z",
      "reward": 100,
      "status": "ACTIVE",
      "customer": {
        "id": "customer-id",
        "name": "Иван Петров",
        "city": "Москва",
        "region": "Москва"
      }
    }
  ],
  "total": 150,
  "limit": 50,
  "offset": 0
}
```

#### POST /api/v1/orders

Создать новый заказ.

**Требуемые права:** `orders:write`

**Тело запроса:**
```json
{
  "customerId": "customer-id",
  "title": "Продвижение товара",
  "description": "Разместить сторис в Instagram",
  "socialNetwork": "INSTAGRAM",
  "targetAudience": "18-35",
  "deadline": "2024-12-31T23:59:59Z",
  "reward": 100,
  "qrCodeUrl": "https://example.com/qr.png",
  "targetCountry": "Россия",
  "targetRegion": "Москва",
  "targetCity": "Москва"
}
```

**Ответ:**
```json
{
  "success": true,
  "data": {
    "id": "order-id",
    "title": "Продвижение товара",
    "status": "ACTIVE",
    ...
  }
}
```

---

### Executions (Выполнения)

#### GET /api/v1/executions

Получить список выполнений.

**Параметры запроса:**
- `executorId` - ID исполнителя
- `orderId` - ID заказа
- `status` - Фильтр по статусу (PENDING, ACCEPTED, REJECTED)
- `limit` - Количество записей
- `offset` - Смещение для пагинации

**Требуемые права:** `executions:read`

**Пример:**
```bash
curl -H "X-API-Key: your-key" \
  "https://your-domain.com/api/v1/executions?executorId=executor-id"
```

#### POST /api/v1/executions

Принять заказ (взять задание).

**Требуемые права:** `executions:write`

**Тело запроса:**
```json
{
  "orderId": "order-id",
  "executorId": "executor-id",
  "screenshotUrl": "https://example.com/screenshot.png",
  "notes": "Заметки исполнителя"
}
```

**Ответ:**
```json
{
  "success": true,
  "data": {
    "id": "execution-id",
    "orderId": "order-id",
    "executorId": "executor-id",
    "status": "PENDING",
    "reward": 100,
    ...
  }
}
```

---

### Users (Пользователи)

#### GET /api/v1/users

Получить данные пользователя.

**Параметры запроса:**
- `id` - ID пользователя
- `phone` - Телефон пользователя
- `email` - Email пользователя

**Требуемые права:** `users:read`

**Пример:**
```bash
curl -H "X-API-Key: your-key" \
  "https://your-domain.com/api/v1/users?id=user-id"
```

**Ответ:**
```json
{
  "success": true,
  "data": {
    "id": "user-id",
    "name": "Иван Петров",
    "email": "ivan@example.com",
    "phone": "+79991234567",
    "role": "EXECUTOR",
    "level": "VERIFIED",
    "balance": 500,
    "isVerified": true,
    "city": "Москва",
    "region": "Москва",
    "country": "Россия",
    "totalExecutions": 25,
    "averageRating": 4.8
  }
}
```

---

## 📱 Примеры использования

### Android/iOS приложение

```kotlin
// Kotlin пример
val response = httpClient.get("https://your-domain.com/api/v1/orders") {
    header("X-API-Key", "your-api-key")
    parameter("status", "ACTIVE")
}
```

```swift
// Swift пример
var request = URLRequest(url: URL(string: "https://your-domain.com/api/v1/orders")!)
request.setValue("your-api-key", forHTTPHeaderField: "X-API-Key")
let session = URLSession.shared
session.dataTask(with: request) { data, response, error in
    // Обработка ответа
}
```

### JavaScript/TypeScript

```typescript
// Получить заказы
const orders = await fetch('https://your-domain.com/api/v1/orders', {
  headers: {
    'X-API-Key': 'your-api-key'
  }
}).then(r => r.json());

// Взять задание
const execution = await fetch('https://your-domain.com/api/v1/executions', {
  method: 'POST',
  headers: {
    'X-API-Key': 'your-api-key',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    orderId: 'order-id',
    executorId: 'executor-id',
    screenshotUrl: 'https://example.com/screenshot.png'
  })
}).then(r => r.json());
```

### Telegram бот

```typescript
// Node.js
bot.on('callback_query', async (callback) => {
  const orderId = callback.data;
  
  // Принять заказ через API
  const response = await fetch('https://your-domain.com/api/v1/executions', {
    method: 'POST',
    headers: {
      'X-API-Key': 'bot-api-key',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      orderId,
      executorId: callback.from.id.toString(),
      screenshotUrl: ''
    })
  });
  
  const result = await response.json();
  
  if (result.success) {
    bot.answerCallbackQuery(callback.id, 'Заказ принят!');
  } else {
    bot.answerCallbackQuery(callback.id, 'Ошибка: ' + result.error);
  }
});
```

---

## 🚨 Обработка ошибок

### Коды ответов

- `200` - Успешный запрос
- `400` - Неверные параметры запроса
- `401` - Недействительный или отсутствующий API ключ
- `403` - Недостаточно прав доступа
- `404` - Ресурс не найден
- `500` - Внутренняя ошибка сервера

### Формат ошибок

```json
{
  "error": "Invalid API key"
}
```

```json
{
  "error": "Missing required fields"
}
```

```json
{
  "error": "Insufficient permissions"
}
```

---

## 📊 Rate Limits

- **Лимит:** 100 запросов в минуту на ключ
- **Превышение:** 429 Too Many Requests
- **Примечание:** В будущем будет настраиваться индивидуально для каждого ключа

---

## 🔒 Безопасность

1. **Никогда не публикуйте API ключ** в код публичных репозиториев
2. **Используйте переменные окружения** для хранения ключей
3. **Удаляйте неиспользуемые ключи** регулярно
4. **Используйте минимальные права** доступа (принцип least privilege)
5. **Устанавливайте срок действия** ключа при создании

---

## 🆘 Поддержка

- **Email:** support@mb-trust.ru
- **Telegram:** @mb_trust_support
- **Документация:** https://docs.mb-trust.ru

---

## 📝 Changelog

### v1.0.0 (2024-12)
- Добавлена поддержка GET /orders
- Добавлена поддержка POST /orders
- Добавлена поддержка GET /executions
- Добавлена поддержка POST /executions
- Добавлена поддержка GET /users
- Добавлена система прав доступа

