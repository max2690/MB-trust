'use client';

import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

export default function TakeTaskButton() {
  const { data: session } = useSession();
  const router = useRouter();

  const go = () => {
    const userId = (session?.user as { id?: string } | undefined)?.id ?? null;
    if (!userId) router.push('/auth/signin?role=executor');
    else router.push('/executor/available');
  };

  return (
    <button
      type="button"
      onClick={go}
      className="px-5 py-3 font-semibold rounded-xl border border-emerald-500 text-emerald-400 bg-transparent hover:bg-emerald-500 hover:text-black transition-all duration-200 ease-out"
    >
      Взять задание
    </button>
  );
}


