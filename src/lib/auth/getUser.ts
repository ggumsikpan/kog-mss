import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'

export type UserRole = 'admin' | 'manager' | 'employee'

export interface CurrentUser {
  id: number
  name: string
  position: string
  role: UserRole
  department_id: number
  is_sample: boolean
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  departments?: any
}

const SAMPLE_USER: CurrentUser = {
  id: 0,
  name: '데모 사용자',
  position: '관리자',
  role: 'admin',
  department_id: 4,
  is_sample: true,
  departments: { name: '관리부' },
}

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const cookieStore = await cookies()
  if (cookieStore.get('kog_demo')?.value === '1') {
    return SAMPLE_USER
  }

  const supabase = await createClient()
  const { data: { user: authUser } } = await supabase.auth.getUser()
  if (!authUser) return null

  const { data } = await supabase
    .from('users')
    .select('id, name, position, role, department_id, is_sample, departments(name)')
    .eq('auth_id', authUser.id)
    .eq('is_active', true)
    .single()

  return data ?? null
}
