import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/admin/trust-levels - Получить все уровни доверия
export async function GET(request: NextRequest) {
  try {
    const trustLevels = await prisma.trustLevel.findMany({
      orderBy: { minExecutions: 'asc' }
    });

    return NextResponse.json({ success: true, trustLevels });
  } catch (error) {
    console.error('Error fetching trust levels:', error);
    return NextResponse.json(
      { error: 'Ошибка получения уровней доверия' },
      { status: 500 }
    );
  }
}

// POST /api/admin/trust-levels - Создать новый уровень доверия
export async function POST(request: NextRequest) {
  try {
    const {
      name,
      displayName,
      minPricePerStory,
      commissionRate,
      minExecutions,
      minRating,
      minDaysActive,
      adminNotes
    } = await request.json();

    // Проверяем обязательные поля
    if (!name || !displayName || !minPricePerStory || !commissionRate) {
      return NextResponse.json(
        { error: 'Заполните все обязательные поля' },
        { status: 400 }
      );
    }

    // Проверяем уникальность имени
    const existingLevel = await prisma.trustLevel.findFirst({
      where: { name }
    });

    if (existingLevel) {
      return NextResponse.json(
        { error: 'Уровень с таким именем уже существует' },
        { status: 400 }
      );
    }

    const trustLevel = await prisma.trustLevel.create({
      data: {
        name,
        displayName,
        minPricePerStory: parseFloat(minPricePerStory),
        commissionRate: parseFloat(commissionRate),
        minExecutions: parseInt(minExecutions) || 0,
        minRating: parseFloat(minRating) || 0,
        minDaysActive: parseInt(minDaysActive) || 0,
        adminNotes
      }
    });

    return NextResponse.json({ 
      success: true, 
      trustLevel,
      message: 'Уровень доверия создан успешно'
    });
  } catch (error) {
    console.error('Error creating trust level:', error);
    return NextResponse.json(
      { error: 'Ошибка создания уровня доверия' },
      { status: 500 }
    );
  }
}
