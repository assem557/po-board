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
  const bottleneckStage = Object.entries(stageCounts).sort((a, b) => Number(b[1]) - Number(a[1]))[0]
  const bottleneckLabel = bottleneckStage
    ? STAGES.find(s => s.number === Number(bottleneckStage[0]))?.title ?? `S${bottleneckStage[0]}`
    : null

  let avgDays: number | null = null
  if (complete.length > 0) {
    const times = complete.map(po => daysSince(po.created_at))
    avgDays = Math.round(times.reduce((a, b) => a + b, 0) / times.length)
  }

  const stats = [
    {
      label: 'Active POs',
      value: active.length,
      icon: TrendingUp,
      color: '#2563eb',
    },
    {
      label: 'Vehicles in flight',
      value: vehiclesInFlight,
      icon: Car,
      color: '#7c3aed',
    },
    {
      label: 'Completed',
      value: complete.length,
      icon: CheckCircle2,
      color: '#059669',
    },
    {
      label: 'Cancelled',
      value: cancelled.length,
      icon: AlertTriangle,
      color: '#dc2626',
    },
    ...(avgDays !== null ? [{
      label: 'Avg. completion',
      value: `${avgDays}d`,
      icon: Clock,
      color: '#ca8a04',
    }] : []),
    ...(bottleneckLabel ? [{
      label: 'Most stuck stage',
      value: bottleneckLabel,
      icon: AlertTriangle,
      color: '#ea580c',
      small: true,
    }] : []),
  ]

  return (
    <div className="flex flex-wrap gap-3 mb-6">
      {stats.map(stat => {
        const Icon = stat.icon
        return (
          <div
            key={stat.label}
            className="flex items-center gap-3 px-4 py-3 rounded-xl"
            style={{ background: 'var(--card)', border: '1px solid var(--border)', minWidth: 140 }}
          >
            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: stat.color + '18' }}>
              <Icon className="w-4 h-4" style={{ color: stat.color }} />
            </div>
            <div>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{stat.label}</p>
              <p className={`font-bold leading-tight ${stat.small ? 'text-sm' : 'text-lg'}`}
                style={{ color: 'var(--text-primary)' }}>
                {stat.value}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
