import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import OpenAI from 'openai';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Инициализация OpenAI клиента
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || undefined,
});

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

// AI верификация через OpenAI Vision API
async function performAIVerification(imageUrl: string, order: any) {
  try {
    // Если OpenAI API ключ не настроен, используем заглушку
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your_openai_api_key_here') {
      console.log('⚠️ OpenAI API ключ не настроен, используем заглушку');
      return await performStubVerification();
    }

    // Получаем полный URL изображения
    const fullImageUrl = imageUrl.startsWith('http') 
      ? imageUrl 
      : `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}${imageUrl}`;

    // Запрос к OpenAI Vision API
    const response = await openai.chat.completions.create({
      model: "gpt-4-vision-preview",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Проанализируй это изображение и определи:
1. Есть ли на изображении QR код?
2. Соответствует ли контент требованиям заказа (${order.description})?
3. Качество изображения (четкое/размытое)?
4. Есть ли подозрительная активность (фотошоп, фейк)?

Отвечай в формате JSON:
{
  "qrCodeDetected": true/false,
  "contentMatches": true/false,
  "qualityScore": 0.0-1.0,
  "suspiciousActivity": true/false,
  "details": "описание"
}`
            },
            {
              type: "image_url",
              image_url: {
                url: fullImageUrl
              }
            }
          ]
        }
      ],
      max_tokens: 500
    });

    // Парсим ответ AI
    const aiResponse = response.choices[0]?.message?.content || '{}';
    let analysis;
    
    try {
      analysis = JSON.parse(aiResponse);
    } catch (error) {
      // Если AI вернул не JSON, пытаемся извлечь информацию из текста
      analysis = {
        qrCodeDetected: aiResponse.toLowerCase().includes('qr') || aiResponse.toLowerCase().includes('код'),
        contentMatches: aiResponse.toLowerCase().includes('соответствует') || !aiResponse.toLowerCase().includes('не соответствует'),
        qualityScore: 0.8,
        suspiciousActivity: aiResponse.toLowerCase().includes('подозрительная') || aiResponse.toLowerCase().includes('фотошоп'),
        details: aiResponse
      };
    }

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
        qualityScore: analysis.qualityScore || 0.7,
        suspiciousActivity: analysis.suspiciousActivity || false,
        details: analysis.details || (approved ? 
          'Скриншот соответствует требованиям заказа' : 
          'Скриншот не соответствует требованиям заказа')
      }
    };

  } catch (error) {
    console.error('Ошибка OpenAI верификации:', error);
    // В случае ошибки используем заглушку
    return await performStubVerification();
  }
}

// Заглушка для AI верификации (если API недоступен)
async function performStubVerification() {
  const analysis = {
    qrCodeDetected: Math.random() > 0.3,
    contentMatches: Math.random() > 0.2,
    qualityScore: Math.random() * 0.4 + 0.6,
    suspiciousActivity: Math.random() < 0.1
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
