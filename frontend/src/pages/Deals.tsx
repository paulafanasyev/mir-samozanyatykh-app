import React, { useEffect, useState } from 'react';
import api from '../api/client';

export default function Deals() {
  const [deals, setDeals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => {
    let mounted = true;
    api.get('/api/deals').then((r) => { if (mounted) setDeals(Array.isArray(r.data) ? r.data : r.data?.items ?? []); }).catch((e) => { if (mounted) setError(e?.response?.data?.detail || 'Не удалось загрузить сделки'); }).finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, []);
  if (loading) return <section className="p-6">Загрузка сделок…</section>;
  if (error) return <section className="p-6 text-red-600">{error}</section>;
  return <section className="p-6"><h1 className="text-2xl font-semibold">Сделки</h1><div className="mt-6 grid gap-3">{deals.map((deal) => <article key={deal.id} className="rounded-xl border p-4"><div className="font-medium">{deal.title ?? deal.name ?? `Сделка #${deal.id}`}</div><div className="text-sm opacity-70">{deal.status ?? '—'} · {deal.amount ?? '—'}</div></article>)}</div></section>;
}
