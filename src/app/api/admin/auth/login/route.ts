import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { 
  createAdminSession, 
  initiateMultiLevelVerification,
  generateVerificationCode,
  createVerificationCode 
} from '@/lib/verification';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { login, password } = await request.json();

    // 🚀 КОСТЫЛЬ ДЛЯ ТЕСТИРОВАНИЯ - любой логин/пароль проходит
    if (process.env.NODE_ENV === 'development') {
      console.log('🔥 DEV MODE: Автоматический вход в API без проверки');
      
      // Создаем фейковую сессию
      const fakeSession = {
        id: 'dev-session-' + Date.now(),
        adminId: 'dev-admin-id',
        token: 'dev-token-' + Math.random().toString(36),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 часа
      };

      const fakeAdmin = {
        id: 'dev-admin-id',
        login: login || 'dev-admin',
        name: 'Dev Admin',
        role: 'SUPER_ADMIN',
        phone: '89241242417',
        email: 'shveddamir@gmail.com',
        isActive: true
      };

      return NextResponse.json({
        success: true,
        session: fakeSession,
        admin: fakeAdmin,
        verification: {
          methods: ['SMS', 'EMAIL'],
          status: { sms: true, email: true }
        }
      });
    }

    if (!login || !password) {
      return NextResponse.json({ error: 'Логин и пароль обязательны' }, { status: 400 });
    }

    // Поиск админа по логину
    const admin = await prisma.admin.findUnique({
      where: { login }
    });

    if (!admin) {
      return NextResponse.json({ error: 'Неверный логин или пароль' }, { status: 401 });
    }

    if (!admin.isActive) {
      return NextResponse.json({ error: 'Аккаунт заблокирован' }, { status: 403 });
    }

    // Проверка пароля
    const isValidPassword = await bcrypt.compare(password, admin.passwordHash);
    if (!isValidPassword) {
      return NextResponse.json({ error: 'Неверный логин или пароль' }, { status: 401 });
    }

    // Создание сессии
    const session = await createAdminSession(admin.id);

    // Инициализация многоуровневой верификации
    const verificationResults = await initiateMultiLevelVerification(admin);

    // Обновление времени последнего входа
    await prisma.admin.update({
      where: { id: admin.id },
      data: { lastLogin: new Date() }
    });

    return NextResponse.json({
      success: true,
      session: {
        id: session.id,
        token: session.token,
        expiresAt: session.expiresAt
      },
      admin: {
        id: admin.id,
        login: admin.login,
        name: admin.name,
        role: admin.role,
        phone: admin.phone,
        email: admin.email,
        telegramId: admin.telegramId
      },
      verification: {
        methods: verificationResults.map(r => ({
          method: r.method,
          success: r.success
        })),
        required: true
      }
    });

  } catch (error) {
    console.error('Ошибка входа админа:', error);
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}

