import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * Google OAuth 콜백 처리
 *
 * 흐름:
 * 1. Supabase가 code 파라미터와 함께 이 경로로 리다이렉트
 * 2. code를 세션으로 교환 (auth.users에 row 생성/갱신)
 * 3. public.users에서 email 매칭
 *    - 있으면: auth_user_id 연결
 *    - 없으면: staff 역할로 신규 생성
 * 4. /dashboard로 리다이렉트
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
  const googleFullName =
    (authUser.user_metadata?.full_name as string | undefined) ??
    (authUser.user_metadata?.name as string | undefined) ??
    email?.split('@')[0] ??
    '신규 사용자'

  if (!email) {
    return NextResponse.redirect(`${origin}/login?error=no_email`)
  }

  // 2. public.users에서 email 매칭
  const { data: existingUser } = await supabase
    .from('users')
    .select('id, auth_user_id, is_active')
    .eq('email', email)
    .maybeSingle()

  if (existingUser) {
    // 기존 사용자: auth_user_id 비어있으면 연결
    if (!existingUser.auth_user_id) {
      await supabase
        .from('users')
        .update({ auth_user_id: authUserId })
        .eq('id', existingUser.id)
    }

    // 비활성 계정 차단
    if (!existingUser.is_active) {
      await supabase.auth.signOut()
      return NextResponse.redirect(`${origin}/login?error=inactive`)
    }
  } else {
    // 신규 사용자: staff 역할로 자동 생성
    const { error: insertError } = await supabase.from('users').insert({
      name: googleFullName,
      email,
      auth_user_id: authUserId,
      role: 'staff',
      is_active: true,
      joined_at: new Date().toISOString().split('T')[0],
    })

    if (insertError) {
      console.error('[auth/callback] User creation failed:', insertError)
      // 이메일 중복 등 예외 시에도 로그인 세션은 유지 — 후속 대응은 admin이
    }
  }

  return NextResponse.redirect(`${origin}${next}`)
}
