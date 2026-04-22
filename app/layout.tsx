import type { Metadata } from 'next'
import './globals.css'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import UserSwitcher from '@/components/UserSwitcher'
import NotificationBell from '@/components/NotificationBell'
import ThemeToggle from '@/components/ThemeToggle'
import ToastStack from '@/components/Toast'
import KeyboardShortcuts from '@/components/KeyboardShortcuts'
import CommandPalette from '@/components/CommandPalette'

export const metadata: Metadata = {
  title: 'Convoy',
  description: 'Vehicle onboarding workflow — replace Slack with structured stages',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700;800&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
        <script dangerouslySetInnerHTML={{ __html: `try{var t=localStorage.getItem('po-board-theme');document.documentElement.setAttribute('data-theme',t||'light')}catch(e){}` }} />
      </head>
      <body>
        {/* Top bar */}
        <header className="sticky top-0 z-50" style={{
          background: 'var(--navy)',
          borderBottom: '1px solid rgba(255,255,255,0.04)',
          boxShadow: '0 1px 0 rgba(255,255,255,0.03), 0 4px 20px rgba(0,0,0,0.3)',
        }}>
          {/* Accent stripe */}
          <div style={{ height: 2, background: 'linear-gradient(90deg, var(--accent) 0%, #fbbf24 50%, transparent 100%)' }} />
          <div className="max-w-screen-xl mx-auto px-6 h-13 flex items-center justify-between gap-6" style={{ height: 52 }}>
            {/* Wordmark */}
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'var(--blue)' }}>
                {/* Convoy logo: 3 chevrons = convoy moving through stages */}
                <svg width="18" height="14" viewBox="0 0 18 14" fill="none">
                  <path d="M1 7L4.5 2V12L1 7Z" fill="white" fillOpacity="0.35"/>
                  <path d="M6 7L10.5 1.5V12.5L6 7Z" fill="white" fillOpacity="0.9"/>
                  <path d="M12 7L16 3.5V10.5L12 7Z" fill="white" fillOpacity="0.55"/>
                </svg>
              </div>
              <div>
                <span className="text-white font-bold text-base tracking-tight leading-none" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  Convoy
                </span>
                <span className="block text-xs leading-none" style={{ color: 'rgba(255,255,255,0.3)', fontSize: 10 }}>
                  Vehicle Onboarding
                </span>
              </div>
            </Link>

            <div className="flex items-center gap-4">
              <Link href="/dealers"
                className="text-sm font-medium transition-opacity hover:opacity-80"
                style={{ color: 'rgba(255,255,255,0.45)' }}>
                Dealers
              </Link>

              <button
                id="cmd-palette-trigger"
                className="hidden md:flex items-center gap-2 text-xs px-2.5 py-1.5 rounded-md transition-all hover:opacity-70"
                style={{ color: 'rgba(255,255,255,0.3)', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)' }}>
                <span>⌘K</span>
              </button>

              <ThemeToggle />
              <NotificationBell />
              <UserSwitcher />

              <Link
                href="/po/new"
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all hover:brightness-110 active:scale-95"
                style={{ background: 'var(--blue)', color: 'white', letterSpacing: '-0.01em' }}
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

        <ToastStack />
        <KeyboardShortcuts />
        <CommandPalette />
      </body>
    </html>
  )
}
