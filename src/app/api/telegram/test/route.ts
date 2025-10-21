import { NextRequest, NextResponse } from 'next/server';
import { sendVerificationCode } from '@/lib/telegram';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { telegramId, code } = await request.json();

    if (!telegramId || !code) {
      return NextResponse.json({ error: 'Telegram ID и код обязательны' }, { status: 400 });
    }

    const result = await sendVerificationCode(telegramId, code, 'admin');

    return NextResponse.json({
      success: result.success,
      message: result.success ? 'Код отправлен успешно' : 'Ошибка отправки',
      error: result.error
    });

  } catch (error) {
    console.error('Ошибка тестирования Telegram:', error);
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}
