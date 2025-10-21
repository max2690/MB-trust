import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { nanoid } from 'nanoid';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, executorId, screenshotUrl, notes } = body;

    // Валидация
    if (!orderId || !executorId) {
      return NextResponse.json({ error: 'Не все поля заполнены' }, { status: 400 });
    }

    // Получаем информацию об исполнителе
    const executor = await prisma.user.findUnique({
      where: { id: executorId },
      select: { 
        id: true, 
        level: true, 
        role: true,
        createdAt: true 
      }
    });

    if (!executor || executor.role !== 'EXECUTOR') {
      return NextResponse.json({ error: 'Исполнитель не найден' }, { status: 404 });
    }

    // Проверяем, что заказ существует и доступен
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        executions: {
          where: { executorId }
        }
      }
    });

    if (!order) {
      return NextResponse.json({ error: 'Заказ не найден' }, { status: 404 });
    }

    // Проверяем, что исполнитель не брал этот заказ ранее
    if (order.executions.length > 0) {
      return NextResponse.json({ error: 'Вы уже взяли этот заказ' }, { status: 400 });
    }

    if (order.status !== 'PENDING') {
      return NextResponse.json({ error: 'Заказ уже принят' }, { status: 400 });
    }

    // Проверяем дневные лимиты
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const dailyLimit = await prisma.executorDailyLimit.findUnique({
      where: {
        executorId_date: {
          executorId,
          date: today
        }
      }
    });

    // Лимиты по уровням
    const levelLimits = {
      NOVICE: 5,
      VERIFIED: 10,
      REFERRAL: 15,
      TOP: 20
    };

    const currentExecutions = dailyLimit?.executionsCount || 0;
    const maxExecutions = levelLimits[executor.level];

    if (currentExecutions >= maxExecutions) {
      return NextResponse.json({ 
        error: `Достигнут дневной лимит (${maxExecutions} заказов для уровня ${executor.level})` 
      }, { status: 400 });
    }

    // Проверяем лимиты по площадкам
    const platformLimits = dailyLimit?.platformLimits as any || {};
    const currentPlatformExecutions = platformLimits[order.socialNetwork] || 0;
    const maxPlatformExecutions = 3; // Максимум 3 заказа на одну площадку в день

    if (currentPlatformExecutions >= maxPlatformExecutions) {
      return NextResponse.json({ 
        error: `Достигнут лимит по площадке ${order.socialNetwork} (${maxPlatformExecutions} заказов в день)` 
      }, { status: 400 });
    }

    // Создаем выполнение
    const execution = await prisma.execution.create({
      data: {
        id: nanoid(),
        orderId,
        executorId,
        screenshotUrl: screenshotUrl || '',
        notes: notes || '',
        status: 'PENDING',
        reward: order.reward
      }
    });

    // Обновляем статус заказа
    await prisma.order.update({
      where: { id: orderId },
      data: { status: 'IN_PROGRESS' }
    });

    // Обновляем дневные лимиты
    const newPlatformLimits = {
      ...platformLimits,
      [order.socialNetwork]: currentPlatformExecutions + 1
    };

    await prisma.executorDailyLimit.upsert({
      where: {
        executorId_date: {
          executorId,
          date: today
        }
      },
      update: {
        executionsCount: currentExecutions + 1,
        platformLimits: newPlatformLimits
      },
      create: {
        executorId,
        date: today,
        executionsCount: 1,
        platformLimits: newPlatformLimits
      }
    });

    return NextResponse.json({ execution, success: true });
    
  } catch (error) {
    console.error('Ошибка создания выполнения:', error);
    return NextResponse.json({ error: 'Ошибка создания выполнения' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const executorId = searchParams.get('executorId');
    const orderId = searchParams.get('orderId');

    let executions;

    if (executorId) {
      // Выполнения конкретного исполнителя
      executions = await prisma.execution.findMany({
        where: { executorId },
        include: {
          order: {
            select: {
              title: true,
              description: true,
              reward: true,
              status: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
    } else if (orderId) {
      // Выполнения конкретного заказа
      executions = await prisma.execution.findMany({
        where: { orderId },
        include: {
          executor: {
            select: {
              name: true,
              level: true,
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
    } else {
      // Все выполнения (для админа)
      executions = await prisma.execution.findMany({
        include: {
          order: {
            select: {
              title: true,
              description: true,
              reward: true,
              status: true
            }
          },
          executor: {
            select: {
              name: true,
              level: true,
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
    }

    return NextResponse.json({ executions, success: true });
    
  } catch (error) {
    console.error('Ошибка получения выполнений:', error);
    return NextResponse.json({ error: 'Ошибка получения выполнений' }, { status: 500 });
  }
}