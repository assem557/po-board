'use client'
import Link from 'next/link'
import { Calendar, Car, CheckCircle2, AlertTriangle, Clock } from 'lucide-react'
import type { PurchaseOrder } from '@/lib/types'
import { getStage } from '@/lib/stages'
import { formatDate, totalVehicles, daysSince } from '@/lib/utils'

const TEAM_ACCENT: Record<string, string> = {
  partnership: '#7c3aed',
  finance: '#2563eb',
  pricing: '#ca8a04',
  ops: '#059669',
  tech: '#dc2626',
  admin: '#475569',
}

interface Props { po: PurchaseOrder }

export default function POCard({ po }: Props) {
  const stage = getStage(po.current_stage)
  const vehicles = totalVehicles(po.vehicle_batches ?? [])
  const isComplete = po.status === 'complete'

  const latestCompletion = [...(po.stage_completions ?? [])]
    .sort((a, b) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime())[0]

  const daysStuck = latestCompletion ? daysSince(latestCompletion.completed_at) : daysSince(po.created_at)
  const isStuck = !isComplete && daysStuck > 1

  const accent = isComplete ? '#059669' : TEAM_ACCENT[stage.team] ?? '#475569'

  return (
    <Link href={`/po/${po.id}`}>
      <div
        className="rounded-xl overflow-hidden cursor-pointer group transition-all hover:-translate-y-0.5"
        style={{
          background: 'var(--card)',
          border: '1px solid var(--border)',
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        }}
      >
        {/* Accent top bar */}
        <div className="h-0.5 w-full" style={{ background: isStuck ? '#dc2626' : accent }} />

        <div className="p-4">
          {/* Header row */}
          <div className="flex items-start justify-between gap-2 mb-3">
            <div className="min-w-0">
              <span className="mono text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                {po.po_number}
              </span>
              <h3 className="font-semibold text-sm mt-0.5 truncate group-hover:text-blue-600 transition-colors"
                style={{ color: 'var(--text-primary)' }}>
                {po.dealer_name}
              </h3>
            </div>
            {isComplete
              ? <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#059669' }} />
              : isStuck
              ? <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#dc2626' }} />
              : null
            }
          </div>

          {/* Stage badge */}
          {!isComplete && (
            <div className="flex items-center gap-1.5 mb-3">
              <span
                className="text-xs px-2 py-0.5 rounded-full font-medium"
                style={{ background: accent + '18', color: accent, border: `1px solid ${accent}33` }}
              >
                {stage.teamLabel}
              </span>
              {isStuck && (
                <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                  style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' }}>
                  {daysStuck}d idle
                </span>
              )}
            </div>
          )}

          {/* Meta row */}
          <div className="flex items-center justify-between text-xs" style={{ color: 'var(--text-muted)' }}>
            <span className="flex items-center gap-1">
              <Car className="w-3 h-3" />
              {vehicles}
            </span>
            {po.delivery_date && (
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {formatDate(po.delivery_date)}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {daysSince(po.created_at)}d
            </span>
          </div>

          {/* Progress pip track */}
          <div className="flex gap-0.5 mt-3">
            {Array.from({ length: 7 }, (_, i) => i + 1).map(s => (
              <div
                key={s}
                className="flex-1 h-0.5 rounded-full transition-all"
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
