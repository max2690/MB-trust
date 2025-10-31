import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Создание нового админа (только для супер-админа)
export async function POST(request: NextRequest) {
  try {
    const { 
      login, 
      password, 
      name,
      role, 
      permissions, 
      createdBy 
    } = await request.json();

    // Проверяем, что создающий - супер-админ
    const creator = await prisma.admin.findUnique({
      where: { login: createdBy }
    });

    if (!creator || creator.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ 
        error: 'Недостаточно прав для создания админа' 
      }, { status: 403 });
    }

    // Хешируем пароль
    const passwordHash = await bcrypt.hash(password, 12);

    // Создаем админа
    const admin = await prisma.admin.create({
      data: {
        login,
        passwordHash,
        name: name || login,
        role,
        permissions: JSON.stringify(permissions || []),
        createdBy: creator.id,
        isActive: true
      }
    });

    return NextResponse.json({
      success: true,
      admin: {
        id: admin.id,
        login: admin.login,
        role: admin.role,
        permissions: admin.permissions ? JSON.parse(admin.permissions) : [],
        createdAt: admin.createdAt
      }
    });

  } catch (error) {
    console.error('Ошибка создания админа:', error);
    return NextResponse.json({ 
      error: 'Ошибка создания админа' 
    }, { status: 500 });
  }
}

// Получение списка админов
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');

    const where: { role?: 'SUPER_ADMIN' | 'MODERATOR_ADMIN' } = role ? { role: role as 'SUPER_ADMIN' | 'MODERATOR_ADMIN' } : {};

    const admins = await prisma.admin.findMany({
      where,
      select: {
        id: true,
        login: true,
        role: true,
        permissions: true,
        isActive: true,
        createdAt: true,
        createdBy: true
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ success: true, admins });

  } catch (error) {
    console.error('Ошибка получения админов:', error);
    return NextResponse.json({ 
      error: 'Ошибка получения админов' 
    }, { status: 500 });
  }
}

// Обновление админа (блокировка/разблокировка, права)
export async function PUT(request: NextRequest) {
  try {
    const { 
      adminId, 
      isActive, 
      permissions, 
      updatedBy 
    } = await request.json();

    // Проверяем права обновляющего
    const updater = await prisma.admin.findUnique({
      where: { login: updatedBy }
    });

    if (!updater) {
      return NextResponse.json({ 
        error: 'Админ не найден' 
      }, { status: 404 });
    }

    // Только супер-админ может изменять других админов
    if (updater.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ 
        error: 'Недостаточно прав для изменения админа' 
      }, { status: 403 });
    }

    const updateData: { isActive?: boolean; permissions?: string } = {};
    if (isActive !== undefined) updateData.isActive = isActive;
    if (permissions) updateData.permissions = JSON.stringify(permissions);

    const admin = await prisma.admin.update({
      where: { id: adminId },
      data: updateData,
      select: {
        id: true,
        login: true,
        role: true,
        permissions: true,
        isActive: true
      }
    });

    return NextResponse.json({
      success: true,
      admin: {
        ...admin,
        permissions: admin.permissions ? JSON.parse(admin.permissions) : []
      }
    });

  } catch (error) {
    console.error('Ошибка обновления админа:', error);
    return NextResponse.json({ 
      error: 'Ошибка обновления админа' 
    }, { status: 500 });
  }
}
