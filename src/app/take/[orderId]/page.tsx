import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export default async function TakeOrder({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await params;
  const session = (await getServerSession(authOptions)) as { user?: { id?: string } } | null;
  if (!(session?.user?.id)) {
    redirect(`/auth/signin?role=executor&redirect=/take/${orderId}`);
  }

  try {
    await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/executions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId, executorId: session.user.id }),
      cache: 'no-store',
    });
  } catch {
    // ignore errors, proceed to active
  }
  redirect('/executor/active');
}


