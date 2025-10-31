// Server-side initialization file
// This ensures the bot is initialized when Next.js server starts

import { initializeTelegramBot } from './telegram-init'

// Initialize bot on server startup
if (process.env.BOT_TOKEN) {
  console.log('🤖 Инициализация Telegram бота...')
  const bot = initializeTelegramBot()
  if (bot) {
    console.log('✅ Telegram бот успешно запущен')
  } else {
    console.error('❌ Не удалось запустить Telegram бота')
  }
} else {
  console.warn('⚠️ BOT_TOKEN не найден в переменных окружения')
}





