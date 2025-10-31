'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { useState } from 'react';

export default function HowItWorksModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const [tab, setTab] = useState<'executor' | 'business'>('executor');

  const tabBtn =
    'px-3 py-2 text-sm rounded-lg transition-all duration-200 ease-out';
  const active = 'bg-emerald-500 text-black';
  const ghost = 'bg-transparent border border-emerald-500 text-emerald-400 hover:bg-emerald-500 hover:text-black';

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60" />
        <Dialog.Content className="fixed left-1/2 top-1/2 w-[92vw] max-w-xl -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-white/10 bg-[#0B0B0F] p-6 text-white shadow-2xl">
          <Dialog.Title className="text-xl font-semibold mb-4">
            Как это работает
          </Dialog.Title>

          <div className="mb-4 flex gap-2">
            <button
              className={`${tabBtn} ${tab === 'executor' ? active : ghost}`}
              onClick={() => setTab('executor')}
            >
              Исполнителю
            </button>
            <button
              className={`${tabBtn} ${tab === 'business' ? active : ghost}`}
              onClick={() => setTab('business')}
            >
              Бизнесу
            </button>
          </div>

          <div className="text-white/85 text-sm leading-6">
            {tab === 'executor' ? (
              <p>
                Вы выполняете простые рекламные действия в социальных сетях: размещаете сторис, пост или отметку бренда. Каждое выполненное задание повышает ваш уровень и открывает доступ к более выгодным предложениям. Все задания проходят проверку на подлинность, а выплаты осуществляются прозрачно и без задержек.
              </p>
            ) : (
              <p>
                Бренд получает живое сарафанное продвижение через реальные аккаунты, а не через ботов и накрутки. Формируется эффект массового присутствия: аудитория видит, что «все уже здесь», что усиливает доверие и желание присоединиться. Это формат нативной рекламы, который работает мягко, достоверно и быстро.
              </p>
            )}
          </div>

          <div className="mt-6 flex justify-end">
            <Dialog.Close asChild>
              <button className="px-4 py-2 rounded-lg bg-transparent border border-emerald-500 text-emerald-400 hover:bg-emerald-500 hover:text-black transition-all duration-200 ease-out">
                Понятно
              </button>
            </Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}




