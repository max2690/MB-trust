import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || '30d' // 7d, 30d, 90d, 1y

    // Вычисляем дату начала периода
    const now = new Date()
    let startDate: Date

    switch (period) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
        break
      case '1y':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
        break
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    }

    // Общая статистика
    const [
      totalUsers,
      totalOrders,
      totalExecutions,
      totalRevenue,
      totalClicks,
      activeExecutors,
      completedOrders
    ] = await Promise.all([
      prisma.user.count({
        where: { createdAt: { gte: startDate } }
      }),
      prisma.order.count({
        where: { createdAt: { gte: startDate } }
      }),
      prisma.execution.count({
        where: { createdAt: { gte: startDate } }
      }),
      prisma.payment.aggregate({
        where: {
          createdAt: { gte: startDate },
          status: 'COMPLETED',
          type: 'DEPOSIT'
        },
        _sum: { amount: true }
      }),
      prisma.clickLog.count({
        where: { timestamp: { gte: startDate } }
      }),
      prisma.user.count({
        where: {
          role: 'EXECUTOR',
          executions: {
            some: {
              createdAt: { gte: startDate }
            }
          }
        }
      }),
      prisma.order.count({
        where: {
          createdAt: { gte: startDate },
          status: 'COMPLETED'
        }
      })
    ])

    // Статистика по уровням исполнителей
    const executorLevels = await prisma.user.groupBy({
      by: ['level'],
      where: {
        role: 'EXECUTOR',
        createdAt: { gte: startDate }
      },
      _count: { level: true }
    })

    // Статистика по социальным сетям
    const socialNetworks = await prisma.order.groupBy({
      by: ['socialNetwork'],
      where: {
        createdAt: { gte: startDate }
      },
      _count: { socialNetwork: true },
      _sum: { budget: true }
    })

    // Ежедневная статистика за последние 30 дней
    const dailyStats = await prisma.$queryRaw`
      SELECT 
        DATE(createdAt) as date,
        COUNT(*) as orders,
        SUM(budget) as revenue
      FROM Order 
      WHERE createdAt >= ${startDate}
      GROUP BY DATE(createdAt)
      ORDER BY date DESC
      LIMIT 30
    `

    return NextResponse.json({
      success: true,
      analytics: {
        overview: {
          totalUsers,
          totalOrders,
          totalExecutions,
          totalRevenue: totalRevenue._sum.amount || 0,
          totalClicks,
          activeExecutors,
          completedOrders,
          completionRate: totalOrders > 0 ? (completedOrders / totalOrders) * 100 : 0
        },
        executorLevels,
        socialNetworks,
        dailyStats
      }
    })
  } catch (error) {
    console.error('Error fetching analytics:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch analytics' },
      { status: 500 }
    )
  }
}
