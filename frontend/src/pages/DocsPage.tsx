import { useState } from 'react'
import { BookOpen, Code, Shield, Zap, Database, Lock, FileText, ChevronDown, ChevronRight, Copy, Check, CheckSquare } from 'lucide-react'

interface Section {
  id: string
  title: string
  icon: React.ElementType
  content: React.ReactNode
}

const CodeBlock = ({ code, language = 'bash' }: { code: string; language?: string }) => {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <div className="relative group">
      <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={copy} className="p-1.5 bg-slate-700 rounded text-slate-300 hover:text-white">
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
        </button>
      </div>
      <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto text-sm"><code>{code}</code></pre>
    </div>
  )
}

const Endpoint = ({ method, path, description }: { method: string; path: string; description: string }) => {
  const colors: Record<string, string> = {
    GET: 'bg-green-100 text-green-700', POST: 'bg-orange-100 text-orange-700', PUT: 'bg-amber-100 text-amber-700', DELETE: 'bg-red-100 text-red-700', PATCH: 'bg-amber-100 text-amber-700',
  }
  return (
    <div className="flex items-start gap-3 py-2 border-b border-slate-100 last:border-0">
      <span className={`text-xs font-bold px-2 py-0.5 rounded ${colors[method] || 'bg-slate-100'}`}>{method}</span>
      <code className="text-sm text-slate-700 font-mono">{path}</code>
      <span className="text-sm text-slate-500 ml-auto">{description}</span>
    </div>
  )
}

export default function DocsPage() {
  const [openSections, setOpenSections] = useState<Set<string>>(new Set(['auth', 'sales']))
  const toggle = (id: string) => {
    const next = new Set(openSections)
    if (next.has(id)) next.delete(id); else next.add(id)
    setOpenSections(next)
  }
  const sections: Section[] = [
    { id: 'auth', title: 'Autentifikatsiya', icon: Lock, content: <div className="space-y-4"><p className="text-slate-600">Vse zashchishchyonnye endpoints trebuyut Bearer token v zagolovke:</p><CodeBlock code={`Authorization: Bearer <access_token>`} /><div className="space-y-2"><Endpoint method="POST" path="/api/auth/register" description="Registratsiya" /><Endpoint method="POST" path="/api/auth/login" description="Vkhod v sistem" /><Endpoint method="POST" path="/api/auth/logout" description="Vykhod" /><Endpoint method="POST" path="/api/auth/refresh" description="Obnovlenie tokena" /><Endpoint method="POST" path="/api/auth/2fa/setup" description="Nastroika 2FA" /><Endpoint method="POST" path="/api/auth/2fa/verify" description="Proverka 2FA" /></div><h4 className="font-semibold text-slate-800 mt-4">Primer vkhoda:</h4><CodeBlock code={`curl -X POST https://mir-samozanyatykh.ru/api/auth/login \-d "email=test@example.com&password=StrongPass123!"`} /></div> },
    { id: 'sales', title: 'Modul prodazh', icon: Zap, content: <div className="space-y-4"><div className="space-y-2"><h4 className="font-semibold text-slate-700">Tovary / Uslugi</h4><Endpoint method="GET" path="/api/sales/products" description="Spisok" /><Endpoint method="POST" path="/api/sales/products" description="Sozdanie" /><Endpoint method="PUT" path="/api/sales/products/{id}" description="Obnovlenie" /><Endpoint method="DELETE" path="/api/sales/products/{id}" description="Udalenie" /></div><div className="space-y-2"><h4 className="font-semibold text-slate-700">Scheta</h4><Endpoint method="GET" path="/api/sales/invoices" description="Spisok s filtrom" /><Endpoint method="POST" path="/api/sales/invoices" description="Sozdanie" /><Endpoint method="GET" path="/api/sales/invoices/{id}" description="Poluchenie" /><Endpoint method="PUT" path="/api/sales/invoices/{id}" description="Obnovlenie" /><Endpoint method="DELETE" path="/api/sales/invoices/{id}" description="Udalenie (tolko draft)" /><Endpoint method="POST" path="/api/sales/invoices/{id}/send" description="Otpravka klientu" /><Endpoint method="GET" path="/api/sales/invoices/{id}/pdf" description="Skachivanie PDF" /></div><div className="space-y-2"><h4 className="font-semibold text-slate-700">Platezhi</h4><Endpoint method="POST" path="/api/sales/invoices/{id}/payments" description="Ruchnoe sozdanie" /><Endpoint method="GET" path="/api/sales/invoices/{id}/payments" description="Spisok platezhey" /><Endpoint method="POST" path="/api/sales/invoices/{id}/yookassa" description="YuKassa onlayn-platezh" /></div><div className="space-y-2"><h4 className="font-semibold text-slate-700">Statistika</h4><Endpoint method="GET" path="/api/sales/stats" description="Obshchaya statistika" /><Endpoint method="GET" path="/api/sales/dashboard" description="Dashboard" /></div></div> },
    { id: 'contracts', title: 'Dogovory', icon: FileText, content: <div className="space-y-4"><Endpoint method="GET" path="/api/contracts/templates" description="Shablony" /><Endpoint method="GET" path="/api/contracts/templates/{category}" description="Detali shablona" /><Endpoint method="POST" path="/api/contracts/generate" description="Generatsiya" /><Endpoint method="POST" path="/api/contracts/{id}/sign" description="Podpisanie" /><Endpoint method="POST" path="/api/contracts/{id}/verify" description="Proverka podpisi" /><Endpoint method="GET" path="/api/contracts/{id}/pdf" description="Skachivanie PDF" /></div> },
    { id: 'crm', title: 'CRM', icon: Database, content: <div className="space-y-4"><Endpoint method="GET" path="/api/crm/clients" description="Spisok s poiskom" /><Endpoint method="POST" path="/api/crm/clients" description="Sozdanie" /><Endpoint method="PUT" path="/api/crm/clients/{id}" description="Obnovlenie" /><Endpoint method="DELETE" path="/api/crm/clients/{id}" description="Udalenie" /><Endpoint method="GET" path="/api/crm/deals" description="Spisok" /><Endpoint method="POST" path="/api/crm/deals" description="Sozdanie" /><Endpoint method="GET" path="/api/crm/stats" description="Statistika" /></div> },
    { id: 'tasks', title: 'Zadachi i Kalendar (v7.7+)', icon: CheckSquare, content: <div className="space-y-4"><Endpoint method="GET" path="/api/tasks" description="Spisok (s filtrami)" /><Endpoint method="POST" path="/api/tasks" description="Sozdanie" /><Endpoint method="PUT" path="/api/tasks/{id}" description="Obnovlenie" /><Endpoint method="DELETE" path="/api/tasks/{id}" description="Udalenie" /><Endpoint method="GET" path="/api/calendar/events" description="Sobytiya za period" /><Endpoint method="POST" path="/api/calendar/events" description="Sozdanie sobytiya" /><Endpoint method="PUT" path="/api/calendar/events/{id}" description="Obnovlenie" /><Endpoint method="DELETE" path="/api/calendar/events/{id}" description="Udalenie" /></div> },
    { id: 'integrations', title: 'Integratsii (v7.8+)', icon: Code, content: <div className="space-y-4"><Endpoint method="GET" path="/api/api-keys" description="Spisok" /><Endpoint method="POST" path="/api/api-keys" description="Sozdanie" /><Endpoint method="DELETE" path="/api/api-keys/{id}" description="Otzyv" /><Endpoint method="GET" path="/api/webhooks" description="Spisok podpisok" /><Endpoint method="POST" path="/api/webhooks" description="Sozdanie" /><Endpoint method="PUT" path="/api/webhooks/{id}" description="Obnovlenie" /><Endpoint method="DELETE" path="/api/webhooks/{id}" description="Udalenie" /></div> },
    { id: 'svetlana', title: 'AI Svetlana', icon: Zap, content: <div className="space-y-4"><Endpoint method="POST" path="/api/svetlana/chat" description="Tekstovyy chat" /><h4 className="font-semibold text-slate-800 mt-4">Primer zaprosa:</h4><CodeBlock code={`curl -X POST https://mir-samozanyatykh.ru/api/svetlana/chat \-H "Authorization: Bearer <token>" \-d "message=Kakie nalogi platit samozanyatyy?&voice=false"`} /></div> },
    { id: 'admin', title: 'Admin Panel (v7.5+)', icon: Shield, content: <div className="space-y-4"><Endpoint method="GET" path="/api/admin/stats" description="Statistika platformy" /><Endpoint method="GET" path="/api/admin/users" description="Spisok polzovateley" /><Endpoint method="POST" path="/api/admin/users/bulk/tier" description="Smena tarifa" /><Endpoint method="POST" path="/api/admin/users/{id}/block" description="Blokirovka" /><Endpoint method="GET" path="/api/admin/audit-logs" description="Audit logi" /></div> },
    { id: 'errors', title: 'Kody oshibok', icon: Shield, content: <div className="grid grid-cols-2 gap-2 text-sm">{['400 Nevernyy zapros','401 Ne avtorizovan','403 Dostup zapreshchyon','404 Ne naydeno','409 Konflikt (dublikat)','422 Oshibka validatsii','423 Akkunt zablokirovan','429 Slishkom mnogo zaprosov','500 Vnutrennyaya oshibka','502 Oshibka vneshnego servisa'].map(x => <div key={x} className="flex justify-between p-2 bg-slate-50 rounded">{x}</div>)}</div> },
    { id: 'rate', title: 'Rate Limits', icon: Zap, content: <div className="grid grid-cols-2 gap-2 text-sm"><div className="p-2 bg-slate-50 rounded">/health — 60/min</div><div className="p-2 bg-slate-50 rounded">/api/auth/login — 5/min</div><div className="p-2 bg-slate-50 rounded">/api/auth/register — 3/min</div><div className="p-2 bg-slate-50 rounded">/api/sales/* — 60/min</div><div className="p-2 bg-slate-50 rounded">/api/svetlana/chat — 30/min (free), 120/min (pro+)</div><div className="p-2 bg-slate-50 rounded">/api/export/* — 10/min</div><div className="p-2 bg-slate-50 rounded">/api/import/* — 10/min</div></div> },
  ]
  return <div className="max-w-4xl mx-auto"><div className="mb-8"><h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3"><BookOpen className="w-8 h-8 text-orange-600" />Dokumentatsiya API</h1><p className="text-slate-500 mt-2">Mir Samozanyatykh v7.9 — polnaya dokumentatsiya API</p></div><div className="space-y-3">{sections.map(section => { const Icon=section.icon; const isOpen=openSections.has(section.id); return <div key={section.id} className="bg-white border border-slate-200 rounded-xl overflow-hidden"><button onClick={()=>toggle(section.id)} className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"><div className="flex items-center gap-3"><Icon className="w-5 h-5 text-orange-600" /><span className="font-semibold text-slate-800">{section.title}</span></div>{isOpen?<ChevronDown className="w-5 h-5 text-slate-400" />:<ChevronRight className="w-5 h-5 text-slate-400" />}</button>{isOpen&&<div className="px-4 pb-4 border-t border-slate-100 pt-4">{section.content}</div>}</div>})}</div><div className="mt-8 p-4 bg-orange-50 border border-orange-200 rounded-xl"><h3 className="font-semibold text-orange-800 mb-2">Bazovyy URL</h3><div className="space-y-1 text-sm"><p><span className="font-mono text-orange-700">Production:</span> <code className="bg-white px-2 py-0.5 rounded">https://mir-samozanyatykh.ru/api</code></p><p><span className="font-mono text-orange-700">Local:</span> <code className="bg-white px-2 py-0.5 rounded">http://localhost:8000/api</code></p></div></div><div className="mt-4 p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-500"><p>ANO TsPS «Mir Samozanyatykh» | INN 9724016805</p><p>Versiya API: 7.9.0</p></div></div>
}
