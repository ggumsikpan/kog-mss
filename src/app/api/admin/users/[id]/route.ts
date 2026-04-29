import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/auth/getUser'

async function assertAdmin() {
  const user = await getCurrentUser()
  return user?.role === 'admin' && !user.is_sample
}

// 역할/활성화/직책/부서 수정
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await assertAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id } = await params
  const body = await request.json()

  const updates: Record<string, unknown> = {}
  if (body.role          !== undefined) updates.role          = body.role
  if (body.is_active     !== undefined) updates.is_active     = body.is_active
  if (body.position      !== undefined) updates.position      = body.position
  if (body.name          !== undefined) updates.name          = body.name
  if (body.phone         !== undefined) updates.phone         = body.phone
  if (body.email         !== undefined) updates.email         = body.email
  if (body.department_id !== undefined) {
    updates.department_id = body.department_id ? parseInt(body.department_id) : null
  }
  if (body.joined_at     !== undefined) updates.joined_at = body.joined_at || null

  const supabase = await createClient()
  const { data, error } = await supabase.from('users').update(updates).eq('id', id).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  return NextResponse.json({ user: data })
}

// PUT (비밀번호 재설정) — Google OAuth 전환 후 폐기
export async function PUT() {
  return NextResponse.json({
    error: '비밀번호 재설정은 Google 계정으로 전환되어 사용할 수 없습니다. Google 계정 비밀번호는 Google에서 관리됩니다.',
  }, { status: 410 })
}
