import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { PAYMENT_PROVIDERS, PAYMENT_URLS } from '@/lib/payment-providers';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { userId, amount, provider, orderId } = await request.json();

    // Проверяем пользователя
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return NextResponse.json({ error: 'Пользователь не найден' }, { status: 404 });
    }

    // Проверяем провайдера
    const paymentProvider = PAYMENT_PROVIDERS[provider];
    if (!paymentProvider || !paymentProvider.isActive) {
      return NextResponse.json({ error: 'Провайдер недоступен' }, { status: 400 });
    }

    // Проверяем лимиты
    if (amount < paymentProvider.minAmount) {
      return NextResponse.json({ 
        error: `Минимальная сумма: ${paymentProvider.minAmount}₽` 
      }, { status: 400 });
    }

    if (amount > paymentProvider.maxAmount) {
      return NextResponse.json({ 
        error: `Максимальная сумма: ${paymentProvider.maxAmount}₽` 
      }, { status: 400 });
    }

    // Рассчитываем комиссию
    const commission = Math.round(amount * paymentProvider.commission / 100);
    const totalAmount = amount + commission;

    // Создаем платеж в БД
    const payment = await prisma.payment.create({
      data: {
        userId,
        amount: totalAmount,
        type: 'DEPOSIT',
        status: 'PENDING',
        description: `Пополнение через ${paymentProvider.name}`,
        stripeId: `stub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      }
    });

    // Создаем URL для оплаты (заглушка)
    const paymentUrl = createPaymentUrl(provider, payment.id, totalAmount, user);

    return NextResponse.json({
      success: true,
      payment: {
        id: payment.id,
        amount: totalAmount,
        commission,
        provider: paymentProvider.name,
        paymentUrl,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000) // 15 минут
      }
    });

  } catch (error) {
    console.error('Ошибка создания платежа:', error);
    return NextResponse.json({ error: 'Ошибка создания платежа' }, { status: 500 });
  }
}

function createPaymentUrl(provider: string, paymentId: string, amount: number, user: any) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  
  if (provider === 'yookassa') {
    // ЗАГЛУШКА - заменим на реальный URL ЮKassa
    return `${baseUrl}/api/payments/yookassa/stub?paymentId=${paymentId}&amount=${amount}`;
  } else if (provider === 'alfa') {
    // ЗАГЛУШКА - заменим на реальный URL Альфа-Банка
    return `${baseUrl}/api/payments/alfa/stub?paymentId=${paymentId}&amount=${amount}`;
  }
  
  return `${baseUrl}/payment/stub?paymentId=${paymentId}&amount=${amount}`;
}
