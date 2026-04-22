'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Plus, LayoutDashboard, Users, X } from 'lucide-react'

interface Command {
  label: string
  hint?: string
  icon: React.ReactNode
  action: () => void
}

export default function CommandPalette() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(0)
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)

  const commands: Command[] = [
    {
      label: 'Go to Board',
      hint: 'B',
      icon: <LayoutDashboard style={{ width: 15, height: 15 }} />,
      action: () => router.push('/'),
    },
    {
      label: 'New Purchase Order',
      hint: 'N',
      icon: <Plus style={{ width: 15, height: 15 }} />,
      action: () => router.push('/po/new'),
    },
    {
      label: 'Dealers',
      hint: 'D',
      icon: <Users style={{ width: 15, height: 15 }} />,
      action: () => router.push('/dealers'),
    },
  ]

  const filtered = query.trim()
    ? commands.filter(c => c.label.toLowerCase().includes(query.toLowerCase()))
    : commands

  useEffect(() => {
    const open_ = () => { setOpen(true); setQuery(''); setSelected(0) }
    const close_ = () => setOpen(false)
    window.addEventListener('convoy:open-palette', open_)
    window.addEventListener('convoy:close-palette', close_)
    document.getElementById('cmd-palette-trigger')?.addEventListener('click', open_)
    return () => {
      window.removeEventListener('convoy:open-palette', open_)
      window.removeEventListener('convoy:close-palette', close_)
    }
  }, [])

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 30)
  }, [open])

  useEffect(() => { setSelected(0) }, [query])

  function execute(cmd: Command) {
    setOpen(false)
    cmd.action()
  }

  function onKey(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') { e.preventDefault(); setSelected(s => Math.min(s + 1, filtered.length - 1)) }
    if (e.key === 'ArrowUp') { e.preventDefault(); setSelected(s => Math.max(s - 1, 0)) }
    if (e.key === 'Enter' && filtered[selected]) execute(filtered[selected])
    if (e.key === 'Escape') setOpen(false)
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[300] flex items-start justify-center pt-[15vh] animate-overlay-in"
      style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(3px)' }}
      onClick={() => setOpen(false)}
    >
      <div
        className="animate-palette-in w-full rounded-2xl overflow-hidden"
        style={{
          maxWidth: 520,
          background: 'var(--card)',
          border: '1px solid var(--border)',
          boxShadow: '0 24px 60px rgba(0,0,0,0.25)',
          margin: '0 16px',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3.5" style={{ borderBottom: '1px solid var(--border)' }}>
          <Search style={{ width: 16, height: 16, color: 'var(--text-muted)', flexShrink: 0 }} />
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={onKey}
            placeholder="Search commands…"
            className="flex-1 text-sm bg-transparent outline-none"
            style={{ color: 'var(--text-primary)' }}
          />
          {query && (
            <button onClick={() => setQuery('')} style={{ color: 'var(--text-muted)' }}>
              <X style={{ width: 14, height: 14 }} />
            </button>
          )}
          <kbd className="text-xs px-1.5 py-0.5 rounded" style={{ background: 'var(--surface)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
            esc
          </kbd>
        </div>

        {/* Commands */}
        <div className="py-2">
          {filtered.length === 0 ? (
            <div className="px-4 py-6 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
              No commands found
            </div>
          ) : (
            filtered.map((cmd, i) => (
              <button
                key={cmd.label}
                onClick={() => execute(cmd)}
                onMouseEnter={() => setSelected(i)}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-left transition-all"
                style={{
                  background: selected === i ? 'var(--accent)' : 'transparent',
                  color: selected === i ? '#1a0a00' : 'var(--text-primary)',
                }}
              >
                <span style={{ color: selected === i ? '#1a0a00' : 'var(--text-muted)', opacity: 0.8 }}>
                  {cmd.icon}
                </span>
                <span className="flex-1 text-sm font-medium">{cmd.label}</span>
                {cmd.hint && (
                  <kbd className="text-xs px-1.5 py-0.5 rounded font-mono"
                    style={{
                      background: selected === i ? 'rgba(0,0,0,0.1)' : 'var(--surface)',
                      color: selected === i ? '#1a0a00' : 'var(--text-muted)',
                      border: `1px solid ${selected === i ? 'rgba(0,0,0,0.15)' : 'var(--border)'}`,
                    }}>
                    {cmd.hint}
                  </kbd>
                )}
              </button>
            ))
          )}
        </div>

        {/* Footer hint */}
        <div className="px-4 py-2.5 flex gap-4 text-xs" style={{ borderTop: '1px solid var(--border)', color: 'var(--text-muted)' }}>
          <span><kbd className="font-mono">↑↓</kbd> navigate</span>
          <span><kbd className="font-mono">↵</kbd> open</span>
          <span><kbd className="font-mono">⌘K</kbd> toggle</span>
        </div>
      </div>
    </div>
  )
}
