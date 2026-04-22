'use client'
import { useState } from 'react'
import type { VehicleBatch } from '@/lib/types'

interface Props {
  batches: VehicleBatch[]
  editable?: boolean
  onUpdate?: (id: string, vin: string, plate: string) => void
}

export default function VehicleTable({ batches, editable, onUpdate }: Props) {
  const [edits, setEdits] = useState<Record<string, { vin: string; plate: string }>>({})
  const [saved, setSaved] = useState<Record<string, boolean>>({})
  const total = batches.reduce((s, b) => s + b.count, 0)
  const hasVin = batches.some(b => b.vin)

  async function handleSave(b: VehicleBatch) {
    const edit = edits[b.id] ?? { vin: b.vin ?? '', plate: b.plate ?? '' }
    await onUpdate?.(b.id, edit.vin, edit.plate)
    setSaved(p => ({ ...p, [b.id]: true }))
    setTimeout(() => setSaved(p => ({ ...p, [b.id]: false })), 2000)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
          Vehicles
        </h4>
        <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
          style={{ background: 'var(--blue-light)', color: 'var(--blue)' }}>
          {total} total
        </span>
      </div>

      <div className="rounded-lg overflow-hidden" style={{ border: '1px solid var(--border)' }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
              <th className="text-left px-4 py-2.5 text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>Color</th>
              <th className="text-left px-4 py-2.5 text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>Qty</th>
              <th className="text-left px-4 py-2.5 text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>City</th>
              {(editable || hasVin) && <>
                <th className="text-left px-4 py-2.5 text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>VIN</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>Plate</th>
                {editable && <th className="px-4 py-2.5" />}
              </>}
            </tr>
          </thead>
          <tbody>
            {batches.map((b, i) => {
              const edit = edits[b.id] ?? { vin: b.vin ?? '', plate: b.plate ?? '' }
              const isSaved = saved[b.id]
              return (
                <tr key={b.id} style={{ borderTop: i > 0 ? '1px solid var(--border)' : 'none' }}>
                  <td className="px-4 py-3 font-medium text-sm" style={{ color: 'var(--text-primary)' }}>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full border flex-shrink-0" style={{
                        background: b.color.toLowerCase() === 'white' ? '#fff' :
                          b.color.toLowerCase() === 'black' ? '#111' :
                          b.color.toLowerCase() === 'silver' ? '#c0c0c0' :
                          b.color.toLowerCase() === 'grey' ? '#888' :
                          b.color.toLowerCase() === 'red' ? '#dc2626' :
                          b.color.toLowerCase() === 'blue' ? '#2563eb' : '#94a3b8',
                        borderColor: 'var(--border)',
                      }} />
                      {b.color}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{b.count}</td>
                  <td className="px-4 py-3 text-sm" style={{ color: 'var(--text-secondary)' }}>{b.city}</td>
                  {(editable || hasVin) && (
                    <>
                      <td className="px-4 py-3">
                        {editable ? (
                          <input
                            value={edit.vin}
                            onChange={e => setEdits(p => ({ ...p, [b.id]: { ...edit, vin: e.target.value } }))}
                            placeholder="VIN…"
                            className="mono text-xs focus:outline-none rounded-md px-2 py-1.5"
                            style={{ border: '1px solid var(--border)', background: 'var(--surface)', width: 140 }}
                          />
                        ) : (
                          <span className="mono text-xs" style={{ color: 'var(--text-secondary)' }}>{b.vin || '—'}</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {editable ? (
                          <input
                            value={edit.plate}
                            onChange={e => setEdits(p => ({ ...p, [b.id]: { ...edit, plate: e.target.value } }))}
                            placeholder="Plate…"
                            className="mono text-xs focus:outline-none rounded-md px-2 py-1.5"
                            style={{ border: '1px solid var(--border)', background: 'var(--surface)', width: 100 }}
                          />
                        ) : (
                          <span className="mono text-xs" style={{ color: 'var(--text-secondary)' }}>{b.plate || '—'}</span>
                        )}
                      </td>
                      {editable && (
                        <td className="px-4 py-3">
                          <button
                            onClick={() => handleSave(b)}
                            className="text-xs font-medium px-2.5 py-1 rounded-md transition-all"
                            style={{
                              background: isSaved ? '#ecfdf5' : 'var(--blue-light)',
                              color: isSaved ? '#059669' : 'var(--blue)',
                            }}
                          >
                            {isSaved ? '✓ Saved' : 'Save'}
                          </button>
                        </td>
                      )}
                    </>
                  )}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
