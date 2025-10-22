import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { nanoid } from 'nanoid';

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
      refundDeadline
    } = body;

    // Валидация
      if (!title || !description || !reward || !processedImageUrl || !qrCodeUrl) {
      return NextResponse.json({ error: 'Не все поля заполнены' }, { status: 400 });
    }

        const parsedReward = parseFloat(reward);
        const rewardPerExecution = parsedReward / quantity; // Равномерное распределение
    const deadlineDate = deadline ? new Date(deadline) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    // Создаем заказы (один или несколько для массовых заказов)
    const orders = [];
    
    for (let i = 0; i < quantity; i++) {
      const orderId = nanoid();
      const qrCodeId = `${orderId}-${i}`;
      
      const order = await prisma.order.create({
        data: {
          id: orderId,
          title: quantity > 1 ? `${title} (${i + 1}/${quantity})` : title,
          description,
          targetAudience: targetAudience || '',
            // reward is the amount per execution
            reward: rewardPerExecution,
            totalReward: parsedReward,
          region: 'Россия',
          socialNetwork,
          qrCode: qrCodeId,
          qrCodeExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          processedImageUrl,
          qrCodeUrl,
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
          customerId: customerId || 'temp-customer',
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
      // Заказы доступные для исполнителей
      orders = await prisma.order.findMany({
        where: {
          status: 'PENDING'
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