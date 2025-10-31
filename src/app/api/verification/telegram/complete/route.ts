import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      code,
      telegramId,
      telegramUsername,
      name,
      city,
      preferredMessenger,
      followersApprox,
      dailyTasksOptIn,
      checkOnly // Флаг только для проверки кода без завершения
    } = body

    if (!code) {
      return NextResponse.json({ error: 'code required' }, { status: 400 })
    }

    // Проверяем код в базе данных
    const user = await prisma.user.findFirst({ where: { verificationCode: code } })
    
    // Если только проверка кода
    if (checkOnly) {
      if (!user) {
        return NextResponse.json({ valid: false, error: 'Invalid code' }, { status: 200 })
      }
      return NextResponse.json({ valid: true, userId: user.id })
    }

    // Полное завершение верификации требует telegramId
    if (!telegramId) {
      return NextResponse.json({ error: 'telegramId required' }, { status: 400 })
    }

    if (!user) {
      return NextResponse.json({ error: 'Invalid code' }, { status: 400 })
    }

    // Завершаем верификацию - обновляем данные пользователя
    await prisma.user.update({
      where: { id: user.id },
      data: {
        telegramId: String(telegramId),
        telegramUsername: telegramUsername || null,
        name: name || user.name,
        city: city || user.city,
        preferredMessenger: preferredMessenger || null,
        followersApprox: typeof followersApprox === 'number' ? followersApprox : null,
        dailyTasksOptIn: !!dailyTasksOptIn,
        isVerified: true,
        verificationCode: null
      }
    })

    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('telegram/complete error', e)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}







