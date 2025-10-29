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
    let body;
    const contentType = request.headers.get('content-type');
    
    if (contentType?.includes('application/json')) {
      try {
        body = await request.json();
      } catch (error) {
        console.error('JSON parse error:', error);
        return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
      }
    } else if (contentType?.includes('multipart/form-data')) {
      const formData = await request.formData();
      const imageFile = formData.get('image') as File;
      
      if (imageFile) {
        // Сохраняем файл временно
        const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
        if (!fs.existsSync(uploadsDir)) {
          fs.mkdirSync(uploadsDir, { recursive: true });
        }
        
        const buffer = Buffer.from(await imageFile.arrayBuffer());
        const fileName = `temp-${Date.now()}.${imageFile.name.split('.').pop()}`;
        const filePath = path.join(uploadsDir, fileName);
        fs.writeFileSync(filePath, buffer);
        
        body = {
          imageUrl: `/uploads/${fileName}`,
          qrText: `order-${nanoid()}`,
          overlay: formData.get('overlay') !== 'false'
        };
      } else {
        body = {
          imageUrl: formData.get('imageUrl') as string,
          qrText: formData.get('qrText') as string,
          overlay: formData.get('overlay') === 'true'
        };
      }
    } else {
      // Попробуем как текст
      const text = await request.text();
      try {
        body = JSON.parse(text);
      } catch (error) {
        console.error('Text parse error:', error);
        return NextResponse.json({ error: 'Invalid request format' }, { status: 400 });
      }
    }
    
    const { imageUrl, qrText, overlay = true } = body;
    
    if (!imageUrl) {
      return NextResponse.json({ error: 'Не все поля заполнены' }, { status: 400 });
    }

    // Создаем папку для изображений если её нет
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // 1. Загружаем изображение по URL или читаем из файла
    let imageBuffer;
    try {
      if (imageUrl.startsWith('/uploads/')) {
        // Читаем локальный файл
        const localPath = path.join(process.cwd(), 'public', imageUrl);
        imageBuffer = fs.readFileSync(localPath);
      } else {
        // Загружаем по URL
        const imageResponse = await fetch(imageUrl);
        imageBuffer = Buffer.from(await imageResponse.arrayBuffer());
      }
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

