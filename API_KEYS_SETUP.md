# 🔑 Настройка API ключей для MB-TRUST

## 📋 Что нужно получить

Для полноценной работы платформы нужны API ключи от следующих сервисов:

---

## 1️⃣ OpenAI API (AI проверка скриншотов)

**Зачем:** Проверка QR-кодов на скриншотах, анализ контента, антифрод

**Регистрация:**
1. Перейти на https://platform.openai.com/signup
2. Зарегистрироваться или войти
3. Перейти в https://platform.openai.com/api-keys
4. Нажать "Create new secret key"
5. Скопировать ключ (начинается с `sk-...`)

**Добавить в `.env.local`:**
```env
OPENAI_API_KEY="sk-your-actual-key-here"
```

**Стоимость:** 
- GPT-4 Vision: ~$0.01 за изображение
- Примерно 100₽ на 10 000 проверок

---

## 2️⃣ DaData API (Автодополнение адресов)

**Зачем:** Умный поиск городов и регионов при создании заказа

**Регистрация:**
1. Перейти на https://dadata.ru/registration/
2. Создать аккаунт
3. Перейти в https://dadata.ru/profile/#info
4. Скопировать API Token

**Добавить в `.env.local`:**
```env
DADATA_API_KEY="your-dadata-token"
```

**Стоимость:** 
- Бесплатно: 10 000 запросов/день
- Платно: от 990₽/месяц

**Альтернатива:** Без ключа работает локальный список из 54 городов

---

## 3️⃣ YooKassa (Прием платежей)

**Зачем:** Пополнение баланса заказчиками (карты, СБП)

**Регистрация:**
1. Перейти на https://yookassa.ru/registration/
2. Пройти верификацию
3. Перейти в https://yookassa.ru/my/
4. Найти Shop ID и Secret Key

**Добавить в `.env.local`:**
```env
YOOKASSA_SHOP_ID="your-shop-id"
YOOKASSA_SECRET_KEY="your-secret-key"
```

**Стоимость:**
- Карты: 2.9% + 15₽ за транзакцию
- СБП: 0.6% за транзакцию

---

## 4️⃣ Tribute (Выплаты в Telegram Wallet)

**Зачем:** Вывод средств исполнителям в Telegram кошелек

**Регистрация:**
1. Перейти на https://tribute.app/
2. Подключить Telegram аккаунт
3. Получить API ключ в настройках
4. Настроить webhook (по желанию)

**Добавить в `.env.local`:**
```env
TRIBUTE_API_KEY="your-tribute-api-key"
```

**Стоимость:**
- Комиссия Tribute: ~1-2% за выплату
- Блокчейн комиссия: минимальная

---

## 5️⃣ Telegram Bot (Работает без ключа)

**Зачем:** Уведомления, коды верификации, команды

**Получение токена:**
1. Написать @BotFather в Telegram
2. Отправить `/newbot`
3. Выбрать имя и username
4. Получить токен бота

**Добавить в `.env.local`:**
```env
TELEGRAM_BOT_TOKEN="your-bot-token"
```

**Стоимость:** Бесплатно

---

## 🚀 Приоритет настройки

### Минимально необходимое (MVP):
1. ✅ Telegram Bot (30 секунд)
2. ✅ OpenAI (2 минуты) - для AI проверки
3. ⚠️ YooKassa (1 день на верификацию) - для приема денег

### Для полной функциональности:
4. ⚠️ DaData (5 минут) - умное автодополнение
5. ⚠️ Tribute (10 минут) - выплаты исполнителям

---

## 📝 Порядок действий

### Шаг 1: Получить обязательные ключи
```bash
# 1. Telegram Bot (самый быстрый)
# Получи токен от @BotFather

# 2. OpenAI
# https://platform.openai.com/api-keys
# Получи ключ, добавь в .env.local

# 3. YooKassa (важно для приема денег)
# https://yookassa.ru/registration/
# Пройди верификацию, получи Shop ID и Secret Key
```

### Шаг 2: Добавить в `.env.local`
```env
# Telegram Bot (обязательно)
TELEGRAM_BOT_TOKEN="your-bot-token-from-botfather"

# OpenAI (обязательно)
OPENAI_API_KEY="sk-your-openai-key"

# YooKassa (обязательно для приема денег)
YOOKASSA_SHOP_ID="your-shop-id"
YOOKASSA_SECRET_KEY="your-secret-key"

# DaData (опционально - работает без нее)
DADATA_API_KEY="your-dadata-token"

# Tribute (опционально - работает без нее)
TRIBUTE_API_KEY="your-tribute-key"
```

### Шаг 3: Запустить проект
```bash
npm run dev
```

---

## ⚠️ Важно

- **TELEGRAM_BOT_TOKEN** - получить ОБЯЗАТЕЛЬНО (за 1 минуту через @BotFather)
- **OPENAI_API_KEY** - получить РЕКОМЕНДУЕТСЯ (для реальной проверки скриншотов)
- **YOOKASSA** - получить НЕОБХОДИМО для приема реальных денег
- **DaData** - опционально (есть fallback на локальные города)
- **Tribute** - опционально (можно выплачивать вручную через бота)

## 💡 Советы

1. Начни с Telegram Bot и OpenAI - это можно сделать за 5 минут
2. YooKassa требует верификации (ID, реквизиты) - может занять 1-3 дня
3. DaData и Tribute можно добавить позже
4. Все API работают с заглушками если ключей нет (для тестирования)

