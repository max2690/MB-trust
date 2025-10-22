# 🚀 MB-TRUST - Платформа честных заданий и выплат

## 🎯 Описание проекта

**MB-TRUST** - это полнофункциональная платформа для размещения рекламных заданий в социальных сетях с системой честных выплат, антифрод защитой и многоуровневой верификацией.

### ✅ РЕАЛИЗОВАННЫЕ ВОЗМОЖНОСТИ:

#### 🎯 **Основной функционал:**
- 📱 **Размещение заданий** в Instagram, TikTok, VK, Telegram, WhatsApp, Facebook
- 💰 **Честные выплаты** с системой уровней доверия (NOVICE → VERIFIED → REFERRAL → TOP)
- 🔐 **Многоуровневая верификация** (Telegram, Email, SMS) с заглушками для тестирования
- 🛡️ **Антифрод защита** с KYC, лимитами исполнителей и проверками
- 📊 **Полная аналитика** кликов, конверсий, статистики
- 👥 **Двухуровневая админ-система** (Супер-админ + Модераторы)

#### 🚀 **Продвинутые функции:**
- 🔄 **Реферальная система** с мгновенными повышениями уровня
- 📈 **Массовые заказы** и кампании (еженедельные/двухнедельные)
- 🧮 **Встроенный калькулятор стоимости** заказов
- 📱 **QR-коды** для отслеживания переходов
- 🖼️ **Проверка скриншотов** через AI (OpenAI Vision, Google Vision, Claude)
- 💳 **Платежная система** (YooKassa, Alfa-Bank) с автоматическими комиссиями
- 🔄 **Система возвратов** с автоматическими проверками
- 📊 **Графики конверсий** и детальная аналитика

#### 🛠️ **Технические возможности:**
- ⚡ **Next.js 15** с App Router
- 🗄️ **Prisma ORM** с SQLite
- 🎨 **Tailwind CSS** + shadcn/ui компоненты
- 🔐 **NextAuth** для аутентификации
- 📱 **Telegram Bot** интеграция
- 📧 **Email верификация** через SMTP
- 📱 **SMS верификация** через SMSC.ru
- 🤖 **AI интеграция** для анализа контента

---

## 🚀 Быстрый старт

### 1. Клонирование репозитория
```bash
git clone https://github.com/max2690/MB-trust.git
cd MB-trust
```

### 2. Установка зависимостей
```bash
npm install
```

### 3. Настройка переменных окружения
```bash
# Скопируйте .env.example в .env.local
cp .env.example .env.local

# Отредактируйте .env.local с вашими данными
# Для тестирования можно оставить заглушки
```

### 4. Инициализация базы данных
```bash
# Применяем схему базы данных
npx prisma db push

# Генерируем Prisma клиент
npx prisma generate
```

### 5. Создание тестовых данных (опционально)
```bash
# Создаем супер-админа и тестовых пользователей
node create-test-data.js
```

### 6. Запуск проекта
```bash
npm run dev
```

### 7. Открыть в браузере
```
http://localhost:3000
```

---

## 🔧 Настройка переменных окружения

### Обязательные переменные:
```env
DATABASE_URL="file:./prisma/dev.db"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### Для полного функционала:
```env
# Telegram Bot
TELEGRAM_BOT_TOKEN="your_telegram_bot_token"

# Email верификация
SMTP_HOST="smtp.gmail.com"
SMTP_USER="your_email@gmail.com"
SMTP_PASS="your_app_password"

# SMS верификация
SMSC_LOGIN="your_smsc_login"
SMSC_PASSWORD="your_smsc_password"

# Платежи
YOOKASSA_SHOP_ID="your_yookassa_shop_id"
YOOKASSA_SECRET_KEY="your_yookassa_secret_key"
```

---

## 🎮 Тестовые данные

### Супер-админ:
- **Логин:** `Max260790Bax`
- **Пароль:** `Left4dead2-`
- **Телефон:** `89241242417`
- **Email:** `shveddamir@gmail.com`

### Тестовые пользователи:
- **Заказчик:** `ivan@test.com` / `test123`
- **Исполнитель:** `maria@test.com` / `test123`
- **Заказчик:** `alex@test.com` / `test123`

---

## 🔗 Основные ссылки

### Админ панели:
- **Супер-админ:** http://localhost:3000/admin-god/dashboard
- **Модератор:** http://localhost:3000/admin-moderator/dashboard

### Пользовательские страницы:
- **Главная:** http://localhost:3000
- **Регистрация:** http://localhost:3000/auth/signup
- **Вход:** http://localhost:3000/auth/signin

### Тестовые ссылки (DEV MODE):
- **Быстрый доступ:** http://localhost:3000/test-links

---

## 🛠️ Разработка

### Структура проекта:
```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API маршруты
│   ├── admin-god/         # Супер-админ панель
│   ├── admin-moderator/   # Модератор панель
│   └── auth/              # Аутентификация
├── components/            # React компоненты
│   └── ui/               # shadcn/ui компоненты
├── lib/                   # Утилиты и конфигурация
└── prisma/               # База данных
    └── schema.prisma     # Схема Prisma
```

### Основные команды:
```bash
# Разработка
npm run dev

# Сборка
npm run build

# Запуск production
npm start

# Линтинг
npm run lint

# Prisma команды
npx prisma studio          # GUI для базы данных
npx prisma db push         # Применить изменения схемы
npx prisma generate        # Генерировать клиент
```

---

## 🔐 Безопасность

### Режим разработки (DEV MODE):
- ✅ Автоматический вход в админ панели
- ✅ Пропуск верификации кодов
- ✅ Прямой доступ к дашбордам
- ✅ Тестовые данные

### Production:
- 🔒 Полная аутентификация
- 🔒 Двухфакторная верификация
- 🔒 Проверка прав доступа
- 🔒 Защита от CSRF

---

## 📊 API Endpoints

### Аутентификация:
- `POST /api/admin/auth/login` - Вход админа
- `GET /api/admin/auth/session` - Проверка сессии

### Заказы:
- `GET /api/orders` - Список заказов
- `POST /api/orders` - Создание заказа
- `GET /api/orders/calculator` - Калькулятор стоимости

### Платежи:
- `POST /api/payments/create` - Создание платежа
- `GET /api/payments/yookassa/stub` - Заглушка YooKassa
- `GET /api/payments/alfa/stub` - Заглушка Alfa-Bank

### Аналитика:
- `GET /api/admin/statistics` - Статистика
- `GET /api/track/[qrCodeId]` - Отслеживание QR-кодов

---

## 🎨 Дизайн и UI

### Компоненты:
- **shadcn/ui** - Современные React компоненты
- **Tailwind CSS** - Utility-first CSS фреймворк
- **Lucide React** - Иконки
- **Recharts** - Графики и диаграммы

### Цветовая схема:
- **Основной:** Черный фон
- **Акценты:** Бирюзовый и золотой
- **Состояния:** Зеленый (успех), Красный (ошибка)

---

## 🚀 Деплой

### Vercel (рекомендуется):

#### 1. Подготовка проекта:
```bash
# Клонируем репозиторий
git clone https://github.com/max2690/MB-trust.git
cd MB-trust

# Устанавливаем зависимости
npm install
```

#### 2. Настройка переменных окружения:
Скопируйте `env.example` в `.env.local` и заполните переменные:

```bash
cp env.example .env.local
```

**Обязательные переменные для продакшна:**
```env
DATABASE_URL="postgresql://username:password@host:port/database"
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="https://your-app.vercel.app"
TELEGRAM_BOT_TOKEN="your_telegram_bot_token"
```

#### 3. Деплой на Vercel:

**Вариант А: Через веб-интерфейс (рекомендуется):**
1. Зайдите на [vercel.com](https://vercel.com)
2. Нажмите "Import Project"
3. Выберите репозиторий `max2690/MB-trust`
4. Настройте переменные окружения
5. Выберите Vercel Postgres для базы данных
6. Нажмите "Deploy"

**Вариант Б: Через CLI:**
```bash
# Установка Vercel CLI
npm i -g vercel

# Логин в Vercel
vercel login

# Деплой
vercel --prod
```

#### 4. Настройка базы данных:
1. В Vercel Dashboard выберите ваш проект
2. Перейдите в "Storage" → "Create Database" → "Postgres"
3. Скопируйте `DATABASE_URL` в переменные окружения
4. Перезапустите деплой

#### 5. Применение миграций:
```bash
# После деплоя выполните миграции
npx prisma db push
npx prisma generate
```

### Railway:

```bash
# Установка Railway CLI
npm install -g @railway/cli

# Логин и деплой
railway login
railway init
railway up
```

---

## 📝 Лицензия

MIT License - см. файл [LICENSE](LICENSE)

---

## 🤝 Поддержка

- **GitHub Issues:** [Создать issue](https://github.com/max2690/MB-trust/issues)
- **Email:** shveddamir@gmail.com
- **Telegram:** @max2690

---

## 🎉 Благодарности

Спасибо всем разработчикам за вклад в проект!

**Сделано с ❤️ для честного бизнеса**