'use client'
import { X, CheckCircle2, AlertCircle, Info } from 'lucide-react'
import { useToastStore } from '@/lib/toast-store'

export default function ToastStack() {
  const { toasts, dismiss } = useToastStore()
  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-6 right-6 z-[200] flex flex-col gap-2 items-end" style={{ pointerEvents: 'none' }}>
      {toasts.map(t => {
        const color = t.type === 'success' ? '#059669' : t.type === 'error' ? '#dc2626' : '#2563eb'
        const bg = t.type === 'success' ? '#ecfdf5' : t.type === 'error' ? '#fef2f2' : '#eff6ff'
        const border = t.type === 'success' ? '#a7f3d0' : t.type === 'error' ? '#fecaca' : '#bfdbfe'
        const Icon = t.type === 'success' ? CheckCircle2 : t.type === 'error' ? AlertCircle : Info

        return (
          <div
            key={t.id}
            className={t.leaving ? 'animate-toast-out' : 'animate-toast-in'}
            style={{
              pointerEvents: 'auto',
              background: bg,
              border: `1px solid ${border}`,
              borderLeft: `3px solid ${color}`,
              borderRadius: 10,
              padding: '10px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              minWidth: 240,
              maxWidth: 340,
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            }}
          >
            <Icon style={{ color, width: 16, height: 16, flexShrink: 0 }} />
            <span style={{ fontSize: 13, fontWeight: 500, color: '#1e293b', flex: 1, lineHeight: 1.4 }}>
              {t.message}
            </span>
            <button onClick={() => dismiss(t.id)} style={{ color: '#94a3b8', display: 'flex', flexShrink: 0 }}>
              <X style={{ width: 14, height: 14 }} />
            </button>
          </div>
        )
      })}
    </div>
  )
}
