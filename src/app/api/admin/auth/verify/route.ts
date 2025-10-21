import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyCode, updateSessionVerification, isAdminFullyVerified } from '@/lib/verification';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { token, code, type } = await request.json();

    if (!token || !code || !type) {
      return NextResponse.json({ error: 'Не все поля заполнены' }, { status: 400 });
    }

    // Поиск сессии
    const session = await prisma.adminSession.findFirst({
      where: {
        token,
        expiresAt: { gt: new Date() }
      },
      include: { admin: true }
    });

    if (!session) {
      return NextResponse.json({ error: 'Сессия не найдена или истекла' }, { status: 401 });
    }

    // Проверка кода верификации
    const isValidCode = await verifyCode(session.adminId, code, type.toUpperCase());
    
    if (!isValidCode) {
      return NextResponse.json({ error: 'Неверный код или код истек' }, { status: 400 });
    }

    // Обновление статуса верификации в сессии
    await updateSessionVerification(session.id, type.toLowerCase(), true);

    // Получение обновленной сессии
    const updatedSession = await prisma.adminSession.findUnique({
      where: { id: session.id },
      include: { admin: true }
    });

    const fullyVerified = isAdminFullyVerified(updatedSession);

    return NextResponse.json({
      success: true,
      verified: true,
      fullyVerified,
      session: {
        id: updatedSession.id,
        smsVerified: updatedSession.smsVerified,
        emailVerified: updatedSession.emailVerified
      },
      admin: {
        id: updatedSession.admin.id,
        login: updatedSession.admin.login,
        name: updatedSession.admin.name,
        role: updatedSession.admin.role
      }
    });

  } catch (error) {
    console.error('Ошибка верификации:', error);
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}

