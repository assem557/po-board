'use client'
import { useState, useMemo, useEffect, useRef } from 'react'
import { Search, X } from 'lucide-react'
import type { PurchaseOrder } from '@/lib/types'
import { STAGES } from '@/lib/stages'
import { daysSince } from '@/lib/utils'
import { ROLE_ACCENT } from '@/lib/constants'
import POCard from './POCard'

type FilterStatus = 'all' | 'active' | 'complete' | 'cancelled' | 'idle'

interface Props { all: PurchaseOrder[] }

export default function BoardClient({ all }: Props) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all')
  const searchRef = useRef<HTMLInputElement>(null)

  // Listen for keyboard shortcut to focus search
  useEffect(() => {
    const handler = () => searchRef.current?.focus()
    window.addEventListener('convoy:focus-search', handler)
    return () => window.removeEventListener('convoy:focus-search', handler)
  }, [])

  const filtered = useMemo(() => {
    return all.filter(po => {
      if (search) {
        const q = search.toLowerCase()
        if (!po.dealer_name.toLowerCase().includes(q) && !po.po_number.toLowerCase().includes(q)) return false
      }
      if (statusFilter === 'idle') {
        if (po.status !== 'active' || po.current_stage >= 8) return false
        const last = [...(po.stage_completions ?? [])]
          .sort((a, b) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime())[0]
        return (last ? daysSince(last.completed_at) : daysSince(po.created_at)) >= 1
      }
      if (statusFilter !== 'all' && po.status !== statusFilter) return false
      return true
    })
  }, [all, search, statusFilter])

  const grouped: Record<number, PurchaseOrder[]> = {}
  for (const s of STAGES) grouped[s.number] = []
  for (const po of filtered) {
    if (po.status === 'active') {
      if (!grouped[po.current_stage]) grouped[po.current_stage] = []
      grouped[po.current_stage].push(po)
    }
  }
  const complete = filtered.filter(p => p.status === 'complete')
  const cancelled = filtered.filter(p => p.status === 'cancelled')

  const filterOptions: { label: string; value: FilterStatus }[] = [
    { label: 'All', value: 'all' },
    { label: 'Active', value: 'active' },
    { label: 'Idle 24h+', value: 'idle' },
    { label: 'Complete', value: 'complete' },
    { label: 'Cancelled', value: 'cancelled' },
  ]

  return (
    <>
      {/* Search & Filter bar */}
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <div className="relative flex-1" style={{ maxWidth: 280 }}>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
          <input
            ref={searchRef}
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search dealer or PO… (/)"
            className="w-full pl-9 pr-8 py-2 text-sm rounded-lg focus:outline-none transition-all"
            style={{
              background: 'var(--card)',
              border: `1px solid ${search ? 'var(--accent)' : 'var(--border)'}`,
              color: 'var(--text-primary)',
              boxShadow: search ? '0 0 0 3px rgba(245,158,11,0.12)' : 'none',
            }}
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2">
              <X className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          {filterOptions.map(opt => (
            <button
              key={opt.value}
              onClick={() => setStatusFilter(opt.value)}
              className="text-xs px-2.5 py-1.5 rounded-lg font-medium transition-all"
              style={{
                background: statusFilter === opt.value ? 'var(--accent)' : 'var(--card)',
                color: statusFilter === opt.value ? '#1a0a00' : 'var(--text-secondary)',
                border: `1px solid ${statusFilter === opt.value ? 'var(--accent)' : 'var(--border)'}`,
                fontWeight: statusFilter === opt.value ? 600 : 500,
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {(search || statusFilter !== 'all') && (
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
            {filtered.length} result{filtered.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Kanban */}
      <div className="overflow-x-auto pb-6 -mx-1 px-1">
        <div className="flex gap-3" style={{ minWidth: 'max-content' }}>
          {STAGES.slice(0, 7).map(stage => {
            const cards = grouped[stage.number] ?? []
            const accent = ROLE_ACCENT[stage.team]
            return (
              <div key={stage.number} className="w-60 flex-shrink-0 flex flex-col gap-3">
                {/* Column header with team-color tint */}
                <div className="rounded-xl px-3 py-2.5" style={{
                  background: `linear-gradient(135deg, ${accent}10 0%, ${accent}06 100%)`,
                  border: `1px solid ${accent}22`,
                }}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ background: accent, boxShadow: `0 0 0 3px ${accent}22` }} />
                      <span className="text-xs font-bold" style={{ color: accent, opacity: 0.8 }}>S{stage.number}</span>
                    </div>
                    {cards.length > 0 && (
                      <span className="text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center"
                        style={{ background: accent + '22', color: accent }}>
                        {cards.length}
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-semibold mt-1 leading-tight" style={{ color: 'var(--text-primary)' }}>{stage.title}</p>
                  <p className="text-xs mt-0.5 font-medium" style={{ color: accent, opacity: 0.65 }}>{stage.teamLabel}</p>
                </div>

                <div className="space-y-2">
                  {cards.length === 0 ? (
                    <div className="rounded-xl h-16 flex items-center justify-center text-xs"
                      style={{ border: `1.5px dashed ${accent}22`, color: 'var(--text-muted)' }}>
                      —
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
            <div className="rounded-xl px-3 py-2.5" style={{
              background: 'linear-gradient(135deg, rgba(5,150,105,0.08) 0%, rgba(5,150,105,0.04) 100%)',
              border: '1px solid rgba(5,150,105,0.2)',
            }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: '#059669', boxShadow: '0 0 0 3px rgba(5,150,105,0.2)' }} />
                  <span className="text-xs font-bold" style={{ color: '#059669', opacity: 0.8 }}>S8</span>
                </div>
                {complete.length > 0 && (
                  <span className="text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center"
                    style={{ background: 'rgba(5,150,105,0.15)', color: '#059669' }}>
                    {complete.length}
                  </span>
                )}
              </div>
              <p className="text-xs font-semibold mt-1 leading-tight" style={{ color: 'var(--text-primary)' }}>Complete</p>
              <p className="text-xs mt-0.5 font-medium" style={{ color: '#059669', opacity: 0.65 }}>All Teams</p>
            </div>
            <div className="space-y-2">
              {complete.length === 0 ? (
                <div className="rounded-xl h-16 flex items-center justify-center text-xs"
                  style={{ border: '1.5px dashed rgba(5,150,105,0.2)', color: 'var(--text-muted)' }}>
                  —
                </div>
              ) : (
                complete.map(po => <POCard key={po.id} po={po} />)
              )}
            </div>
          </div>

          {/* Cancelled column */}
          {cancelled.length > 0 && (
            <div className="w-60 flex-shrink-0 flex flex-col gap-3">
              <div className="rounded-xl px-3 py-2.5" style={{
                background: 'rgba(148,163,184,0.06)',
                border: '1px solid rgba(148,163,184,0.18)',
              }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ background: '#94a3b8' }} />
                    <span className="text-xs font-bold" style={{ color: '#94a3b8', opacity: 0.8 }}>—</span>
                  </div>
                  <span className="text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center"
                    style={{ background: 'var(--border)', color: 'var(--text-muted)' }}>
                    {cancelled.length}
                  </span>
                </div>
                <p className="text-xs font-semibold mt-1 leading-tight" style={{ color: 'var(--text-primary)' }}>Cancelled</p>
                <p className="text-xs mt-0.5 font-medium" style={{ color: '#94a3b8', opacity: 0.65 }}>All Teams</p>
              </div>
              <div className="space-y-2">
                {cancelled.map(po => <POCard key={po.id} po={po} />)}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
