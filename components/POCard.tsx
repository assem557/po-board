'use client'
import Link from 'next/link'
import { Calendar, Car, CheckCircle2 } from 'lucide-react'
import type { PurchaseOrder } from '@/lib/types'
import { getStage } from '@/lib/stages'
import { formatDate, formatAge, daysSince, totalVehicles } from '@/lib/utils'
import { ROLE_ACCENT } from '@/lib/constants'

interface Props { po: PurchaseOrder }

function heatColor(days: number): string {
  if (days >= 5) return '#dc2626'   // red — very stuck
  if (days >= 3) return '#f97316'   // orange
  if (days >= 2) return '#eab308'   // yellow
  return '#dc2626'                   // default red (>1 triggers isStuck)
}

function heatGlow(days: number): string {
  if (days >= 5) return '0 0 0 1px rgba(220,38,38,0.3)'
  if (days >= 3) return '0 0 0 1px rgba(249,115,22,0.25)'
  return '0 0 0 1px rgba(234,179,8,0.2)'
}

export default function POCard({ po }: Props) {
  const stage = getStage(po.current_stage)
  const vehicles = totalVehicles(po.vehicle_batches ?? [])
  const isComplete = po.status === 'complete'
  const isCancelled = po.status === 'cancelled'

  const latestCompletion = [...(po.stage_completions ?? [])]
    .sort((a, b) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime())[0]

  const stageEnteredAt = latestCompletion?.completed_at ?? po.created_at
  const daysInStage = daysSince(stageEnteredAt)
  const isStuck = !isComplete && !isCancelled && daysInStage > 1

  const accent = isComplete ? '#059669' : isCancelled ? '#94a3b8' : ROLE_ACCENT[stage.team] ?? '#475569'
  const topBorder = isStuck ? heatColor(daysInStage) : accent
  const extraShadow = isStuck ? heatGlow(daysInStage) : 'none'

  return (
    <Link href={`/po/${po.id}`} style={{ display: 'block' }}>
      <div
        className="rounded-xl overflow-hidden cursor-pointer card-lift animate-fade-in"
        style={{
          background: 'var(--card)',
          border: '1px solid var(--border)',
          boxShadow: `0 1px 4px rgba(0,0,0,0.06), ${extraShadow}`,
          opacity: isCancelled ? 0.55 : 1,
        }}
      >
        {/* Top accent bar */}
        <div className="h-[3px] w-full transition-all" style={{
          background: isStuck
            ? `linear-gradient(90deg, ${heatColor(daysInStage)}, ${heatColor(daysInStage)}99)`
            : accent,
        }} />

        <div className="p-3.5">
          {/* Header row */}
          <div className="flex items-start justify-between gap-2 mb-2.5">
            <div className="min-w-0">
              <span className="mono text-xs" style={{ color: 'var(--text-muted)', fontSize: 10 }}>
                {po.po_number}
              </span>
              <h3 className="font-semibold text-sm mt-0.5 truncate" style={{ color: 'var(--text-primary)', lineHeight: 1.3 }}>
                {po.dealer_name}
              </h3>
            </div>
            {isCancelled ? (
              <span className="text-xs px-1.5 py-0.5 rounded font-medium flex-shrink-0"
                style={{ background: 'var(--border)', color: 'var(--text-muted)', fontSize: 10 }}>
                cancelled
              </span>
            ) : isComplete ? (
              <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: '#059669' }} />
            ) : null}
          </div>

          {/* Action row */}
          {!isComplete && !isCancelled && (
            <div className="flex items-center gap-1.5 mb-2.5">
              <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                style={{ background: accent + '15', color: accent, border: `1px solid ${accent}28`, fontSize: 11 }}>
                {isStuck ? `Idle · ${stage.teamLabel}` : `Waiting on: ${stage.teamLabel}`}
              </span>
              {isStuck && daysInStage >= 2 && (
                <span className="text-xs px-1.5 py-0.5 rounded-full font-medium"
                  style={{ background: heatColor(daysInStage) + '15', color: heatColor(daysInStage), border: `1px solid ${heatColor(daysInStage)}28`, fontSize: 10 }}>
                  {daysInStage}d
                </span>
              )}
            </div>
          )}

          {/* Meta row */}
          <div className="flex items-center justify-between text-xs gap-2" style={{ color: 'var(--text-muted)' }}>
            <span className="flex items-center gap-1">
              <Car className="w-3 h-3" />{vehicles}
            </span>
            {po.delivery_date && (
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />{formatDate(po.delivery_date)}
              </span>
            )}
            <span style={{ marginLeft: 'auto', fontSize: 10 }}>{formatAge(stageEnteredAt)}</span>
          </div>

          {/* Stage progress dots */}
          <div className="flex gap-0.5 mt-2.5">
            {Array.from({ length: 7 }, (_, i) => i + 1).map(s => (
              <div key={s} className="flex-1 rounded-full transition-all"
                style={{
                  height: 3,
                  background: po.current_stage > s
                    ? accent
                    : po.current_stage === s && !isComplete
                    ? accent + '60'
                    : 'var(--border)',
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </Link>
  )
}
