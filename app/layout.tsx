import type { Metadata } from 'next'
import './globals.css'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import UserSwitcher from '@/components/UserSwitcher'
import NotificationBell from '@/components/NotificationBell'
import ThemeToggle from '@/components/ThemeToggle'

export const metadata: Metadata = {
  title: 'PO Board',
  description: 'Vehicle onboarding workflow',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
        <script dangerouslySetInnerHTML={{ __html: `try{var t=localStorage.getItem('po-board-theme');document.documentElement.setAttribute('data-theme',t||'light')}catch(e){}` }} />
      </head>
      <body>
        {/* Top bar — dark navy command bar */}
        <header style={{ background: 'var(--navy)' }} className="sticky top-0 z-50">
          <div className="max-w-screen-xl mx-auto px-6 h-14 flex items-center justify-between gap-6">
            {/* Wordmark */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-7 h-7 rounded-md flex items-center justify-center" style={{ background: 'var(--blue)' }}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <rect x="1" y="1" width="5" height="5" rx="1" fill="white" fillOpacity="0.9"/>
                  <rect x="8" y="1" width="5" height="5" rx="1" fill="white" fillOpacity="0.5"/>
                  <rect x="1" y="8" width="5" height="5" rx="1" fill="white" fillOpacity="0.5"/>
                  <rect x="8" y="8" width="5" height="5" rx="1" fill="white" fillOpacity="0.9"/>
                </svg>
              </div>
              <span className="text-white font-semibold text-sm tracking-tight">PO Board</span>
              <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)' }}>
                Vehicle Onboarding
              </span>
            </Link>

            <div className="flex items-center gap-4">
              <Link href="/dealers"
                className="text-sm font-medium transition-opacity hover:opacity-70"
                style={{ color: 'rgba(255,255,255,0.5)' }}>
                Dealers
              </Link>
              <ThemeToggle />
              <NotificationBell />
              <UserSwitcher />
              <Link
                href="/po/new"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all"
                style={{ background: 'var(--blue)', color: 'white' }}
              >
                <Plus className="w-3.5 h-3.5" />
                New PO
              </Link>
            </div>
          </div>
        </header>

        <main className="max-w-screen-xl mx-auto px-6 py-7">
          {children}
        </main>
      </body>
    </html>
  )
}
