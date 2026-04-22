'use client'
import { useState } from 'react'
import { Send, AlertCircle } from 'lucide-react'
import type { POComment } from '@/lib/types'
import { useUserStore } from '@/lib/store'
import { formatDate } from '@/lib/utils'
import { ROLE_ACCENT } from '@/lib/constants'

interface Props {
  poId: string
  comments: POComment[]
  onComment: (c: POComment) => void
}

export default function CommentThread({ poId, comments, onComment }: Props) {
  const { name, role } = useUserStore()
  const [body, setBody] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')

  async function handleSend() {
    if (!body.trim()) return
    setSending(true)
    setError('')
    try {
      const res = await fetch(`/api/purchase-orders/${poId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ author_name: name, author_role: role, body: body.trim() }),
      })
      if (res.ok) {
        onComment(await res.json())
        setBody('')
      } else {
        const d = await res.json()
        setError(d.error ?? 'Failed to send message. Try again.')
      }
    } catch {
      setError('Network error. Check your connection and try again.')
    } finally {
      setSending(false)
    }
  }

  return (
    <div>
      <h3 className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: 'var(--text-muted)' }}>
        Thread
      </h3>

      <div className="space-y-4 mb-5">
        {comments.length === 0 && (
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No messages yet.</p>
        )}
        {comments.map(c => {
          const accent = ROLE_ACCENT[c.author_role] ?? '#475569'
          return (
            <div key={c.id} className="flex gap-3">
              <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-white text-xs font-bold"
                style={{ background: accent }}>
                {c.author_name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2 mb-0.5">
                  <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                    {c.author_name.split(' ')[0]}
                  </span>
                  <span className="text-xs px-1.5 py-px rounded" style={{ background: accent + '18', color: accent }}>
                    {c.author_role}
                  </span>
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{formatDate(c.created_at)}</span>
                </div>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{c.body}</p>
              </div>
            </div>
          )
        })}
      </div>

      {error && (
        <div className="flex items-center gap-2 text-xs px-3 py-2 rounded-lg mb-3"
          style={{ background: 'var(--red-light)', border: '1px solid #fecaca', color: 'var(--red)' }}>
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          {error}
        </div>
      )}

      <div className="flex gap-2 items-end">
        <div className="flex-1">
          <textarea
            value={body}
            onChange={e => setBody(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSend() }}
            placeholder="Add a note… ⌘↵ to send"
            rows={2}
            className="w-full text-sm rounded-lg px-3 py-2.5 resize-none focus:outline-none transition-all"
            style={{ border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-primary)' }}
          />
        </div>
        <button
          onClick={handleSend}
          disabled={!body.trim() || sending}
          className="w-9 h-9 rounded-lg flex items-center justify-center transition-all flex-shrink-0"
          style={{
            background: body.trim() ? 'var(--navy)' : 'var(--border)',
            color: body.trim() ? 'white' : 'var(--text-muted)',
            cursor: body.trim() ? 'pointer' : 'not-allowed',
          }}
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )
}
