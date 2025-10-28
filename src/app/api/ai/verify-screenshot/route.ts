import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { screenshotId, orderId } = body;

    if (!screenshotId || !orderId) {
      return NextResponse.json({ error: 'Не все поля заполнены' }, { status: 400 });
    }

    // Получаем выполнение и заказ
    const execution = await prisma.execution.findFirst({
      where: { 
        id: screenshotId,
        orderId: orderId 
      },
      include: {
        order: true,
        executor: true
      }
    });

    if (!execution) {
      return NextResponse.json({ error: 'Выполнение не найдено' }, { status: 404 });
    }

    if (!execution.screenshotUrl) {
      return NextResponse.json({ error: 'Скриншот не загружен' }, { status: 400 });
    }

    // Заглушка для AI верификации
    const verificationResult = await performAIVerification(execution.screenshotUrl, execution.order);

    // Обновляем статус выполнения
    await prisma.execution.update({
      where: { id: execution.id },
      data: {
        status: verificationResult.approved ? 'APPROVED' : 'REJECTED',
        reviewedAt: new Date(),
        moderatorComment: JSON.stringify(verificationResult.analysis) || 'Проверено AI'
      }
    });

    // Если выполнение одобрено, обновляем счетчик
    if (verificationResult.approved) {
      // Обновляем счетчик выполненных заказов
      await prisma.order.update({
        where: { id: execution.orderId },
        data: {
          completedCount: {
            increment: 1
          }
        }
      });

      // Начисляем деньги исполнителю
      await prisma.user.update({
        where: { id: execution.executorId },
        data: {
          balance: {
            increment: execution.reward || 0
          }
        }
      });
    }

    return NextResponse.json({
      success: true,
      verification: verificationResult,
      message: verificationResult.approved ? 'Скриншот одобрен' : 'Скриншот отклонен'
    });

  } catch (error) {
    console.error('Ошибка AI верификации:', error);
    return NextResponse.json({ error: 'Ошибка AI верификации' }, { status: 500 });
  }
}

// Заглушка для AI верификации
async function performAIVerification(imageUrl: string, order: any) {
  // В реальном приложении здесь будет интеграция с OpenAI Vision API
  // или другой AI сервис для анализа изображений
  
  // Имитируем анализ
  const analysis = {
    qrCodeDetected: Math.random() > 0.3, // 70% шанс найти QR код
    contentMatches: Math.random() > 0.2, // 80% шанс соответствия контенту
    qualityScore: Math.random() * 0.4 + 0.6, // Оценка качества 0.6-1.0
    suspiciousActivity: Math.random() < 0.1 // 10% шанс подозрительной активности
  };

  const confidence = analysis.qrCodeDetected && analysis.contentMatches ? 
    analysis.qualityScore : 0.3;

  const approved = analysis.qrCodeDetected && 
                  analysis.contentMatches && 
                  !analysis.suspiciousActivity && 
                  confidence > 0.7;

  return {
    approved,
    confidence,
    analysis: {
      qrCodeDetected: analysis.qrCodeDetected,
      contentMatches: analysis.contentMatches,
      qualityScore: analysis.qualityScore,
      suspiciousActivity: analysis.suspiciousActivity,
      details: approved ? 
        'Скриншот соответствует требованиям заказа' : 
        'Скриншот не соответствует требованиям заказа'
    }
  };
}
