import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, amount, type, description } = body

    // Проверяем пользователя
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    // Создаем платеж
    const payment = await prisma.payment.create({
      data: {
        userId,
        amount,
        type,
        status: 'PENDING'
      }
    })

    return NextResponse.json({
      success: true,
      payment
    })
  } catch (error) {
    console.error('Error creating payment:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create payment' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const status = searchParams.get('status')

    const where: any = {}
    if (userId) where.userId = userId
    if (status) where.status = status

    const payments = await prisma.payment.findMany({
      where,
      include: {
        user: {
          select: { name: true, phone: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ success: true, payments })
  } catch (error) {
    console.error('Error fetching payments:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch payments' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { paymentId, status, transactionId } = body

    const payment = await prisma.payment.update({
      where: { id: paymentId },
      data: {
        status,
        transactionId,
        processedAt: new Date()
      }
    })

    // Если платеж успешен, обновляем баланс
    if (status === 'COMPLETED' && payment.type === 'DEPOSIT') {
      await prisma.user.update({
        where: { id: payment.userId },
        data: {
          balance: {
            increment: payment.amount
          }
        }
      })
    }

    return NextResponse.json({
      success: true,
      payment
    })
  } catch (error) {
    console.error('Error updating payment:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update payment' },
      { status: 500 }
    )
  }
}
