'use client'
import Link from 'next/link'
import { Calendar, Car, CheckCircle2, AlertTriangle } from 'lucide-react'
import type { PurchaseOrder } from '@/lib/types'
import { getStage } from '@/lib/stages'
import { formatDate, formatAge, daysSince, totalVehicles } from '@/lib/utils'
import { ROLE_ACCENT } from '@/lib/constants'

interface Props { po: PurchaseOrder }

export default function POCard({ po }: Props) {
  const stage = getStage(po.current_stage)
  const vehicles = totalVehicles(po.vehicle_batches ?? [])
  const isComplete = po.status === 'complete'
  const isCancelled = po.status === 'cancelled'

  // Age since entering current stage (not since creation)
  const latestCompletion = [...(po.stage_completions ?? [])]
    .sort((a, b) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime())[0]

  const stageEnteredAt = latestCompletion?.completed_at ?? po.created_at
  const daysInStage = daysSince(stageEnteredAt)
  const isStuck = !isComplete && !isCancelled && daysInStage > 1

  const accent = isComplete ? '#059669' : isCancelled ? '#94a3b8' : ROLE_ACCENT[stage.team] ?? '#475569'

  return (
    <Link href={`/po/${po.id}`}>
      <div
        className="rounded-xl overflow-hidden cursor-pointer group transition-all hover:-translate-y-0.5"
        style={{
          background: 'var(--card)',
          border: `1px solid ${isCancelled ? 'var(--border)' : 'var(--border)'}`,
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
          opacity: isCancelled ? 0.6 : 1,
        }}
      >
        <div className="h-0.5 w-full" style={{ background: isStuck ? '#dc2626' : accent }} />

        <div className="p-4">
          <div className="flex items-start justify-between gap-2 mb-3">
            <div className="min-w-0">
              <span className="mono text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                {po.po_number}
              </span>
              <h3 className="font-semibold text-sm mt-0.5 truncate transition-colors"
                style={{ color: 'var(--text-primary)' }}>
                {po.dealer_name}
              </h3>
            </div>
            {isCancelled
              ? <span className="text-xs px-1.5 py-0.5 rounded font-medium flex-shrink-0"
                  style={{ background: 'var(--border)', color: 'var(--text-muted)' }}>cancelled</span>
              : isComplete
              ? <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#059669' }} />
              : isStuck
              ? <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#dc2626' }} />
              : null
            }
          </div>

          {!isComplete && !isCancelled && (
            <div className="flex items-center gap-1.5 mb-3">
              <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                style={{ background: accent + '18', color: accent, border: `1px solid ${accent}33` }}>
                {stage.teamLabel}
              </span>
              {isStuck && (
                <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                  style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' }}>
                  {daysInStage}d idle
                </span>
              )}
            </div>
          )}

          <div className="flex items-center justify-between text-xs" style={{ color: 'var(--text-muted)' }}>
            <span className="flex items-center gap-1"><Car className="w-3 h-3" />{vehicles}</span>
            {po.delivery_date && (
              <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{formatDate(po.delivery_date)}</span>
            )}
            <span>{formatAge(stageEnteredAt)}</span>
          </div>

          <div className="flex gap-0.5 mt-3">
            {Array.from({ length: 7 }, (_, i) => i + 1).map(s => (
              <div key={s} className="flex-1 h-0.5 rounded-full transition-all"
                style={{
                  background: po.current_stage > s
                    ? accent
                    : po.current_stage === s && !isComplete
                    ? accent + '55'
                    : 'var(--border)'
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </Link>
  )
}
