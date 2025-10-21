export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest, { params }: { params: Promise<{ qrCodeId: string }> }) {
  try {
    const { qrCodeId } = await params
    const { searchParams } = new URL(request.url)
    const redirectUrl = searchParams.get('url') || 'https://mb-trust.app'

    // Находим заказ по QR-коду
    const order = await prisma.order.findUnique({
      where: { qrCode: qrCodeId },
      include: {
        executions: {
          where: { status: 'COMPLETED' },
          include: {
            executor: {
              select: { name: true, level: true }
            }
          }
        }
      }
    })

    if (!order) {
      return NextResponse.redirect(redirectUrl)
    }

    // Проверяем, не истек ли QR-код
    if (order.qrCodeExpiry < new Date()) {
      return NextResponse.redirect(redirectUrl)
    }

    // Логируем клик (заглушка - можно добавить отдельную таблицу для аналитики)
    console.log(`QR Code clicked: ${qrCodeId}, Order: ${order.id}, IP: ${request.headers.get('x-forwarded-for') || 'unknown'}`)

    // Перенаправляем на целевую ссылку
    return NextResponse.redirect(redirectUrl)
  } catch (error) {
    console.error('Error tracking click:', error)
    return NextResponse.redirect('https://mb-trust.app')
  }
}
