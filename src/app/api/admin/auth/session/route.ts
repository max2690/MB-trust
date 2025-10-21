import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/verification';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // 🚀 КОСТЫЛЬ ДЛЯ ТЕСТИРОВАНИЯ - любой токен проходит
    if (process.env.NODE_ENV === 'development') {
      console.log('🔥 DEV MODE: Автоматическое подтверждение сессии');
      
      const fakeSession = {
        id: 'dev-session-' + Date.now(),
        smsVerified: true,
        emailVerified: true,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
      };

      const fakeAdmin = {
        id: 'dev-admin-id',
        login: 'dev-admin',
        name: 'Dev Admin',
        role: 'SUPER_ADMIN',
        phone: '89241242417',
        email: 'shveddamir@gmail.com',
        telegramId: null
      };

      return NextResponse.json({
        success: true,
        session: fakeSession,
        admin: fakeAdmin
      });
    }

    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json({ error: 'Токен обязателен' }, { status: 400 });
    }

    // Проверка сессии
    const session = await verifyAdminSession(token);

    if (!session) {
      return NextResponse.json({ error: 'Сессия не найдена или истекла' }, { status: 401 });
    }

    return NextResponse.json({
      success: true,
      session: {
        id: session.id,
        smsVerified: session.smsVerified,
        emailVerified: session.emailVerified,
        expiresAt: session.expiresAt
      },
      admin: {
        id: session.admin.id,
        login: session.admin.login,
        name: session.admin.name,
        role: session.admin.role,
        phone: session.admin.phone,
        email: session.admin.email,
        telegramId: session.admin.telegramId
      }
    });

  } catch (error) {
    console.error('Ошибка проверки сессии:', error);
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}

