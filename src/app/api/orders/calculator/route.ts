import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      platforms, // [{ platform: 'INSTAGRAM', quantity: 100 }, { platform: 'TELEGRAM', quantity: 50 }]
      campaignType, // 'SINGLE', 'WEEKLY', 'BIWEEKLY'
      executionDays, // количество дней выполнения
      customSchedule, // { day1: 50, day2: 200, day3: 50 } - опционально
      autoDistribution = true
    } = body;

    if (!platforms || !Array.isArray(platforms) || platforms.length === 0) {
      return NextResponse.json({ error: 'Не указаны платформы' }, { status: 400 });
    }

    // Получаем цены платформ
    const platformSettings = await prisma.platformSettings.findMany({
      where: { isActive: true }
    });

    const platformPrices = platformSettings.reduce((acc, setting) => {
      acc[setting.platform] = setting.basePrice;
      return acc;
    }, {} as Record<string, number>);

    // Рассчитываем общую стоимость
    let totalCost = 0;
    const platformCosts: Record<string, number> = {};
    const totalQuantity = platforms.reduce((sum, p) => sum + p.quantity, 0);

    for (const platform of platforms) {
      const price = platformPrices[platform.platform] || 0;
      const cost = platform.quantity * price;
      platformCosts[platform.platform] = cost;
      totalCost += cost;
    }

    // Рассчитываем распределение по дням
    let dailyDistribution: Record<string, Record<string, number>> = {};

    if (autoDistribution) {
      // Автоматическое равномерное распределение
      const days = executionDays || 1;
      for (const platform of platforms) {
        const dailyQuantity = Math.ceil(platform.quantity / days);
        dailyDistribution[platform.platform] = {};
        
        let remaining = platform.quantity;
        for (let day = 1; day <= days; day++) {
          const todayQuantity = Math.min(dailyQuantity, remaining);
          dailyDistribution[platform.platform][`day${day}`] = todayQuantity;
          remaining -= todayQuantity;
        }
      }
    } else if (customSchedule) {
      // Пользовательское расписание
      dailyDistribution = customSchedule;
    }

    // Рассчитываем стоимость по дням
    const dailyCosts: Record<string, number> = {};
    Object.keys(dailyDistribution).forEach(day => {
      let dayCost = 0;
      Object.entries(dailyDistribution[day]).forEach(([platform, quantity]) => {
        const price = platformPrices[platform] || 0;
        dayCost += (quantity as number) * price;
      });
      dailyCosts[day] = dayCost;
    });

    // Рассчитываем сроки
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + (executionDays || 1));

    // Рассчитываем дедлайн для возврата (72 часа после завершения)
    const refundDeadline = new Date(endDate);
    refundDeadline.setHours(refundDeadline.getHours() + 72);

    return NextResponse.json({
      calculation: {
        totalCost,
        totalQuantity,
        platformCosts,
        dailyDistribution,
        dailyCosts,
        executionDays: executionDays || 1,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        refundDeadline: refundDeadline.toISOString()
      },
      breakdown: {
        platforms: platforms.map(p => ({
          platform: p.platform,
          quantity: p.quantity,
          price: platformPrices[p.platform] || 0,
          cost: platformCosts[p.platform] || 0
        }))
      },
      success: true
    });

  } catch (error) {
    console.error('Ошибка расчета:', error);
    return NextResponse.json({ error: 'Ошибка расчета' }, { status: 500 });
  }
}

