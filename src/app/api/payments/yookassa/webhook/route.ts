import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// YooKassa Webhook обработчик
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const signature = request.headers.get('x-yookassa-signature');

    // Проверка подписи (если настроена)
    if (process.env.YOOKASSA_SECRET && signature) {
      const isValid = verifySignature(JSON.stringify(body), signature);
      if (!isValid) {
        console.error('Invalid YooKassa signature');
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
      }
    }

    // Обработка события
    const { event, object } = body;

    if (event === 'payment.succeeded') {
      const paymentId = object.metadata?.payment_id;
      
      if (!paymentId) {
        console.error('No payment_id in metadata');
        return NextResponse.json({ error: 'No payment_id' }, { status: 400 });
      }

      // Обновляем статус платежа в БД
      const payment = await prisma.payment.update({
        where: { id: paymentId },
        data: {
          status: 'COMPLETED',
          transactionId: object.id,
          updatedAt: new Date()
        },
        include: { user: true }
      });

      // Пополняем баланс пользователя
      await prisma.user.update({
        where: { id: payment.userId },
        data: {
          balance: {
            increment: payment.amount
          }
        }
      });

      console.log(`✅ YooKassa платеж ${paymentId} успешно обработан`);
    }

    if (event === 'payment.canceled') {
      const paymentId = object.metadata?.payment_id;
      
      if (paymentId) {
        await prisma.payment.update({
          where: { id: paymentId },
          data: {
            status: 'CANCELLED',
            updatedAt: new Date()
          }
        });

        console.log(`❌ YooKassa платеж ${paymentId} отменен`);
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Ошибка YooKassa webhook:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

// Проверка подписи YooKassa
function verifySignature(body: string, signature: string): boolean {
  // TODO: Реализовать проверку HMAC подписи
  // https://yookassa.ru/developers/payments/receipt-of-payment-notifications/check-signature
  return true; // Заглушка
}

// GET для проверки webhook
export async function GET() {
  return NextResponse.json({ 
    service: 'MB-TRUST YooKassa Webhook',
    status: 'active',
    version: '1.0.0'
  });
}

