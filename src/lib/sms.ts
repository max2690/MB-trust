// SMS сервис с заглушкой для разработки

// Отправка SMS кода верификации
export const sendSMS = async (phone: string, code: string, type: 'admin' | 'user' = 'user') => {
  if (process.env.NODE_ENV === 'development') {
    // Заглушка для разработки
    console.log(`
📱 SMS ВЕРИФИКАЦИЯ (ЗАГЛУШКА)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📞 Номер: ${phone}
🔐 Код: ${code}
👤 Тип: ${type}
⏰ Время: ${new Date().toLocaleString()}
💰 Стоимость: 0₽ (заглушка)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    `);
    
    return { success: true, cost: 0, method: 'stub' };
  }
  
  // В production - реальная отправка через SMSC.ru
  try {
    const response = await fetch('https://smsc.ru/sys/send.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        login: process.env.SMS_LOGIN!,
        psw: process.env.SMS_PASSWORD!,
        phones: phone,
        mes: `Код верификации MB-TRUST: ${code}. Действует 2 минуты.`,
        sender: 'MB-TRUST'
      })
    });
    
    const result = await response.text();
    
    if (result.includes('OK')) {
      return { success: true, cost: 0.8, method: 'smsc' };
    } else {
      throw new Error(`SMS отправка не удалась: ${result}`);
    }
  } catch (error) {
    console.error('Ошибка отправки SMS:', error);
      return { success: false, error: (error as any).message };
  }
};

// Отправка SMS уведомления о заказе
export const sendOrderSMS = async (phone: string, orderData: any) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`
📱 SMS УВЕДОМЛЕНИЕ О ЗАКАЗЕ (ЗАГЛУШКА)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📞 Номер: ${phone}
📋 Заказ: ${orderData.title}
💰 Вознаграждение: ${orderData.reward}₽
📱 Платформа: ${orderData.socialNetwork}
⏰ Время: ${new Date().toLocaleString()}
💰 Стоимость: 0₽ (заглушка)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    `);
    
    return { success: true, cost: 0, method: 'stub' };
  }
  
  try {
    const message = `Новый заказ MB-TRUST: ${orderData.title}. Вознаграждение: ${orderData.reward}₽. Платформа: ${orderData.socialNetwork}. Дедлайн: ${new Date(orderData.deadline).toLocaleDateString()}`;
    
    const response = await fetch('https://smsc.ru/sys/send.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        login: process.env.SMS_LOGIN!,
        psw: process.env.SMS_PASSWORD!,
        phones: phone,
        mes: message,
        sender: 'MB-TRUST'
      })
    });
    
    const result = await response.text();
    
    if (result.includes('OK')) {
      return { success: true, cost: 0.8, method: 'smsc' };
    } else {
      throw new Error(`SMS отправка не удалась: ${result}`);
    }
  } catch (error) {
    console.error('Ошибка отправки SMS уведомления:', error);
      return { success: false, error: (error as any).message };
  }
};

// Отправка SMS уведомления о выполнении
export const sendExecutionSMS = async (phone: string, executionData: any) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`
📱 SMS УВЕДОМЛЕНИЕ О ВЫПОЛНЕНИИ (ЗАГЛУШКА)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📞 Номер: ${phone}
📋 Заказ: ${executionData.order.title}
💰 Заработано: ${executionData.reward}₽
📊 Клики: ${executionData.clicks}
⏰ Время: ${new Date().toLocaleString()}
💰 Стоимость: 0₽ (заглушка)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    `);
    
    return { success: true, cost: 0, method: 'stub' };
  }
  
  try {
    const message = `Заказ выполнен! MB-TRUST: ${executionData.order.title}. Заработано: ${executionData.reward}₽. Клики: ${executionData.clicks}. Баланс пополнен!`;
    
    const response = await fetch('https://smsc.ru/sys/send.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        login: process.env.SMS_LOGIN!,
        psw: process.env.SMS_PASSWORD!,
        phones: phone,
        mes: message,
        sender: 'MB-TRUST'
      })
    });
    
    const result = await response.text();
    
    if (result.includes('OK')) {
      return { success: true, cost: 0.8, method: 'smsc' };
    } else {
      throw new Error(`SMS отправка не удалась: ${result}`);
    }
  } catch (error) {
    console.error('Ошибка отправки SMS уведомления о выполнении:', error);
      return { success: false, error: (error as any).message };
  }
};

// Отправка SMS уведомления о балансе
export const sendBalanceSMS = async (phone: string, balance: number, type: 'deposit' | 'withdrawal' | 'earning') => {
  if (process.env.NODE_ENV === 'development') {
    const emoji = type === 'deposit' ? '💰' : type === 'withdrawal' ? '💸' : '🎉';
    const action = type === 'deposit' ? 'пополнен' : type === 'withdrawal' ? 'списан' : 'заработан';
    
    console.log(`
📱 SMS УВЕДОМЛЕНИЕ О БАЛАНСЕ (ЗАГЛУШКА)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📞 Номер: ${phone}
${emoji} Баланс ${action}: ${balance}₽
👤 Тип: ${type}
⏰ Время: ${new Date().toLocaleString()}
💰 Стоимость: 0₽ (заглушка)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    `);
    
    return { success: true, cost: 0, method: 'stub' };
  }
  
  try {
    const emoji = type === 'deposit' ? '💰' : type === 'withdrawal' ? '💸' : '🎉';
    const action = type === 'deposit' ? 'пополнен' : type === 'withdrawal' ? 'списан' : 'заработан';
    const message = `MB-TRUST: ${emoji} Баланс ${action}! Текущий баланс: ${balance}₽`;
    
    const response = await fetch('https://smsc.ru/sys/send.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        login: process.env.SMS_LOGIN!,
        psw: process.env.SMS_PASSWORD!,
        phones: phone,
        mes: message,
        sender: 'MB-TRUST'
      })
    });
    
    const result = await response.text();
    
    if (result.includes('OK')) {
      return { success: true, cost: 0.8, method: 'smsc' };
    } else {
      throw new Error(`SMS отправка не удалась: ${result}`);
    }
  } catch (error) {
    console.error('Ошибка отправки SMS уведомления о балансе:', error);
      return { success: false, error: (error as any).message };
  }
};

// Проверка валидности номера телефона
export const isValidPhone = (phone: string): boolean => {
  // Убираем все символы кроме цифр
  const cleanPhone = phone.replace(/\D/g, '');
  
  // Проверяем российские номера
  if (cleanPhone.startsWith('7') && cleanPhone.length === 11) {
    return true;
  }
  
  // Проверяем номера без кода страны
  if (cleanPhone.startsWith('8') && cleanPhone.length === 11) {
    return true;
  }
  
  // Проверяем номера без 8/7
  if (cleanPhone.length === 10) {
    return true;
  }
  
  return false;
};

// Нормализация номера телефона
export const normalizePhone = (phone: string): string => {
  const cleanPhone = phone.replace(/\D/g, '');
  
  if (cleanPhone.startsWith('8') && cleanPhone.length === 11) {
    return '7' + cleanPhone.slice(1);
  }
  
  if (cleanPhone.length === 10) {
    return '7' + cleanPhone;
  }
  
  return cleanPhone;
};

export default {
  sendSMS,
  sendOrderSMS,
  sendExecutionSMS,
  sendBalanceSMS,
  isValidPhone,
  normalizePhone
};

