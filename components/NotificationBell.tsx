'use client'
import { useState, useRef, useEffect } from 'react'
import { Bell, X, CheckCheck, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { useNotifStore, type Notification } from '@/lib/notifications'
import { useUserStore } from '@/lib/store'
import { formatDate } from '@/lib/utils'

const ROLE_ACCENT: Record<string, string> = {
  partnership: '#7c3aed',
  finance: '#2563eb',
  pricing: '#ca8a04',
  ops: '#059669',
  tech: '#dc2626',
  admin: '#475569',
}

const TYPE_ICON: Record<string, string> = {
  stage_advanced: '→',
  stage_idle: '⏱',
  comment: '💬',
  info: 'ℹ',
}

function NotifRow({ n, onClose }: { n: Notification; onClose: () => void }) {
  const { markRead } = useNotifStore()
  const accent = ROLE_ACCENT[n.forTeam] ?? '#475569'
  const isUnread = !n.readAt

  return (
    <Link
      href={`/po/${n.poId}`}
      onClick={() => { markRead(n.id); onClose() }}
      className="block px-4 py-3 transition-colors hover:bg-gray-50"
      style={{ borderBottom: '1px solid var(--border)', background: isUnread ? '#f8faff' : 'transparent' }}
    >
      <div className="flex gap-3">
        <div
          className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-sm font-bold"
          style={{ background: accent + '22', color: accent }}
        >
          {TYPE_ICON[n.type]}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-semibold leading-tight" style={{ color: 'var(--text-primary)' }}>
              {n.title}
            </p>
            {isUnread && (
              <div className="w-2 h-2 rounded-full flex-shrink-0 mt-1" style={{ background: accent }} />
            )}
          </div>
          <p className="text-xs mt-0.5 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            {n.body}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <span className="mono text-xs" style={{ color: 'var(--text-muted)' }}>{n.poNumber}</span>
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>·</span>
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{formatDate(n.createdAt)}</span>
          </div>
        </div>
      </div>
    </Link>
  )
}

export default function NotificationBell() {
  const { role } = useUserStore()
  const { notifications, markAllRead, clear } = useNotifStore()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // Filter to this role's notifications
  const mine = notifications.filter(n => n.forTeam === role || n.forTeam === 'admin')
  const unread = mine.filter(n => !n.readAt)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(p => !p)}
        className="relative w-8 h-8 flex items-center justify-center rounded-lg transition-colors"
        style={{ background: open ? 'rgba(255,255,255,0.15)' : 'transparent', color: 'rgba(255,255,255,0.7)' }}
      >
        <Bell className="w-4 h-4" />
        {unread.length > 0 && (
          <span
            className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full text-white flex items-center justify-center font-bold"
            style={{ background: '#dc2626', fontSize: 9 }}
          >
            {unread.length > 9 ? '9+' : unread.length}
          </span>
        )}
      </button>

      {open && (
        <div
          className="absolute right-0 top-10 w-80 rounded-xl overflow-hidden z-50"
          style={{
            background: 'var(--card)',
            border: '1px solid var(--border)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.14)',
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3"
            style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}>
            <div className="flex items-center gap-2">
              <Bell className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
              <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                Notifications
              </span>
              {unread.length > 0 && (
                <span className="text-xs px-1.5 py-0.5 rounded-full font-medium"
                  style={{ background: '#eff6ff', color: 'var(--blue)' }}>
                  {unread.length} new
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {unread.length > 0 && (
                <button
                  onClick={() => markAllRead(role)}
                  className="p-1.5 rounded-md transition-colors hover:bg-gray-100"
                  title="Mark all read"
                  style={{ color: 'var(--text-muted)' }}
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-md transition-colors hover:bg-gray-100"
                style={{ color: 'var(--text-muted)' }}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* List */}
          <div style={{ maxHeight: 360, overflowY: 'auto' }}>
            {mine.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <Bell className="w-6 h-6 mx-auto mb-2" style={{ color: 'var(--border)' }} />
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No notifications yet</p>
              </div>
            ) : (
              mine.map(n => <NotifRow key={n.id} n={n} onClose={() => setOpen(false)} />)
            )}
          </div>

          {/* Footer */}
          {mine.length > 0 && (
            <div className="px-4 py-2.5 flex items-center justify-between"
              style={{ borderTop: '1px solid var(--border)', background: 'var(--surface)' }}>
              <button
                onClick={clear}
                className="text-xs transition-colors hover:opacity-60"
                style={{ color: 'var(--text-muted)' }}
              >
                Clear all
              </button>
              <Link
                href="/"
                onClick={() => setOpen(false)}
                className="text-xs flex items-center gap-1 font-medium"
                style={{ color: 'var(--blue)' }}
              >
                View board <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
