'use client'
import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, Calendar, Package, Clock, FileText,
  Pencil, X, RotateCcw, Ban, RefreshCw, Download, Check, AlertCircle,
  MessageSquare,
} from 'lucide-react'
import type { PurchaseOrder } from '@/lib/types'
import POStageProgress from '@/components/POStageProgress'
import StageActionCard from '@/components/StageActionCard'
import CommentThread from '@/components/CommentThread'
import VehicleTable from '@/components/VehicleTable'
import { formatDate, daysSince, totalVehicles } from '@/lib/utils'
import { useUserStore } from '@/lib/store'
import { ROLE_ACCENT } from '@/lib/constants'

export default function PODetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { name: userName, role: userRole } = useUserStore()
  const [po, setPO] = useState<PurchaseOrder | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionError, setActionError] = useState('')
  const [sideTab, setSideTab] = useState<'activity' | 'thread'>('activity')

  // Edit state
  const [editing, setEditing] = useState(false)
  const [editDealerName, setEditDealerName] = useState('')
  const [editDeliveryDate, setEditDeliveryDate] = useState('')
  const [editNotes, setEditNotes] = useState('')
  const [saving, setSaving] = useState(false)

  // Cancel state
  const [showCancel, setShowCancel] = useState(false)
  const [cancelReason, setCancelReason] = useState('')
  const [cancelling, setCancelling] = useState(false)

  // Rollback state
  const [showRollback, setShowRollback] = useState(false)
  const [rollingBack, setRollingBack] = useState(false)

  async function fetchPO() {
    const res = await fetch(`/api/purchase-orders/${id}`)
    if (res.ok) setPO(await res.json())
    else router.push('/')
    setLoading(false)
  }

  useEffect(() => { fetchPO() }, [id])

  function openEdit() {
    if (!po) return
    setEditDealerName(po.dealer_name)
    setEditDeliveryDate(po.delivery_date ?? '')
    setEditNotes(po.notes ?? '')
    setEditing(true)
    setActionError('')
  }

  async function handleSaveEdit() {
    setSaving(true)
    setActionError('')
    const res = await fetch(`/api/purchase-orders/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dealer_name: editDealerName, delivery_date: editDeliveryDate || null, notes: editNotes || null }),
    })
    setSaving(false)
    if (!res.ok) { setActionError('Failed to save changes. Please try again.'); return }
    setEditing(false)
    await fetchPO()
  }

  async function handleCancel() {
    setCancelling(true)
    setActionError('')
    const res = await fetch(`/api/purchase-orders/${id}/cancel`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason: cancelReason, author_name: userName, author_role: userRole }),
    })
    setCancelling(false)
    if (!res.ok) { setActionError('Failed to cancel PO. Please try again.'); return }
    setShowCancel(false)
    await fetchPO()
  }

  async function handleReopen() {
    setActionError('')
    const res = await fetch(`/api/purchase-orders/${id}/reopen`, { method: 'POST' })
    if (!res.ok) { setActionError('Failed to reopen PO. Please try again.'); return }
    await fetchPO()
  }

  async function handleRollback() {
    setRollingBack(true)
    setActionError('')
    const res = await fetch(`/api/purchase-orders/${id}/rollback`, { method: 'POST' })
    setRollingBack(false)
    if (!res.ok) { setActionError('Failed to roll back stage. Please try again.'); return }
    setShowRollback(false)
    await fetchPO()
  }

  function handleExportCSV() {
    if (!po) return
    const rows: string[][] = []
    rows.push(['PO Export'])
    rows.push(['PO Number', po.po_number])
    rows.push(['Dealer', po.dealer_name])
    rows.push(['Status', po.status])
    rows.push(['Stage', String(po.current_stage)])
    rows.push(['Delivery Date', po.delivery_date ?? ''])
    rows.push(['Notes', po.notes ?? ''])
    rows.push(['Created', po.created_at])
    rows.push([])
    rows.push(['Vehicles'])
    rows.push(['Color', 'Count', 'City', 'VIN', 'Plate'])
    for (const b of po.vehicle_batches ?? []) {
      rows.push([b.color, String(b.count), b.city, b.vin ?? '', b.plate ?? ''])
    }
    rows.push([])
    rows.push(['Stage History'])
    rows.push(['Stage', 'Completed By', 'Role', 'Notes', 'Date'])
    for (const sc of po.stage_completions ?? []) {
      rows.push([String(sc.stage), sc.completed_by_name, sc.completed_by_role, sc.notes ?? '', sc.completed_at])
    }
    const csv = rows.map(r => r.map(c => `"${c.replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `${po.po_number}.csv`; a.click()
    URL.revokeObjectURL(url)
  }

  const inputStyle = {
    border: '1px solid rgba(255,255,255,0.15)',
    background: 'rgba(255,255,255,0.08)',
    color: 'white',
    borderRadius: 8,
    padding: '7px 11px',
    fontSize: 14,
    width: '100%',
    outline: 'none',
  }

  if (loading) {
    return (
      <div style={{ maxWidth: 980, margin: '0 auto' }}>
        <div className="h-4 w-14 rounded animate-pulse mb-6" style={{ background: 'var(--border)' }} />
        <div className="rounded-2xl animate-pulse mb-5" style={{ background: 'var(--border)', height: 170 }} />
        <div className="grid gap-5" style={{ gridTemplateColumns: '1fr 320px' }}>
          <div className="space-y-5">
            <div className="rounded-xl animate-pulse" style={{ background: 'var(--border)', height: 220 }} />
            <div className="rounded-xl animate-pulse" style={{ background: 'var(--border)', height: 140 }} />
          </div>
          <div>
            <div className="rounded-xl animate-pulse" style={{ background: 'var(--border)', height: 320 }} />
          </div>
        </div>
      </div>
    )
  }
  if (!po) return null

  const vehicles = totalVehicles(po.vehicle_batches ?? [])
  const isExistingDealer = !!po.dealer_id
  const isComplete = po.status === 'complete'
  const isCancelled = po.status === 'cancelled'
  const statusColor = isComplete ? '#059669' : isCancelled ? '#94a3b8' : 'var(--accent)'

  const editModeForTable = po.current_stage === 6 && !isCancelled
    ? 'vin-plate'
    : po.current_stage === 1 && !isCancelled
    ? 'batches'
    : undefined

  return (
    <div style={{ maxWidth: 980, margin: '0 auto' }} className="animate-fade-in">
      <Link href="/" className="inline-flex items-center gap-1.5 text-sm mb-6 transition-opacity hover:opacity-60"
        style={{ color: 'var(--text-secondary)' }}>
        <ArrowLeft className="w-3.5 h-3.5" /> Board
      </Link>

      {actionError && (
        <div className="flex items-center gap-2 text-sm px-4 py-3 rounded-xl mb-4"
          style={{ background: 'var(--red-light)', border: '1px solid #fecaca', color: 'var(--red)' }}>
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {actionError}
          <button onClick={() => setActionError('')} className="ml-auto" style={{ color: 'var(--red)' }}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header card */}
      <div className="rounded-2xl overflow-hidden mb-5"
        style={{ background: 'var(--card)', border: '1px solid var(--border)', boxShadow: '0 2px 16px rgba(0,0,0,0.07)' }}>

        {/* Top accent stripe */}
        <div style={{ height: 3, background: isComplete ? '#059669' : isCancelled ? '#94a3b8' : 'linear-gradient(90deg, var(--accent), #fbbf24)' }} />

        <div className="px-7 py-5" style={{ background: 'var(--navy)' }}>
          {editing ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs mb-1.5" style={{ color: 'rgba(255,255,255,0.5)' }}>Dealer Name</label>
                  <input value={editDealerName} onChange={e => setEditDealerName(e.target.value)} style={inputStyle} />
                </div>
                <div>
                  <label className="block text-xs mb-1.5" style={{ color: 'rgba(255,255,255,0.5)' }}>Delivery Date</label>
                  <input type="date" value={editDeliveryDate} onChange={e => setEditDeliveryDate(e.target.value)} style={inputStyle} />
                </div>
              </div>
              <div>
                <label className="block text-xs mb-1.5" style={{ color: 'rgba(255,255,255,0.5)' }}>Notes</label>
                <input value={editNotes} onChange={e => setEditNotes(e.target.value)} style={inputStyle} />
              </div>
              <div className="flex gap-2 pt-1">
                <button onClick={handleSaveEdit} disabled={saving}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium"
                  style={{ background: '#059669', color: 'white' }}>
                  <Check className="w-3.5 h-3.5" /> {saving ? 'Saving…' : 'Save'}
                </button>
                <button onClick={() => setEditing(false)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm"
                  style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)' }}>
                  <X className="w-3.5 h-3.5" /> Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="mono text-xs" style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11 }}>{po.po_number}</span>
                  <h1 className="text-2xl font-bold text-white mt-0.5" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    {po.dealer_name}
                  </h1>
                  {po.notes && <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.45)' }}>{po.notes}</p>}
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full mt-1 flex-shrink-0"
                  style={{
                    background: isComplete ? 'rgba(5,150,105,0.2)' : isCancelled ? 'rgba(148,163,184,0.15)' : 'rgba(245,158,11,0.2)',
                    color: isComplete ? '#6ee7b7' : isCancelled ? '#94a3b8' : '#fbbf24',
                    border: `1px solid ${isComplete ? 'rgba(5,150,105,0.3)' : isCancelled ? 'rgba(148,163,184,0.2)' : 'rgba(245,158,11,0.3)'}`,
                  }}>
                  {po.status}
                </span>
              </div>

              <div className="flex flex-wrap gap-5 mt-4 text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
                <span className="flex items-center gap-1.5"><Package className="w-3.5 h-3.5" /> {vehicles} vehicles</span>
                {po.delivery_date && (
                  <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> {formatDate(po.delivery_date)}</span>
                )}
                <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {daysSince(po.created_at)}d ago</span>
              </div>

              <div className="flex items-center gap-2 mt-4 flex-wrap">
                <button onClick={openEdit}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all hover:opacity-80"
                  style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)' }}>
                  <Pencil className="w-3 h-3" /> Edit
                </button>

                {!isCancelled && !isComplete && po.current_stage > 1 && (
                  <button onClick={() => setShowRollback(true)}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all hover:opacity-80"
                    style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)' }}>
                    <RotateCcw className="w-3 h-3" /> Roll back
                  </button>
                )}

                {!isCancelled && !isComplete && (
                  <button onClick={() => setShowCancel(true)}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium"
                    style={{ background: 'rgba(220,38,38,0.2)', color: '#fca5a5' }}>
                    <Ban className="w-3 h-3" /> Cancel PO
                  </button>
                )}

                {isCancelled && (
                  <button onClick={handleReopen}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium"
                    style={{ background: 'rgba(5,150,105,0.2)', color: '#6ee7b7' }}>
                    <RefreshCw className="w-3 h-3" /> Reopen PO
                  </button>
                )}

                <button onClick={handleExportCSV}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium ml-auto"
                  style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.4)' }}>
                  <Download className="w-3 h-3" /> CSV
                </button>
              </div>

              {showRollback && (
                <div className="mt-3 p-3 rounded-xl" style={{ background: 'rgba(220,38,38,0.15)', border: '1px solid rgba(220,38,38,0.3)' }}>
                  <p className="text-sm text-white mb-2">
                    Roll back Stage {po.current_stage} → Stage {po.current_stage - 1}? The last completion record will be removed.
                  </p>
                  <div className="flex gap-2">
                    <button onClick={handleRollback} disabled={rollingBack}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium"
                      style={{ background: '#dc2626', color: 'white' }}>
                      {rollingBack ? 'Rolling back…' : 'Yes, roll back'}
                    </button>
                    <button onClick={() => setShowRollback(false)}
                      className="px-3 py-1.5 rounded-lg text-xs"
                      style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)' }}>
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {showCancel && (
                <div className="mt-3 p-3 rounded-xl" style={{ background: 'rgba(220,38,38,0.15)', border: '1px solid rgba(220,38,38,0.3)' }}>
                  <p className="text-sm text-white mb-2">Cancel this PO? Add a reason (optional):</p>
                  <input value={cancelReason} onChange={e => setCancelReason(e.target.value)}
                    placeholder="Reason for cancellation…"
                    className="w-full text-sm rounded-lg px-3 py-2 mb-2 focus:outline-none"
                    style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.2)', color: 'white' }} />
                  <div className="flex gap-2">
                    <button onClick={handleCancel} disabled={cancelling}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium"
                      style={{ background: '#dc2626', color: 'white' }}>
                      {cancelling ? 'Cancelling…' : 'Confirm Cancel'}
                    </button>
                    <button onClick={() => setShowCancel(false)}
                      className="px-3 py-1.5 rounded-lg text-xs"
                      style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)' }}>
                      Keep PO
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Stage progress */}
        <div className="px-7 py-5">
          <POStageProgress currentStage={po.current_stage} />
        </div>
      </div>

      {/* Body: 2-col layout */}
      <div className="grid gap-5" style={{ gridTemplateColumns: '1fr 340px' }}>
        {/* Left: stage action + vehicle table */}
        <div className="space-y-5">
          {!isCancelled && (
            <StageActionCard
              poId={po.id}
              currentStage={po.current_stage}
              isExistingDealer={isExistingDealer}
              onAdvanced={fetchPO}
            />
          )}
          {isCancelled && (
            <div className="rounded-xl p-6 text-center" style={{ background: 'var(--red-light)', border: '1px solid #fecaca' }}>
              <Ban className="w-8 h-8 mx-auto mb-2" style={{ color: '#dc2626' }} />
              <p className="font-semibold" style={{ color: '#991b1b' }}>This PO has been cancelled.</p>
              <p className="text-sm mt-1" style={{ color: '#b91c1c' }}>Use &quot;Reopen PO&quot; to resume it.</p>
            </div>
          )}

          <div className="rounded-xl p-5" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
            <VehicleTable
              batches={po.vehicle_batches ?? []}
              poId={po.id}
              editMode={editModeForTable}
              onRefresh={fetchPO}
            />
            {editModeForTable === 'batches' && (
              <p className="text-xs mt-3" style={{ color: 'var(--text-muted)' }}>
                Stage 1 — you can add or remove vehicle rows before Finance issues the PO.
              </p>
            )}
          </div>
        </div>

        {/* Right: tabbed panel */}
        <div className="rounded-xl overflow-hidden" style={{ background: 'var(--card)', border: '1px solid var(--border)', alignSelf: 'start' }}>
          {/* Tab bar */}
          <div className="flex" style={{ borderBottom: '1px solid var(--border)' }}>
            {([
              { key: 'activity', label: 'Activity', icon: FileText },
              { key: 'thread', label: 'Thread', icon: MessageSquare },
            ] as const).map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setSideTab(key)}
                className="flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-semibold transition-all"
                style={{
                  color: sideTab === key ? 'var(--accent)' : 'var(--text-muted)',
                  borderBottom: sideTab === key ? '2px solid var(--accent)' : '2px solid transparent',
                  background: 'transparent',
                  marginBottom: -1,
                }}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
                {key === 'thread' && (po.comments ?? []).length > 0 && (
                  <span className="text-xs w-4 h-4 rounded-full flex items-center justify-center font-bold"
                    style={{ background: 'var(--accent)', color: '#1a0a00', fontSize: 9 }}>
                    {(po.comments ?? []).length}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="p-5">
            {sideTab === 'activity' && (
              <div>
                {(po.stage_completions ?? []).length === 0 ? (
                  <p className="text-sm py-4 text-center" style={{ color: 'var(--text-muted)' }}>No activity yet.</p>
                ) : (
                  <div className="space-y-4">
                    {[...(po.stage_completions ?? [])].reverse().map(sc => {
                      const accent = ROLE_ACCENT[sc.completed_by_role] ?? '#475569'
                      return (
                        <div key={sc.id} className="flex gap-3">
                          <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-white text-xs font-bold"
                            style={{ background: accent }}>
                            {sc.completed_by_name.charAt(0)}
                          </div>
                          <div className="min-w-0 pt-0.5">
                            <p className="text-xs leading-relaxed">
                              <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                                {sc.completed_by_name.split(' ')[0]}
                              </span>
                              <span style={{ color: 'var(--text-secondary)' }}> completed </span>
                              <span className="font-semibold" style={{ color: accent }}>Stage {sc.stage}</span>
                            </p>
                            {sc.notes && (
                              <p className="text-xs mt-1 px-2 py-1 rounded-lg" style={{ color: 'var(--text-secondary)', background: 'var(--surface)', fontSize: 11 }}>
                                {sc.notes}
                              </p>
                            )}
                            {sc.document_name && (
                              <p className="text-xs mt-1 flex items-center gap-1" style={{ color: '#2563eb' }}>
                                📎 {sc.document_name}
                              </p>
                            )}
                            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)', fontSize: 10 }}>{formatDate(sc.completed_at)}</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )}

            {sideTab === 'thread' && (
              <CommentThread
                poId={po.id}
                comments={po.comments ?? []}
                onComment={c => setPO(p => p ? { ...p, comments: [...(p.comments ?? []), c] } : p)}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
