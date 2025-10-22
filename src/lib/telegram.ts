import TelegramBot from 'node-telegram-bot-api';

// Типы для Telegram Bot API
type TelegramMessage = {
  message_id: number;
  from?: {
    id: number;
    first_name?: string;
    last_name?: string;
    username?: string;
  };
  chat: {
    id: number;
    type: string;
  };
  text?: string;
  date: number;
};

type TelegramError = {
  code: number;
  description: string;
};

// Инициализация бота
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN!, { 
  polling: false,
  webHook: false  // Полностью отключить polling и webhook
});

// Заглушка для Telegram в development
const sendTelegramStub = async (telegramId: string, message: string, type: string) => {
  console.log(`
🤖 TELEGRAM ВЕРИФИКАЦИЯ (ЗАГЛУШКА)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━      
📱 Telegram ID: ${telegramId}
📋 Сообщение: ${message.replace(/\*/g, '').replace(/`/g, '')}
👤 Тип: ${type}
⏰ Время: ${new Date().toLocaleString()}
💰 Стоимость: 0₽ (заглушка)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━      
  `);
  
  return { success: true, cost: 0, method: 'stub' };
};

// Отправка кода верификации
export const sendVerificationCode = async (telegramId: string, code: string, type: 'admin' | 'user' = 'user') => {
  try {
    // Проверяем, что это не тестовый ID
    if (telegramId === '123456789' || !telegramId || telegramId.length < 5) {
      const message = type === 'admin' 
        ? `Код верификации MB-TRUST Admin: ${code}`
        : `Код верификации MB-TRUST: ${code}`;
      
      return await sendTelegramStub(telegramId, message, type);
    }

    const message = type === 'admin' 
      ? `
🔐 **Код верификации MB-TRUST Admin**

Ваш код: \`${code}\`

⏰ Действует: 2 минуты
🔒 Не передавайте код третьим лицам
      `
      : `
🔐 **Код верификации MB-TRUST**

Ваш код: \`${code}\`

⏰ Действует: 2 минуты
🔒 Не передавайте код третьим лицам
      `;

    await bot.sendMessage(telegramId, message, { parse_mode: 'Markdown' });
    return { success: true };
  } catch (error) {
    console.error('Ошибка отправки Telegram сообщения:', error);
    
    // Fallback на заглушку при ошибке
    const message = type === 'admin' 
      ? `Код верификации MB-TRUST Admin: ${code}`
      : `Код верификации MB-TRUST: ${code}`;
    
    return await sendTelegramStub(telegramId, message, type);
  }
};

// Отправка уведомления о заказе
export const sendOrderNotification = async (telegramId: string, orderData: any) => {
  try {
    // Проверяем, что это не тестовый ID
    if (telegramId === '123456789' || !telegramId || telegramId.length < 5) {
      const message = `Новый заказ MB-TRUST: ${orderData.title}`;
      return await sendTelegramStub(telegramId, message, 'order');
    }

    const message = `
📢 **Новый заказ доступен!**

📋 **${orderData.title}**
💰 **Вознаграждение:** ${orderData.reward}₽
🌍 **Регион:** ${orderData.region}
📱 **Платформа:** ${orderData.socialNetwork}
⏰ **Дедлайн:** ${new Date(orderData.deadline).toLocaleString()}

🎯 **Описание:** ${orderData.description}

Перейдите в приложение для принятия заказа.
    `;
    
    await bot.sendMessage(telegramId, message, { parse_mode: 'Markdown' });
    return { success: true };
  } catch (error) {
    console.error('Ошибка отправки уведомления о заказе:', error);
    
    // Fallback на заглушку при ошибке
    const message = `Новый заказ MB-TRUST: ${orderData.title}`;
    return await sendTelegramStub(telegramId, message, 'order');
  }
};

// Отправка уведомления о выполнении
export const sendExecutionNotification = async (telegramId: string, executionData: any) => {
  try {
    // Проверяем, что это не тестовый ID
    if (telegramId === '123456789' || !telegramId || telegramId.length < 5) {
      const message = `Выполнение заказа MB-TRUST: ${executionData.orderTitle}`;
      return await sendTelegramStub(telegramId, message, 'execution');
    }

    const message = `
✅ **Заказ выполнен!**

📋 **${executionData.order.title}**
💰 **Заработано:** ${executionData.reward}₽
📊 **Клики:** ${executionData.clicks}
📱 **Платформа:** ${executionData.order.socialNetwork}

Ваш баланс пополнен!
    `;
    
    await bot.sendMessage(telegramId, message, { parse_mode: 'Markdown' });
    return { success: true };
  } catch (error) {
    console.error('Ошибка отправки уведомления о выполнении:', error);
    
    // Fallback на заглушку при ошибке
    const message = `Выполнение заказа MB-TRUST: ${executionData.orderTitle}`;
    return await sendTelegramStub(telegramId, message, 'execution');
  }
};

// Отправка уведомления о балансе
export const sendBalanceNotification = async (telegramId: string, balance: number, type: 'deposit' | 'withdrawal' | 'earning') => {
  try {
    // Проверяем, что это не тестовый ID
    if (telegramId === '123456789' || !telegramId || telegramId.length < 5) {
      const action = type === 'deposit' ? 'пополнен' : type === 'withdrawal' ? 'списан' : 'заработан';
      const message = `Баланс ${action}: ${balance}₽`;
      return await sendTelegramStub(telegramId, message, 'balance');
    }

    const emoji = type === 'deposit' ? '💰' : type === 'withdrawal' ? '💸' : '🎉';
    const action = type === 'deposit' ? 'пополнен' : type === 'withdrawal' ? 'списан' : 'заработан';
    
    const message = `
${emoji} **Баланс ${action}!**

💳 **Текущий баланс:** ${balance}₽

${type === 'earning' ? 'Поздравляем с успешным выполнением заказа!' : ''}
    `;
    
    await bot.sendMessage(telegramId, message, { parse_mode: 'Markdown' });
    return { success: true };
  } catch (error) {
    console.error('Ошибка отправки уведомления о балансе:', error);
    
    // Fallback на заглушку при ошибке
    const action = type === 'deposit' ? 'пополнен' : type === 'withdrawal' ? 'списан' : 'заработан';
    const message = `Баланс ${action}: ${balance}₽`;
    return await sendTelegramStub(telegramId, message, 'balance');
  }
};

// Настройка обработчиков бота
export const setupTelegramBot = () => {
  // Полностью отключено для избежания конфликтов
  console.log('🤖 Telegram бот отключен (polling и webhook отключены)');
  return;
  
  bot.on('message', async (msg: TelegramMessage) => {
    const chatId = msg.chat.id;
    const text = msg.text;
    
    if (text === '/start') {
      await bot.sendMessage(chatId, `
🤖 **MB-TRUST Bot**

Добро пожаловать! Этот бот используется для:
• Верификации аккаунтов
• Уведомлений о заказах
• Информации о балансе
• Поддержки

Для получения кода верификации обратитесь к администратору.
      `);
    }
    
    if (text === '/help') {
      await bot.sendMessage(chatId, `
📋 **Доступные команды:**

/start - Начать работу с ботом
/help - Показать эту справку
/balance - Проверить баланс (в разработке)
/orders - Мои заказы (в разработке)

💬 **Поддержка:** @mb_trust_support
      `);
    }
  });
  
  bot.on('error', (error: TelegramError) => {
    console.error('Ошибка Telegram бота:', error);
  });
  
  console.log('🤖 Telegram бот запущен и готов к работе');
};

// Получение информации о пользователе
export const getTelegramUserInfo = async (telegramId: string) => {
  try {
    const user = await bot.getChat(telegramId);
    return {
      id: user.id.toString(),
      username: 'username' in user ? user.username : null,
      firstName: 'first_name' in user ? user.first_name : null,
      lastName: 'last_name' in user ? user.last_name : null,
    };
  } catch (error) {
    console.error('Ошибка получения информации о пользователе:', error);
    return null;
  }
};

// Проверка валидности Telegram ID
export const isValidTelegramId = (telegramId: string): boolean => {
  return /^\d+$/.test(telegramId) && telegramId.length >= 8;
};

export default bot;

