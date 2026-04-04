import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'KOG 경영관리 시스템',
  description: '코그 인터내셔널 전사적 경영관리 시스템',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className="h-full">
      <body className="min-h-full">{children}</body>
    </html>
  )
}
