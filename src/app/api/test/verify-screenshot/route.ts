import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST /api/test/verify-screenshot - Тестовая проверка скриншота
export async function POST(request: NextRequest) {
  try {
    const { screenshot, orderId, stepNumber } = await request.json();

    if (!screenshot || !orderId || stepNumber === undefined) {
      return NextResponse.json(
        { error: 'Все поля обязательны' },
        { status: 400 }
      );
    }

    // Проверяем существование тестового заказа
    const order = await prisma.order.findUnique({
      where: { id: orderId }
    });

    if (!order || !order.isTestOrder) {
      return NextResponse.json(
        { error: 'Тестовый заказ не найден' },
        { status: 404 }
      );
    }

    // Тестовая AI проверка (заглушка)
    const aiResult = await testAIVerification(screenshot);

    // Находим выполнение
    const execution = await prisma.execution.findFirst({
      where: {
        orderId: orderId,
        executorId: 'test-executor',
        isTestExecution: true
      }
    });

    if (!execution) {
      return NextResponse.json(
        { error: 'Выполнение не найдено' },
        { status: 404 }
      );
    }

    // Обновляем статус выполнения
    const newStatus = aiResult.approved ? 'APPROVED' : 'REJECTED';
    
    await prisma.execution.update({
      where: { id: execution.id },
      data: {
        status: newStatus,
        screenshotUrl: screenshot,
        reviewedAt: new Date(),
        moderatorComment: aiResult.message
      }
    });

    // Если все скриншоты одобрены, завершаем заказ
    if (aiResult.approved) {
      const completedSteps = stepNumber + 1;
      if (completedSteps >= order.quantity) {
        await prisma.order.update({
          where: { id: orderId },
          data: { 
            status: 'COMPLETED',
            completedCount: order.quantity
          }
        });
      }
    }

    return NextResponse.json({
      success: true,
      result: aiResult,
      message: 'Тестовая проверка завершена',
      orderCompleted: aiResult.approved && (stepNumber + 1) >= order.quantity
    });
  } catch (error) {
    console.error('Error verifying test screenshot:', error);
    return NextResponse.json(
      { error: 'Ошибка тестовой проверки скриншота' },
      { status: 500 }
    );
  }
}

// Заглушка для тестовой AI проверки
async function testAIVerification(screenshot: string) {
  // Имитируем AI проверку с высокой вероятностью одобрения для тестов
  const confidence = Math.random() * 0.2 + 0.8; // 80-100% уверенности для тестов
  
  return {
    confidence: confidence,
    approved: confidence > 0.85, // 85% порог для тестов
    details: {
      qrCodeDetected: Math.random() > 0.1,
      platformMatch: Math.random() > 0.05,
      qualityScore: Math.random() * 0.1 + 0.9
    },
    message: confidence > 0.85 
      ? 'Тестовый скриншот одобрен! ✅' 
      : 'Тестовый скриншот отклонен. Попробуйте еще раз. ❌'
  };
}
