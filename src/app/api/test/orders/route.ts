import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { SocialNetwork, OrderStatus } from '@prisma/client';

// POST /api/test/orders - Создание тестового заказа
export async function POST(request: NextRequest) {
  try {
    const { 
      platform, 
      quantity, 
      pricePerStory, 
      description,
      title = 'Тестовый заказ'
    } = await request.json();

    if (!platform || !quantity || !pricePerStory) {
      return NextResponse.json(
        { error: 'Платформа, количество и цена обязательны' },
        { status: 400 }
      );
    }

    // Создаем тестовый заказ БЕЗ списания денег
    const testOrder = await prisma.order.create({
      data: {
        title,
        description: description || 'Тестовое описание заказа',
        socialNetwork: (platform.toUpperCase() as keyof typeof SocialNetwork) as SocialNetwork,
        quantity: parseInt(quantity),
        pricePerStory: parseFloat(pricePerStory),
        totalReward: parseFloat(pricePerStory) * parseInt(quantity),
        platformCommission: parseFloat(pricePerStory) * parseInt(quantity) * 0.1, // 10% комиссия для теста
        executorEarnings: parseFloat(pricePerStory) * parseInt(quantity) * 0.9,
        platformEarnings: parseFloat(pricePerStory) * parseInt(quantity) * 0.1,
        budget: parseFloat(pricePerStory) * parseInt(quantity), // Старое поле для совместимости
        reward: parseFloat(pricePerStory), // Старое поле для совместимости
        region: 'Тестовый регион',
        qrCode: `test_qr_${Date.now()}`,
        qrCodeExpiry: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 дней
        deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 дня
        status: OrderStatus.PENDING,
        isTestOrder: true,
        testMode: true,
        customerId: 'test-customer'
      }
    });

    return NextResponse.json({
      success: true,
      order: testOrder,
      message: 'Тестовый заказ создан (деньги не списаны)'
    });
  } catch (error) {
    console.error('Error creating test order:', error);
    return NextResponse.json(
      { error: 'Ошибка создания тестового заказа' },
      { status: 500 }
    );
  }
}

// GET /api/test/orders - Получить список тестовых заказов
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const where: { isTestOrder: boolean; status?: OrderStatus } = {
      isTestOrder: true
    };
    if (status) where.status = status as OrderStatus;

    const orders = await prisma.order.findMany({
      where,
      include: {
        executions: {
          include: {
            executor: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({
      success: true,
      orders
    });
  } catch (error) {
    console.error('Error fetching test orders:', error);
    return NextResponse.json(
      { error: 'Ошибка получения тестовых заказов' },
      { status: 500 }
    );
  }
}
