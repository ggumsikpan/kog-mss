'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Loader2, Building2, FlaskConical, AlertCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const ERROR_MESSAGES: Record<string, (email?: string) => string> = {
  not_registered: (email) =>
    email
      ? `${email}은(는) 등록되지 않은 계정입니다. 관리자에게 가입을 요청해주세요.`
      : '등록되지 않은 계정입니다. 관리자에게 가입을 요청해주세요.',
  inactive: (email) =>
    email
      ? `${email} 계정이 비활성화되어 있습니다. 관리자에게 문의해주세요.`
      : '비활성화된 계정입니다. 관리자에게 문의해주세요.',
  no_email: () => 'Google 계정에서 이메일 정보를 받지 못했습니다.',
  session_exchange: () => 'Google 인증 처리에 실패했습니다. 다시 시도해주세요.',
  missing_code: () => '인증 코드가 누락되었습니다. 다시 시도해주세요.',
}

function ErrorBanner() {
  const params = useSearchParams()
  const errorKey = params.get('error')
  const email = params.get('email') ?? undefined

  if (!errorKey) return null

  const builder = ERROR_MESSAGES[errorKey]
  const message = builder ? builder(email) : '로그인에 실패했습니다. 다시 시도해주세요.'

  return (
    <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2.5 mb-3">
      <AlertCircle size={14} className="text-red-500 flex-shrink-0 mt-0.5" />
      <p className="text-xs text-red-700 leading-relaxed">{message}</p>
    </div>
  )
}

function LoginContent() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleGoogleLogin() {
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    if (error) {
      setError(error.message || 'Google 로그인에 실패했습니다.')
      setLoading(false)
    }
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
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <Suspense fallback={null}>
            <ErrorBanner />
          </Suspense>

          <p className="text-center text-sm text-gray-600 mb-4">
            Google 계정으로 로그인하세요
          </p>

          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 font-semibold text-sm py-3 rounded-xl transition-colors disabled:opacity-50 shadow-sm"
          >
            {loading ? (
              <Loader2 size={18} className="animate-spin text-gray-500" />
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            )}
            {loading ? '로그인 중...' : 'Google 계정으로 로그인'}
          </button>

          {error && (
            <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2 mt-3">{error}</p>
          )}

          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-[11px] text-gray-400 leading-relaxed text-center">
              회사 등록된 Google 계정으로만 로그인 가능합니다.<br/>
              계정이 없으시면 관리자에게 등록을 요청해주세요.
            </p>
          </div>
        </div>

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

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <LoginContent />
    </Suspense>
  )
}
