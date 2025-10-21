import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const customerId = searchParams.get('customerId');

    const where: any = {};
    if (status) where.status = status;
    if (customerId) where.customerId = customerId;

    const refunds = await prisma.refund.findMany({
      where,
      include: {
        order: {
          select: {
            title: true,
            socialNetwork: true,
            deadline: true
          }
        },
        customer: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ refunds, success: true });

  } catch (error) {
    console.error('Ошибка получения возвратов:', error);
    return NextResponse.json({ error: 'Ошибка получения возвратов' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, customerId, reason = 'Невыполнение заказа в срок' } = body;

    if (!orderId || !customerId) {
      return NextResponse.json({ error: 'Не все поля заполнены' }, { status: 400 });
    }

    // Получаем заказ
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        executions: {
          where: { status: 'COMPLETED' }
        }
      }
    });

    if (!order) {
      return NextResponse.json({ error: 'Заказ не найден' }, { status: 404 });
    }

    if (order.customerId !== customerId) {
      return NextResponse.json({ error: 'Нет доступа к заказу' }, { status: 403 });
    }

    // Проверяем, что заказ не выполнен
    if (order.status === 'COMPLETED' || order.executions.length > 0) {
      return NextResponse.json({ error: 'Заказ уже выполнен' }, { status: 400 });
    }

    // Проверяем, что прошло 72 часа после дедлайна
    const now = new Date();
    const refundDeadline = order.refundDeadline || new Date(order.deadline.getTime() + 72 * 60 * 60 * 1000);
    
    if (now < refundDeadline) {
      return NextResponse.json({ 
        error: `Возврат возможен только через 72 часа после дедлайна (${refundDeadline.toLocaleString()})` 
      }, { status: 400 });
    }

    // Проверяем, что возврат еще не создан
    const existingRefund = await prisma.refund.findFirst({
      where: { orderId, status: { not: 'CANCELLED' } }
    });

    if (existingRefund) {
      return NextResponse.json({ error: 'Возврат уже создан' }, { status: 400 });
    }

    // Создаем возврат
    const refund = await prisma.refund.create({
      data: {
        orderId,
        customerId,
        amount: order.budget,
        reason,
        status: 'PENDING'
      }
    });

    return NextResponse.json({ refund, success: true });

  } catch (error) {
    console.error('Ошибка создания возврата:', error);
    return NextResponse.json({ error: 'Ошибка создания возврата' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { refundId, status, processedAt } = body;

    if (!refundId || !status) {
      return NextResponse.json({ error: 'Не все поля заполнены' }, { status: 400 });
    }

    const refund = await prisma.refund.update({
      where: { id: refundId },
      data: {
        status,
        processedAt: status === 'COMPLETED' ? (processedAt || new Date()) : null
      },
      include: {
        order: true,
        customer: true
      }
    });

    // Если возврат завершен, возвращаем деньги на счет заказчика
    if (status === 'COMPLETED') {
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
    }

    return NextResponse.json({ refund, success: true });

  } catch (error) {
    console.error('Ошибка обновления возврата:', error);
    return NextResponse.json({ error: 'Ошибка обновления возврата' }, { status: 500 });
  }
}

