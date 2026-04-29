'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  Plus, X, Loader2, UserCheck, UserX, Shield, ChevronDown, Pencil
} from 'lucide-react'

const ROLES = ['employee', 'manager', 'admin'] as const
const ROLE_LABEL: Record<string, string> = { admin: '관리자', manager: '매니저', employee: '직원' }
const ROLE_COLOR: Record<string, string> = {
  admin:    'bg-red-100 text-red-700',
  manager:  'bg-blue-100 text-blue-700',
  employee: 'bg-gray-100 text-gray-600',
}

type FormState = {
  name: string
  phone: string
  email: string
  position: string
  role: typeof ROLES[number]
  department_id: string
  joined_at: string
}

const EMPTY_FORM: FormState = {
  name: '', phone: '', email: '', position: '',
  role: 'employee', department_id: '', joined_at: '',
}

export default function AdminClient({
  users: initUsers,
  departments = [],
}: {
  users: any[]
  departments: { id: number; name: string }[]
}) {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [users, setUsers] = useState<any[]>(initUsers)

  // 등록/수정 모달 통합
  const [modalMode, setModalMode] = useState<'create' | 'edit' | null>(null)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<FormState>(EMPTY_FORM)

  // 역할 변경 드롭다운
  const [editingRole, setEditingRole] = useState<number | null>(null)

  function f(key: keyof FormState, val: string) {
    setForm(prev => ({ ...prev, [key]: val }))
  }

  function deptName(deptId: number | null | undefined) {
    if (!deptId) return null
    return departments.find(d => d.id === deptId)?.name ?? null
  }

  function openCreate() {
    setForm({ ...EMPTY_FORM })
    setEditingId(null)
    setModalMode('create')
  }

  function openEdit(user: any) {
    setForm({
      name: user.name ?? '',
      phone: user.phone ?? '',
      email: user.email ?? '',
      position: user.position ?? '',
      role: (user.role as typeof ROLES[number]) ?? 'employee',
      department_id: user.department_id ? String(user.department_id) : '',
      joined_at: user.joined_at ?? '',
    })
    setEditingId(user.id)
    setModalMode('edit')
  }

  function closeModal() {
    setModalMode(null)
    setEditingId(null)
  }

  async function submitForm() {
    if (!form.name || !form.email) {
      alert('이름과 Google 이메일은 필수입니다.')
      return
    }
    setSaving(true)

    if (modalMode === 'create') {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const json = await res.json()
      if (!res.ok) { alert('생성 실패: ' + json.error); setSaving(false); return }
      setUsers(prev => [...prev, json.user])
    } else if (modalMode === 'edit' && editingId) {
      const res = await fetch(`/api/admin/users/${editingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          phone: form.phone,
          email: form.email,
          position: form.position,
          role: form.role,
          department_id: form.department_id,
          joined_at: form.joined_at,
        }),
      })
      const json = await res.json()
      if (!res.ok) { alert('수정 실패: ' + json.error); setSaving(false); return }
      setUsers(prev => prev.map(u => u.id === editingId ? { ...u, ...json.user } : u))
    }

    setSaving(false)
    closeModal()
    startTransition(() => router.refresh())
  }

  async function updateRole(userId: number, role: string) {
    const res = await fetch(`/api/admin/users/${userId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role }),
    })
    if (!res.ok) { alert('역할 변경 실패'); return }
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, role } : u))
    setEditingRole(null)
  }

  async function toggleActive(userId: number, current: boolean) {
    if (!confirm(current ? '계정을 비활성화하시겠습니까?' : '계정을 활성화하시겠습니까?')) return
    const res = await fetch(`/api/admin/users/${userId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: !current }),
    })
    if (!res.ok) { alert('변경 실패'); return }
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, is_active: !current } : u))
  }

  const inputCls = 'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400'

  return (
    <div>
      {/* 등록 버튼 */}
      <div className="flex justify-end mb-4">
        <button onClick={openCreate}
          className="flex items-center gap-1.5 bg-[#1A2744] text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-[#243560] transition-colors">
          <Plus size={14} /> 사용자 추가
        </button>
      </div>

      {/* 사용자 목록 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[820px]">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">이름 / 직책</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">부서</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">연락처</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">이메일</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500">역할</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500">상태</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500">관리</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {users.map(u => (
              <tr key={u.id} className={`hover:bg-gray-50 transition-colors ${!u.is_active ? 'opacity-50' : ''}`}>
                <td className="px-5 py-3.5">
                  <p className="font-semibold text-gray-900">{u.name}</p>
                  <p className="text-xs text-gray-400">{u.position || '-'}</p>
                </td>
                <td className="px-4 py-3.5 text-gray-600 text-xs">{deptName(u.department_id) ?? '-'}</td>
                <td className="px-4 py-3.5 text-gray-600 text-xs">{u.phone || '-'}</td>
                <td className="px-4 py-3.5 text-gray-600 text-xs">{u.email || '-'}</td>
                <td className="px-4 py-3.5 text-center">
                  {editingRole === u.id ? (
                    <div className="flex items-center gap-1 justify-center">
                      <select defaultValue={u.role}
                        onChange={e => updateRole(u.id, e.target.value)}
                        className="text-xs border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-400">
                        {ROLES.map(r => <option key={r} value={r}>{ROLE_LABEL[r]}</option>)}
                      </select>
                      <button onClick={() => setEditingRole(null)} className="text-gray-400 hover:text-gray-600">
                        <X size={12} />
                      </button>
                    </div>
                  ) : (
                    <button onClick={() => setEditingRole(u.id)}
                      className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded ${ROLE_COLOR[u.role] ?? 'bg-gray-100 text-gray-600'}`}>
                      {ROLE_LABEL[u.role] ?? u.role}
                      <ChevronDown size={10} />
                    </button>
                  )}
                </td>
                <td className="px-4 py-3.5 text-center">
                  <button onClick={() => toggleActive(u.id, u.is_active)}
                    className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded ${
                      u.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                    }`}>
                    {u.is_active ? <UserCheck size={11} /> : <UserX size={11} />}
                    {u.is_active ? '활성' : '비활성'}
                  </button>
                </td>
                <td className="px-4 py-3.5 text-right">
                  <button onClick={() => openEdit(u)}
                    className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-blue-600 hover:bg-blue-50 px-2 py-1 rounded transition-colors">
                    <Pencil size={11} /> 수정
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
        {users.length === 0 && (
          <div className="text-center py-12 text-gray-400 text-sm">등록된 사용자가 없습니다</div>
        )}
      </div>

      {/* 사용자 등록/수정 모달 (통합) */}
      {modalMode && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="font-bold text-gray-900">
                {modalMode === 'create' ? '사용자 추가' : '사용자 수정'}
              </h2>
              <button onClick={closeModal}><X size={18} className="text-gray-400" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">이름 *</label>
                  <input value={form.name} onChange={e => f('name', e.target.value)} className={inputCls} />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">직책</label>
                  <input value={form.position} onChange={e => f('position', e.target.value)} placeholder="예: 과장" className={inputCls} />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1 block">연락처</label>
                <input value={form.phone} onChange={e => f('phone', e.target.value)} placeholder="010-0000-0000" className={inputCls} />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1 block">Google 이메일 *</label>
                <input type="email" value={form.email} onChange={e => f('email', e.target.value)}
                  placeholder="name@gmail.com" className={inputCls} />
                <p className="text-[11px] text-gray-400 mt-1">이 이메일로 Google 로그인 시 자동 매칭됩니다.</p>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1 block">소속 부서</label>
                <select value={form.department_id} onChange={e => f('department_id', e.target.value)} className={inputCls}>
                  <option value="">미배정</option>
                  {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">역할 *</label>
                  <select value={form.role} onChange={e => f('role', e.target.value)} className={inputCls}>
                    {ROLES.map(r => <option key={r} value={r}>{ROLE_LABEL[r]}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">입사일</label>
                  <input type="date" value={form.joined_at} onChange={e => f('joined_at', e.target.value)} className={inputCls} />
                </div>
              </div>
            </div>
            <div className="p-5 border-t border-gray-100">
              <button onClick={submitForm} disabled={saving}
                className="w-full flex items-center justify-center gap-2 bg-[#1A2744] text-white font-semibold py-2.5 rounded-xl hover:bg-[#243560] transition-colors disabled:opacity-50">
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Shield size={14} />}
                {saving ? '저장 중...' : modalMode === 'create' ? '계정 생성' : '저장'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
