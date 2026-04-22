import { TrendingUp, Car, AlertTriangle, CheckCircle2, Clock } from 'lucide-react'
import type { PurchaseOrder } from '@/lib/types'
import { daysSince, totalVehicles } from '@/lib/utils'
import { STAGES } from '@/lib/stages'

interface Props { all: PurchaseOrder[] }

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

  const stats = [
    { label: 'Active POs', value: String(active.length), icon: TrendingUp, color: '#2563eb' },
    { label: 'Vehicles in flight', value: String(vehiclesInFlight), icon: Car, color: '#7c3aed' },
    { label: 'Completed', value: String(complete.length), icon: CheckCircle2, color: '#059669' },
    { label: 'Cancelled', value: String(cancelled.length), icon: AlertTriangle, color: '#dc2626' },
    ...(avgDays !== null ? [{ label: 'Avg. completion', value: `${avgDays}d`, icon: Clock, color: '#ca8a04' }] : []),
    ...(bottleneckStage ? [{
      label: 'Most congested',
      value: `S${bottleneckStage.number}`,
      sub: bottleneckStage.teamLabel,
      icon: AlertTriangle,
      color: '#ea580c',
    }] : []),
  ]

  return (
    <div className="flex flex-wrap gap-3 mb-6">
      {stats.map(stat => {
        const Icon = stat.icon
        return (
          <div key={stat.label} className="flex items-center gap-3 px-4 py-3 rounded-xl flex-shrink-0"
            style={{ background: 'var(--card)', border: '1px solid var(--border)', minWidth: 130 }}>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: stat.color + '18' }}>
              <Icon className="w-4 h-4" style={{ color: stat.color }} />
            </div>
            <div className="min-w-0">
              <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{stat.label}</p>
              <p className="font-bold text-lg leading-tight" style={{ color: 'var(--text-primary)' }}>{stat.value}</p>
              {'sub' in stat && stat.sub && (
                <p className="text-xs truncate" style={{ color: 'var(--text-muted)', fontSize: 10 }}>{stat.sub}</p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
