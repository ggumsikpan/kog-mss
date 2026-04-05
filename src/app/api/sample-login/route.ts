import { NextResponse } from 'next/server'

export async function POST() {
  const res = NextResponse.json({ ok: true })
  res.cookies.set('kog_demo', '1', {
    path: '/',
    maxAge: 60 * 60 * 24, // 24시간
    httpOnly: false,
    sameSite: 'lax',
  })
  return res
}
