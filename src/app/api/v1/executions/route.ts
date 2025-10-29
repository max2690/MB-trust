import { NextRequest, NextResponse } from 'next/server';
import { validateApiKey, checkPermission, ApiRequest } from '@/lib/api-middleware';
import { prisma } from '@/lib/prisma';
import { nanoid } from 'nanoid';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// GET /api/v1/executions - Получить выполнения
export async function GET(request: NextRequest) {
  try {
    const validationError = await validateApiKey(request);
    if (validationError) return validationError;
    
    if (!checkPermission(request as ApiRequest, 'executions:read')) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }
    
    const { searchParams } = new URL(request.url);
    const executorId = searchParams.get('executorId');
    const orderId = searchParams.get('orderId');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');
    
    const where: any = {};
    if (executorId) where.executorId = executorId;
    if (orderId) where.orderId = orderId;
    if (status) where.status = status;
    
    const executions = await prisma.execution.findMany({
      where,
      take: Math.min(limit, 100),
      skip: offset,
      orderBy: { createdAt: 'desc' },
      include: {
        order: {
          select: {
            id: true,
            title: true,
            socialNetwork: true
          }
        },
        executor: {
          select: {
            id: true,
            name: true,
            level: true
          }
        }
      }
    });
    
    const total = await prisma.execution.count({ where });
    
    return NextResponse.json({
      success: true,
      data: executions,
      total,
      limit,
      offset
    });
  } catch (error) {
    console.error('Error fetching executions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/v1/executions - Принять заказ (взять задание)
export async function POST(request: NextRequest) {
  try {
    const validationError = await validateApiKey(request);
    if (validationError) return validationError;
    
    if (!checkPermission(request as ApiRequest, 'executions:write')) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }
    
    const body = await request.json();
    const { orderId, executorId, screenshotUrl, notes } = body;
    
    if (!orderId || !executorId) {
      return NextResponse.json(
        { error: 'Missing orderId or executorId' },
        { status: 400 }
      );
    }
    
    // Проверяем, что заказ существует и активен
    const order = await prisma.order.findUnique({
      where: { id: orderId }
    });
    
    if (!order || order.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'Order not found or not active' },
        { status: 404 }
      );
    }
    
    // Проверяем исполнителя
    const executor = await prisma.user.findUnique({
      where: { id: executorId }
    });
    
    if (!executor || executor.role !== 'EXECUTOR') {
      return NextResponse.json(
        { error: 'Executor not found' },
        { status: 404 }
      );
    }
    
    // Проверяем лимиты
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const dailyLimit = await prisma.executorDailyLimit.findUnique({
      where: {
        executorId_date: {
          executorId,
          date: today
        }
      }
    });
    
    const levelLimits: Record<string, number> = {
      NOVICE: 5,
      VERIFIED: 10,
      REFERRAL: 15,
      TOP: 20
    };
    
    const currentExecutions = dailyLimit?.executionsCount || 0;
    const maxExecutions = levelLimits[executor.level || 'NOVICE'] || 5;
    
    if (currentExecutions >= maxExecutions) {
      return NextResponse.json({ 
        error: `Daily limit reached (${maxExecutions} orders for ${executor.level} level)` 
      }, { status: 400 });
    }
    
    // Создаем выполнение
    const execution = await prisma.execution.create({
      data: {
        id: nanoid(),
        orderId,
        executorId,
        screenshotUrl: screenshotUrl || '',
        notes: notes || '',
        status: 'PENDING',
        reward: order.reward
      }
    });
    
    // Обновляем статус заказа
    await prisma.order.update({
      where: { id: orderId },
      data: { status: 'IN_PROGRESS' }
    });
    
    // Обновляем дневные лимиты
    await prisma.executorDailyLimit.upsert({
      where: {
        executorId_date: {
          executorId,
          date: today
        }
      },
      update: {
        executionsCount: currentExecutions + 1
      },
      create: {
        executorId,
        date: today,
        executionsCount: 1
      }
    });
    
    return NextResponse.json({
      success: true,
      data: execution
    });
  } catch (error) {
    console.error('Error creating execution:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

