import Link from 'next/link'
import { Plus, Activity, AlertTriangle } from 'lucide-react'
import POCard from '@/components/POCard'
import IdleChecker from '@/components/IdleChecker'
import { getAllPOs } from '@/lib/db'
import { STAGES } from '@/lib/stages'
import { daysSince } from '@/lib/utils'
import type { PurchaseOrder } from '@/lib/types'

export const dynamic = 'force-dynamic'

const STAGE_TEAM_ACCENT: Record<string, string> = {
  partnership: '#7c3aed',
  finance: '#2563eb',
  pricing: '#ca8a04',
  ops: '#059669',
  tech: '#dc2626',
  admin: '#475569',
}

export default async function HomePage() {
  const all = await getAllPOs()

  const grouped: Record<number, PurchaseOrder[]> = {}
  for (const s of STAGES) grouped[s.number] = []

  for (const po of all) {
    if (!grouped[po.current_stage]) grouped[po.current_stage] = []
    grouped[po.current_stage].push(po)
  }

  const active = all.filter(p => p.status !== 'complete')
  const complete = all.filter(p => p.status === 'complete')

  // POs idle for 24h+ (check against last stage completion or created_at)
  const idlePOs = all.filter(po => {
    if (po.status !== 'active' || po.current_stage >= 8) return false
    const last = [...(po.stage_completions ?? [])]
      .sort((a, b) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime())[0]
    const since = last ? daysSince(last.completed_at) : daysSince(po.created_at)
    return since >= 1
  })

  return (
    <div>
      <IdleChecker pos={all} />
      {/* Page header */}
      <div className="flex items-end justify-between mb-7">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Activity className="w-4 h-4" style={{ color: 'var(--blue)' }} />
            <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
              Operations
            </span>
          </div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
            Vehicle Onboarding
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
            {active.length} active · {complete.length} complete
            {idlePOs.length > 0 && (
              <span className="ml-2 inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full"
                style={{ background: '#fef3c7', color: '#92400e', border: '1px solid #fde68a' }}>
                <AlertTriangle className="w-3 h-3" />
                {idlePOs.length} idle
              </span>
            )}
          </p>
        </div>
        <Link
          href="/po/new"
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all hover:opacity-90"
          style={{ background: 'var(--navy)', color: 'white' }}
        >
          <Plus className="w-4 h-4" />
          New PO
        </Link>
      </div>

      {/* Kanban — horizontal scroll */}
      <div className="overflow-x-auto pb-6 -mx-1 px-1">
        <div className="flex gap-3" style={{ minWidth: 'max-content' }}>
          {STAGES.slice(0, 7).map(stage => {
            const cards = grouped[stage.number] ?? []
            const accent = STAGE_TEAM_ACCENT[stage.team]
            return (
              <div key={stage.number} className="w-60 flex-shrink-0 flex flex-col gap-3">
                {/* Column header */}
                <div
                  className="rounded-lg px-3 py-2.5"
                  style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full" style={{ background: accent }} />
                      <span className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>
                        S{stage.number}
                      </span>
                    </div>
                    {cards.length > 0 && (
                      <span
                        className="text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center"
                        style={{ background: accent + '18', color: accent }}
                      >
                        {cards.length}
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-semibold mt-1 leading-tight" style={{ color: 'var(--text-primary)' }}>
                    {stage.title}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                    {stage.teamLabel}
                  </p>
                </div>

                {/* Cards */}
                <div className="space-y-2.5">
                  {cards.length === 0 ? (
                    <div
                      className="rounded-xl h-20 flex items-center justify-center text-xs"
                      style={{ border: '1.5px dashed var(--border)', color: 'var(--text-muted)' }}
                    >
                      Empty
                    </div>
                  ) : (
                    cards.map(po => <POCard key={po.id} po={po} />)
                  )}
                </div>
              </div>
            )
          })}

          {/* Complete column */}
          <div className="w-60 flex-shrink-0 flex flex-col gap-3">
            <div className="rounded-lg px-3 py-2.5" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#059669' }} />
                  <span className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>S8</span>
                </div>
                {complete.length > 0 && (
                  <span className="text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center"
                    style={{ background: '#ecfdf5', color: '#059669' }}>
                    {complete.length}
                  </span>
                )}
              </div>
              <p className="text-xs font-semibold mt-1 leading-tight" style={{ color: 'var(--text-primary)' }}>Complete</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>All Teams</p>
            </div>
            <div className="space-y-2.5">
              {complete.length === 0 ? (
                <div className="rounded-xl h-20 flex items-center justify-center text-xs"
                  style={{ border: '1.5px dashed var(--border)', color: 'var(--text-muted)' }}>
                  Empty
                </div>
              ) : (
                complete.map(po => <POCard key={po.id} po={po} />)
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
