import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Основная статистика
    const totalUsers = await prisma.user.count();
    const totalOrders = await prisma.order.count();
    const totalExecutions = await prisma.execution.count();
    const completedOrders = await prisma.order.count({
      where: { status: 'COMPLETED' }
    });

    // Пользователи по ролям
    const usersByRole = await prisma.user.groupBy({
      by: ['role'],
      _count: { role: true }
    });

    // Пользователи по уровням
    const usersByLevel = await prisma.user.groupBy({
      by: ['level'],
      _count: { level: true }
    });

    // Заказы по платформам
    const ordersByPlatform = await prisma.order.groupBy({
      by: ['socialNetwork'],
      _count: { socialNetwork: true }
    });

    // Пользователи по регионам
    const usersByRegion = await prisma.user.groupBy({
      by: ['region'],
      _count: { region: true }
    });

    // Топ исполнители
    const topExecutors = await prisma.user.findMany({
      where: { role: 'EXECUTOR' },
      include: {
        executions: {
          where: { status: 'COMPLETED' }
        }
      },
      take: 5,
      orderBy: { balance: 'desc' }
    });

    // Топ заказчики
    const topCustomers = await prisma.user.findMany({
      where: { role: 'CUSTOMER' },
      include: {
        orders: true
      },
      take: 5,
      orderBy: { balance: 'desc' }
    });

    // Динамика (последние 7 дней)
    const dynamics = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayUsers = await prisma.user.count({
        where: {
          createdAt: {
            gte: new Date(dateStr + 'T00:00:00.000Z'),
            lt: new Date(dateStr + 'T23:59:59.999Z')
          }
        }
      });

      const dayOrders = await prisma.order.count({
        where: {
          createdAt: {
            gte: new Date(dateStr + 'T00:00:00.000Z'),
            lt: new Date(dateStr + 'T23:59:59.999Z')
          }
        }
      });

      dynamics.push({
        date: dateStr,
        users: dayUsers,
        orders: dayOrders,
        revenue: dayOrders * 100 // Примерная выручка
      });
    }

    return NextResponse.json({
      overview: {
        totalUsers,
        totalOrders,
        totalExecutions,
        totalRevenue: totalExecutions * 50, // Примерная выручка
        activeUsers: totalUsers,
        completedOrders,
        completionRate: totalOrders > 0 ? ((completedOrders / totalOrders) * 100).toFixed(1) : '0'
      },
      breakdown: {
        usersByRole: usersByRole.map(item => ({
          role: item.role,
          count: item._count.role
        })),
        usersByLevel: usersByLevel.map(item => ({
          level: item.level,
          count: item._count.level
        })),
        ordersByPlatform: ordersByPlatform.map(item => ({
          platform: item.socialNetwork,
          count: item._count.socialNetwork
        })),
        usersByRegion: usersByRegion.map(item => ({
          region: item.region,
          count: item._count.region
        }))
      },
      dynamics,
      topUsers: {
        executors: topExecutors.map(executor => ({
          name: executor.name,
          earnings: executor.balance,
          executions: executor.executions.length
        })),
        customers: topCustomers.map(customer => ({
          name: customer.name,
          spent: customer.balance,
          orders: customer.orders.length
        }))
      },
      success: true
    });

  } catch (error) {
    console.error('Ошибка получения статистики:', error);
    return NextResponse.json({ error: 'Ошибка получения статистики' }, { status: 500 });
  }
}
