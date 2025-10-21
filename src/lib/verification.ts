import { prisma } from './prisma';
import { sendVerificationCode } from './telegram';
import { sendVerificationEmail } from './email';
import { sendSMS } from './sms';
import { nanoid } from 'nanoid';

// Типы верификации
export enum VerificationMethod {
  EMAIL = 'email',
  TELEGRAM = 'telegram',
  SMS = 'sms'
}

// Приоритеты методов верификации
const verificationPriority = {
  [VerificationMethod.TELEGRAM]: 1, // Самый приоритетный
  [VerificationMethod.EMAIL]: 2,    // Второй по приоритету
  [VerificationMethod.SMS]: 3       // Последний (платный)
};

// Выбор метода верификации для пользователя
export const chooseVerificationMethod = (user: any): VerificationMethod => {
  // 🚀 КОСТЫЛЬ ДЛЯ ТЕСТИРОВАНИЯ - в dev режиме всегда EMAIL
  if (process.env.NODE_ENV === 'development') {
    console.log('🔥 DEV MODE: Автоматический выбор EMAIL для верификации');
    return VerificationMethod.EMAIL;
  }

  // 1. Telegram (если есть)
  if (user.telegramId) {
    return VerificationMethod.TELEGRAM;
  }
  
  // 2. Email (если есть)
  if (user.email) {
    return VerificationMethod.EMAIL;
  }
  
  // 3. SMS (по умолчанию)
  return VerificationMethod.SMS;
};

// Выбор метода верификации для админа
export const chooseAdminVerificationMethod = (admin: any): VerificationMethod => {
  // 🚀 КОСТЫЛЬ ДЛЯ ТЕСТИРОВАНИЯ - в dev режиме всегда EMAIL
  if (process.env.NODE_ENV === 'development') {
    console.log('🔥 DEV MODE: Автоматический выбор EMAIL для админ верификации');
    return VerificationMethod.EMAIL;
  }

  // Для админов приоритет: Telegram > Email > SMS
  if (admin.telegramId) {
    return VerificationMethod.TELEGRAM;
  }
  
  if (admin.email) {
    return VerificationMethod.EMAIL;
  }
  
  return VerificationMethod.SMS;
};

// Генерация кода верификации
export const generateVerificationCode = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Создание кода верификации в базе данных
export const createVerificationCode = async (
  adminId: string,
  type: 'SMS' | 'EMAIL' | 'TELEGRAM',
  code: string
) => {
  const expiresAt = new Date(Date.now() + 2 * 60 * 1000); // 2 минуты
  
  return await prisma.adminVerificationCode.create({
    data: {
      adminId,
      type,
      code,
      expiresAt
    }
  });
};

// Отправка кода верификации
export const sendVerificationCodeToUser = async (
  user: any,
  code: string,
  type: 'admin' | 'user' = 'user'
) => {
  const method = chooseVerificationMethod(user);
  
  switch (method) {
    case VerificationMethod.TELEGRAM:
      return await sendVerificationCode(user.telegramId, code, type);
    
    case VerificationMethod.EMAIL:
      return await sendVerificationEmail(user.email, code, type);
    
    case VerificationMethod.SMS:
      return await sendSMS(user.phone, code, type);
    
    default:
      throw new Error('Неизвестный метод верификации');
  }
};

// Отправка кода верификации админу
export const sendVerificationCodeToAdmin = async (
  admin: any,
  code: string
) => {
  const method = chooseAdminVerificationMethod(admin);
  
  switch (method) {
    case VerificationMethod.TELEGRAM:
      return await sendVerificationCode(admin.telegramId, code, 'admin');
    
    case VerificationMethod.EMAIL:
      return await sendVerificationEmail(admin.email, code, 'admin');
    
    case VerificationMethod.SMS:
      return await sendSMS(admin.phone, code, 'admin');
    
    default:
      throw new Error('Неизвестный метод верификации');
  }
};

// Проверка кода верификации
export const verifyCode = async (
  adminId: string,
  code: string,
  type: 'SMS' | 'EMAIL' | 'TELEGRAM'
): Promise<boolean> => {
  // 🚀 КОСТЫЛЬ ДЛЯ ТЕСТИРОВАНИЯ - любой код проходит
  if (process.env.NODE_ENV === 'development') {
    console.log('🔥 DEV MODE: Автоматическое подтверждение кода верификации');
    return true;
  }

  const verificationCode = await prisma.adminVerificationCode.findFirst({
    where: {
      adminId,
      code,
      type,
      isUsed: false,
      expiresAt: {
        gt: new Date()
      }
    }
  });
  
  if (!verificationCode) {
    return false;
  }
  
  // Помечаем код как использованный
  await prisma.adminVerificationCode.update({
    where: { id: verificationCode.id },
    data: { isUsed: true }
  });
  
  return true;
};

// Создание сессии админа
export const createAdminSession = async (adminId: string) => {
  const token = nanoid();
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 часа
  
  return await prisma.adminSession.create({
    data: {
      adminId,
      token,
      expiresAt
    }
  });
};

// Проверка сессии админа
export const verifyAdminSession = async (token: string) => {
  const session = await prisma.adminSession.findFirst({
    where: {
      token,
      expiresAt: {
        gt: new Date()
      }
    },
    include: {
      admin: true
    }
  });
  
  return session;
};

// Обновление статуса верификации в сессии
export const updateSessionVerification = async (
  sessionId: string,
  type: 'sms' | 'email',
  verified: boolean
) => {
  const updateData = type === 'sms' 
    ? { smsVerified: verified }
    : { emailVerified: verified };
  
  return await prisma.adminSession.update({
    where: { id: sessionId },
    data: updateData
  });
};

// Полная верификация админа (SMS + Email)
export const isAdminFullyVerified = (session: any): boolean => {
  return session.smsVerified && session.emailVerified;
};

// Очистка истекших кодов верификации
export const cleanupExpiredCodes = async () => {
  const result = await prisma.adminVerificationCode.deleteMany({
    where: {
      OR: [
        { expiresAt: { lt: new Date() } },
        { isUsed: true }
      ]
    }
  });
  
  console.log(`🧹 Очищено ${result.count} истекших кодов верификации`);
  return result.count;
};

// Очистка истекших сессий
export const cleanupExpiredSessions = async () => {
  const result = await prisma.adminSession.deleteMany({
    where: {
      expiresAt: { lt: new Date() }
    }
  });
  
  console.log(`🧹 Очищено ${result.count} истекших сессий`);
  return result.count;
};

// Получение статистики верификации
export const getVerificationStats = async () => {
  const totalCodes = await prisma.adminVerificationCode.count();
  const usedCodes = await prisma.adminVerificationCode.count({
    where: { isUsed: true }
  });
  const expiredCodes = await prisma.adminVerificationCode.count({
    where: { expiresAt: { lt: new Date() } }
  });
  const activeSessions = await prisma.adminSession.count({
    where: { expiresAt: { gt: new Date() } }
  });
  
  return {
    totalCodes,
    usedCodes,
    expiredCodes,
    activeSessions,
    successRate: totalCodes > 0 ? (usedCodes / totalCodes * 100).toFixed(2) : 0
  };
};

// Многоуровневая верификация для админов
export const initiateMultiLevelVerification = async (admin: any) => {
  const results = [];
  
  // 1. SMS верификация
  if (admin.phone) {
    const smsCode = generateVerificationCode();
    await createVerificationCode(admin.id, 'SMS', smsCode);
    const smsResult = await sendSMS(admin.phone, smsCode, 'admin');
    results.push({ method: 'SMS', success: smsResult.success, code: smsCode });
  }
  
  // 2. Email верификация
  if (admin.email) {
    const emailCode = generateVerificationCode();
    await createVerificationCode(admin.id, 'EMAIL', emailCode);
    const emailResult = await sendVerificationEmail(admin.email, emailCode, 'admin');
    results.push({ method: 'EMAIL', success: emailResult.success, code: emailCode });
  }
  
  // 3. Telegram верификация (если есть)
  if (admin.telegramId) {
    const telegramCode = generateVerificationCode();
    await createVerificationCode(admin.id, 'TELEGRAM', telegramCode);
    const telegramResult = await sendVerificationCode(admin.telegramId, telegramCode, 'admin');
    results.push({ method: 'TELEGRAM', success: telegramResult.success, code: telegramCode });
  }
  
  return results;
};

export default {
  VerificationMethod,
  chooseVerificationMethod,
  chooseAdminVerificationMethod,
  generateVerificationCode,
  createVerificationCode,
  sendVerificationCodeToUser,
  sendVerificationCodeToAdmin,
  verifyCode,
  createAdminSession,
  verifyAdminSession,
  updateSessionVerification,
  isAdminFullyVerified,
  cleanupExpiredCodes,
  cleanupExpiredSessions,
  getVerificationStats,
  initiateMultiLevelVerification
};

