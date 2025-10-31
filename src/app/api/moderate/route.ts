import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { executionId, status, moderatorId, comment } = body

    // Проверяем, что выполнение существует
    const execution = await prisma.execution.findUnique({
      where: { id: executionId },
      include: {
        order: true,
        executor: true
      }
    })

    if (!execution) {
      return NextResponse.json(
        { success: false, error: 'Execution not found' },
        { status: 404 }
      )
    }

    // Обновляем статус выполнения
    const updatedExecution = await prisma.execution.update({
      where: { id: executionId },
      data: {
        status,
        moderatorId,
        moderatorComment: comment,
        reviewedAt: new Date()
      }
    })

    // Если одобрено, создаем платеж
    if (status === 'COMPLETED') {
      const commissionRate = {
        NOVICE: 0.4,
        VERIFIED: 0.5,
        REFERRAL: 0.6,
        TOP: 0.8
      }

      const executorRate = commissionRate[execution.executor.level] || 0.4
      const executorAmount = execution.order.reward * executorRate
      const platformAmount = execution.order.reward * 0.2

      await prisma.payment.create({
        data: {
          userId: execution.executorId,
          executorId: execution.executorId,
          orderId: execution.orderId,
          amount: executorAmount,
          type: 'EXECUTOR_PAYMENT',
          status: 'PENDING',
          description: `Payment for order: ${execution.order.title}`
        }
      })

      // Обновляем баланс исполнителя
      await prisma.user.update({
        where: { id: execution.executorId },
        data: {
          balance: {
            increment: executorAmount
          }
        }
      })

      // Обновляем статистику заказа
      await prisma.order.update({
        where: { id: execution.orderId },
        data: {
          completedExecutions: {
            increment: 1
          }
        }
      })
    }

    return NextResponse.json({
      success: true,
      execution: updatedExecution
    })
  } catch (error) {
    console.error('Error moderating execution:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to moderate execution' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || 'PENDING_REVIEW'

    const executions = await prisma.execution.findMany({
      where: { status: status as 'PENDING' | 'UPLOADED' | 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED' | 'COMPLETED' },
      include: {
        order: {
          select: { title: true, description: true, reward: true }
        },
        executor: {
          select: { name: true, level: true, isVerified: true }
        }
      },
      orderBy: { createdAt: 'asc' }
    })

    return NextResponse.json({ success: true, executions })
  } catch (error) {
    console.error('Error fetching executions for moderation:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch executions' },
      { status: 500 }
    )
  }
}
