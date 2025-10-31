'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function PayoutPage() {
  const [method, setMethod] = useState<'card' | 'ton' | 'sbp'>('card');
  const [details, setDetails] = useState('');
  const [amount, setAmount] = useState<number | ''>('');
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!amount || amount <= 0) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/payouts/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: Number(amount), method, details }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Ошибка запроса');
      router.push('/executor/balance');
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-mb-black text-mb-white">
      <div className="container mx-auto px-4 py-8 max-w-md space-y-6">
        <h1 className="text-2xl font-bold">Запросить вывод</h1>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <div className="font-medium">Куда вывести</div>
            <div className="flex gap-4">
              {(['card', 'ton', 'sbp'] as const).map(v => (
                <label key={v} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="method"
                    value={v}
                    checked={method === v}
                    onChange={() => setMethod(v)}
                  />
                  <span>{v === 'card' ? 'Карта' : v.toUpperCase()}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-sm">Номер карты / кошелёк</label>
            <input
              className="w-full rounded border px-3 py-2 bg-transparent"
              value={details}
              onChange={e => setDetails(e.target.value)}
              placeholder="0000 0000 0000 0000 / UQ... / телефон СБП"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm">Сумма</label>
            <input
              className="w-full rounded border px-3 py-2 bg-transparent"
              type="number"
              min={1}
              value={amount}
              onChange={e => setAmount(e.target.value === '' ? '' : Number(e.target.value))}
              required
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="rounded border px-4 py-2"
          >
            {submitting ? 'Отправка...' : 'Запросить выплату'}
          </button>
        </form>
      </div>
    </div>
  );
}





