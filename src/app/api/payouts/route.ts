import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST /api/payouts/create - Создание выплаты
export async function POST(request: NextRequest) {
  try {
    const { amount, method, userId } = await request.json();

    if (!amount || !method || !userId) {
      return NextResponse.json(
        { error: 'Все поля обязательны' },
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

    // Проверяем баланс пользователя
    if (user.balance < amount) {
      return NextResponse.json(
        { error: 'Недостаточно средств на балансе' },
        { status: 400 }
      );
    }

    // Проверяем способ выплаты
    if (method === 'BANK_SPB') {
      if (!user.isSelfEmployed || user.nalogVerificationStatus !== 'VERIFIED') {
        return NextResponse.json(
          { error: 'Для банковских выплат требуется статус самозанятого' },
          { status: 400 }
        );
      }
    }

    if (method === 'TELEGRAM_WALLET') {
      if (!user.telegramWalletVerified) {
        return NextResponse.json(
          { error: 'Telegram Wallet не верифицирован' },
          { status: 400 }
        );
      }
    }

    // Создаем выплату
    const payout = await prisma.payout.create({
      data: {
        userId: user.id,
        amount: parseFloat(amount),
        method: method,
        status: 'PENDING'
      }
    });

    // Обрабатываем выплату
    await processPayout(payout);

    return NextResponse.json({
      success: true,
      payoutId: payout.id,
      message: 'Выплата создана и обрабатывается'
    });
  } catch (error) {
    console.error('Error creating payout:', error);
    return NextResponse.json(
      { error: 'Ошибка создания выплаты' },
      { status: 500 }
    );
  }
}

// GET /api/payouts - Получить список выплат
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const status = searchParams.get('status');

    const where: any = {};
    if (userId) where.userId = userId;
    if (status) where.status = status;

    const payouts = await prisma.payout.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({
      success: true,
      payouts
    });
  } catch (error) {
    console.error('Error fetching payouts:', error);
    return NextResponse.json(
      { error: 'Ошибка получения списка выплат' },
      { status: 500 }
    );
  }
}

// Обработка выплаты
async function processPayout(payout: any) {
  try {
    // Обновляем статус на "Обрабатывается"
    await prisma.payout.update({
      where: { id: payout.id },
      data: { 
        status: 'PROCESSING',
        processedAt: new Date()
      }
    });

    // Имитируем обработку выплаты
    const success = Math.random() > 0.1; // 90% успешных выплат

    if (success) {
      // Успешная выплата
      await prisma.payout.update({
        where: { id: payout.id },
        data: { 
          status: 'COMPLETED',
          completedAt: new Date(),
          transactionId: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        }
      });

      // Списываем с баланса пользователя
      await prisma.user.update({
        where: { id: payout.userId },
        data: {
          balance: {
            decrement: payout.amount
          }
        }
      });

      console.log(`✅ Выплата ${payout.id} завершена успешно`);
    } else {
      // Неудачная выплата
      await prisma.payout.update({
        where: { id: payout.id },
        data: { 
          status: 'FAILED',
          completedAt: new Date()
        }
      });

      console.log(`❌ Выплата ${payout.id} не удалась`);
    }
  } catch (error) {
    console.error('Error processing payout:', error);
    
    // Обновляем статус на "Неудачная"
    await prisma.payout.update({
      where: { id: payout.id },
      data: { 
        status: 'FAILED',
        completedAt: new Date()
      }
    });
  }
}
