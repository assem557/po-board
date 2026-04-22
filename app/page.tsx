import Link from 'next/link'
import { Plus, Activity, AlertTriangle } from 'lucide-react'
import BoardClient from '@/components/BoardClient'
import DashboardStats from '@/components/DashboardStats'
import IdleChecker from '@/components/IdleChecker'
import { getAllPOs } from '@/lib/db'
import { daysSince } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const all = await getAllPOs()

  const active = all.filter(p => p.status !== 'complete')
  const complete = all.filter(p => p.status === 'complete')

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
      <div className="flex items-end justify-between mb-5">
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
        <div className="flex items-center gap-2">
          <Link
            href="/dealers"
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all"
            style={{ background: 'var(--card)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
          >
            Dealers
          </Link>
          <Link
            href="/po/new"
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all hover:opacity-90"
            style={{ background: 'var(--navy)', color: 'white' }}
          >
            <Plus className="w-4 h-4" />
            New PO
          </Link>
        </div>
      </div>

      <DashboardStats all={all} />
      <BoardClient all={all} />
    </div>
  )
}
