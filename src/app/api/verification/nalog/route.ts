import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST /api/verification/nalog - Проверка статуса самозанятого
export async function POST(request: NextRequest) {
  try {
    const { innNumber, userId } = await request.json();

    if (!innNumber || !userId) {
      return NextResponse.json(
        { error: 'ИНН и ID пользователя обязательны' },
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

    // Проверяем статус самозанятого через nalog.ru
    const verificationResult = await verifySelfEmployedStatus(innNumber);

    if (verificationResult.verified) {
      // Обновляем статус пользователя
      await prisma.user.update({
        where: { id: userId },
        data: {
          isSelfEmployed: true,
          innNumber: innNumber,
          nalogVerificationStatus: 'VERIFIED',
          nalogVerifiedAt: new Date()
        }
      });

      return NextResponse.json({
        success: true,
        message: 'Статус самозанятого подтвержден',
        verified: true,
        details: verificationResult.details
      });
    } else {
      return NextResponse.json({
        success: false,
        message: verificationResult.message,
        verified: false
      }, { status: 400 });
    }
  } catch (error) {
    console.error('Error verifying self-employed status:', error);
    return NextResponse.json(
      { error: 'Ошибка верификации статуса самозанятого' },
      { status: 500 }
    );
  }
}

// Заглушка для проверки статуса самозанятого через nalog.ru
async function verifySelfEmployedStatus(innNumber: string) {
  // В реальности здесь будет интеграция с API nalog.ru
  // Пока возвращаем заглушку с высокой вероятностью успеха
  
  console.log(`🔍 Проверяем статус самозанятого для ИНН: ${innNumber}`);
  
  // Имитируем проверку
  const isValidINN = innNumber.length === 12 && /^\d+$/.test(innNumber);
  
  if (!isValidINN) {
    return {
      verified: false,
      status: 'INVALID_INN',
      message: 'Неверный формат ИНН'
    };
  }
  
  // Имитируем успешную проверку
  return {
    verified: true,
    status: 'VERIFIED',
    message: 'Статус самозанятого подтвержден',
    details: {
      inn: innNumber,
      status: 'ACTIVE',
      registrationDate: '2023-01-01',
      lastActivity: new Date().toISOString()
    }
  };
}