import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const region = searchParams.get('region');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');

    const skip = (page - 1) * limit;

    // Строим фильтры
    const where: {
      isActive: boolean;
      region?: string | { contains: string; mode: 'insensitive' };
      name?: { contains: string; mode: 'insensitive' };
      OR?: Array<{ name: { contains: string; mode: 'insensitive' } } | { region: { contains: string; mode: 'insensitive' } }>;
    } = { isActive: true };
    
    if (region) where.region = region;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { region: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Получаем города
    const [cities, total] = await Promise.all([
      prisma.city.findMany({
        where,
        orderBy: [
          { region: 'asc' },
          { name: 'asc' }
        ],
        skip,
        take: limit
      }),
      prisma.city.count({ where })
    ]);

    // Получаем список регионов
    const regions = await prisma.city.findMany({
      select: { region: true },
      distinct: ['region'],
      orderBy: { region: 'asc' }
    });

    return NextResponse.json({
      cities,
      regions: regions.map(r => r.region),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      success: true
    });

  } catch (error) {
    console.error('Ошибка получения городов:', error);
    return NextResponse.json({ error: 'Ошибка получения городов' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, region, country = 'Россия' } = body;

    if (!name || !region) {
      return NextResponse.json({ error: 'Название города и регион обязательны' }, { status: 400 });
    }

    const city = await prisma.city.create({
      data: { name, region, country }
    });

    return NextResponse.json({ city, success: true });

  } catch (error) {
    console.error('Ошибка создания города:', error);
    return NextResponse.json({ error: 'Ошибка создания города' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { cityId, updates } = body;

    if (!cityId || !updates) {
      return NextResponse.json({ error: 'Не все поля заполнены' }, { status: 400 });
    }

    const updatedCity = await prisma.city.update({
      where: { id: cityId },
      data: updates
    });

    return NextResponse.json({ city: updatedCity, success: true });

  } catch (error) {
    console.error('Ошибка обновления города:', error);
    return NextResponse.json({ error: 'Ошибка обновления города' }, { status: 500 });
  }
}

