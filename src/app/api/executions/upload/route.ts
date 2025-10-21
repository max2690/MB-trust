import { NextRequest, NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
import fs from 'fs';
import path from 'path';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const screenshotFile = formData.get('screenshot') as File;
    const orderId = formData.get('orderId') as string;
    const executorId = formData.get('executorId') as string;
    
    if (!screenshotFile || !orderId || !executorId) {
      return NextResponse.json({ error: 'Файл, ID заказа или ID исполнителя не найдены' }, { status: 400 });
    }

    // Проверяем, что выполнение существует
    const execution = await prisma.execution.findFirst({
      where: {
        orderId,
        executorId
      }
    });

    if (!execution) {
      return NextResponse.json({ error: 'Выполнение не найдено' }, { status: 404 });
    }

    // Создаем папку для скриншотов если её нет
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'screenshots');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Генерируем уникальное имя файла
    const fileExtension = screenshotFile.name.split('.').pop() || 'png';
    const fileName = `${execution.id}-${nanoid()}.${fileExtension}`;
    const filePath = path.join(uploadsDir, fileName);

    // Сохраняем файл
    const buffer = Buffer.from(await screenshotFile.arrayBuffer());
    fs.writeFileSync(filePath, buffer);

    const screenshotUrl = `/uploads/screenshots/${fileName}`;

    // Обновляем выполнение с URL скриншота
    await prisma.execution.update({
      where: { id: execution.id },
      data: {
        screenshotUrl,
        status: 'UPLOADED'
      }
    });

    return NextResponse.json({
      screenshotUrl,
      executionId: execution.id,
      success: true
    });
    
  } catch (error) {
    console.error('Ошибка загрузки скриншота:', error);
    return NextResponse.json({ error: 'Ошибка загрузки скриншота' }, { status: 500 });
  }
}
