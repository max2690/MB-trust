import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const hasEnv = Boolean(process.env.DATABASE_URL);
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({ ok: true, env: hasEnv, db: 'up' });
  } catch (e) {
    return NextResponse.json({ ok: false, env: hasEnv, db: 'down' }, { status: 500 });
  }
}

