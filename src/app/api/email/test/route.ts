import { NextRequest, NextResponse } from 'next/server';
import { sendVerificationEmail } from '@/lib/email';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { email, code } = await request.json();

    if (!email || !code) {
      return NextResponse.json({ error: 'Email и код обязательны' }, { status: 400 });
    }

    const result = await sendVerificationEmail(email, code, 'admin');

    return NextResponse.json({
      success: result.success,
      message: result.success ? 'Email отправлен успешно' : 'Ошибка отправки',
      error: result.error
    });

  } catch (error) {
    console.error('Ошибка тестирования Email:', error);
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}
