import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * Google OAuth 콜백 처리 (화이트리스트 모드)
 *
 * 흐름:
 * 1. Supabase가 code 파라미터와 함께 이 경로로 리다이렉트
 * 2. code를 세션으로 교환 (auth.users에 row 생성/갱신)
 * 3. public.users에서 email 매칭
 *    - 있고 활성: auth_user_id 연결 후 dashboard 이동
 *    - 있고 비활성: 로그아웃 + 에러
 *    - 없음: 로그아웃 + 등록 안 됨 에러 (자동 생성 안 함)
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=missing_code`)
  }

  const supabase = await createClient()

  // 1. code → session 교환
  const { data: sessionData, error: sessionError } =
    await supabase.auth.exchangeCodeForSession(code)

  if (sessionError || !sessionData.user) {
    console.error('[auth/callback] Session exchange failed:', sessionError)
    return NextResponse.redirect(`${origin}/login?error=session_exchange`)
  }

  const authUser = sessionData.user
  const email = authUser.email
  const authUserId = authUser.id

  if (!email) {
    await supabase.auth.signOut()
    return NextResponse.redirect(`${origin}/login?error=no_email`)
  }

  // 2. public.users에서 email 매칭 (화이트리스트)
  const { data: existingUser } = await supabase
    .from('users')
    .select('id, auth_user_id, is_active')
    .eq('email', email)
    .maybeSingle()

  // ✗ 등록되지 않은 이메일 → 로그아웃 + 차단
  if (!existingUser) {
    await supabase.auth.signOut()
    return NextResponse.redirect(
      `${origin}/login?error=not_registered&email=${encodeURIComponent(email)}`
    )
  }

  // ✗ 비활성화된 계정 → 로그아웃 + 차단
  if (!existingUser.is_active) {
    await supabase.auth.signOut()
    return NextResponse.redirect(
      `${origin}/login?error=inactive&email=${encodeURIComponent(email)}`
    )
  }

  // ✓ 활성 사용자: auth_user_id 연결 (아직 없으면)
  if (!existingUser.auth_user_id) {
    await supabase
      .from('users')
      .update({ auth_user_id: authUserId })
      .eq('id', existingUser.id)
  }

  return NextResponse.redirect(`${origin}${next}`)
}
