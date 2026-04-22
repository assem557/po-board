'use client'
import { useState, useMemo } from 'react'
import { Search, Filter, X } from 'lucide-react'
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
  // Only active POs in stage columns — cancelled ones stay separate
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
      <div className="flex items-center gap-3 mb-5">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search dealer or PO number…"
            className="w-full pl-9 pr-8 py-2 text-sm rounded-lg focus:outline-none"
            style={{ background: 'var(--card)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2">
              <X className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <Filter className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
          {filterOptions.map(opt => (
            <button
              key={opt.value}
              onClick={() => setStatusFilter(opt.value)}
              className="text-xs px-2.5 py-1.5 rounded-lg font-medium transition-all"
              style={{
                background: statusFilter === opt.value ? 'var(--navy)' : 'var(--card)',
                color: statusFilter === opt.value ? 'white' : 'var(--text-secondary)',
                border: `1px solid ${statusFilter === opt.value ? 'var(--navy)' : 'var(--border)'}`,
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
                <div className="rounded-lg px-3 py-2.5" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full" style={{ background: accent }} />
                      <span className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>S{stage.number}</span>
                    </div>
                    {cards.length > 0 && (
                      <span className="text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center"
                        style={{ background: accent + '18', color: accent }}>
                        {cards.length}
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-semibold mt-1 leading-tight" style={{ color: 'var(--text-primary)' }}>{stage.title}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{stage.teamLabel}</p>
                </div>
                <div className="space-y-2.5">
                  {cards.length === 0 ? (
                    <div className="rounded-xl h-20 flex items-center justify-center text-xs"
                      style={{ border: '1.5px dashed var(--border)', color: 'var(--text-muted)' }}>
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

          {/* Cancelled column — only shown when there are cancelled POs */}
          {cancelled.length > 0 && (
            <div className="w-60 flex-shrink-0 flex flex-col gap-3">
              <div className="rounded-lg px-3 py-2.5" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#94a3b8' }} />
                    <span className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>—</span>
                  </div>
                  <span className="text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center"
                    style={{ background: 'var(--border)', color: 'var(--text-muted)' }}>
                    {cancelled.length}
                  </span>
                </div>
                <p className="text-xs font-semibold mt-1 leading-tight" style={{ color: 'var(--text-primary)' }}>Cancelled</p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>All Teams</p>
              </div>
              <div className="space-y-2.5">
                {cancelled.map(po => <POCard key={po.id} po={po} />)}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
