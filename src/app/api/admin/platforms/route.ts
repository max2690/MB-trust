import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const platforms = await prisma.platformSettings.findMany({
      orderBy: { platform: 'asc' }
    });

    const commissions = await prisma.commissionSettings.findMany({
      orderBy: { level: 'asc' }
    });

    return NextResponse.json({
      platforms,
      commissions,
      success: true
    });

  } catch (error) {
    console.error('Ошибка получения настроек платформ:', error);
    return NextResponse.json({ error: 'Ошибка получения настроек платформ' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, data } = body;

    if (type === 'platform') {
      // Обновляем цену платформы
      const { platform, basePrice } = data;
      
      const updatedPlatform = await prisma.platformSettings.update({
        where: { platform },
        data: { basePrice }
      });

      return NextResponse.json({ platform: updatedPlatform, success: true });

    } else if (type === 'commission') {
      // Обновляем комиссию
      const { level, executorRate, platformRate } = data;
      
      const updatedCommission = await prisma.commissionSettings.update({
        where: { level },
        data: { executorRate, platformRate }
      });

      return NextResponse.json({ commission: updatedCommission, success: true });

    } else {
      return NextResponse.json({ error: 'Неверный тип обновления' }, { status: 400 });
    }

  } catch (error) {
    console.error('Ошибка обновления настроек:', error);
    return NextResponse.json({ error: 'Ошибка обновления настроек' }, { status: 500 });
  }
}

