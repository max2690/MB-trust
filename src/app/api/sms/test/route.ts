import { NextRequest, NextResponse } from 'next/server';
import { sendSMS } from '@/lib/sms';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { phone, code } = await request.json();

    if (!phone || !code) {
      return NextResponse.json({ error: 'Телефон и код обязательны' }, { status: 400 });
    }

    const result = await sendSMS(phone, code, 'admin');

    return NextResponse.json({
      success: result.success,
      message: result.success ? 'SMS отправлен успешно' : 'Ошибка отправки',
      error: result.error,
      method: result.method,
      cost: result.cost
    });

  } catch (error) {
    console.error('Ошибка тестирования SMS:', error);
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}
