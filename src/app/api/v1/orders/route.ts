import { NextRequest, NextResponse } from 'next/server';
import { validateApiKey, checkPermission, ApiRequest } from '@/lib/api-middleware';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// GET /api/v1/orders - Получить заказы
export async function GET(request: NextRequest) {
  try {
    // Проверяем API ключ
    const validationError = await validateApiKey(request);
    if (validationError) return validationError;
    
    // Проверяем права
    if (!checkPermission(request as ApiRequest, 'orders:read')) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }
    
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const socialNetwork = searchParams.get('platform');
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');
    
    const where: any = {};
    if (status) where.status = status;
    if (socialNetwork) where.socialNetwork = socialNetwork;
    
    // Логика получения заказов
    const orders = await prisma.order.findMany({
      where,
      take: Math.min(limit, 100), // Максимум 100
      skip: offset,
      orderBy: { createdAt: 'desc' },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            city: true,
            region: true
          }
        }
      }
    });
    
    const total = await prisma.order.count({ where });
    
    return NextResponse.json({
      success: true,
      data: orders,
      total,
      limit,
      offset
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/v1/orders - Создать заказ
export async function POST(request: NextRequest) {
  try {
    const validationError = await validateApiKey(request);
    if (validationError) return validationError;
    
    if (!checkPermission(request as ApiRequest, 'orders:write')) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }
    
    const body = await request.json();
    const {
      customerId,
      title,
      description,
      socialNetwork,
      targetAudience,
      deadline,
      reward,
      qrCodeUrl,
      targetCountry,
      targetRegion,
      targetCity
    } = body;
    
    // Валидация
    if (!customerId || !title || !socialNetwork || !targetAudience || !deadline || !reward) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Создаем заказ
    const order = await prisma.order.create({
      data: {
        customerId,
        title,
        description: description || '',
        socialNetwork,
        targetAudience,
        deadline: new Date(deadline),
        reward: parseFloat(reward),
        qrCodeUrl: qrCodeUrl || '',
        status: 'ACTIVE',
        targetCountry: targetCountry || 'Россия',
        targetRegion: targetRegion || null,
        targetCity: targetCity || null
      }
    });
    
    return NextResponse.json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

