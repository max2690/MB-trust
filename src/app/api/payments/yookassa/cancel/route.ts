import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const paymentId = searchParams.get('paymentId');

    if (paymentId) {
      // Проверяем существование платежа
      const existingPayment = await prisma.payment.findUnique({
        where: { id: paymentId }
      });
      
      if (existingPayment) {
        // Обновляем статус платежа на отмененный
        await prisma.payment.update({
          where: { id: paymentId },
          data: { 
            status: 'CANCELLED',
            updatedAt: new Date()
          }
        });

        console.log(`❌ Платеж ${paymentId} отменен через ЮKassa`);
      } else {
        console.log(`⚠️ Платеж ${paymentId} не найден для отмены`);
      }
    }

    // Перенаправляем на страницу отмены
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    return NextResponse.redirect(`${baseUrl}/payment/cancelled`);

  } catch (error) {
    console.error('Ошибка обработки отмены платежа:', error);
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    return NextResponse.redirect(`${baseUrl}/payment/error`);
  }
}
