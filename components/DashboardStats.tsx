'use client'
import { useState, useEffect } from 'react'
import { TrendingUp, Car, AlertTriangle, CheckCircle2, Clock } from 'lucide-react'
import type { PurchaseOrder } from '@/lib/types'
import { daysSince, totalVehicles } from '@/lib/utils'
import { STAGES } from '@/lib/stages'

interface Props { all: PurchaseOrder[] }

function useCountUp(target: number, duration = 500) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (target === 0) { setCount(0); return }
    let startTime: number | null = null
    const step = (ts: number) => {
      if (!startTime) startTime = ts
      const progress = Math.min((ts - startTime) / duration, 1)
      // ease-out
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.round(eased * target))
      if (progress < 1) requestAnimationFrame(step)
    }
    const raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [target, duration])
  return count
}

function StatCard({ label, rawValue, displayValue, icon: Icon, color, sub }: {
  label: string
  rawValue: number
  displayValue: string
  icon: React.ElementType
  color: string
  sub?: string
}) {
  const count = useCountUp(rawValue)
  const animated = displayValue.replace(String(rawValue), String(count))

  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-xl flex-shrink-0 animate-fade-in"
      style={{ background: 'var(--card)', border: '1px solid var(--border)', minWidth: 130, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
      <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: color + '15' }}>
        <Icon className="w-4 h-4" style={{ color }} />
      </div>
      <div className="min-w-0">
        <p className="text-xs truncate" style={{ color: 'var(--text-muted)', fontSize: 11 }}>{label}</p>
        <p className="font-bold text-xl leading-tight tabular-nums" style={{ color: 'var(--text-primary)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          {animated}
        </p>
        {sub && (
          <p className="text-xs truncate" style={{ color: 'var(--text-muted)', fontSize: 10 }}>{sub}</p>
        )}
      </div>
    </div>
  )
}

export default function DashboardStats({ all }: Props) {
  const active = all.filter(p => p.status === 'active')
  const complete = all.filter(p => p.status === 'complete')
  const cancelled = all.filter(p => p.status === 'cancelled')

  const vehiclesInFlight = active.reduce((s, po) => s + totalVehicles(po.vehicle_batches ?? []), 0)

  const stageCounts: Record<number, number> = {}
  for (const po of active) {
    stageCounts[po.current_stage] = (stageCounts[po.current_stage] ?? 0) + 1
  }
  const bottleneckEntry = Object.entries(stageCounts).sort((a, b) => Number(b[1]) - Number(a[1]))[0]
  const bottleneckStage = bottleneckEntry
    ? STAGES.find(s => s.number === Number(bottleneckEntry[0]))
    : null

  let avgDays: number | null = null
  if (complete.length > 0) {
    const times = complete.map(po => daysSince(po.created_at))
    avgDays = Math.round(times.reduce((a, b) => a + b, 0) / times.length)
  }

  return (
    <div className="flex flex-wrap gap-2.5 mb-6">
      <StatCard label="Active POs" rawValue={active.length} displayValue={String(active.length)} icon={TrendingUp} color="#2563eb" />
      <StatCard label="Vehicles in flight" rawValue={vehiclesInFlight} displayValue={String(vehiclesInFlight)} icon={Car} color="#7c3aed" />
      <StatCard label="Completed" rawValue={complete.length} displayValue={String(complete.length)} icon={CheckCircle2} color="#059669" />
      <StatCard label="Cancelled" rawValue={cancelled.length} displayValue={String(cancelled.length)} icon={AlertTriangle} color="#dc2626" />
      {avgDays !== null && (
        <StatCard label="Avg. completion" rawValue={avgDays} displayValue={`${avgDays}d`} icon={Clock} color="#ca8a04" />
      )}
      {bottleneckStage && (
        <StatCard
          label="Most congested"
          rawValue={Number(bottleneckEntry![1])}
          displayValue={`S${bottleneckStage.number}`}
          icon={AlertTriangle}
          color="#ea580c"
          sub={bottleneckStage.teamLabel}
        />
      )}
    </div>
  )
}
