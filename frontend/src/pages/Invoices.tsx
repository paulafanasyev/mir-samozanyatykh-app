import React, { useEffect, useState } from 'react';
import api from '../api/client';

export default function Invoices() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    api.get('/api/invoices').then((r) => {
      if (mounted) setInvoices(Array.isArray(r.data) ? r.data : r.data?.items ?? []);
    }).catch((e) => {
      if (mounted) setError(e?.response?.data?.detail || 'Не удалось загрузить счета');
    }).finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, []);

  if (loading) return <section className="p-6">Загрузка счетов…</section>;
  if (error) return <section className="p-6 text-red-600">{error}</section>;
  return <section className="p-6"><h1 className="text-2xl font-semibold">Счета</h1><div className="mt-6 overflow-auto"><table className="min-w-full"><thead><tr><th className="p-2 text-left">№</th><th className="p-2 text-left">Клиент</th><th className="p-2 text-left">Сумма</th><th className="p-2 text-left">Статус</th></tr></thead><tbody>{invoices.map((invoice) => <tr key={invoice.id} className="border-t"><td className="p-2">{invoice.number ?? invoice.id}</td><td className="p-2">{invoice.client_name ?? invoice.client?.name ?? '—'}</td><td className="p-2">{invoice.amount ?? '—'}</td><td className="p-2">{invoice.status ?? '—'}</td></tr>)}</tbody></table></div></section>;
}
