import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { nanoid } from 'nanoid';
import QRCode from 'qrcode';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      title, 
      description, 
      targetAudience, 
      reward, 
      processedImageUrl, 
      qrCodeUrl,
      customerId,
      quantity = 1,
      socialNetwork = 'INSTAGRAM',
      deadline,
      // NEW: Расширенные настройки
      campaignType = 'SINGLE',
      totalQuantity = 1,
      platforms = [],
      dailyDistribution = {},
      autoDistribution = true,
      refundOnFailure = true,
      refundDeadline,
      // Геолокация
      targetCountry,
      targetRegion,
      targetCity
    } = body;

    // Валидация
    if (!title || !description || !reward) {
      return NextResponse.json({ error: 'Не все поля заполнены' }, { status: 400 });
    }

    // Генерируем изображения если не предоставлены
    const finalProcessedImageUrl = processedImageUrl || `https://via.placeholder.com/400x400/3B82F6/FFFFFF?text=${encodeURIComponent(title)}`;
    
    // Генерируем настоящий QR код
    const qrCodeData = {
      orderId: nanoid(),
      platform: socialNetwork,
      url: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/track/${nanoid()}`,
      timestamp: new Date().toISOString()
    };
    
    const qrCodeImage = await QRCode.toDataURL(JSON.stringify(qrCodeData), {
      width: 200,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });
    
    const finalQrCodeUrl = qrCodeUrl || qrCodeImage;

        const parsedReward = parseFloat(reward);
        const rewardPerExecution = parsedReward / quantity; // Равномерное распределение
    const deadlineDate = deadline ? new Date(deadline) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    // Создаем заказы (один или несколько для массовых заказов)
    const orders = [];
    
    for (let i = 0; i < quantity; i++) {
      const orderId = nanoid();
      const qrCodeId = `${orderId}-${i}`;
      
      // Генерируем уникальный QR код для каждого заказа
      const uniqueQrCodeData = {
        orderId: orderId,
        platform: socialNetwork,
        url: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/track/${qrCodeId}`,
        timestamp: new Date().toISOString(),
        orderNumber: i + 1,
        totalOrders: quantity
      };
      
      const uniqueQrCodeImage = await QRCode.toDataURL(JSON.stringify(uniqueQrCodeData), {
        width: 200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      
      const order = await prisma.order.create({
        data: {
          id: orderId,
          title: quantity > 1 ? `${title} (${i + 1}/${quantity})` : title,
          description,
          targetAudience: targetAudience || '',
          pricePerStory: rewardPerExecution,
          platformCommission: parsedReward * 0.1, // 10% комиссия платформы
          executorEarnings: parsedReward * 0.9,
          platformEarnings: parsedReward * 0.1,
          budget: parsedReward, // Старое поле для совместимости
          reward: rewardPerExecution, // Старое поле для совместимости
          customer: {
            connect: { id: customerId || 'temp-customer' }
          },
          region: targetRegion || targetCity || 'Россия',
          socialNetwork,
          targetCountry: targetCountry || 'Россия',
          targetRegion: targetRegion || null,
          targetCity: targetCity || null,
          qrCode: qrCodeId,
          qrCodeExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          processedImageUrl: finalProcessedImageUrl,
          qrCodeUrl: uniqueQrCodeImage,
          quantity: 1,
          maxExecutions: 1,
          completedCount: 0,
          deadline: deadlineDate,
          // NEW: Расширенные поля
          campaignType,
          totalQuantity: quantity > 1 ? quantity : totalQuantity,
          dailySchedule: quantity > 1 ? null : dailyDistribution,
          autoDistribution,
          refundOnFailure,
          refundDeadline: refundDeadline ? new Date(refundDeadline) : new Date(deadlineDate.getTime() + 72 * 60 * 60 * 1000),
          status: 'PENDING',
        }
      });

      orders.push(order);
    }

    return NextResponse.json({ 
      orders: quantity === 1 ? orders[0] : orders, 
      success: true,
      message: quantity > 1 ? `Создано ${quantity} заказов` : 'Заказ создан'
    });
    
  } catch (error) {
    console.error('Ошибка создания заказа:', error);
    return NextResponse.json({ error: 'Ошибка создания заказа' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');
    const userId = searchParams.get('userId');

    let orders;

    if (role === 'executor') {
      // Получаем информацию о пользователе
      const user = userId ? await prisma.user.findUnique({
        where: { id: userId },
        select: { city: true, region: true, country: true }
      }) : null;

      // Формируем условия для геофильтрации
      const geoFilters: any[] = [];
      
      if (user) {
        // Поиск заказов, где целевая геолокация включает пользователя
        const conditions: any[] = [
          // Вся страна
          { targetCountry: user.country, targetRegion: null, targetCity: null },
          // Регион пользователя
          { targetRegion: user.region, targetCity: null },
          // Конкретный город пользователя
          { targetCity: user.city }
        ];
        
        // Если у пользователя есть город, добавляем поиск по городу
        if (user.city) {
          conditions.push({ targetCity: user.city });
        }
        
        // Если у пользователя есть регион, добавляем поиск по региону
        if (user.region) {
          conditions.push({ targetRegion: user.region });
        }
        
        geoFilters.push({ OR: conditions });
      }

      // Заказы доступные для исполнителей с геофильтрацией
      orders = await prisma.order.findMany({
        where: {
          status: 'PENDING',
          ...(geoFilters.length > 0 ? { AND: geoFilters } : {})
        },
        include: {
          customer: {
            select: {
              name: true,
              level: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
    } else if (role === 'customer' && userId) {
      // Заказы конкретного заказчика
      orders = await prisma.order.findMany({
        where: {
          customerId: userId
        },
        include: {
          executions: {
            include: {
              executor: {
                select: {
                  name: true,
                  level: true
                }
              }
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
    } else {
      // Все заказы (для админа)
      orders = await prisma.order.findMany({
        include: {
          customer: {
            select: {
              name: true,
              level: true
            }
          },
          executions: {
            include: {
              executor: {
                select: {
                  name: true,
                  level: true
                }
              }
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
    }

    return NextResponse.json({ orders, success: true });
    
  } catch (error) {
    console.error('Ошибка получения заказов:', error);
    return NextResponse.json({ error: 'Ошибка получения заказов' }, { status: 500 });
  }
}