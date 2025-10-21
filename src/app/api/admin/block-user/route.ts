import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Блокировка/разблокировка пользователя
export async function POST(request: NextRequest) {
  try {
    const { 
      userId, 
      isBlocked, 
      reason, 
      blockedBy 
    } = await request.json();

    // Проверяем права блокирующего
    const admin = await prisma.admin.findUnique({
      where: { login: blockedBy }
    });

    if (!admin || !admin.isActive) {
      return NextResponse.json({ 
        error: 'Админ не найден или неактивен' 
      }, { status: 404 });
    }

    // Получаем пользователя для блокировки
    const targetUser = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!targetUser) {
      return NextResponse.json({ 
        error: 'Пользователь не найден' 
      }, { status: 404 });
    }

    // Проверяем, не пытается ли модератор заблокировать админа
    if (admin.role !== 'SUPER_ADMIN') {
      // Модераторы могут блокировать только обычных пользователей
      // (в будущем можно добавить проверку роли пользователя)
    }

    // Обновляем статус пользователя
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { 
        isBlocked,
        updatedAt: new Date()
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        isBlocked: true,
        updatedAt: true
      }
    });

    // Логируем действие
    console.log(`👤 Пользователь ${updatedUser.name} (${updatedUser.id}) ${isBlocked ? 'заблокирован' : 'разблокирован'} админом ${admin.login}. Причина: ${reason || 'Не указана'}`);

    return NextResponse.json({
      success: true,
      user: updatedUser,
      action: isBlocked ? 'blocked' : 'unblocked',
      reason: reason || 'Не указана'
    });

  } catch (error) {
    console.error('Ошибка блокировки пользователя:', error);
    return NextResponse.json({ 
      error: 'Ошибка блокировки пользователя' 
    }, { status: 500 });
  }
}

// Массовая блокировка пользователей
export async function PUT(request: NextRequest) {
  try {
    const { 
      userIds, 
      isBlocked, 
      reason, 
      blockedBy 
    } = await request.json();

    // Проверяем права блокирующего
    const admin = await prisma.admin.findUnique({
      where: { login: blockedBy },
      select: { id: true, login: true, role: true, isActive: true }
    });

    if (!admin || !admin.isActive) {
      return NextResponse.json({ 
        error: 'Админ не найден или неактивен' 
      }, { status: 404 });
    }

    // Обновляем всех пользователей
    const result = await prisma.user.updateMany({
      where: { 
        id: { in: userIds }
        // В будущем можно добавить фильтрацию по ролям
      },
      data: { 
        isBlocked,
        updatedAt: new Date()
      }
    });

    console.log(`👥 Массовая ${isBlocked ? 'блокировка' : 'разблокировка'}: ${result.count} пользователей админом ${admin.login}. Причина: ${reason || 'Не указана'}`);

    return NextResponse.json({
      success: true,
      affectedCount: result.count,
      action: isBlocked ? 'blocked' : 'unblocked',
      reason: reason || 'Не указана'
    });

  } catch (error) {
    console.error('Ошибка массовой блокировки:', error);
    return NextResponse.json({ 
      error: 'Ошибка массовой блокировки' 
    }, { status: 500 });
  }
}
