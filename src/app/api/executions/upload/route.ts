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
    // Поддерживаем оба названия для совместимости
    const screenshotFile = (formData.get('file') || formData.get('screenshot')) as File;
    const orderId = formData.get('orderId') as string;
    const executorId = formData.get('executorId') as string;
    
    if (!screenshotFile || !orderId || !executorId) {
      return NextResponse.json({ error: 'Файл, ID заказа или ID исполнителя не найдены' }, { status: 400 });
    }

    // Проверка типа файла
    if (!screenshotFile.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Файл должен быть изображением' }, { status: 400 });
    }

    // Проверка размера (макс 10MB)
    if (screenshotFile.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'Размер файла не должен превышать 10MB' }, { status: 400 });
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

    // Автоматическая AI проверка скриншота
    try {
      const verifyResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/ai/verify-screenshot`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          screenshotId: execution.id,
          orderId: orderId
        })
      });
      
      const verifyResult = await verifyResponse.json();
      
      if (verifyResult.success) {
        console.log(`✅ AI проверка завершена для выполнения ${execution.id}:`, verifyResult.verification.approved ? 'ОДОБРЕНО' : 'ОТКЛОНЕНО');
      }
    } catch (error) {
      console.error('⚠️ Ошибка автоматической AI проверки:', error);
      // Не падаем, если AI проверка не удалась - модератор проверит вручную
    }

    return NextResponse.json({
      screenshotUrl,
      executionId: execution.id,
      success: true,
      message: 'Скриншот загружен. Идет автоматическая проверка...'
    });
    
  } catch (error) {
    console.error('Ошибка загрузки скриншота:', error);
    return NextResponse.json({ error: 'Ошибка загрузки скриншота' }, { status: 500 });
  }
}
