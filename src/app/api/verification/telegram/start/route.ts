import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { randomBytes } from 'crypto'

export async function POST(req: NextRequest) {
  try {
    const { userId } = await req.json()
    if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 })

    // Проверяем тестовый режим: только Telegram
    if (process.env.AUTH_MODE && process.env.AUTH_MODE !== 'telegram-only') {
      return NextResponse.json({ error: 'Not allowed in current mode' }, { status: 403 })
    }

    const code = randomBytes(3).toString('hex')
    await prisma.user.update({ where: { id: userId }, data: { verificationCode: code } })

    // Получаем имя бота из переменной окружения или получаем через Telegram API
    let botUsername = process.env.TELEGRAM_BOT_USERNAME || process.env.BOT_USERNAME

    // Если username не указан, получаем через Telegram API
    if (!botUsername && process.env.BOT_TOKEN) {
      try {
        const response = await fetch(`https://api.telegram.org/bot${process.env.BOT_TOKEN}/getMe`)
        const data = await response.json()
        if (data.ok && data.result?.username) {
          botUsername = data.result.username
        }
      } catch (e) {
        console.error('Failed to get bot username:', e)
      }
    }

    const deepLink = `https://t.me/${botUsername || 'MBTRUST_bot'}?start=link_${code}`

    return NextResponse.json({
      success: true,
      code,
      deepLink
    })
  } catch (e) {
    console.error('telegram/start error', e)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}


