import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const role = searchParams.get('role');
    const region = searchParams.get('region');
    const level = searchParams.get('level');
    const search = searchParams.get('search');

    const skip = (page - 1) * limit;

    // Строим фильтры
    const where: any = {};
    
    if (role) where.role = role;
    if (region) where.region = region;
    if (level) where.level = level;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Получаем пользователей с пагинацией
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          level: true,
          region: true,
          balance: true,
          isVerified: true,
          isBlocked: true,
          createdAt: true,
          _count: {
            select: {
              orders: true,
              executions: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.user.count({ where })
    ]);

    // Статистика
    const stats = await prisma.user.groupBy({
      by: ['role', 'level'],
      _count: { id: true },
      where: { isBlocked: false }
    });

    return NextResponse.json({
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      stats,
      success: true
    });

  } catch (error) {
    console.error('Ошибка получения пользователей:', error);
    return NextResponse.json({ error: 'Ошибка получения пользователей' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, updates } = body;

    if (!userId || !updates) {
      return NextResponse.json({ error: 'Не все поля заполнены' }, { status: 400 });
    }

    // Обновляем пользователя
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updates,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        level: true,
        region: true,
        balance: true,
        isVerified: true,
        isBlocked: true
      }
    });

    return NextResponse.json({ user: updatedUser, success: true });

  } catch (error) {
    console.error('Ошибка обновления пользователя:', error);
    return NextResponse.json({ error: 'Ошибка обновления пользователя' }, { status: 500 });
  }
}

