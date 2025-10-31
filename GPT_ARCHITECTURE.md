# 📋 MB-TRUST - Архитектура проекта для GPT

> **Последнее обновление:** Декабрь 2024  
> **Версия:** 2.0  
> **Статус:** Активная разработка

---

## 🎯 КРАТКИЙ ОБЗОР ПРОЕКТА

**MB-TRUST** — платформа для размещения рекламных заданий в социальных сетях с системой автоматических выплат, верификации и антифрод защитой.

**Технологический стек:**
- **Frontend:** Next.js 15 (App Router), React 19, TypeScript
- **UI:** Tailwind CSS, shadcn/ui компоненты
- **Backend:** Next.js API Routes, Prisma ORM
- **База данных:** SQLite (dev) / PostgreSQL (prod)
- **Интеграции:** Telegram Bot API, OpenAI API, YooKassa, Alfa-Bank

---

## 🔄 ЧТО ИЗМЕНИЛОСЬ ПОСЛЕ ПОСЛЕДНИХ ПРАВОК

### ✅ Последние изменения (Декабрь 2024):

#### 1. **Замена toast уведомлений на локальные компоненты**
   - **Было:** Использовалась система toast из `@/components/ui/toast`
   - **Стало:** Локальные уведомления через React state в каждом компоненте
   - **Файлы:**
     - `src/app/executor/available/page.tsx` - добавлен state `notification`
     - `src/app/executor/active/page.tsx` - добавлен state `notification`
     - `src/app/layout.tsx` - удален компонент `<Toaster />`

#### 2. **Инициализация Telegram бота**
   - **Было:** Динамический импорт без явного вызова функции
   - **Стало:** Создан отдельный файл `telegram-init-server.ts` для серверной инициализации
   - **Файлы:**
     - `src/lib/telegram-init-server.ts` (новый) - автоматическая инициализация на сервере
     - `src/lib/telegram-init.ts` - основная логика бота
     - `src/app/layout.tsx` - обновлен импорт

#### 3. **Запрос кода верификации в Telegram боте**
   - **Было:** Бот требовал код только через deep link в ссылке
   - **Стало:** Если код не передан, бот запрашивает его у пользователя вручную
   - **Файлы:**
     - `src/lib/telegram-init.ts` - добавлена логика запроса кода
     - `src/app/api/verification/telegram/complete/route.ts` - добавлен флаг `checkOnly` для проверки кода без завершения

#### 4. **Улучшенная обработка ошибок**
   - Добавлены уведомления об ошибках при загрузке данных
   - Улучшена валидация при загрузке скриншотов (тип файла, размер)
   - Добавлены понятные сообщения пользователю

---

## 🗺️ КАРТА ПЕРЕХОДОВ И НАВИГАЦИИ

### 📍 Точки входа:

```
Главная страница (/)
├── Регистрация (/auth/signup)
│   ├── Заказчик (/auth/signup/customer)
│   └── Исполнитель (/auth/signup/executor)
├── Вход (/auth/signin)
└── Верификация (/auth/verify)
```

### 👤 ПОЛЬЗОВАТЕЛЬСКИЕ РОЛИ И ПЕРЕХОДЫ:

#### 🔵 ЗАКАЗЧИК (CUSTOMER):

```
/auth/signup/customer
  ↓ (после регистрации)
/auth/verify?userId=XXX
  ↓ (после верификации через Telegram)
/dashboard/customer
  ├── /dashboard/customer/create-order - Создание заказа
  ├── /dashboard/customer/orders - Список заказов
  └── /customer/dashboard - Полная панель заказчика
      ├── /customer/advanced-orders - Продвинутые заказы
      └── /customer/refunds - Возвраты
```

**Логика перехода:**
1. Пользователь выбирает роль "Заказчик"
2. Нажимает "Войти через Telegram" → проверка существования аккаунта
3. Если пользователь не найден → `/auth/signup/customer`
4. Если найден, но не верифицирован → `/auth/verify?userId=XXX`
5. Если верифицирован → `/dashboard/customer`

#### 🟢 ИСПОЛНИТЕЛЬ (EXECUTOR):

```
/auth/signup/executor
  ↓ (после регистрации)
/auth/verify?userId=XXX
  ↓ (после верификации через Telegram)
/executor/available
  ├── /executor/active - Активные задания
  ├── /executor/history - История выполненных
  └── /executor/stats - Статистика исполнителя
```

**Логика перехода:**
1. Пользователь выбирает роль "Исполнитель"
2. Нажимает "Войти через Telegram" → проверка существования аккаунта
3. Если пользователь не найден → `/auth/signup/executor`
4. Если найден, но не верифицирован → `/auth/verify?userId=XXX`
5. Если верифицирован → `/executor/available` (ЕДИНСТВЕННАЯ ТОЧКА ВХОДА!)

**⚠️ ВАЖНО:** Все старые пути исполнителя редиректятся на `/executor/available`:
- `/executor/dashboard` → `/executor/available`
- `/dashboard/executor` → `/executor/available`

#### 🔴 АДМИН (ADMIN):

```
/admin-god/login (Супер-админ)
  ↓ (после авторизации)
/admin-god/dashboard
  ├── /admin-god/api-keys - API ключи
  └── /admin-god/trust-levels - Уровни доверия

/admin-moderator/login (Модератор)
  ↓ (после авторизации)
/admin-moderator/dashboard

/admin (Общая админка)
  ├── /admin/analytics - Аналитика
  └── /admin/moderate - Модерация
```

---

## 📱 TELEGRAM BOT - ЛОГИКА РАБОТЫ

### 🔄 Процесс верификации через Telegram:

```
1. Пользователь на сайте:
   /auth/signup/[role] 
   → Нажимает "Верификация через Telegram"
   → Генерируется код → Сохраняется в БД (user.verificationCode)
   → Открывается Telegram по deep link: t.me/BOT?start=link_XXX

2. В Telegram боте:
   
   Вариант A (с кодом в ссылке):
   /start link_XXX
   → Бот проверяет код в БД
   → Если верный → Начинает диалог сбора данных
   → Если неверный → Сообщение об ошибке
   
   Вариант B (без кода):
   /start
   → Бот запрашивает код у пользователя
   → Пользователь вводит код вручную
   → Бот проверяет код
   → Если верный → Начинает диалог

3. Сбор данных через AI:
   → Бот задает вопросы через OpenAI GPT
   → Пользователь отвечает свободным текстом
   → AI извлекает: имя, город, мессенджер, подписчики, ежедневные задания
   → Когда все собрано → Вызывается /api/verification/telegram/complete
   → Пользователь верифицирован (isVerified = true)
   → Код удаляется (verificationCode = null)

4. Возврат на сайт:
   → Пользователь возвращается на сайт
   → Страница /auth/verify опрашивает статус верификации
   → При isVerified = true → Редирект на соответствующий dashboard
```

### 📂 Файлы Telegram бота:

- `src/lib/telegram-init.ts` - Основная логика бота с AI
- `src/lib/telegram-init-server.ts` - Инициализация на сервере
- `src/app/api/verification/telegram/start/route.ts` - Генерация кода и deep link
- `src/app/api/verification/telegram/complete/route.ts` - Завершение верификации

---

## 🔀 ОСНОВНЫЕ ПЕРЕХОДЫ МЕЖДУ СТРАНИЦАМИ

### Форма регистрации → Верификация:
```typescript
// src/app/auth/signup/[role]/page.tsx
const handleTelegramLogin = async () => {
  // Получаем код с сервера
  const res = await fetch('/api/verification/telegram/start', {...})
  // Открываем Telegram
  window.open(data.deepLink)
  // Переходим на страницу ожидания верификации
  router.push(`/auth/verify?userId=${userId}`)
}
```

### Верификация → Dashboard:
```typescript
// src/app/auth/verify/page.tsx
// Опрашивает /api/users?userId=XXX каждые 1.5 секунды
// Когда isVerified = true:
router.push(user.role === 'CUSTOMER' 
  ? '/dashboard/customer' 
  : '/executor/available'
)
```

### Исполнитель: Принятие задания:
```typescript
// src/app/executor/available/page.tsx
const handleAccept = async (orderId: string) => {
  await fetch('/api/executions', {
    method: 'POST',
    body: JSON.stringify({ orderId, executorId })
  })
  // После успеха:
  router.push('/executor/active')
}
```

### Исполнитель: Загрузка скриншота:
```typescript
// src/app/executor/active/page.tsx
const upload = async (file: File, orderId: string) => {
  // Валидация: тип файла, размер (макс 10MB)
  const fd = new FormData()
  fd.append('file', file)
  await fetch('/api/executions/upload', { method: 'POST', body: fd })
  // Обновление списка заданий
  refreshExecutions()
}
```

---

## 🗂️ СТРУКТУРА ПРОЕКТА

```
mb-trust/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (routes)/
│   │   │   ├── auth/           # Аутентификация
│   │   │   │   ├── signin/
│   │   │   │   ├── signup/
│   │   │   │   │   ├── customer/
│   │   │   │   │   └── executor/
│   │   │   │   └── verify/     # ⭐ НОВОЕ: Страница ожидания верификации
│   │   │   ├── executor/       # ⭐ УНИФИЦИРОВАННАЯ НАВИГАЦИЯ
│   │   │   │   ├── page.tsx   # → редирект на /executor/available
│   │   │   │   ├── available/  # Доступные задания
│   │   │   │   ├── active/     # Активные задания
│   │   │   │   ├── history/    # История выполненных
│   │   │   │   └── stats/      # Статистика
│   │   │   ├── dashboard/
│   │   │   │   └── customer/
│   │   │   └── api/            # API Routes
│   │   │       ├── orders/
│   │   │       ├── executions/
│   │   │       └── verification/
│   │   ├── layout.tsx          # ⭐ Обновлено: инициализация бота
│   │   └── page.tsx            # Главная страница
│   ├── components/
│   │   ├── ui/                 # ⚠️ ЗАФИКСИРОВАННЫЕ компоненты (не менять!)
│   │   ├── business/
│   │   │   ├── OrderCard.tsx   # ⭐ Обновлено: показ описания, ссылок, скриншотов
│   │   │   └── ExecutionStatusBadge.tsx
│   │   └── layout/
│   │       └── ExecutorNav.tsx # Навигация для исполнителя
│   └── lib/
│       ├── telegram-init.ts    # ⭐ Обновлено: запрос кода, AI диалог
│       ├── telegram-init-server.ts # ⭐ НОВОЕ: серверная инициализация
│       └── prisma.ts           # Prisma клиент
```

---

## 🔌 API ENDPOINTS (Ключевые)

### Заказы (Orders):
- `POST /api/orders` - Создание заказа (заказчик)
- `GET /api/orders?role=executor` - Список доступных заданий (исполнитель)
- `GET /api/orders?role=customer&userId=XXX` - Заказы заказчика

### Выполнения (Executions):
- `POST /api/executions` - Принятие задания исполнителем
- `GET /api/executions?executorId=XXX` - Все выполнения исполнителя
- `GET /api/executions?executorId=XXX&status=COMPLETED` - Фильтр по статусу
- `POST /api/executions/upload` - Загрузка скриншота выполнения

### Верификация:
- `POST /api/verification/telegram/start` - Генерация кода верификации
- `POST /api/verification/telegram/complete` - ⭐ Обновлено: проверка кода (`checkOnly`) или завершение верификации

### Пользователи:
- `GET /api/users?userId=XXX` - Информация о пользователе
- `GET /api/users?telegramId=XXX` - Поиск по Telegram ID

---

## 🎨 UI КОМПОНЕНТЫ (Правила работы)

### ⚠️ ЗАПРЕЩЕНО ИЗМЕНЯТЬ:
- `src/components/ui/*` - Все компоненты из shadcn/ui
- `src/app/globals.css` - Глобальные стили
- Tailwind конфигурация

### ✅ РАЗРЕШЕНО:
- Менять props и handlers в UI компонентах
- Добавлять логику в страницы
- Создавать новые API endpoints
- Работать с базой данных

### 📦 Ключевые бизнес-компоненты:

#### `OrderCard` (`src/components/business/OrderCard.tsx`):
```typescript
interface OrderCardProps {
  order: OrderUI;
  onAccept: (orderId: string) => void;
  compact?: boolean;
  hideAcceptButton?: boolean;
  showScreenshotUpload?: boolean; // Для исполнителей
  onScreenshotUpload?: (file: File, orderId: string) => void;
}
```

**Отображает:**
- Название и описание задания
- Изображение для размещения
- QR код
- Кнопку "Принять заказ" (для исполнителей)
- Окно загрузки скриншота (для активных заданий)

#### `ExecutorNav` (`src/components/layout/ExecutorNav.tsx`):
Навигация между разделами исполнителя:
- Доступные задания
- Активные задания
- История
- Статистика

---

## 🗄️ БАЗА ДАННЫХ (Prisma Schema)

### Ключевые модели:

#### `User`:
```prisma
model User {
  id                String   @id @default(nanoid())
  telegramId        String?  @unique
  verificationCode  String?  // ⭐ Генерируется при /api/verification/telegram/start
  isVerified        Boolean  @default(false) // ⭐ Обновляется после завершения верификации
  role              Role     @default(CUSTOMER)
  // ...
}
```

#### `Order`:
```prisma
model Order {
  id                  String   @id @default(nanoid())
  title               String
  description         String   // ⭐ Показывается исполнителям
  processedImageUrl   String?  // Изображение для размещения
  qrCodeUrl           String?  // QR код
  reward              Float
  status              OrderStatus
  // ...
  executions          Execution[]
}
```

#### `Execution`:
```prisma
model Execution {
  id              String   @id @default(nanoid())
  orderId         String
  executorId      String
  status          ExecutionStatus // PENDING, IN_PROGRESS, UPLOADED, COMPLETED...
  screenshotUrl   String?
  // ...
  order           Order    @relation(fields: [orderId], references: [id])
  executor        User    @relation(fields: [executorId], references: [id])
}
```

---

## 🔐 СИСТЕМА АВТЕНТИФИКАЦИИ

### Текущий подход:
- **Telegram только** (для тестирования)
- Пользователь проходит регистрацию → получает код → верифицируется в боте → возвращается на сайт

### Переменные окружения:
```env
BOT_TOKEN=8345454942:AAFoOh3asQ104UUvIxNgMTpLCwwFI1oIJDY
TELEGRAM_BOT_USERNAME=MBTRUST_bot
OPENAI_API_KEY=your-openai-key-here
NEXTAUTH_URL=http://localhost:3000
```

---

## 🐛 ИЗВЕСТНЫЕ ОСОБЕННОСТИ

1. **Тестовые пользователи:** 
   - Используется `test-executor-1` как жестко закодированный ID
   - TODO: Заменить на реальную сессию

2. **Уведомления:**
   - Заменены на локальные компоненты (не toast)
   - Автоматически скрываются через 5 секунд

3. **Telegram бот:**
   - Инициализируется только на сервере (`typeof window === 'undefined'`)
   - Предотвращает множественные экземпляры через флаг `isInitialized`

4. **Редиректы старых путей:**
   - `/executor/dashboard` → `/executor/available`
   - `/dashboard/executor` → `/executor/available`

---

## 🚀 КАК ЗАПУСТИТЬ ПРОЕКТ

```bash
# 1. Установить зависимости
npm install

# 2. Настроить .env.local
BOT_TOKEN=ваш_токен
OPENAI_API_KEY=ваш_ключ

# 3. Инициализировать БД
npx prisma db push
npx prisma generate

# 4. Запустить dev сервер
npm run dev

# 5. Открыть http://localhost:3000
```

---

## 📝 ЧЕКЛИСТ ДЛЯ РАЗРАБОТКИ

### При добавлении нового функционала:

- [ ] Проверь, не изменяешь ли UI компоненты (`src/components/ui/*`)
- [ ] Если работаешь с Telegram ботом - убедись, что инициализация происходит только на сервере
- [ ] При добавлении новых страниц - проверь редиректы для исполнителей
- [ ] Используй локальные уведомления вместо toast
- [ ] Проверь, что обработка ошибок корректна
- [ ] Убедись, что все API endpoints возвращают правильные статусы

---

## 🔗 ПОЛЕЗНЫЕ ССЫЛКИ

- **Next.js 15 Docs:** https://nextjs.org/docs
- **Prisma Docs:** https://www.prisma.io/docs
- **Telegram Bot API:** https://core.telegram.org/bots/api
- **shadcn/ui:** https://ui.shadcn.com

---

**Последняя правка:** Декабрь 2024  
**Подготовлено для:** GPT-4, Claude, другие AI ассистенты




