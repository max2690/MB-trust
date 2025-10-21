import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const executorId = searchParams.get('executorId');

    if (!executorId) {
      return NextResponse.json({ error: 'ID исполнителя не указан' }, { status: 400 });
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

    // Получаем дневные лимиты
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
    const platformLimits = dailyLimit?.platformLimits as any || {};

    // Проверяем, сколько дней работает исполнитель
    const daysSinceRegistration = Math.floor(
      (Date.now() - executor.createdAt.getTime()) / (1000 * 60 * 60 * 24)
    );

    return NextResponse.json({
      executor: {
        id: executor.id,
        level: executor.level,
        daysSinceRegistration
      },
      limits: {
        daily: {
          current: currentExecutions,
          max: maxExecutions,
          remaining: maxExecutions - currentExecutions
        },
        platforms: platformLimits,
        maxPerPlatform: 3
      },
      success: true
    });
    
  } catch (error) {
    console.error('Ошибка получения лимитов:', error);
    return NextResponse.json({ error: 'Ошибка получения лимитов' }, { status: 500 });
  }
}

