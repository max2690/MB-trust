'use client';

import { useEffect, useState } from 'react';

type Step = 'region' | 'accounts' | 'notifications' | 'rules' | 'finish';

export default function ExecutorOnboarding() {
  const [step, setStep] = useState<Step>('region');
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    country: 'Россия',
    region: '',
    city: '',
    accounts: [] as Array<{ platform: string; handle: string; followersApprox?: number }>,
    tgNotify: false,
    webPush: false,
    rulesAccepted: false,
  });

  const save = async (partial?: Partial<typeof form>) => {
    setSaving(true);
    const body = { ...(partial ? { ...form, ...partial } : form) };
    try {
      await fetch('/api/onboarding/executor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (partial) setForm(prev => ({ ...prev, ...partial }));
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    if (step !== 'region') save().catch(() => void 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  const next = () => {
    if (step === 'region') return setStep('accounts');
    if (step === 'accounts') return setStep('notifications');
    if (step === 'notifications') return setStep('rules');
    if (step === 'rules') return setStep('finish');
  };
  const back = () => {
    if (step === 'accounts') return setStep('region');
    if (step === 'notifications') return setStep('accounts');
    if (step === 'rules') return setStep('notifications');
  };

  return (
    <div className="min-h-screen bg-mb-black text-mb-white">
      <div className="container mx-auto px-4 py-8 max-w-2xl space-y-6">
        <h1 className="text-2xl font-bold">Онбординг исполнителя</h1>
        <div className="text-sm text-mb-gray">{saving ? 'Сохранение...' : 'Автосохранение включено'}</div>

        {step === 'region' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm mb-1">Страна</label>
              <input className="w-full rounded border px-3 py-2 bg-transparent" value={form.country} onChange={e => setForm({ ...form, country: e.target.value })} />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-sm mb-1">Регион</label>
                <input className="w-full rounded border px-3 py-2 bg-transparent" value={form.region} onChange={e => setForm({ ...form, region: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm mb-1">Город</label>
                <input className="w-full rounded border px-3 py-2 bg-transparent" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} />
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => (save().then(next))} className="rounded border px-4 py-2 transition-all duration-200 ease-out hover:bg-emerald-500 hover:text-black">Дальше</button>
            </div>
          </div>
        )}

        {step === 'accounts' && (
          <div className="space-y-4">
            <div className="text-sm text-mb-gray">Добавьте минимум 1 аккаунт (можно пропустить — уровень NOVICE)</div>
            <button
              className="rounded border px-4 py-2 transition-all duration-200 ease-out hover:bg-emerald-500 hover:text-black"
              onClick={() => setForm(f => ({ ...f, accounts: [...f.accounts, { platform: 'tg', handle: '' }] }))}
            >
              Добавить аккаунт
            </button>
            <div className="space-y-3">
              {form.accounts.map((a, i) => (
                <div key={i} className="grid gap-2 sm:grid-cols-3">
                  <input className="rounded border px-3 py-2 bg-transparent" placeholder="platform (tg/ig/vk)" value={a.platform} onChange={e => {
                    const v = e.target.value; setForm(f => { const copy = [...f.accounts]; copy[i] = { ...copy[i], platform: v }; return { ...f, accounts: copy }; });
                  }} />
                  <input className="rounded border px-3 py-2 bg-transparent" placeholder="@handle" value={a.handle} onChange={e => {
                    const v = e.target.value; setForm(f => { const copy = [...f.accounts]; copy[i] = { ...copy[i], handle: v }; return { ...f, accounts: copy }; });
                  }} />
                  <input className="rounded border px-3 py-2 bg-transparent" type="number" placeholder="подписчики" onChange={e => {
                    const v = e.target.value === '' ? undefined : Number(e.target.value);
                    setForm(f => { const copy = [...f.accounts]; copy[i] = { ...copy[i], followersApprox: v }; return { ...f, accounts: copy }; });
                  }} />
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <button onClick={back} className="rounded border px-4 py-2">Назад</button>
              <button onClick={() => (save().then(next))} className="rounded border px-4 py-2 transition-all duration-200 ease-out hover:bg-emerald-500 hover:text-black">Дальше</button>
            </div>
          </div>
        )}

        {step === 'notifications' && (
          <div className="space-y-4">
            <label className="flex items-center gap-2"><input type="checkbox" checked={form.tgNotify} onChange={e => setForm({ ...form, tgNotify: e.target.checked })} /> Привязать Telegram-бота</label>
            <label className="flex items-center gap-2"><input type="checkbox" checked={form.webPush} onChange={e => setForm({ ...form, webPush: e.target.checked })} /> Включить web-push</label>
            <div className="flex gap-3">
              <button onClick={back} className="rounded border px-4 py-2">Назад</button>
              <button onClick={() => (save().then(next))} className="rounded border px-4 py-2 transition-all duration-200 ease-out hover:bg-emerald-500 hover:text-black">Дальше</button>
            </div>
          </div>
        )}

        {step === 'rules' && (
          <div className="space-y-4">
            <div className="text-sm text-mb-gray">Подтвердите антифрод правила (3 галки):</div>
            <label className="flex items-center gap-2"><input type="checkbox" checked={form.rulesAccepted} onChange={e => setForm({ ...form, rulesAccepted: e.target.checked })} /> Согласен с правилами</label>
            <div className="flex gap-3">
              <button onClick={back} className="rounded border px-4 py-2">Назад</button>
              <button disabled={!form.rulesAccepted} onClick={() => (save().then(() => setStep('finish')))} className="rounded border px-4 py-2 transition-all duration-200 ease-out hover:bg-emerald-500 hover:text-black">Завершить</button>
            </div>
          </div>
        )}

        {step === 'finish' && (
          <div className="space-y-3">
            <div className="text-mb-turquoise">Онбординг завершён</div>
            <a href="/executor/balance" className="underline text-emerald-400">Перейти в баланс</a>
            <a href="/executor/available" className="underline text-emerald-400">Перейти к заданиям</a>
          </div>
        )}
      </div>
    </div>
  );
}




