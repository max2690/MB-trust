// Инициализация Telegram бота при запуске приложения
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const initializeTelegramBot = () => {
  if (process.env.TELEGRAM_BOT_TOKEN) {
    console.log('🤖 Telegram бот отключен для избежания конфликтов');
    // setupTelegramBot(); // Отключено
    console.log('✅ Telegram бот готов к работе (только отправка сообщений)');
  } else {
    console.log('⚠️ TELEGRAM_BOT_TOKEN не найден, бот не запущен');
  }
};

// Автоматический запуск при импорте в development
if (process.env.NODE_ENV === 'development') {
  initializeTelegramBot();
}
