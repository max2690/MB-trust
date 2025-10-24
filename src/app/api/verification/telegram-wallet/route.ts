import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST /api/verification/telegram-wallet - Верификация Telegram Wallet
export async function POST(request: NextRequest) {
  try {
    const { telegramUserId, userId } = await request.json();

    if (!telegramUserId || !userId) {
      return NextResponse.json(
        { error: 'Telegram User ID и ID пользователя обязательны' },
        { status: 400 }
      );
    }

    // Проверяем существование пользователя
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Пользователь не найден' },
        { status: 404 }
      );
    }

    // Заглушка для проверки Telegram Wallet
    const walletInfo = await checkTelegramWallet(telegramUserId);

    if (walletInfo.exists) {
      // Обновляем статус пользователя
      await prisma.user.update({
        where: { id: userId },
        data: {
          telegramWalletId: telegramUserId,
          telegramWalletVerified: true,
          telegramWalletVerifiedAt: new Date()
        }
      });

      return NextResponse.json({
        success: true,
        message: 'Telegram Wallet верифицирован',
        verified: true,
        walletInfo
      });
    } else {
      return NextResponse.json({
        success: false,
        message: 'Telegram Wallet не найден',
        verified: false
      }, { status: 400 });
    }
  } catch (error) {
    console.error('Error verifying Telegram Wallet:', error);
    return NextResponse.json(
      { error: 'Ошибка верификации Telegram Wallet' },
      { status: 500 }
    );
  }
}

// Заглушка для проверки Telegram Wallet
async function checkTelegramWallet(telegramUserId: string) {
  // В реальности здесь будет интеграция с Telegram Wallet API
  console.log(`🔍 Проверяем Telegram Wallet для ID: ${telegramUserId}`);
  
  // Имитируем проверку
  const isValidUserId = /^\d+$/.test(telegramUserId) && telegramUserId.length >= 8;
  
  return {
    exists: isValidUserId,
    userId: telegramUserId,
    balance: isValidUserId ? Math.floor(Math.random() * 10000) : 0,
    currency: 'RUB',
    lastActivity: isValidUserId ? new Date().toISOString() : null
  };
}