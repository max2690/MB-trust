import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ExecutionStatus } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export default async function ExecutorIndex() {
  const session = (await getServerSession(authOptions)) as { user?: { id?: string } } | null;
  if (!(session?.user?.id)) {
    redirect("/auth/signin");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      role: true,
      isVerified: true,
      balance: true,
      level: true,
      totalExecutions: true,
      followersApprox: true,
    },
  });

  if (!user) redirect("/auth/signin");
  if (!user.isVerified) redirect(`/auth/verify?userId=${session.user.id}`);
  if (user.role !== "EXECUTOR") redirect("/");

  // Подсчёт выполненных сегодня можно добавить позже; пока используем totalExecutions
  const inProcess = await prisma.execution.count({
    where: {
      executorId: session.user.id,
      status: { in: [ExecutionStatus.PENDING, ExecutionStatus.UPLOADED, ExecutionStatus.PENDING_REVIEW] },
    },
  });

  const paidTotal = await prisma.payout.aggregate({
    _sum: { amount: true },
    where: { userId: session.user.id, status: "COMPLETED" },
  });

  return (
    <div className="min-h-screen bg-mb-black text-mb-white">
      <div className="container mx-auto px-4 py-8 space-y-6">
        <h1 className="text-2xl font-bold">Панель исполнителя</h1>

        <section className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg border border-mb-gray/20 p-4">
            <div className="text-sm text-mb-gray">Баланс</div>
            <div className="text-2xl font-semibold">{Number(user.balance).toLocaleString()} ₽</div>
            <Link href="/executor/payout" className="inline-block mt-3 text-mb-turquoise underline">Вывести</Link>
          </div>

          <div className="rounded-lg border border-mb-gray/20 p-4">
            <div className="text-sm text-mb-gray">Выплачено</div>
            <div className="text-2xl font-semibold">{Number(paidTotal._sum.amount ?? 0).toLocaleString()} ₽</div>
          </div>

          <div className="rounded-lg border border-mb-gray/20 p-4">
            <div className="text-sm text-mb-gray">В процессе</div>
            <div className="text-2xl font-semibold">{inProcess}</div>
          </div>
        </section>

        <section className="rounded-lg border border-mb-gray/20 p-4 flex items-center justify-between">
          <div>
            <div className="font-medium">Уровень: {user.level}</div>
            <div className="text-sm text-mb-gray">Всего выполнено: {user.totalExecutions}</div>
          </div>
          <Link href="/executor/available" className="text-mb-turquoise underline">Перейти к заданиям</Link>
        </section>
      </div>
    </div>
  );
}



