import { type ClassValue, clsx } from 'clsx'

export function cn(...inputs: ClassValue[]) {
  return inputs.filter(Boolean).join(' ')
}

export function calcDelayDays(dueDateStr: string): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const due = new Date(dueDateStr)
  due.setHours(0, 0, 0, 0)
  return Math.floor((today.getTime() - due.getTime()) / (1000 * 60 * 60 * 24))
}

export function calcDaysUntil(dueDateStr: string): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const due = new Date(dueDateStr)
  due.setHours(0, 0, 0, 0)
  return Math.floor((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
}

export function getPriorityColor(priority: string) {
  if (priority === 'high') return 'text-red-600 bg-red-50 border-red-200'
  if (priority === 'medium') return 'text-yellow-700 bg-yellow-50 border-yellow-200'
  return 'text-blue-600 bg-blue-50 border-blue-200'
}

export function getStatusColor(status: string) {
  switch (status) {
    case '지연': case '만료': return 'bg-red-100 text-red-700'
    case '진행중': case '임박': return 'bg-yellow-100 text-yellow-700'
    case '완료': return 'bg-green-100 text-green-700'
    case '보류': return 'bg-gray-100 text-gray-600'
    default: return 'bg-gray-100 text-gray-600'
  }
}
