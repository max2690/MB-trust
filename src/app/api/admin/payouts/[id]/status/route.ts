import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { PayoutStatus } from '@prisma/client';

export async function POST(_req: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const body = await _req.json();
  const status = body?.status as 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED' | 'REJECTED';

  if (!['PROCESSING','COMPLETED','FAILED','CANCELLED','REJECTED'].includes(status)) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  try {
    const payout = await prisma.payout.update({
      where: { id },
      data: {
        status: status as PayoutStatus,
        processedAt: status === 'PROCESSING' ? new Date() : undefined,
        completedAt: ['COMPLETED','FAILED','CANCELLED','REJECTED'].includes(status) ? new Date() : undefined,
      },
    });

    if (status === 'REJECTED') {
      await prisma.user.update({
        where: { id: payout.userId },
        data: { balance: { increment: Number(payout.amount) } },
      });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}


