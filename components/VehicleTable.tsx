'use client'
import { useState } from 'react'
import { Plus, Trash2, Save } from 'lucide-react'
import type { VehicleBatch } from '@/lib/types'
import { COLORS, CITIES, COLOR_SWATCH } from '@/lib/constants'

interface Props {
  batches: VehicleBatch[]
  poId?: string
  editMode?: 'vin-plate' | 'batches'
  onUpdate?: (id: string, vin: string, plate: string) => void
  onRefresh?: () => void
}

function ColorDot({ color }: { color: string }) {
  const hex = COLOR_SWATCH[color] ?? '#94a3b8'
  return (
    <div className="w-3 h-3 rounded-full border flex-shrink-0"
      style={{ background: hex, borderColor: color === 'White' ? '#d1d5db' : hex }} />
  )
}

export default function VehicleTable({ batches, poId, editMode, onUpdate, onRefresh }: Props) {
  // VIN/Plate editing state (stage 6)
  const [edits, setEdits] = useState<Record<string, { vin: string; plate: string }>>({})
  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  // Batch editing state (stage 1)
  const [newRows, setNewRows] = useState<{ color: string; count: number; city: string }[]>([])
  const [batchSaving, setBatchSaving] = useState(false)
  const [batchError, setBatchError] = useState('')

  const total = batches.reduce((s, b) => s + b.count, 0)
  const hasVin = batches.some(b => b.vin)
  const dirtyCount = Object.keys(edits).length

  async function handleSaveAll() {
    if (!dirtyCount) return
    setSaving(true)
    try {
      await Promise.all(
        Object.entries(edits).map(([id, e]) =>
          fetch(`/api/purchase-orders/${poId}/vehicles/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ vin: e.vin, plate: e.plate }),
          })
        )
      )
      setEdits({})
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 2500)
      onRefresh?.()
    } finally {
      setSaving(false)
    }
  }

  async function handleDeleteBatch(batchId: string) {
    await fetch(`/api/purchase-orders/${poId}/vehicles/${batchId}`, { method: 'DELETE' })
    onRefresh?.()
  }

  async function handleSaveBatches() {
    const valid = newRows.filter(r => r.color && r.city && r.count > 0)
    if (valid.length === 0) return
    setBatchSaving(true)
    setBatchError('')
    try {
      await Promise.all(
        valid.map(r =>
          fetch(`/api/purchase-orders/${poId}/vehicles`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(r),
          })
        )
      )
      setNewRows([])
      onRefresh?.()
    } catch {
      setBatchError('Failed to save. Please try again.')
    } finally {
      setBatchSaving(false)
    }
  }

  const inputCls = "focus:outline-none text-xs rounded-md px-2 py-1.5 mono"
  const inputStyle = { border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-primary)' }
  const selectStyle = { ...inputStyle, padding: '6px 8px', fontSize: 13, borderRadius: 6, width: '100%', outline: 'none' }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
          Vehicles
        </h4>
        <div className="flex items-center gap-2">
          {editMode === 'vin-plate' && dirtyCount > 0 && (
            <button onClick={handleSaveAll} disabled={saving}
              className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-md transition-all"
              style={{ background: saveSuccess ? '#ecfdf5' : 'var(--blue-light)', color: saveSuccess ? '#059669' : 'var(--blue)' }}>
              <Save className="w-3 h-3" />
              {saving ? 'Saving…' : saveSuccess ? 'Saved!' : `Save ${dirtyCount} change${dirtyCount > 1 ? 's' : ''}`}
            </button>
          )}
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
            style={{ background: 'var(--blue-light)', color: 'var(--blue)' }}>
            {total} total
          </span>
        </div>
      </div>

      <div className="rounded-lg overflow-hidden" style={{ border: '1px solid var(--border)' }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
              <th className="text-left px-4 py-2.5 text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>Color</th>
              <th className="text-left px-4 py-2.5 text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>Qty</th>
              <th className="text-left px-4 py-2.5 text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>City</th>
              {(editMode === 'vin-plate' || hasVin) && (
                <>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>VIN</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>Plate</th>
                </>
              )}
              {editMode === 'batches' && <th className="px-4 py-2.5 w-10" />}
            </tr>
          </thead>
          <tbody>
            {batches.map((b, i) => {
              const edit = edits[b.id] ?? { vin: b.vin ?? '', plate: b.plate ?? '' }
              const isDirty = !!edits[b.id]
              return (
                <tr key={b.id} style={{ borderTop: i > 0 ? '1px solid var(--border)' : 'none', background: isDirty ? 'var(--blue-light)' : 'transparent' }}>
                  <td className="px-4 py-3 font-medium text-sm" style={{ color: 'var(--text-primary)' }}>
                    <div className="flex items-center gap-2">
                      <ColorDot color={b.color} />
                      {b.color}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{b.count}</td>
                  <td className="px-4 py-3 text-sm" style={{ color: 'var(--text-secondary)' }}>{b.city}</td>
                  {(editMode === 'vin-plate' || hasVin) && (
                    <>
                      <td className="px-4 py-3">
                        {editMode === 'vin-plate' ? (
                          <input
                            value={edit.vin}
                            onChange={e => setEdits(p => ({ ...p, [b.id]: { ...edit, vin: e.target.value } }))}
                            placeholder="VIN…"
                            className={inputCls}
                            style={{ ...inputStyle, width: 140 }}
                          />
                        ) : (
                          <span className="mono text-xs" style={{ color: 'var(--text-secondary)' }}>{b.vin || '—'}</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {editMode === 'vin-plate' ? (
                          <input
                            value={edit.plate}
                            onChange={e => setEdits(p => ({ ...p, [b.id]: { ...edit, plate: e.target.value } }))}
                            placeholder="Plate…"
                            className={inputCls}
                            style={{ ...inputStyle, width: 100 }}
                          />
                        ) : (
                          <span className="mono text-xs" style={{ color: 'var(--text-secondary)' }}>{b.plate || '—'}</span>
                        )}
                      </td>
                    </>
                  )}
                  {editMode === 'batches' && (
                    <td className="px-4 py-3">
                      <button onClick={() => handleDeleteBatch(b.id)}
                        className="p-1 rounded transition-opacity hover:opacity-60"
                        style={{ color: 'var(--text-muted)' }}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  )}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Add new rows (batch edit mode) */}
      {editMode === 'batches' && (
        <div className="mt-3 space-y-2">
          {newRows.map((r, i) => (
            <div key={i} className="grid grid-cols-12 gap-2 items-center">
              <div className="col-span-4">
                <select value={r.color} onChange={e => setNewRows(p => p.map((x, j) => j === i ? { ...x, color: e.target.value } : x))}
                  style={selectStyle}>
                  <option value="">Color…</option>
                  {COLORS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="col-span-2">
                <input type="number" min={1} value={r.count}
                  onChange={e => setNewRows(p => p.map((x, j) => j === i ? { ...x, count: parseInt(e.target.value) || 1 } : x))}
                  className="w-full text-center focus:outline-none text-sm rounded-md px-2 py-1.5"
                  style={inputStyle} />
              </div>
              <div className="col-span-5">
                <select value={r.city} onChange={e => setNewRows(p => p.map((x, j) => j === i ? { ...x, city: e.target.value } : x))}
                  style={selectStyle}>
                  <option value="">City…</option>
                  {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="col-span-1 flex justify-center">
                <button onClick={() => setNewRows(p => p.filter((_, j) => j !== i))}
                  className="p-1 rounded transition-opacity hover:opacity-60" style={{ color: 'var(--text-muted)' }}>
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}

          <div className="flex gap-2 pt-1">
            <button onClick={() => setNewRows(p => [...p, { color: '', count: 1, city: '' }])}
              className="flex items-center gap-1.5 text-xs font-medium transition-opacity hover:opacity-70"
              style={{ color: 'var(--blue)' }}>
              <Plus className="w-3.5 h-3.5" /> Add row
            </button>
            {newRows.length > 0 && (
              <button onClick={handleSaveBatches} disabled={batchSaving}
                className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-md"
                style={{ background: 'var(--navy)', color: 'white' }}>
                {batchSaving ? 'Saving…' : 'Save new rows'}
              </button>
            )}
          </div>
          {batchError && <p className="text-xs mt-1" style={{ color: 'var(--red)' }}>{batchError}</p>}
        </div>
      )}
    </div>
  )
}
