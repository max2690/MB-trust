import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Tribute API для выплат в Telegram Wallet
// https://tribute.app/api

interface TributePaymentRequest {
  recipient_tg_id: string;
  amount: number;
  recipient_address?: string;
  currency: string;
}

// Создание выплаты через Tribute
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, amount, telegramWalletId } = body;

    if (!userId || !amount || !telegramWalletId) {
      return NextResponse.json(
        { error: 'Все поля обязательны' },
        { status: 400 }
      );
    }

    // Получаем пользователя
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Пользователь не найден' },
        { status: 404 }
      );
    }

    // Проверяем баланс
    if (user.balance < amount) {
      return NextResponse.json(
        { error: 'Недостаточно средств' },
        { status: 400 }
      );
    }

    // Проверяем верификацию Telegram Wallet
    if (!user.telegramWalletVerified || !telegramWalletId) {
      return NextResponse.json(
        { error: 'Telegram Wallet не верифицирован' },
        { status: 400 }
      );
    }

    // Если Tribute API ключ не настроен, используем заглушку
    if (!process.env.TRIBUTE_API_KEY || process.env.TRIBUTE_API_KEY === 'your_tribute_api_key_here') {
      console.log('⚠️ Tribute API ключ не настроен, используем заглушку');
      return await processStubPayout(userId, amount, telegramWalletId);
    }

    // Реальная интеграция с Tribute API
    const tributePayload: TributePaymentRequest = {
      recipient_tg_id: telegramWalletId,
      amount: amount * 100, // В копейках
      currency: 'USD' // или другой валютный код TON
    };

    const response = await fetch('https://tribute.app/api/v1/payments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.TRIBUTE_API_KEY}`
      },
      body: JSON.stringify(tributePayload)
    });

    if (!response.ok) {
      throw new Error('Tribute API error');
    }

    const tributeData = await response.json();

    // Создаем запись о выплате в БД
    const payout = await prisma.payout.create({
      data: {
        userId,
        amount,
        method: 'TELEGRAM_WALLET',
        status: 'PROCESSING',
        telegramTransactionId: tributeData.transaction_id,
        processedAt: new Date()
      }
    });

    // Обновляем баланс (резервируем сумму)
    await prisma.user.update({
      where: { id: userId },
      data: {
        balance: {
          decrement: amount
        }
      }
    });

    return NextResponse.json({
      success: true,
      payout,
      tributeTransactionId: tributeData.transaction_id,
      message: 'Выплата обрабатывается'
    });

  } catch (error) {
    console.error('Ошибка Tribute выплаты:', error);
    return NextResponse.json(
      { error: 'Ошибка создания выплаты' },
      { status: 500 }
    );
  }
}

// Заглушка выплаты (если API недоступен)
async function processStubPayout(userId: string, amount: number, telegramWalletId: string) {
  // Создаем запись о выплате в БД
  const payout = await prisma.payout.create({
    data: {
      userId,
      amount,
      method: 'TELEGRAM_WALLET',
      status: 'PROCESSING',
      telegramTransactionId: `stub_${Date.now()}`,
      processedAt: new Date()
    }
  });

  // Симулируем успешную выплату через 2 секунды
  setTimeout(async () => {
    await prisma.payout.update({
      where: { id: payout.id },
      data: {
        status: 'COMPLETED',
        completedAt: new Date()
      }
    });

    console.log(`✅ Заглушка: Выплата ${payout.id} успешно завершена`);
  }, 2000);

  // Обновляем баланс
  await prisma.user.update({
    where: { id: userId },
    data: {
      balance: {
        decrement: amount
      }
    }
  });

  return NextResponse.json({
    success: true,
    payout,
    message: 'Выплата обрабатывается (заглушка)'
  });
}

