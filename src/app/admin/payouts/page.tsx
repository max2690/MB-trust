'use client';

import { useEffect, useState } from 'react';

type AdminPayoutItem = {
  id: string;
  amount: number;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED' | 'REJECTED';
  method: string;
  user?: { id: string; name?: string | null; email?: string | null } | null;
};

export default function AdminPayouts() {
  const [items, setItems] = useState<AdminPayoutItem[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const r = await fetch('/api/payouts', { cache: 'no-store' });
    const d = await r.json();
    setItems(d.payouts || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const setStatus = async (id: string, status: AdminPayoutItem['status']) => {
    const r = await fetch(`/api/admin/payouts/${id}/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (r.ok) load();
    else alert('Ошибка смены статуса');
  };

  if (loading) return <div className="p-6 text-white">Загрузка…</div>;

  return (
    <div className="min-h-screen bg-mb-black text-mb-white p-6 space-y-4">
      <h1 className="text-2xl font-bold">Заявки на выплаты</h1>
      <div className="space-y-2">
        {items.map(p => (
          <div key={p.id} className="rounded border border-white/10 p-3 flex items-center justify-between">
            <div className="text-sm">
              <div>ID: {p.id}</div>
              <div>Пользователь: {p.user?.name || p.user?.email || p.user?.id}</div>
              <div>Сумма: {Number(p.amount).toLocaleString()} ₽</div>
              <div>Статус: {p.status}</div>
              <div>Метод: {p.method}</div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setStatus(p.id, 'PROCESSING')} className="rounded border px-3 py-1">PROCESSING</button>
              <button onClick={() => setStatus(p.id, 'COMPLETED')} className="rounded border px-3 py-1">PAID</button>
              <button onClick={() => setStatus(p.id, 'REJECTED')} className="rounded border px-3 py-1">REJECT</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


