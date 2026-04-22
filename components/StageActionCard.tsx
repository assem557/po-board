'use client'
import { useState } from 'react'
import { Upload, ArrowRight, Lock, AlertCircle, Sparkles } from 'lucide-react'
import { getStage } from '@/lib/stages'
import { useUserStore } from '@/lib/store'
import { useNotifStore, STAGE_NEXT_TEAM, STAGE_NEXT_LABEL } from '@/lib/notifications'
import { ROLE_ACCENT } from '@/lib/constants'

interface Props {
  poId: string
  currentStage: number
  isExistingDealer: boolean
  onAdvanced: () => void
}

export default function StageActionCard({ poId, currentStage, isExistingDealer, onAdvanced }: Props) {
  const { name, role } = useUserStore()
  const stage = getStage(currentStage)
  const [notes, setNotes] = useState('')
  const [docName, setDocName] = useState('')
  const [checkedBoxes, setCheckedBoxes] = useState<Record<string, boolean>>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (currentStage >= 8) {
    return (
      <div className="rounded-xl p-6 text-center" style={{ background: 'var(--green-light)', border: '1px solid #a7f3d0' }}>
        <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3" style={{ background: '#059669' }}>
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <h3 className="font-semibold text-base" style={{ color: '#064e3b' }}>PO Complete</h3>
        <p className="text-sm mt-1" style={{ color: '#065f46' }}>All stages done. Vehicles are live on the platform.</p>
      </div>
    )
  }

  const { add: addNotif } = useNotifStore()
  const accent = ROLE_ACCENT[stage.team] ?? '#475569'
  const isMyStage = role === stage.team || role === 'admin'
  const checkboxes = stage.requiresCheckboxes ?? []
  const effectiveCheckboxes = stage.number === 6 && isExistingDealer ? [] : checkboxes

  function canAdvance(): boolean {
    if (!isMyStage) return false
    if (stage.requiresDocument && !docName) return false
    if (stage.requiresNote && !notes.trim()) return false
    for (const cb of effectiveCheckboxes) if (!checkedBoxes[cb]) return false
    return true
  }

  async function handleAdvance() {
    if (!canAdvance()) { setError(stage.gateLabel); return }
    setError('')
    setLoading(true)
    try {
      const res = await fetch(`/api/purchase-orders/${poId}/advance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          completedBy: { name, role },
          notes,
          document_name: docName || undefined,
          document_url: docName ? '#uploaded' : undefined,
        }),
      })
      if (!res.ok) {
        const d = await res.json()
        setError(d.error ?? 'Failed to advance stage')
      } else {
        const updated = await res.json()
        const nextTeam = STAGE_NEXT_TEAM[stage.number]
        const nextLabel = STAGE_NEXT_LABEL[stage.number]
        if (nextTeam) {
          addNotif({
            type: 'stage_advanced',
            title: `Stage ${stage.number} complete — ${stage.title}`,
            body: nextLabel,
            poId,
            poNumber: updated.po_number,
            dealerName: updated.dealer_name,
            forTeam: nextTeam,
          })
        }
        onAdvanced()
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-xl overflow-hidden"
      style={{ border: `1px solid ${isMyStage ? accent + '44' : 'var(--border)'}`, background: 'var(--card)' }}>
      <div className="px-5 pt-5 pb-4" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                style={{ background: accent + '18', color: accent, border: `1px solid ${accent}33` }}>
                {stage.teamLabel}
              </span>
              <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>Stage {currentStage}/7</span>
            </div>
            <h3 className="font-semibold text-base" style={{ color: 'var(--text-primary)' }}>{stage.title}</h3>
            <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>{stage.description}</p>
          </div>
          {!isMyStage && <Lock className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--text-muted)' }} />}
        </div>
      </div>

      <div className="px-5 py-4 space-y-4">
        {!isMyStage && (
          <div className="flex items-center gap-2 text-sm px-3 py-2.5 rounded-lg"
            style={{ background: 'var(--amber-light)', border: '1px solid #fde68a', color: '#92400e' }}>
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            Assigned to <strong>{stage.teamLabel}</strong>. Switch your role above to take action.
          </div>
        )}

        {effectiveCheckboxes.length > 0 && (
          <div className="space-y-2">
            {effectiveCheckboxes.map(cb => (
              <button key={cb} onClick={() => isMyStage && setCheckedBoxes(p => ({ ...p, [cb]: !p[cb] }))}
                disabled={!isMyStage} className="flex items-center gap-2.5 w-full text-left">
                <div className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0 transition-all"
                  style={{ background: checkedBoxes[cb] ? accent : 'transparent', border: `1.5px solid ${checkedBoxes[cb] ? accent : 'var(--border)'}` }}>
                  {checkedBoxes[cb] && (
                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                      <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{cb}</span>
              </button>
            ))}
          </div>
        )}

        {stage.requiresDocument && (
          <div>
            <label className="block text-xs font-semibold mb-2 uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>
              Document <span style={{ color: accent }}>*</span>
            </label>
            <label className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-sm cursor-pointer transition-all ${!isMyStage ? 'opacity-40 cursor-not-allowed' : ''}`}
              style={{
                borderStyle: docName ? 'solid' : 'dashed',
                borderColor: docName ? accent : 'var(--border)',
                background: docName ? accent + '08' : 'var(--surface)',
                color: docName ? accent : 'var(--text-muted)',
              }}>
              <Upload className="w-4 h-4 flex-shrink-0" />
              <span>{docName || 'Attach PO document…'}</span>
              <input type="file" className="hidden" disabled={!isMyStage}
                onChange={e => setDocName(e.target.files?.[0]?.name ?? '')} />
            </label>
          </div>
        )}

        {isMyStage && (
          <div>
            <label className="block text-xs font-semibold mb-2 uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>
              Notes {stage.requiresNote && <span style={{ color: accent }}>*</span>}
            </label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)}
              placeholder={stage.requiresNote ? 'Required — e.g. price amounts, confirmation details…' : 'Optional notes…'}
              rows={2}
              className="w-full text-sm rounded-lg px-3 py-2.5 resize-none focus:outline-none transition-all"
              style={{
                border: `1px solid ${notes ? accent + '55' : 'var(--border)'}`,
                background: 'var(--surface)',
                color: 'var(--text-primary)',
              }}
            />
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 text-sm px-3 py-2 rounded-lg"
            style={{ background: 'var(--red-light)', border: '1px solid #fecaca', color: 'var(--red)' }}>
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        <button onClick={handleAdvance} disabled={!isMyStage || loading}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all"
          style={{
            background: isMyStage && !loading ? accent : 'var(--border)',
            color: isMyStage && !loading ? 'white' : 'var(--text-muted)',
            cursor: isMyStage && !loading ? 'pointer' : 'not-allowed',
            opacity: loading ? 0.7 : 1,
          }}>
          {loading ? 'Saving…' : (<>Complete & pass to next team <ArrowRight className="w-4 h-4" /></>)}
        </button>
      </div>
    </div>
  )
}
