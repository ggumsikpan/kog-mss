'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Loader2, Building2, FlaskConical } from 'lucide-react'

const SAMPLE_EMAIL = 'sample@kog.com'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    // 샘플 계정 — Supabase 인증 생략
    if (email.trim().toLowerCase() === SAMPLE_EMAIL) {
      await fetch('/api/sample-login', { method: 'POST' })
      router.push('/dashboard')
      router.refresh()
      return
    }

    const supabase = createClient()
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password })

    if (authError) {
      setError('이메일 또는 비밀번호가 올바르지 않습니다.')
      setLoading(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  async function handleSampleLogin() {
    setLoading(true)
    await fetch('/api/sample-login', { method: 'POST' })
    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#f0f2f5' }}>
      <div className="w-full max-w-sm">
        {/* 로고 */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4" style={{ background: '#1A2744' }}>
            <Building2 size={28} className="text-white" />
          </div>
          <p className="text-xs font-semibold text-gray-400 tracking-widest uppercase mb-1">KOG International</p>
          <h1 className="text-xl font-black text-gray-900">경영관리 시스템</h1>
        </div>

        {/* 로그인 카드 */}
        <form onSubmit={handleLogin} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">이메일</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoFocus
              placeholder="your@email.com"
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">비밀번호</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required={email.trim().toLowerCase() !== SAMPLE_EMAIL}
              placeholder="••••••••"
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {error && (
            <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 text-white font-semibold py-2.5 rounded-xl transition-colors disabled:opacity-50"
            style={{ background: '#1A2744' }}
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : null}
            {loading ? '로그인 중...' : '로그인'}
          </button>
        </form>

        {/* 샘플 체험 버튼 */}
        <div className="mt-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400">또는</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>
          <button
            onClick={handleSampleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-amber-400 hover:bg-amber-500 text-amber-900 font-semibold text-sm py-2.5 rounded-xl transition-colors disabled:opacity-50"
          >
            <FlaskConical size={15} />
            샘플 데이터로 체험하기
          </button>
          <p className="text-center text-xs text-gray-400 mt-2">
            실제 데이터 없이 모든 기능을 미리 체험할 수 있습니다
          </p>
        </div>
      </div>
    </div>
  )
}
