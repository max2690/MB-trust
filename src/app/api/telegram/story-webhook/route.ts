import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST /api/telegram/story-webhook - Webhook для получения новых сторис
export async function POST(request: NextRequest) {
  try {
    const { 
      telegramUserId, 
      storyData, 
      messageId,
      chatId 
    } = await request.json();

    console.log(`📱 Получена новая сторис от пользователя ${telegramUserId}`);

    // Находим верификацию пользователя
    const verification = await prisma.telegramVerification.findFirst({
      where: { 
        telegramUserId: telegramUserId.toString(),
        isMonitoring: true 
      },
      include: { user: true }
    });

    if (!verification) {
      console.log(`❌ Мониторинг не настроен для пользователя ${telegramUserId}`);
      return NextResponse.json({
        success: false,
        message: 'Мониторинг не настроен'
      });
    }

    // Находим активные заказы для этого пользователя
    const activeOrders = await prisma.order.findMany({
      where: {
        status: 'IN_PROGRESS',
        executions: {
          some: {
            executorId: verification.userId,
            status: 'PENDING'
          }
        }
      },
      include: {
        executions: {
          where: {
            executorId: verification.userId,
            status: 'PENDING'
          }
        }
      }
    });

    if (activeOrders.length === 0) {
      console.log(`❌ Нет активных заказов для пользователя ${verification.userId}`);
      return NextResponse.json({
        success: false,
        message: 'Нет активных заказов'
      });
    }

    // Обрабатываем сторис для каждого активного заказа
    const results = [];
    for (const order of activeOrders) {
      const result = await processStoryForOrder(storyData, order, verification);
      results.push(result);
    }

    // Обновляем статистику верификации
    await prisma.telegramVerification.update({
      where: { id: verification.id },
      data: {
        storiesMonitored: { increment: 1 },
        lastStoryCheck: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Сторис обработана',
      results
    });
  } catch (error) {
    console.error('Error processing Telegram story:', error);
    return NextResponse.json(
      { error: 'Ошибка обработки сторис' },
      { status: 500 }
    );
  }
}

// Обработка сторис для конкретного заказа
async function processStoryForOrder(storyData: any, order: any, verification: any) {
  try {
    console.log(`🔍 Анализируем сторис для заказа ${order.id}`);

    // Заглушка для AI анализа сторис
    const aiResult = await analyzeStoryWithAI(storyData, order);

    if (aiResult.approved) {
      // Находим выполнение для обновления
      const execution = order.executions[0];
      
      if (execution) {
        // Обновляем выполнение
        await prisma.execution.update({
          where: { id: execution.id },
          data: {
            status: 'APPROVED',
            screenshotUrl: storyData.photo?.file_id || 'telegram_story',
            reviewedAt: new Date(),
            moderatorComment: 'Автоматически одобрено через Telegram мониторинг'
          }
        });

        // Обновляем статистику
        await prisma.telegramVerification.update({
          where: { id: verification.id },
          data: {
            storiesApproved: { increment: 1 }
          }
        });

        // Проверяем, завершен ли заказ
        const completedExecutions = await prisma.execution.count({
          where: {
            orderId: order.id,
            status: 'APPROVED'
          }
        });

        if (completedExecutions >= order.quantity) {
          await prisma.order.update({
            where: { id: order.id },
            data: { 
              status: 'COMPLETED',
              completedCount: order.quantity
            }
          });
        }

        console.log(`✅ Сторис одобрена для заказа ${order.id}`);
      }
    } else {
      console.log(`❌ Сторис отклонена для заказа ${order.id}: ${aiResult.message}`);
    }

    return {
      orderId: order.id,
      approved: aiResult.approved,
      message: aiResult.message,
      details: aiResult.details
    };
  } catch (error) {
    console.error('Error processing story for order:', error);
    return {
      orderId: order.id,
      approved: false,
      message: 'Ошибка обработки сторис',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Заглушка для AI анализа сторис
async function analyzeStoryWithAI(storyData: any, order: any) {
  // В реальности здесь будет AI анализ изображения
  // Пока возвращаем заглушку с высокой вероятностью одобрения
  
  const confidence = Math.random() * 0.2 + 0.8; // 80-100% уверенности
  
  return {
    approved: confidence > 0.85,
    confidence: confidence,
    details: {
      qrCodeDetected: Math.random() > 0.1,
      platformMatch: Math.random() > 0.05,
      qualityScore: Math.random() * 0.1 + 0.9,
      contentMatch: Math.random() > 0.1
    },
    message: confidence > 0.85 
      ? 'Сторис автоматически одобрена! ✅' 
      : 'Сторис не прошла автоматическую проверку ❌'
  };
}
