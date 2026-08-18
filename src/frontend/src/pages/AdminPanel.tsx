import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { api } from '../api/client'
import { Users, Shield, BarChart3, Search, Filter, Lock, Unlock, Trash2, Eye, Edit3, Crown, ChevronLeft, ChevronRight, X, CheckCircle, AlertTriangle, Clock, Mail, Phone, Calendar } from 'lucide-react'

interface UserAdmin {
  id: number
  email: string
  full_name: string | null
  phone: string | null
  inn: string | null
  is_active: boolean
  is_verified: boolean
  is_admin: boolean
  is_moderator: boolean
  subscription_tier: string
  subscription_expires: string | null
  points: number
  level: string
  failed_login_attempts: number
  locked_until: string | null
  last_login_at: string | null
  created_at: string
  role: string
}

interface PlatformStats {
  total_users: number
  active_users_30d: number
  new_users_today: number
  new_users_week: number
  new_users_month: number
  total_revenue: number
  paid_invoices_count: number
  subscriptions_by_tier: Record<string, { count: number; percentage: number }>
  avg_invoices_per_user: number
  top_actions: { action: string; count: number }[]
  users_by_month: { month: string; count: number }[]
}

export default function AdminPanel() {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<'users' | 'stats' | 'audit'>('users')
  const [users, setUsers] = useState<UserAdmin[]>([])
  const [stats, setStats] = useState<PlatformStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [search, setSearch] = useState('')
  const [tierFilter, setTierFilter] = useState('')
  const [editUser, setEditUser] = useState<UserAdmin | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showBlockModal, setShowBlockModal] = useState(false)
  const [blockReason, setBlockReason] = useState('')
  const [blockDuration, setBlockDuration] = useState('')
  const [blockTarget, setBlockTarget] = useState<UserAdmin | null>(null)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (user && !user.is_admin) navigate('/dashboard')
  }, [user, navigate])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set('page', String(page))
      params.set('per_page', '20')
      if (search) params.set('search', search)
      if (tierFilter) params.set('tier', tierFilter)
      const res = await api.get(`/api/admin/users?${params}`)
      setUsers(res.data.users)
      setTotalPages(res.data.pagination.total_pages)
    } catch (e: any) {
      setError(e.response?.data?.message || 'Ошибка загрузки пользователей')
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    setLoading(true)
    try {
      const res = await api.get('/api/admin/stats')
      setStats(res.data)
    } catch (e: any) {
      setError(e.response?.data?.message || 'Ошибка загрузки статистики')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (activeTab === 'users') fetchUsers()
    if (activeTab === 'stats') fetchStats()
  }, [activeTab, page, search, tierFilter])

  const handleBlock = async () => {
    if (!blockTarget) return
    try {
      await api.post(`/api/admin/users/${blockTarget.id}/block`, {
        action: 'block',
        reason: blockReason,
        duration_hours: blockDuration ? parseInt(blockDuration) : null,
      })
      setMessage(`Пользователь ${blockTarget.email} заблокирован`)
      setShowBlockModal(false)
      setBlockReason('')
      setBlockDuration('')
      setBlockTarget(null)
      fetchUsers()
    } catch (e: any) {
      setError(e.response?.data?.message || 'Ошибка блокировки')
    }
  }

  const handleUnblock = async (u: UserAdmin) => {
    try {
      await api.post(`/api/admin/users/${u.id}/unblock`)
      setMessage(`Пользователь ${u.email} разблокирован`)
      fetchUsers()
    } catch (e: any) {
      setError(e.response?.data?.message || 'Ошибка разблокировки')
    }
  }

  const handleDelete = async (u: UserAdmin) => {
    if (!confirm(`Удалить пользователя ${u.email}? Это действие необратимо.`)) return
    try {
      await api.delete(`/api/admin/users/${u.id}`)
      setMessage(`Пользователь ${u.email} удалён`)
      fetchUsers()
    } catch (e: any) {
      setError(e.response?.data?.message || 'Ошибка удаления')
    }
  }

  const handleUpdateUser = async () => {
    if (!editUser) return
    try {
      await api.put(`/api/admin/users/${editUser.id}`, {
        full_name: editUser.full_name,
        phone: editUser.phone,
        is_active: editUser.is_active,
        is_verified: editUser.is_verified,
        is_admin: editUser.is_admin,
        is_moderator: editUser.is_moderator,
        subscription_tier: editUser.subscription_tier,
      })
      setMessage(`Пользователь ${editUser.email} обновлён`)
      setShowEditModal(false)
      setEditUser(null)
      fetchUsers()
    } catch (e: any) {
      setError(e.response?.data?.message || 'Ошибка обновления')
    }
  }

  const tierColors: Record<string, string> = {
    free: 'bg-slate-100 text-slate-700',
    pro: 'bg-orange-100 text-orange-700',
    business: 'bg-amber-100 text-amber-700',
    enterprise: 'bg-amber-100 text-amber-700',
  }

  const tierLabels: Record<string, string> = {
    free: 'Бесплатный',
    pro: 'Профессиональный',
    business: 'Бизнес',
    enterprise: 'Корпоративный',
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Shield className="w-7 h-7 text-orange-600" />
            Административная панель
          </h1>
          <p className="text-slate-500 mt-1">Управление пользователями, статистика и аудит</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setActiveTab('users')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'users' ? 'bg-orange-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-100'}`}>
            <Users className="w-4 h-4" />
            Пользователи
          </button>
          <button onClick={() => setActiveTab('stats')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'stats' ? 'bg-orange-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-100'}`}>
            <BarChart3 className="w-4 h-4" />
            Статистика
          </button>
          <button onClick={() => navigate('/api/admin/audit-logs')} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-white text-slate-600 hover:bg-slate-100 transition-colors">
            <Eye className="w-4 h-4" />
            Аудит
          </button>
        </div>
      </div>

      {message && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2 text-green-700">
          <CheckCircle className="w-5 h-5" />
          {message}
          <button onClick={() => setMessage('')} className="ml-auto"><X className="w-4 h-4" /></button>
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2 text-red-700">
          <AlertTriangle className="w-5 h-5" />
          {error}
          <button onClick={() => setError('')} className="ml-auto"><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* USERS TAB */}
      {activeTab === 'users' && (
        <>
          <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} placeholder="Поиск по email, имени, ИНН" className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm" />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <select value={tierFilter} onChange={e => { setTierFilter(e.target.value); setPage(1) }} className="pl-9 pr-8 py-2 border border-slate-200 rounded-lg text-sm bg-white">
                <option value="">Все тарифы</option>
                <option value="free">Бесплатный</option>
                <option value="pro">Профессиональный</option>
                <option value="business">Бизнес</option>
                <option value="enterprise">Корпоративный</option>
              </select>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            {loading ? (
              <div className="p-12 text-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto" /></div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="text-left px-4 py-3 font-medium text-slate-500">Пользователь</th>
                      <th className="text-left px-4 py-3 font-medium text-slate-500">Статус</th>
                      <th className="text-left px-4 py-3 font-medium text-slate-500">Тариф</th>
                      <th className="text-left px-4 py-3 font-medium text-slate-500">Регистрация</th>
                      <th className="text-right px-4 py-3 font-medium text-slate-500">Действия</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u.id} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="px-4 py-3">
                          <div className="font-medium text-slate-800">{u.full_name || 'Без имени'}</div>
                          <div className="text-xs text-slate-500 flex items-center gap-2"><Mail className="w-3 h-3" />{u.email}</div>
                          {u.phone && <div className="text-xs text-slate-400 flex items-center gap-2"><Phone className="w-3 h-3" />{u.phone}</div>}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-col gap-1">
                            <span className={`inline-flex w-fit items-center gap-1 px-2 py-0.5 rounded-full text-xs ${u.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                              <span className="w-1.5 h-1.5 rounded-full bg-current" />{u.is_active ? 'Активен' : 'Неактивен'}
                            </span>
                            {u.is_verified && <span className="text-xs text-green-600">✓ Проверен</span>}
                            {u.locked_until && <span className="text-xs text-red-600">Заблокирован</span>}
                          </div>
                        </td>
                        <td className="px-4 py-3"><span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium ${tierColors[u.subscription_tier] || tierColors.free}`}>{u.subscription_tier === 'pro' && <Crown className="w-3 h-3" />}{tierLabels[u.subscription_tier] || u.subscription_tier}</span></td>
                        <td className="px-4 py-3 text-slate-600"><div className="flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(u.created_at).toLocaleDateString('ru-RU')}</div><div className="text-xs text-slate-400">{u.last_login_at ? `Вход: ${new Date(u.last_login_at).toLocaleDateString('ru-RU')}` : 'Не входил'}</div></td>
                        <td className="px-4 py-3"><div className="flex justify-end gap-1">
                          <button title="Редактировать" onClick={() => { setEditUser(u); setShowEditModal(true) }} className="p-2 text-slate-500 hover:text-orange-600 hover:bg-orange-50 rounded-lg"><Edit3 className="w-4 h-4" /></button>
                          {u.locked_until ? <button title="Разблокировать" onClick={() => handleUnblock(u)} className="p-2 text-green-600 hover:bg-green-50 rounded-lg"><Unlock className="w-4 h-4" /></button> : <button title="Заблокировать" onClick={() => { setBlockTarget(u); setShowBlockModal(true) }} className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg"><Lock className="w-4 h-4" /></button>}
                          <button title="Удалить" onClick={() => handleDelete(u)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                        </div></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-sm text-slate-500">Страница {page} из {totalPages}</span>
              <div className="flex gap-1"><button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="p-2 rounded-lg hover:bg-slate-100 disabled:opacity-30"><ChevronLeft className="w-5 h-5" /></button><button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="p-2 rounded-lg hover:bg-slate-100 disabled:opacity-30"><ChevronRight className="w-5 h-5" /></button></div>
            </div>
          </div>
        </>
      )}

      {/* STATS TAB */}
      {activeTab === 'stats' && stats && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              ['Всего пользователей', stats.total_users], ['Активных за 30 дней', stats.active_users_30d], ['Новых сегодня', stats.new_users_today], ['Новых за неделю', stats.new_users_week], ['Новых за месяц', stats.new_users_month]
            ].map(([label, value]) => <div key={String(label)} className="bg-white border border-slate-200 rounded-xl p-4"><div className="text-sm text-slate-500">{label}</div><div className="text-2xl font-bold text-slate-900 mt-1">{value}</div></div>)}
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white border border-slate-200 rounded-xl p-5"><h2 className="font-semibold text-slate-900 mb-4">Финансы</h2><div className="text-sm text-slate-500">Выручка</div><div className="text-3xl font-bold text-green-600">{new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB' }).format(stats.total_revenue || 0)}</div><div className="text-sm text-slate-500 mt-4">Оплаченных счетов: {stats.paid_invoices_count}</div></div>
            <div className="bg-white border border-slate-200 rounded-xl p-5"><h2 className="font-semibold text-slate-900 mb-4">Тарифы</h2><div className="space-y-3">{Object.entries(stats.subscriptions_by_tier).map(([tier, value]) => <div key={tier}><div className="flex justify-between text-sm"><span>{tierLabels[tier] || tier}</span><span>{value.count} ({value.percentage}%)</span></div><div className="h-2 bg-slate-100 rounded-full mt-1"><div className="h-2 bg-orange-500 rounded-full" style={{ width: `${value.percentage}%` }} /></div></div>)}</div></div>
          </div>
        </div>
      )}

      {/* BLOCK MODAL */}
      {showBlockModal && blockTarget && <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"><div className="bg-white rounded-xl max-w-md w-full p-6"><div className="flex items-center justify-between mb-4"><h3 className="text-lg font-semibold">Блокировка пользователя</h3><button onClick={() => setShowBlockModal(false)}><X /></button></div><p className="text-sm text-slate-500 mb-4">{blockTarget.email}</p><label className="block text-sm font-medium mb-1">Причина</label><textarea value={blockReason} onChange={e => setBlockReason(e.target.value)} className="w-full border rounded-lg p-2 mb-4" rows={3} /><label className="block text-sm font-medium mb-1">Срок, часов (необязательно)</label><input value={blockDuration} onChange={e => setBlockDuration(e.target.value)} type="number" className="w-full border rounded-lg p-2 mb-5" /><div className="flex gap-2"><button onClick={handleBlock} className="flex-1 bg-orange-600 text-white rounded-lg py-2">Заблокировать</button><button onClick={() => setShowBlockModal(false)} className="flex-1 border rounded-lg py-2">Отмена</button></div></div></div>}

      {/* EDIT MODAL */}
      {showEditModal && editUser && <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"><div className="bg-white rounded-xl max-w-lg w-full p-6"><div className="flex items-center justify-between mb-4"><h3 className="text-lg font-semibold">Редактирование пользователя</h3><button onClick={() => setShowEditModal(false)}><X /></button></div><div className="space-y-3"><input value={editUser.full_name || ''} onChange={e => setEditUser({ ...editUser, full_name: e.target.value })} placeholder="Имя" className="w-full border rounded-lg p-2" /><input value={editUser.phone || ''} onChange={e => setEditUser({ ...editUser, phone: e.target.value })} placeholder="Телефон" className="w-full border rounded-lg p-2" /><select value={editUser.subscription_tier} onChange={e => setEditUser({ ...editUser, subscription_tier: e.target.value })} className="w-full border rounded-lg p-2"><option value="free">Бесплатный</option><option value="pro">Профессиональный</option><option value="business">Бизнес</option><option value="enterprise">Корпоративный</option></select><label className="flex gap-2"><input type="checkbox" checked={editUser.is_active} onChange={e => setEditUser({ ...editUser, is_active: e.target.checked })} /> Активен</label><label className="flex gap-2"><input type="checkbox" checked={editUser.is_verified} onChange={e => setEditUser({ ...editUser, is_verified: e.target.checked })} /> Проверен</label><label className="flex gap-2"><input type="checkbox" checked={editUser.is_admin} onChange={e => setEditUser({ ...editUser, is_admin: e.target.checked })} /> Администратор</label><label className="flex gap-2"><input type="checkbox" checked={editUser.is_moderator} onChange={e => setEditUser({ ...editUser, is_moderator: e.target.checked })} /> Модератор</label></div><div className="flex gap-2 mt-5"><button onClick={handleUpdateUser} className="flex-1 bg-orange-600 text-white rounded-lg py-2">Сохранить</button><button onClick={() => setShowEditModal(false)} className="flex-1 border rounded-lg py-2">Отмена</button></div></div></div>}
    </div>
  )
}
