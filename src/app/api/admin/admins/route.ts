import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const admins = await prisma.admin.findMany({
      select: {
        id: true,
        login: true,
        name: true,
        role: true,
        phone: true,
        email: true,
        telegramId: true,
        isActive: true,
        createdAt: true,
        lastLogin: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ admins, success: true });
  } catch (error) {
    console.error('Ошибка получения списка админов:', error);
    return NextResponse.json({ error: 'Ошибка получения списка админов' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { login, password, name, phone, email, telegramId, role } = body;

    if (!login || !password || !name) {
      return NextResponse.json({ error: 'Логин, пароль и имя обязательны' }, { status: 400 });
    }

    // Проверка уникальности логина
    const existingAdmin = await prisma.admin.findUnique({
      where: { login }
    });

    if (existingAdmin) {
      return NextResponse.json({ error: 'Админ с таким логином уже существует' }, { status: 400 });
    }

    // Хеширование пароля
    const passwordHash = await bcrypt.hash(password, 12);

    // Создание админа
    const newAdmin = await prisma.admin.create({
      data: {
        login,
        passwordHash,
        name,
        role: role || 'MODERATOR_ADMIN',
        phone: phone || null,
        email: email || null,
        telegramId: telegramId || null,
        isActive: true,
      },
      select: {
        id: true,
        login: true,
        name: true,
        role: true,
        phone: true,
        email: true,
        telegramId: true,
        isActive: true,
        createdAt: true,
      }
    });

    return NextResponse.json({ admin: newAdmin, success: true });
  } catch (error) {
    console.error('Ошибка создания админа:', error);
    return NextResponse.json({ error: 'Ошибка создания админа' }, { status: 500 });
  }
}

