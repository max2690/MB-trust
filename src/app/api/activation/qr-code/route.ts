import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import QRCode from 'qrcode';

// POST /api/activation/qr-code - Генерация QR-кода для активации
export async function POST(request: NextRequest) {
  try {
    const { userId, platform = 'instagram' } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'ID пользователя обязателен' },
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

    // Проверяем, не активирован ли уже пользователь
    if (user.isActivated) {
      return NextResponse.json(
        { error: 'Пользователь уже активирован' },
        { status: 400 }
      );
    }

    // Проверяем существующую активацию
    const existingActivation = await prisma.activationStory.findFirst({
      where: { userId }
    });

    let activationStory;
    if (existingActivation) {
      activationStory = await prisma.activationStory.update({
        where: { id: existingActivation.id },
        data: {
          platform,
          qrCodeId: `qr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          status: 'PENDING'
        }
      });
    } else {
      activationStory = await prisma.activationStory.create({
        data: {
          userId,
          platform,
          qrCodeId: `qr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          status: 'PENDING'
        }
      });
    }

    // Генерируем QR-код
    const qrCodeData = {
      url: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/join`,
      userId: user.id,
      activationId: activationStory.id,
      platform: 'mb-trust',
      message: 'Присоединяйся к MB-TRUST!'
    };

    const qrCodeImage = await QRCode.toDataURL(JSON.stringify(qrCodeData), {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });

    return NextResponse.json({
      success: true,
      qrCode: qrCodeImage,
      qrCodeId: activationStory.qrCodeId,
      activationId: activationStory.id,
      message: 'QR-код для активации сгенерирован'
    });
  } catch (error) {
    console.error('Error generating activation QR code:', error);
    return NextResponse.json(
      { error: 'Ошибка генерации QR-кода' },
      { status: 500 }
    );
  }
}

// GET /api/activation/qr-code - Получить QR-код для активации
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

    const activationStory = await prisma.activationStory.findFirst({
      where: {
        userId,
        status: 'PENDING'
      },
      orderBy: { createdAt: 'desc' }
    });

    if (!activationStory) {
      return NextResponse.json(
        { error: 'Задание активации не найдено' },
        { status: 404 }
      );
    }

    // Генерируем QR-код
    const qrCodeData = {
      url: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/join`,
      userId,
      activationId: activationStory.id,
      platform: 'mb-trust',
      message: 'Присоединяйся к MB-TRUST!'
    };

    const qrCodeImage = await QRCode.toDataURL(JSON.stringify(qrCodeData), {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });

    return NextResponse.json({
      success: true,
      qrCode: qrCodeImage,
      qrCodeId: activationStory.qrCodeId,
      activationId: activationStory.id
    });
  } catch (error) {
    console.error('Error getting activation QR code:', error);
    return NextResponse.json(
      { error: 'Ошибка получения QR-кода' },
      { status: 500 }
    );
  }
}
