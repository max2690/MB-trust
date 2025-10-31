import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { nanoid } from 'nanoid';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const orderId = formData.get('orderId') as string;
    const executorId = formData.get('executorId') as string;

    if (!file || !orderId || !executorId) {
      return NextResponse.json({ error: 'Не все поля заполнены' }, { status: 400 });
    }

    // Проверяем тип файла
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Файл должен быть изображением' }, { status: 400 });
    }

    // Проверяем размер файла (максимум 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'Файл слишком большой (максимум 10MB)' }, { status: 400 });
    }

    // Конвертируем файл в base64
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString('base64');
    const dataUrl = `data:${file.type};base64,${base64}`;

    // Создаем выполнение с скриншотом
    const execution = await prisma.execution.create({
      data: {
        id: nanoid(),
        orderId,
        executorId,
        screenshotUrl: dataUrl,
        status: 'PENDING',
        reward: 0, // Будет обновлено после проверки
        isTestExecution: false
      }
    });

    return NextResponse.json({
      success: true,
      execution: {
        id: execution.id,
        screenshotUrl: execution.screenshotUrl,
        status: execution.status
      },
      message: 'Скриншот загружен успешно'
    });

  } catch (error) {
    console.error('Ошибка загрузки скриншота:', error);
    return NextResponse.json({ error: 'Ошибка загрузки скриншота' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('orderId');
    const executorId = searchParams.get('executorId');

    if (!orderId && !executorId) {
      return NextResponse.json({ error: 'Необходимо указать orderId или executorId' }, { status: 400 });
    }

    const where: { orderId?: string; executorId?: string } = {};
    if (orderId) where.orderId = orderId;
    if (executorId) where.executorId = executorId;

    const executions = await prisma.execution.findMany({
      where,
      include: {
        order: {
          select: {
            id: true,
            title: true,
            status: true
          }
        },
        executor: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({
      success: true,
      executions
    });

  } catch (error) {
    console.error('Ошибка получения скриншотов:', error);
    return NextResponse.json({ error: 'Ошибка получения скриншотов' }, { status: 500 });
  }
}
