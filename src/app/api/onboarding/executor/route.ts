import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  const session = (await getServerSession(authOptions)) as { user?: { id?: string } } | null;
  if (!(session && session.user && session.user.id)) return NextResponse.json({ ok: false }, { status: 401 });

  const body = await req.json();
  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        country: body.country || undefined,
        region: body.region || undefined,
        city: body.city || undefined,
        followersApprox: Array.isArray(body.accounts) ? (body.accounts[0]?.followersApprox ?? undefined) : undefined,
        preferredMessenger: body.tgNotify ? 'Telegram' : undefined,
      },
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}


