'use client';

import { useState } from 'react';

export default function ProfileForm({ initial }: { initial: { name: string; username: string; city: string; followers: number }}) {
  const [name, setName] = useState(initial.name);
  const [username, setUsername] = useState(initial.username);
  const [city, setCity] = useState(initial.city);
  const [followers, setFollowers] = useState<number | ''>(initial.followers || 0);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/profile/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, telegramUsername: username, city, followersApprox: followers === '' ? 0 : Number(followers) }),
      });
      if (!res.ok) throw new Error('Ошибка сохранения');
      alert('Сохранено');
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <div>
        <label className="block text-sm">Имя</label>
        <input className="w-full rounded border px-3 py-2 bg-transparent" value={name} onChange={e => setName(e.target.value)} />
      </div>
      <div>
        <label className="block text-sm">Telegram username</label>
        <input className="w-full rounded border px-3 py-2 bg-transparent" value={username} onChange={e => setUsername(e.target.value)} />
      </div>
      <div>
        <label className="block text-sm">Город</label>
        <input className="w-full rounded border px-3 py-2 bg-transparent" value={city} onChange={e => setCity(e.target.value)} />
      </div>
      <div>
        <label className="block text-sm">Подписчики</label>
        <input className="w-full rounded border px-3 py-2 bg-transparent" type="number" min={0} value={followers} onChange={e => setFollowers(e.target.value === '' ? '' : Number(e.target.value))} />
      </div>
      <button type="submit" disabled={submitting} className="rounded border px-4 py-2">
        {submitting ? 'Сохранение...' : 'Сохранить'}
      </button>
    </form>
  );
}





