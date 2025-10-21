import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const commissions = await prisma.commissionSettings.findMany({
      orderBy: { level: 'asc' },
    });
    return NextResponse.json({ commissions, success: true });
  } catch (error) {
    console.error('Ошибка получения настроек комиссий:', error);
    return NextResponse.json({ error: 'Ошибка получения настроек комиссий' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { level, executorRate, platformRate } = body;

    if (!level || executorRate === undefined || platformRate === undefined) {
      return NextResponse.json({ error: 'Не все поля заполнены' }, { status: 400 });
    }

    const updatedCommission = await prisma.commissionSettings.update({
      where: { level },
      data: {
        executorRate: parseFloat(executorRate),
        platformRate: parseFloat(platformRate),
      },
    });

    return NextResponse.json({ commission: updatedCommission, success: true });
  } catch (error) {
    console.error('Ошибка обновления настроек комиссий:', error);
    return NextResponse.json({ error: 'Ошибка обновления настроек комиссий' }, { status: 500 });
  }
}

