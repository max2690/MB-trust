import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

function mapMethod(method: string): 'BANK_SPB' | 'TELEGRAM_WALLET' {
  if (method === 'ton') return 'TELEGRAM_WALLET';
  return 'BANK_SPB'; // 'card' и 'sbp'
}

export async function POST(req: Request) {
  const session = (await getServerSession(authOptions)) as { user?: { id?: string } } | null;
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }
  // дальше весь твой оригинальный код

  const { amount, method, details } = await req.json();
  if (!amount || amount <= 0 || !method) {
    return NextResponse.json({ success: false, message: 'Invalid payload' }, { status: 400 });
  }

  try {
    const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { id: true, role: true, balance: true, isVerified: true } });
    if (!user) return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    if (!user.isVerified || user.role !== 'EXECUTOR') return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
    if (Number(user.balance) < Number(amount)) return NextResponse.json({ success: false, message: 'Недостаточно средств' }, { status: 400 });

    const payoutMethod = mapMethod(method);

    const payout = await prisma.$transaction(async (tx) => {
      const created = await tx.payout.create({
        data: {
          userId: user.id,
          amount: Number(amount),
          method: payoutMethod,
          status: 'PENDING',
        },
      });

      await tx.user.update({
        where: { id: user.id },
        data: { balance: { decrement: Number(amount) } },
      });

      // Запишем событие в payments (как WITHDRAWAL), чтобы история отображалась
      await tx.payment.create({
        data: {
          userId: user.id,
          amount: -Number(amount),
          type: 'WITHDRAWAL',
          status: 'PENDING',
          description: details ? `Заявка на вывод (${method}): ${details}` : `Заявка на вывод (${method})`,
        },
      });

      return created;
    });

    return NextResponse.json({ success: true, id: payout.id });
  } catch (e) {
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}



