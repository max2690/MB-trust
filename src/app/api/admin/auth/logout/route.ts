import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json({ error: 'Токен обязателен' }, { status: 400 });
    }

    // Удаление сессии
    await prisma.adminSession.deleteMany({
      where: { token }
    });

    return NextResponse.json({
      success: true,
      message: 'Выход выполнен успешно'
    });

  } catch (error) {
    console.error('Ошибка выхода:', error);
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}

