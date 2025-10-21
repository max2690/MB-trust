import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const paymentId = searchParams.get('paymentId');
  const amount = searchParams.get('amount');

  if (!paymentId || !amount) {
    return NextResponse.json({ error: 'Неверные параметры' }, { status: 400 });
  }

  // Заглушка страницы оплаты Альфа-Банка
  const html = `
    <!DOCTYPE html>
    <html lang="ru">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Оплата через Альфа-Банк</title>
      <style>
        body { 
          font-family: Arial, sans-serif; 
          background: #0B0B0F; 
          color: white; 
          margin: 0; 
          padding: 20px;
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
        }
        .payment-card {
          background: #1a1a1a;
          border-radius: 12px;
          padding: 30px;
          text-align: center;
          max-width: 400px;
          width: 100%;
        }
        .logo { font-size: 48px; margin-bottom: 20px; }
        .amount { font-size: 32px; color: #FFD700; margin: 20px 0; }
        .button {
          background: #FFD700;
          color: #0B0B0F;
          border: none;
          padding: 15px 30px;
          border-radius: 8px;
          font-size: 18px;
          cursor: pointer;
          margin: 10px;
          width: 100%;
        }
        .button:hover { background: #E6C200; }
        .button.cancel { background: #666; }
        .button.cancel:hover { background: #888; }
      </style>
    </head>
    <body>
      <div class="payment-card">
        <div class="logo">🏛️</div>
        <h1>Альфа-Банк</h1>
        <p>Сумма к оплате:</p>
        <div class="amount">${amount}₽</div>
        <p>ID платежа: ${paymentId}</p>
        <button class="button" onclick="simulatePayment('success')">
          ✅ Оплатить
        </button>
        <button class="button cancel" onclick="simulatePayment('cancel')">
          ❌ Отменить
        </button>
      </div>
      
      <script>
        function simulatePayment(result) {
          const baseUrl = '${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}';
          if (result === 'success') {
            window.location.href = baseUrl + '/api/payments/alfa/success?paymentId=${paymentId}';
          } else {
            window.location.href = baseUrl + '/api/payments/alfa/cancel?paymentId=${paymentId}';
          }
        }
      </script>
    </body>
    </html>
  `;

  return new NextResponse(html, {
    headers: { 'Content-Type': 'text/html' }
  });
}
