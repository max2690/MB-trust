import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';
import QRCode from 'qrcode';
import { nanoid } from 'nanoid';
import fs from 'fs';
import path from 'path';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { imageUrl, qrText, overlay = true } = body;
    
    if (!imageUrl || !qrText) {
      return NextResponse.json({ error: 'Не все поля заполнены' }, { status: 400 });
    }

    // Создаем папку для изображений если её нет
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // 1. Загружаем изображение по URL
    let imageBuffer;
    try {
      const imageResponse = await fetch(imageUrl);
      imageBuffer = Buffer.from(await imageResponse.arrayBuffer());
    } catch (error) {
      return NextResponse.json({ error: 'Не удалось загрузить изображение' }, { status: 400 });
    }
    
    // 2. Генерируем уникальный ID для заказа
    const orderId = nanoid();
    
    // 3. Генерируем QR код
    const qrCodeDataURL = await QRCode.toDataURL(qrText, {
      width: 200,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });
    
    // 4. Конвертируем QR код в буфер
    const qrCodeBuffer = Buffer.from(qrCodeDataURL.split(',')[1], 'base64');
    
    // 5. Обрабатываем основное изображение
    let processedImageUrl = imageUrl;
    if (overlay) {
      const processedImage = await sharp(imageBuffer)
        .resize(800, 600, { fit: 'cover' })
        .composite([
          {
            input: qrCodeBuffer,
            top: 20,
            left: 20,
            blend: 'over'
          }
        ])
        .png()
        .toBuffer();
      
      // 6. Сохраняем файлы
      const processedImageName = `${orderId}-processed.png`;
      const qrCodeName = `${orderId}-qrcode.png`;
      
      const processedImagePath = path.join(uploadsDir, processedImageName);
      const qrCodePath = path.join(uploadsDir, qrCodeName);
      
      fs.writeFileSync(processedImagePath, processedImage);
      fs.writeFileSync(qrCodePath, qrCodeBuffer);
      
      processedImageUrl = `/uploads/${processedImageName}`;
    }
    
    const qrCodeUrl = `/uploads/${orderId}-qrcode.png`;
    
    return NextResponse.json({
      orderId,
      processedImageUrl,
      qrCodeUrl,
      success: true
    });
    
  } catch (error) {
    console.error('Ошибка обработки изображения:', error);
    return NextResponse.json({ error: 'Ошибка обработки' }, { status: 500 });
  }
}

