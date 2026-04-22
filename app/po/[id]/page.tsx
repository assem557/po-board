'use client'
import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Calendar, Package, Clock, FileText } from 'lucide-react'
import type { PurchaseOrder, POComment } from '@/lib/types'
import POStageProgress from '@/components/POStageProgress'
import StageActionCard from '@/components/StageActionCard'
import CommentThread from '@/components/CommentThread'
import VehicleTable from '@/components/VehicleTable'
import { formatDate, daysSince, totalVehicles } from '@/lib/utils'

const ROLE_ACCENT: Record<string, string> = {
  partnership: '#7c3aed',
  finance: '#2563eb',
  pricing: '#ca8a04',
  ops: '#059669',
  tech: '#dc2626',
  admin: '#475569',
}

export default function PODetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [po, setPO] = useState<PurchaseOrder | null>(null)
  const [loading, setLoading] = useState(true)

  async function fetchPO() {
    const res = await fetch(`/api/purchase-orders/${id}`)
    if (res.ok) setPO(await res.json())
    else router.push('/')
    setLoading(false)
  }

  useEffect(() => { fetchPO() }, [id])

  async function handleVehicleUpdate(batchId: string, vin: string, plate: string) {
    await fetch(`/api/purchase-orders/${id}/vehicles/${batchId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ vin, plate }),
    })
    await fetchPO()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center" style={{ minHeight: 200 }}>
        <div className="text-sm" style={{ color: 'var(--text-muted)' }}>Loading…</div>
      </div>
    )
  }
  if (!po) return null

  const vehicles = totalVehicles(po.vehicle_batches ?? [])
  const isExistingDealer = !!po.dealer_id
  const isComplete = po.status === 'complete'
  const statusColor = isComplete ? '#059669' : po.status === 'cancelled' ? '#dc2626' : '#2563eb'

  return (
    <div style={{ maxWidth: 960, margin: '0 auto' }}>
      <Link href="/" className="inline-flex items-center gap-1.5 text-sm mb-6 transition-opacity hover:opacity-60"
        style={{ color: 'var(--text-secondary)' }}>
        <ArrowLeft className="w-3.5 h-3.5" /> Board
      </Link>

      {/* Header card */}
      <div className="rounded-2xl overflow-hidden mb-5"
        style={{ background: 'var(--card)', border: '1px solid var(--border)', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
        {/* Dark header strip */}
        <div className="px-7 py-5" style={{ background: 'var(--navy)' }}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <span className="mono text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>{po.po_number}</span>
              <h1 className="text-2xl font-bold text-white mt-0.5">{po.dealer_name}</h1>
              {po.notes && <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.5)' }}>{po.notes}</p>}
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full mt-1"
              style={{ background: statusColor + '22', color: statusColor, border: `1px solid ${statusColor}44` }}>
              {po.status}
            </span>
          </div>

          {/* Meta row */}
          <div className="flex flex-wrap gap-5 mt-4 text-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>
            <span className="flex items-center gap-1.5">
              <Package className="w-3.5 h-3.5" /> {vehicles} vehicles
            </span>
            {po.delivery_date && (
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" /> {formatDate(po.delivery_date)}
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" /> {daysSince(po.created_at)}d ago
            </span>
          </div>
        </div>

        {/* Stage progress */}
        <div className="px-7 py-5">
          <POStageProgress currentStage={po.current_stage} />
        </div>
      </div>

      {/* Body: 2-col layout */}
      <div className="grid gap-5" style={{ gridTemplateColumns: '1fr 320px' }}>
        {/* Left col */}
        <div className="space-y-5">
          <StageActionCard
            poId={po.id}
            currentStage={po.current_stage}
            isExistingDealer={isExistingDealer}
            onAdvanced={fetchPO}
          />

          <div className="rounded-xl p-5"
            style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
            <VehicleTable
              batches={po.vehicle_batches ?? []}
              editable={po.current_stage === 6}
              onUpdate={handleVehicleUpdate}
            />
          </div>
        </div>

        {/* Right col */}
        <div className="space-y-5">
          {/* Activity log */}
          <div className="rounded-xl p-5"
            style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
            <h3 className="text-xs font-semibold uppercase tracking-widest mb-4 flex items-center gap-2"
              style={{ color: 'var(--text-muted)' }}>
              <FileText className="w-3.5 h-3.5" /> Activity
            </h3>
            {(po.stage_completions ?? []).length === 0
              ? <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No activity yet.</p>
              : (
                <div className="space-y-4">
                  {[...(po.stage_completions ?? [])].reverse().map(sc => {
                    const accent = ROLE_ACCENT[sc.completed_by_role] ?? '#475569'
                    return (
                      <div key={sc.id} className="flex gap-3">
                        <div className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-white text-xs font-bold"
                          style={{ background: accent }}>
                          {sc.completed_by_name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs">
                            <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                              {sc.completed_by_name.split(' ')[0]}
                            </span>
                            <span style={{ color: 'var(--text-secondary)' }}> completed </span>
                            <span className="font-medium" style={{ color: accent }}>Stage {sc.stage}</span>
                          </p>
                          {sc.notes && <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>{sc.notes}</p>}
                          {sc.document_name && (
                            <p className="text-xs mt-0.5 flex items-center gap-1" style={{ color: '#2563eb' }}>
                              📎 {sc.document_name}
                            </p>
                          )}
                          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{formatDate(sc.completed_at)}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )
            }
          </div>

          {/* Comments */}
          <div className="rounded-xl p-5"
            style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
            <CommentThread
              poId={po.id}
              comments={po.comments ?? []}
              onComment={c => setPO(p => p ? { ...p, comments: [...(p.comments ?? []), c] } : p)}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
