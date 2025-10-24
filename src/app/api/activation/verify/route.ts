import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST /api/activation/verify - Проверка активации по скриншоту
export async function POST(request: NextRequest) {
  try {
    const { userId, screenshot, activationId } = await request.json();

    if (!userId || !screenshot || !activationId) {
      return NextResponse.json(
        { error: 'Все поля обязательны' },
        { status: 400 }
      );
    }

    // Проверяем существование задания активации
    const activationStory = await prisma.activationStory.findUnique({
      where: { id: activationId },
      include: { user: true }
    });

    if (!activationStory) {
      return NextResponse.json(
        { error: 'Задание активации не найдено' },
        { status: 404 }
      );
    }

    if (activationStory.userId !== userId) {
      return NextResponse.json(
        { error: 'Неверный пользователь' },
        { status: 400 }
      );
    }

    if (activationStory.status === 'COMPLETED') {
      return NextResponse.json(
        { error: 'Активация уже завершена' },
        { status: 400 }
      );
    }

    // Заглушка для AI проверки скриншота
    const aiResult = await verifyActivationScreenshot(screenshot);

    if (aiResult.approved) {
      // Активируем аккаунт
      await prisma.user.update({
        where: { id: userId },
        data: {
          isActivated: true,
          activationCompletedAt: new Date()
        }
      });

      // Обновляем статус задания активации
      await prisma.activationStory.update({
        where: { id: activationId },
        data: {
          status: 'COMPLETED',
          screenshotUrl: screenshot,
          completedAt: new Date()
        }
      });

      return NextResponse.json({
        success: true,
        message: 'Активация успешно завершена!',
        activated: true
      });
    } else {
      // Обновляем статус на отклоненный
      await prisma.activationStory.update({
        where: { id: activationId },
        data: {
          status: 'REJECTED',
          screenshotUrl: screenshot
        }
      });

      return NextResponse.json({
        success: false,
        message: aiResult.message || 'Скриншот не прошел проверку',
        activated: false,
        details: aiResult.details
      });
    }
  } catch (error) {
    console.error('Error verifying activation:', error);
    return NextResponse.json(
      { error: 'Ошибка проверки активации' },
      { status: 500 }
    );
  }
}

// GET /api/activation/status - Получить статус активации
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

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        activationStories: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Пользователь не найден' },
        { status: 404 }
      );
    }

    const latestActivation = user.activationStories[0];

    return NextResponse.json({
      success: true,
      isActivated: user.isActivated,
      activationCompletedAt: user.activationCompletedAt,
      latestActivation: latestActivation ? {
        id: latestActivation.id,
        platform: latestActivation.platform,
        status: latestActivation.status,
        createdAt: latestActivation.createdAt,
        completedAt: latestActivation.completedAt
      } : null
    });
  } catch (error) {
    console.error('Error getting activation status:', error);
    return NextResponse.json(
      { error: 'Ошибка получения статуса активации' },
      { status: 500 }
    );
  }
}

// Заглушка для AI проверки скриншота активации
async function verifyActivationScreenshot(screenshot: string) {
  // В реальности здесь будет AI проверка
  // Пока возвращаем заглушку с высокой вероятностью одобрения
  
  const confidence = Math.random() * 0.3 + 0.7; // 70-100% уверенности
  
  return {
    approved: confidence > 0.8,
    confidence: confidence,
    details: {
      qrCodeDetected: Math.random() > 0.2,
      platformMatch: Math.random() > 0.1,
      qualityScore: Math.random() * 0.2 + 0.8
    },
    message: confidence > 0.8 
      ? 'Скриншот одобрен! Активация завершена.' 
      : 'Скриншот не прошел проверку. Попробуйте еще раз.'
  };
}
