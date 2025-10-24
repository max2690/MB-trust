import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST /api/cron/check-levels - Проверка и повышение уровней пользователей
export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Начинаем проверку уровней пользователей...');

    // Получаем всех исполнителей
    const executors = await prisma.user.findMany({
      where: {
        role: 'EXECUTOR',
        isActivated: true
      },
      include: {
        trustLevel: true,
        executions: {
          where: {
            status: 'COMPLETED'
          }
        }
      }
    });

    let upgradedCount = 0;
    const upgrades = [];

    for (const executor of executors) {
      const currentLevel = executor.trustLevel;
      const totalExecutions = executor.executions.length;
      const averageRating = executor.averageRating || 0;
      const daysActive = executor.daysActive || 0;

      // Находим следующий доступный уровень
      const nextLevel = await prisma.trustLevel.findFirst({
        where: {
          minExecutions: { lte: totalExecutions },
          minRating: { lte: averageRating },
          minDaysActive: { lte: daysActive },
          isActive: true
        },
        orderBy: { minExecutions: 'desc' }
      });

      // Проверяем, нужно ли повышение уровня
      if (nextLevel && (!currentLevel || nextLevel.minExecutions > currentLevel.minExecutions)) {
        await prisma.user.update({
          where: { id: executor.id },
          data: {
            trustLevelId: nextLevel.id,
            levelUpEligible: true
          }
        });

        upgradedCount++;
        upgrades.push({
          userId: executor.id,
          userName: executor.name,
          fromLevel: currentLevel?.displayName || 'Нет уровня',
          toLevel: nextLevel.displayName
        });

        console.log(`✅ ${executor.name} повышен с ${currentLevel?.displayName || 'Нет уровня'} до ${nextLevel.displayName}`);
      }
    }

    console.log(`🎉 Проверка завершена. Повышено уровней: ${upgradedCount}`);

    return NextResponse.json({
      success: true,
      message: `Проверка завершена. Повышено уровней: ${upgradedCount}`,
      upgradedCount,
      upgrades
    });
  } catch (error) {
    console.error('Error checking user levels:', error);
    return NextResponse.json(
      { error: 'Ошибка проверки уровней пользователей' },
      { status: 500 }
    );
  }
}

// GET /api/cron/check-levels - Получить статистику уровней
export async function GET(request: NextRequest) {
  try {
    const stats = await prisma.user.groupBy({
      by: ['trustLevelId'],
      _count: {
        id: true
      },
      where: {
        role: 'EXECUTOR',
        isActivated: true
      }
    });

    const levelStats = await Promise.all(
      stats.map(async (stat) => {
        const level = await prisma.trustLevel.findUnique({
          where: { id: stat.trustLevelId || '' }
        });

        return {
          level: level?.displayName || 'Без уровня',
          count: stat._count.id
        };
      })
    );

    return NextResponse.json({
      success: true,
      stats: levelStats
    });
  } catch (error) {
    console.error('Error fetching level stats:', error);
    return NextResponse.json(
      { error: 'Ошибка получения статистики уровней' },
      { status: 500 }
    );
  }
}
