import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST /api/admin/init-trust-levels - Инициализация уровней доверия
export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Инициализация уровней доверия...');

    // Проверяем, есть ли уже уровни
    const existingLevels = await prisma.trustLevel.findMany();
    if (existingLevels.length > 0) {
      return NextResponse.json({
        success: true,
        message: 'Уровни доверия уже инициализированы',
        levels: existingLevels
      });
    }

    // Создаем уровни доверия
    const trustLevels = [
      {
        name: 'NOVICE',
        displayName: 'Новичок',
        minPricePerStory: 50,
        commissionRate: 0.4, // 40% комиссия
        minExecutions: 0,
        minRating: 0,
        minDaysActive: 0,
        adminNotes: 'Начальный уровень для новых пользователей'
      },
      {
        name: 'VERIFIED',
        displayName: 'Проверенный',
        minPricePerStory: 80,
        commissionRate: 0.5, // 50% комиссия
        minExecutions: 10,
        minRating: 4.0,
        minDaysActive: 30,
        adminNotes: 'Уровень для активных пользователей'
      },
      {
        name: 'REFERRAL',
        displayName: 'Реферальный',
        minPricePerStory: 100,
        commissionRate: 0.6, // 60% комиссия
        minExecutions: 50,
        minRating: 4.5,
        minDaysActive: 100,
        adminNotes: 'Уровень для пользователей с рефералами'
      },
      {
        name: 'TOP',
        displayName: 'Топ',
        minPricePerStory: 150,
        commissionRate: 0.8, // 80% комиссия
        minExecutions: 100,
        minRating: 4.8,
        minDaysActive: 200,
        adminNotes: 'Высший уровень для топовых исполнителей'
      }
    ];

    const createdLevels = await Promise.all(
      trustLevels.map(level => 
        prisma.trustLevel.create({ data: level })
      )
    );

    console.log(`✅ Создано ${createdLevels.length} уровней доверия`);

    return NextResponse.json({
      success: true,
      message: `Создано ${createdLevels.length} уровней доверия`,
      levels: createdLevels
    });
  } catch (error) {
    console.error('Error initializing trust levels:', error);
    return NextResponse.json(
      { error: 'Ошибка инициализации уровней доверия' },
      { status: 500 }
    );
  }
}

// GET /api/admin/init-trust-levels - Получить статус инициализации
export async function GET(request: NextRequest) {
  try {
    const levels = await prisma.trustLevel.findMany({
      orderBy: { minExecutions: 'asc' }
    });

    return NextResponse.json({
      success: true,
      initialized: levels.length > 0,
      levelsCount: levels.length,
      levels
    });
  } catch (error) {
    console.error('Error checking trust levels:', error);
    return NextResponse.json(
      { error: 'Ошибка проверки уровней доверия' },
      { status: 500 }
    );
  }
}
