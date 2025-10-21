import { NextRequest, NextResponse } from 'next/server';
import { sendOrderNotification, sendExecutionNotification, sendBalanceNotification } from '@/lib/telegram';
import { sendOrderEmail, sendExecutionEmail, sendBalanceEmail } from '@/lib/email';
import { sendOrderSMS, sendExecutionSMS, sendBalanceSMS } from '@/lib/sms';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { type, method, data } = await request.json();

    if (!type || !method || !data) {
      return NextResponse.json({ error: 'Тип, метод и данные обязательны' }, { status: 400 });
    }

    let result;

    switch (type) {
      case 'order':
        if (method === 'telegram') {
          result = await sendOrderNotification(data.telegramId, data.orderData);
        } else if (method === 'email') {
          result = await sendOrderEmail(data.email, data.orderData);
        } else if (method === 'sms') {
          result = await sendOrderSMS(data.phone, data.orderData);
        }
        break;

      case 'execution':
        if (method === 'telegram') {
          result = await sendExecutionNotification(data.telegramId, data.executionData);
        } else if (method === 'email') {
          result = await sendExecutionEmail(data.email, data.executionData);
        } else if (method === 'sms') {
          result = await sendExecutionSMS(data.phone, data.executionData);
        }
        break;

      case 'balance':
        if (method === 'telegram') {
          result = await sendBalanceNotification(data.telegramId, data.balance, data.type);
        } else if (method === 'email') {
          result = await sendBalanceEmail(data.email, data.balance, data.type);
        } else if (method === 'sms') {
          result = await sendBalanceSMS(data.phone, data.balance, data.type);
        }
        break;

      default:
        return NextResponse.json({ error: 'Неизвестный тип уведомления' }, { status: 400 });
    }

    return NextResponse.json({
      success: !!result && !!result.success,
      message: result && 'success' in result && result.success ? 'Уведомление отправлено успешно' : 'Ошибка отправки',
      error: result && 'error' in result ? (result as any).error : undefined,
      method: result && 'method' in result ? (result as any).method : undefined,
      cost: result && 'cost' in result ? (result as any).cost : undefined
    });

  } catch (error) {
    console.error('Ошибка тестирования уведомлений:', error);
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}
