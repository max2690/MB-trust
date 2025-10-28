import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST /api/test/orders/[id]/accept - Принятие тестового заказа
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: orderId } = await params;

    // Проверяем существование тестового заказа
    const order = await prisma.order.findUnique({
      where: { id: orderId }
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Заказ не найден' },
        { status: 404 }
      );
    }

    if (!order.isTestOrder) {
      return NextResponse.json(
        { error: 'Это не тестовый заказ' },
        { status: 400 }
      );
    }

    if (order.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Заказ уже принят или завершен' },
        { status: 400 }
      );
    }

    // Принимаем тестовый заказ
    const execution = await prisma.execution.create({
      data: {
        orderId: orderId,
        executorId: 'test-executor',
        status: 'PENDING',
        reward: Number(order.executorEarnings),
        isTestExecution: true
      }
    });

    // Обновляем статус заказа
    await prisma.order.update({
      where: { id: orderId },
      data: { status: 'IN_PROGRESS' }
    });

    return NextResponse.json({
      success: true,
      execution,
      message: 'Тестовый заказ принят'
    });
  } catch (error) {
    console.error('Error accepting test order:', error);
    return NextResponse.json(
      { error: 'Ошибка принятия тестового заказа' },
      { status: 500 }
    );
  }
}

// GET /api/test/orders/[id] - Получить информацию о тестовом заказе
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: orderId } = await params;

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        executions: {
          include: {
            executor: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      }
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Заказ не найден' },
        { status: 404 }
      );
    }

    if (!order.isTestOrder) {
      return NextResponse.json(
        { error: 'Это не тестовый заказ' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      order
    });
  } catch (error) {
    console.error('Error fetching test order:', error);
    return NextResponse.json(
      { error: 'Ошибка получения тестового заказа' },
      { status: 500 }
    );
  }
}
