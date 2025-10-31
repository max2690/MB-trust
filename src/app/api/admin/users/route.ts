import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { UserRole, UserLevel } from '@prisma/client';

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
    const where: {
      role?: UserRole;
      region?: string;
      level?: UserLevel;
      OR?: Array<{
        name?: { contains: string; mode: 'insensitive' };
        email?: { contains: string; mode: 'insensitive' };
        phone?: { contains: string; mode: 'insensitive' };
      }>;
    } = {};
    
    if (role) where.role = role as UserRole;
    if (region) where.region = region;
    if (level) where.level = level as UserLevel;
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

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userIdFromQuery = searchParams.get('userId');
    const body = await (async () => {
      try { return await request.json(); } catch { return {}; }
    })();
    const userId = userIdFromQuery || (body as { userId?: string }).userId;

    if (!userId) {
      return NextResponse.json({ success: false, error: 'userId is required' }, { status: 400 });
    }

    try {
      await prisma.user.delete({ where: { id: userId } });
      return NextResponse.json({ success: true });
    } catch (err) {
      // Если есть внешние ключи и удаление невозможно, делаем мягкое удаление (не трогаем обязательные поля)
      await prisma.user.update({
        where: { id: userId },
        data: {
          isBlocked: true,
          name: 'Deleted User',
          telegramUsername: null,
        },
      });
      return NextResponse.json({ success: true, softDeleted: true });
    }
  } catch (error) {
    console.error('Ошибка удаления пользователя:', error);
    return NextResponse.json({ success: false, error: 'Ошибка удаления пользователя' }, { status: 500 });
  }
}

