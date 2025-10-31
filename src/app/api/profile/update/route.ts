import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  const session = (await getServerSession(authOptions)) as { user?: { id?: string } } | null;
  if (!session?.user?.id) return NextResponse.json({ ok: false }, { status: 401 });

  const { name, telegramUsername, city, followersApprox } = await req.json();
  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: { name, telegramUsername, city, followersApprox },
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}



