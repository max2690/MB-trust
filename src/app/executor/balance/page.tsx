import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export default async function BalancePage() {
  const session = (await getServerSession(authOptions)) as { user?: { id?: string } } | null;
  if (!(session?.user?.id)) redirect("/auth/signin");

  const [user, payouts, payments] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { balance: true },
    }),
    prisma.payout.aggregate({ _sum: { amount: true }, where: { userId: session.user.id, status: "COMPLETED" } }),
    prisma.payment.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: { id: true, amount: true, type: true, createdAt: true, description: true },
    }),
  ]);

  if (!user) redirect("/auth/signin");

  return (
    <div className="min-h-screen bg-mb-black text-mb-white">
      <div className="container mx-auto px-4 py-8 space-y-6">
        <h1 className="text-2xl font-bold">Баланс</h1>

        <div className="rounded-lg border border-mb-gray/20 p-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <div className="text-sm text-mb-gray">Текущий баланс</div>
              <div className="text-2xl font-semibold">{Number(user.balance).toLocaleString()} ₽</div>
            </div>
            <div>
              <div className="text-sm text-mb-gray">Выплачено всего</div>
              <div className="text-2xl font-semibold">{Number(payouts._sum.amount ?? 0).toLocaleString()} ₽</div>
            </div>
            <div className="self-center">
              <Link href="/executor/payout" className="text-mb-turquoise underline">Вывести</Link>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-mb-gray/20 p-4">
          <div className="font-medium mb-3">История начислений</div>
          {payments.length === 0 ? (
            <div className="text-sm text-mb-gray">Пока пусто</div>
          ) : (
            <ul className="space-y-2">
              {payments.map((p) => (
                <li key={p.id} className="flex items-center justify-between text-sm">
                  <span>{p.description || p.type}</span>
                  <span className={p.amount >= 0 ? "text-mb-turquoise" : "text-mb-gold"}>
                    {p.amount >= 0 ? "+" : ""}{p.amount.toLocaleString()} ₽
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}



