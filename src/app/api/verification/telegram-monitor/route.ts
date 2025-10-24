import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST /api/verification/telegram-monitor - Начать мониторинг Telegram аккаунта
export async function POST(request: NextRequest) {
  try {
    const { userId, telegramUsername } = await request.json();

    if (!userId || !telegramUsername) {
      return NextResponse.json(
        { error: 'ID пользователя и Telegram username обязательны' },
        { status: 400 }
      );
    }

    // Проверяем существование пользователя
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Пользователь не найден' },
        { status: 404 }
      );
    }

    // Убираем @ если есть
    const cleanUsername = telegramUsername.replace('@', '');

    // Проверяем, не верифицирован ли уже этот аккаунт
    const existingUsernameVerification = await prisma.telegramVerification.findFirst({
      where: {
        OR: [
          { telegramUsername: cleanUsername },
          { telegramUsername: `@${cleanUsername}` }
        ]
      }
    });

    if (existingUsernameVerification && existingUsernameVerification.userId !== userId) {
      return NextResponse.json(
        { error: 'Этот Telegram аккаунт уже используется другим пользователем' },
        { status: 400 }
      );
    }

    // Проверяем существующую верификацию для пользователя
    const existingUserVerification = await prisma.telegramVerification.findFirst({
      where: { userId }
    });

    let verification;
    if (existingUserVerification) {
      verification = await prisma.telegramVerification.update({
        where: { id: existingUserVerification.id },
        data: {
          telegramUsername: `@${cleanUsername}`,
          isMonitoring: true,
          lastStoryCheck: new Date()
        }
      });
    } else {
      verification = await prisma.telegramVerification.create({
        data: {
          userId,
          telegramUsername: `@${cleanUsername}`,
          telegramUserId: '', // Будет заполнено ботом
          isVerified: false,
          isMonitoring: true,
          storiesMonitored: 0,
          storiesApproved: 0,
          lastStoryCheck: new Date()
        }
      });
    }

    // Отправляем команду боту для начала мониторинга
    await startTelegramMonitoring(verification.id, cleanUsername);

    return NextResponse.json({
      success: true,
      verification,
      message: 'Мониторинг Telegram аккаунта запущен'
    });
  } catch (error) {
    console.error('Error starting Telegram monitoring:', error);
    return NextResponse.json(
      { error: 'Ошибка запуска мониторинга Telegram' },
      { status: 500 }
    );
  }
}

// GET /api/verification/telegram-monitor - Получить статус мониторинга
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'ID пользователя обязателен' },
        { status: 400 }
      );
    }

    const verification = await prisma.telegramVerification.findFirst({
      where: { userId }
    });

    if (!verification) {
      return NextResponse.json({
        success: true,
        monitoring: false,
        message: 'Мониторинг не настроен'
      });
    }

    return NextResponse.json({
      success: true,
      monitoring: verification.isMonitoring,
      verification: {
        telegramUsername: verification.telegramUsername,
        isVerified: verification.isVerified,
        storiesMonitored: verification.storiesMonitored,
        storiesApproved: verification.storiesApproved,
        lastStoryCheck: verification.lastStoryCheck
      }
    });
  } catch (error) {
    console.error('Error getting Telegram monitoring status:', error);
    return NextResponse.json(
      { error: 'Ошибка получения статуса мониторинга' },
      { status: 500 }
    );
  }
}

// PUT /api/verification/telegram-monitor - Остановить мониторинг
export async function PUT(request: NextRequest) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'ID пользователя обязателен' },
        { status: 400 }
      );
    }

    const verification = await prisma.telegramVerification.findFirst({
      where: { userId }
    });

    if (!verification) {
      return NextResponse.json(
        { error: 'Мониторинг не настроен' },
        { status: 404 }
      );
    }

    // Останавливаем мониторинг
    await prisma.telegramVerification.update({
      where: { id: verification.id },
      data: { isMonitoring: false }
    });

    return NextResponse.json({
      success: true,
      message: 'Мониторинг Telegram остановлен'
    });
  } catch (error) {
    console.error('Error stopping Telegram monitoring:', error);
    return NextResponse.json(
      { error: 'Ошибка остановки мониторинга' },
      { status: 500 }
    );
  }
}

// Заглушка для запуска мониторинга через бота
async function startTelegramMonitoring(verificationId: string, username: string) {
  // В реальности здесь будет команда боту начать мониторинг
  console.log(`🤖 Запуск мониторинга для @${username} (ID: ${verificationId})`);
  
  // Имитируем получение информации о пользователе
  const mockTelegramUserId = Math.floor(Math.random() * 1000000).toString();
  
  // Обновляем telegramUserId
  await prisma.telegramVerification.update({
    where: { id: verificationId },
    data: { telegramUserId: mockTelegramUserId }
  });
}
