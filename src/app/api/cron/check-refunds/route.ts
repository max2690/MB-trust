import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    console.log('🔄 Проверка заказов для автоматического возврата...');

    const now = new Date();
    
    // Находим заказы, которые не выполнены и прошло 72 часа после дедлайна
    const expiredOrders = await prisma.order.findMany({
      where: {
        status: { in: ['PENDING', 'IN_PROGRESS'] },
        refundOnFailure: true,
        refundDeadline: { lte: now },
        refunds: { none: { status: { not: 'CANCELLED' } } } // Нет активных возвратов
      },
      include: {
        executions: {
          where: { status: 'COMPLETED' }
        }
      }
    });

    console.log(`📋 Найдено ${expiredOrders.length} заказов для возврата`);

    const processedRefunds = [];

    for (const order of expiredOrders) {
      // Проверяем, что заказ действительно не выполнен
      if (order.executions.length === 0) {
        try {
          // Создаем автоматический возврат
          const refundAmount = (order as { totalReward?: number }).totalReward ?? order.reward ?? 0;

          const refund = await prisma.refund.create({
            data: {
              orderId: order.id,
              customerId: order.customerId,
              amount: refundAmount,
              reason: 'Автоматический возврат: заказ не выполнен в срок',
              status: 'PENDING'
            }
          });

          // Обновляем статус заказа
          await prisma.order.update({
            where: { id: order.id },
            data: { status: 'CANCELLED' }
          });

          processedRefunds.push(refund);
          console.log(`✅ Создан возврат для заказа ${order.id}: ${refundAmount}₽`);

        } catch (error) {
          console.error(`❌ Ошибка создания возврата для заказа ${order.id}:`, error);
        }
      }
    }

    // Обрабатываем ожидающие возвраты
    const pendingRefunds = await prisma.refund.findMany({
      where: { status: 'PENDING' },
      include: { customer: true, order: true }
    });

    console.log(`💰 Обработка ${pendingRefunds.length} ожидающих возвратов`);

    for (const refund of pendingRefunds) {
      try {
        // Возвращаем деньги на счет заказчика
        await prisma.user.update({
          where: { id: refund.customerId },
          data: {
            balance: {
              increment: refund.amount
            }
          }
        });

        // Создаем запись о платеже
        await prisma.payment.create({
          data: {
            userId: refund.customerId,
            amount: refund.amount,
            type: 'DEPOSIT',
            status: 'COMPLETED',
            description: `Возврат за невыполненный заказ: ${refund.order.title}`
          }
        });

        // Обновляем статус возврата
        await prisma.refund.update({
          where: { id: refund.id },
          data: {
            status: 'COMPLETED',
            processedAt: now
          }
        });

        console.log(`✅ Обработан возврат ${refund.id}: ${refund.amount}₽ для ${refund.customer.name}`);

      } catch (error) {
        console.error(`❌ Ошибка обработки возврата ${refund.id}:`, error);
      }
    }

    return NextResponse.json({
      message: 'Проверка возвратов завершена',
      processedRefunds: processedRefunds.length,
      completedRefunds: pendingRefunds.length,
      success: true
    });

  } catch (error) {
    console.error('Ошибка проверки возвратов:', error);
    return NextResponse.json({ error: 'Ошибка проверки возвратов' }, { status: 500 });
  }
}

