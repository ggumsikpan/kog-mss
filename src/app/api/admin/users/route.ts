import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/auth/getUser'

async function assertAdmin() {
  const user = await getCurrentUser()
  return user?.role === 'admin' && !user.is_sample
}

// 사용자 생성 (Google OAuth 전환 후: 비밀번호 없이 이메일 선등록)
export async function POST(request: NextRequest) {
  if (!await assertAdmin()) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await request.json()

  if (!body.name || !body.email) {
    return NextResponse.json({ error: '이름과 이메일은 필수입니다.' }, { status: 400 })
  }

  const supabase = await createClient()
  const { data, error } = await supabase.from('users').insert([{
    name:          body.name,
    phone:         body.phone || null,
    email:         body.email,
    password_hash: null, // Google OAuth 사용 — 비밀번호 없음
    position:      body.position || null,
    role:          body.role || 'staff',
    department_id: body.department_id ? parseInt(body.department_id) : null,
    is_active:     true,
    joined_at:     body.joined_at || null,
  }]).select().single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ user: data })
}
