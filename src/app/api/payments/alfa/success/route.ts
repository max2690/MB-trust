import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const paymentId = searchParams.get('paymentId');

    if (!paymentId) {
      return NextResponse.redirect('/payment/error');
    }

    // Обновляем статус платежа
    const payment = await prisma.payment.update({
      where: { id: paymentId },
      data: { 
        status: 'COMPLETED',
        updatedAt: new Date()
      },
      include: { user: true }
    });

    if (payment) {
      // Пополняем баланс пользователя
      await prisma.user.update({
        where: { id: payment.userId },
        data: {
          balance: {
            increment: payment.amount
          }
        }
      });

      console.log(`💰 Платеж ${paymentId} успешно обработан через Альфа-Банк`);
    }

    // Перенаправляем на страницу успеха
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    return NextResponse.redirect(`${baseUrl}/payment/success`);

  } catch (error) {
    console.error('Ошибка обработки успешного платежа:', error);
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    return NextResponse.redirect(`${baseUrl}/payment/error`);
  }
}
