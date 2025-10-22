import nodemailer from 'nodemailer';
import { getErrorMessage } from './error';

// Создание транспорта для отправки email
const createTransporter = () => {
  // Проверяем наличие App Password
  if (!process.env.EMAIL_APP_PASSWORD || process.env.EMAIL_APP_PASSWORD === 'your-16-character-app-password-here') {
    console.log('⚠️ EMAIL_APP_PASSWORD не настроен, email отправка отключена');
    return null;
  }
  
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER || 'shveddamir@gmail.com',
      pass: process.env.EMAIL_APP_PASSWORD
    }
  });
};

// Заглушка для email в development
const sendEmailStub = async (email: string, subject: string, html: string, type: string) => {
  console.log(`
📧 EMAIL ВЕРИФИКАЦИЯ (ЗАГЛУШКА)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━      
📧 Email: ${email}
📋 Тема: ${subject}
👤 Тип: ${type}
⏰ Время: ${new Date().toLocaleString()}
💰 Стоимость: 0₽ (заглушка)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━      
  `);
  
  return { success: true, cost: 0, method: 'stub' };
};

// Отправка кода верификации
export const sendVerificationEmail = async (email: string, code: string, type: 'admin' | 'user' = 'user') => {
  try {
    const transporter = createTransporter();
    
    if (!transporter) {
      // Используем заглушку в development
      const subject = type === 'admin' 
        ? 'Код верификации MB-TRUST Admin'
        : 'Код верификации MB-TRUST';
      
      return await sendEmailStub(email, subject, `Код: ${code}`, type);
    }
    
    const subject = type === 'admin' 
      ? 'Код верификации MB-TRUST Admin'
      : 'Код верификации MB-TRUST';
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0B0B0F; color: #ffffff; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #00D4FF; margin: 0;">MB-TRUST</h1>
          <p style="color: #888; margin: 5px 0 0 0;">${type === 'admin' ? 'Админ-панель' : 'Платформа доверия'}</p>
        </div>
        
        <div style="background: #1a1a1a; padding: 30px; border-radius: 10px; text-align: center;">
          <h2 style="color: #ffffff; margin: 0 0 20px 0;">🔐 Код верификации</h2>
          <p style="color: #ccc; margin: 0 0 20px 0;">Ваш код для входа:</p>
          <div style="background: #00D4FF; color: #000; padding: 20px; border-radius: 8px; font-size: 32px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
            ${code}
          </div>
          <p style="color: #888; margin: 20px 0 0 0; font-size: 14px;">
            ⏰ Действует: 2 минуты<br>
            🔒 Не передавайте код третьим лицам
          </p>
        </div>
        
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #333;">
          <p style="color: #666; font-size: 12px; margin: 0;">
            Если вы не запрашивали этот код, проигнорируйте это письмо.
          </p>
        </div>
      </div>
    `;
    
    const mailOptions = {
      from: `MB-TRUST <${process.env.EMAIL_USER || 'shveddamir@gmail.com'}>`,
      to: email,
      subject,
      html
    };
    
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Ошибка отправки email:', error);
  return { success: false, error: getErrorMessage(error) };
  }
};

// Отправка уведомления о заказе
export const sendOrderEmail = async (email: string, orderData: any) => {
  try {
    const transporter = createTransporter();
    
    if (!transporter) {
      // Используем заглушку в development
      return await sendEmailStub(email, 'Новый заказ MB-TRUST', `Заказ: ${orderData.title}`, 'order');
    }
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0B0B0F; color: #ffffff; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #00D4FF; margin: 0;">MB-TRUST</h1>
          <p style="color: #888; margin: 5px 0 0 0;">Новый заказ доступен</p>
        </div>
        
        <div style="background: #1a1a1a; padding: 30px; border-radius: 10px;">
          <h2 style="color: #ffffff; margin: 0 0 20px 0;">📢 Новый заказ доступен!</h2>
          
          <div style="background: #2a2a2a; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #00D4FF; margin: 0 0 10px 0;">${orderData.title}</h3>
            <p style="color: #ccc; margin: 0 0 15px 0;">${orderData.description}</p>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 15px 0;">
              <div>
                <strong style="color: #00D4FF;">💰 Вознаграждение:</strong><br>
                <span style="color: #fff;">${orderData.reward}₽</span>
              </div>
              <div>
                <strong style="color: #00D4FF;">🌍 Регион:</strong><br>
                <span style="color: #fff;">${orderData.region}</span>
              </div>
              <div>
                <strong style="color: #00D4FF;">📱 Платформа:</strong><br>
                <span style="color: #fff;">${orderData.socialNetwork}</span>
              </div>
              <div>
                <strong style="color: #00D4FF;">⏰ Дедлайн:</strong><br>
                <span style="color: #fff;">${new Date(orderData.deadline).toLocaleString()}</span>
              </div>
            </div>
          </div>
          
          <div style="text-align: center; margin: 20px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/executor/dashboard" 
               style="background: #00D4FF; color: #000; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
              Принять заказ
            </a>
          </div>
        </div>
      </div>
    `;
    
    const mailOptions = {
      from: `MB-TRUST <${process.env.EMAIL_USER || 'shveddamir@gmail.com'}>`,
      to: email,
      subject: '📢 Новый заказ доступен - MB-TRUST',
      html
    };
    
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Ошибка отправки email о заказе:', error);
  return { success: false, error: getErrorMessage(error) };
  }
};

// Отправка уведомления о выполнении
export const sendExecutionEmail = async (email: string, executionData: any) => {
  try {
    const transporter = createTransporter();
    
    if (!transporter) {
      // Используем заглушку в development
      return await sendEmailStub(email, 'Выполнение заказа MB-TRUST', `Выполнение: ${executionData.orderTitle}`, 'execution');
    }
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0B0B0F; color: #ffffff; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #00D4FF; margin: 0;">MB-TRUST</h1>
          <p style="color: #888; margin: 5px 0 0 0;">Заказ выполнен</p>
        </div>
        
        <div style="background: #1a1a1a; padding: 30px; border-radius: 10px; text-align: center;">
          <h2 style="color: #00D4FF; margin: 0 0 20px 0;">✅ Заказ выполнен!</h2>
          
          <div style="background: #2a2a2a; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #ffffff; margin: 0 0 15px 0;">${executionData.order.title}</h3>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 15px 0;">
              <div>
                <strong style="color: #00D4FF;">💰 Заработано:</strong><br>
                <span style="color: #fff; font-size: 18px; font-weight: bold;">${executionData.reward}₽</span>
              </div>
              <div>
                <strong style="color: #00D4FF;">📊 Клики:</strong><br>
                <span style="color: #fff;">${executionData.clicks}</span>
              </div>
              <div>
                <strong style="color: #00D4FF;">📱 Платформа:</strong><br>
                <span style="color: #fff;">${executionData.order.socialNetwork}</span>
              </div>
              <div>
                <strong style="color: #00D4FF;">📅 Дата:</strong><br>
                <span style="color: #fff;">${new Date(executionData.createdAt).toLocaleString()}</span>
              </div>
            </div>
          </div>
          
          <p style="color: #00D4FF; font-size: 18px; font-weight: bold; margin: 20px 0;">
            🎉 Ваш баланс пополнен!
          </p>
        </div>
      </div>
    `;
    
    const mailOptions = {
      from: `MB-TRUST <${process.env.EMAIL_USER || 'shveddamir@gmail.com'}>`,
      to: email,
      subject: '✅ Заказ выполнен - MB-TRUST',
      html
    };
    
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Ошибка отправки email о выполнении:', error);
  return { success: false, error: getErrorMessage(error) };
  }
};

// Отправка уведомления о балансе
export const sendBalanceEmail = async (email: string, balance: number, type: 'deposit' | 'withdrawal' | 'earning') => {
  try {
    const transporter = createTransporter();
    
    if (!transporter) {
      // Используем заглушку в development
      const action = type === 'deposit' ? 'пополнен' : type === 'withdrawal' ? 'списан' : 'заработан';
      return await sendEmailStub(email, `Баланс ${action}`, `Баланс: ${balance}₽`, 'balance');
    }
    
    const emoji = type === 'deposit' ? '💰' : type === 'withdrawal' ? '💸' : '🎉';
    const action = type === 'deposit' ? 'пополнен' : type === 'withdrawal' ? 'списан' : 'заработан';
    const title = type === 'deposit' ? 'Баланс пополнен' : type === 'withdrawal' ? 'Средства списаны' : 'Заработано!';
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0B0B0F; color: #ffffff; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #00D4FF; margin: 0;">MB-TRUST</h1>
          <p style="color: #888; margin: 5px 0 0 0;">${title}</p>
        </div>
        
        <div style="background: #1a1a1a; padding: 30px; border-radius: 10px; text-align: center;">
          <h2 style="color: #ffffff; margin: 0 0 20px 0;">${emoji} Баланс ${action}!</h2>
          
          <div style="background: #2a2a2a; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <div style="font-size: 32px; font-weight: bold; color: #00D4FF; margin: 20px 0;">
              ${balance}₽
            </div>
            <p style="color: #ccc; margin: 0;">
              Текущий баланс вашего аккаунта
            </p>
          </div>
          
          ${type === 'earning' ? `
            <p style="color: #00D4FF; font-size: 18px; font-weight: bold; margin: 20px 0;">
              🎉 Поздравляем с успешным выполнением заказа!
            </p>
          ` : ''}
          
          <div style="text-align: center; margin: 20px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" 
               style="background: #00D4FF; color: #000; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
              Перейти в личный кабинет
            </a>
          </div>
        </div>
      </div>
    `;
    
    const mailOptions = {
      from: `MB-TRUST <${process.env.EMAIL_USER || 'shveddamir@gmail.com'}>`,
      to: email,
      subject: `${emoji} ${title} - MB-TRUST`,
      html
    };
    
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Ошибка отправки email о балансе:', error);
  return { success: false, error: getErrorMessage(error) };
  }
};

// Проверка валидности email
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export default {
  sendVerificationEmail,
  sendOrderEmail,
  sendExecutionEmail,
  sendBalanceEmail,
  isValidEmail
};

