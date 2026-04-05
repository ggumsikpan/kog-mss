import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/auth/getUser'
import WorklogClient from './WorklogClient'
import {
  SAMPLE_WORK_LOGS, SAMPLE_USERS, SAMPLE_DEPARTMENTS, SAMPLE_ATTENDANCE,
} from '@/lib/sample-data'

export default async function WorklogsPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()
  const currentUser = await getCurrentUser()
  const role = currentUser?.role ?? 'employee'
  const isSample = currentUser?.is_sample ?? false
  const today = new Date().toISOString().split('T')[0]
  const targetDate = params.date || today

  let logs: any[]
  let users: any[]
  let departments: any[]
  let attendance: any[]

  if (isSample) {
    logs = SAMPLE_WORK_LOGS.map((l: any) => ({
      ...l,
      title: l.title ?? '',
      log_type: l.log_type ?? '정기업무',
      description: l.description ?? '',
      is_planned: l.is_planned ?? true,
      note: l.note ?? '',
    }))
    users = SAMPLE_USERS
    departments = SAMPLE_DEPARTMENTS
    attendance = SAMPLE_ATTENDANCE
  } else {
    const [
      { data: logsData },
      { data: usersData },
      { data: departmentsData },
      { data: attendanceData },
    ] = await Promise.all([
      supabase
        .from('work_logs')
        .select('*, users(name, position, departments(name))')
        .eq('log_date', targetDate)
        .order('created_at', { ascending: true }),
      supabase
        .from('users')
        .select('id, name, position, department_id, departments(name)')
        .eq('is_active', true)
        .order('name'),
      supabase
        .from('departments')
        .select('id, name')
        .order('name'),
      supabase
        .from('attendance_records')
        .select('id, user_id, date, type, note')
        .eq('date', targetDate),
    ])
    logs = logsData ?? []
    users = usersData ?? []
    departments = departmentsData ?? []
    attendance = attendanceData ?? []
  }

  // 미작성자: 오늘 로그가 없는 직원
  const submittedUserIds = new Set(logs.map((l: any) => l.user_id))
  const nonSubmitters = users.filter((u: any) => !submittedUserIds.has(u.id))

  const total = logs.length
  const done  = logs.filter((l: any) => l.achieved).length
  const pct   = total > 0 ? Math.round(done / total * 100) : 0

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-black text-gray-900">업무일지 · 근태</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {targetDate === today ? '오늘' : targetDate} ·{' '}
            {total > 0
              ? <span>달성 <strong className={pct >= 80 ? 'text-green-600' : pct >= 60 ? 'text-yellow-600' : 'text-red-600'}>{done}/{total}건 ({pct}%)</strong></span>
              : '등록된 업무 없음'
            }
          </p>
        </div>
      </div>

      <WorklogClient
        logs={logs}
        users={users}
        departments={departments}
        attendance={attendance}
        nonSubmitters={nonSubmitters}
        targetDate={targetDate}
        today={today}
        role={role}
        isSample={isSample}
      />
    </div>
  )
}
