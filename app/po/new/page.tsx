'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, ArrowLeft, ArrowRight } from 'lucide-react'
import Link from 'next/link'

interface Batch { color: string; count: number; city: string }

const CITIES = ['Riyadh', 'Jeddah', 'Dammam', 'Mecca', 'Medina', 'Khobar', 'Tabuk']
const COLORS = ['White', 'Black', 'Silver', 'Grey', 'Red', 'Blue', 'Pearl', 'Champagne']

const inputStyle = (error?: string) => ({
  border: `1px solid ${error ? '#dc2626' : 'var(--border)'}`,
  background: 'var(--surface)',
  color: 'var(--text-primary)',
  borderRadius: 8,
  padding: '8px 12px',
  fontSize: 14,
  width: '100%',
  outline: 'none',
  transition: 'border-color .15s',
})

export default function NewPOPage() {
  const router = useRouter()
  const [poNumber, setPoNumber] = useState('')
  const [dealerName, setDealerName] = useState('')
  const [deliveryDate, setDeliveryDate] = useState('')
  const [notes, setNotes] = useState('')
  const [batches, setBatches] = useState<Batch[]>([{ color: '', count: 1, city: '' }])
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  function validate(): boolean {
    const e: Record<string, string> = {}
    if (!poNumber.trim()) e.poNumber = 'Required'
    if (!dealerName.trim()) e.dealerName = 'Required'
    batches.forEach((b, i) => {
      if (!b.color) e[`b${i}c`] = 'Required'
      if (!b.city) e[`b${i}ci`] = 'Required'
    })
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    setSubmitting(true)
    try {
      const res = await fetch('/api/purchase-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ po_number: poNumber, dealer_name: dealerName, delivery_date: deliveryDate || undefined, notes: notes || undefined, batches }),
      })
      if (res.ok) router.push(`/po/${(await res.json()).id}`)
    } finally { setSubmitting(false) }
  }

  const total = batches.reduce((s, b) => s + Number(b.count || 0), 0)

  return (
    <div style={{ maxWidth: 640, margin: '0 auto' }}>
      <Link href="/" className="inline-flex items-center gap-1.5 text-sm mb-7 transition-colors hover:opacity-70"
        style={{ color: 'var(--text-secondary)' }}>
        <ArrowLeft className="w-3.5 h-3.5" /> Back to board
      </Link>

      <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--card)', border: '1px solid var(--border)', boxShadow: '0 4px 24px rgba(0,0,0,0.07)' }}>
        {/* Form header */}
        <div className="px-7 py-6" style={{ borderBottom: '1px solid var(--border)', background: 'var(--navy)' }}>
          <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
            New Purchase Order
          </p>
          <h1 className="text-xl font-bold text-white">Vehicle Onboarding Request</h1>
          <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.5)' }}>
            Creates a PO at Stage 1 — assigned to Partnership.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="px-7 py-6 space-y-6">
          {/* PO details */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: 'var(--text-secondary)' }}>
                PO Number <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <input
                value={poNumber}
                onChange={e => setPoNumber(e.target.value)}
                placeholder="e.g. PO-2024-004"
                className="mono"
                style={inputStyle(errors.poNumber)}
              />
              {errors.poNumber && <p className="text-xs mt-1" style={{ color: '#dc2626' }}>{errors.poNumber}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: 'var(--text-secondary)' }}>
                Dealer Name <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <input
                value={dealerName}
                onChange={e => setDealerName(e.target.value)}
                placeholder="e.g. Hanko Motors"
                style={inputStyle(errors.dealerName)}
              />
              {errors.dealerName && <p className="text-xs mt-1" style={{ color: '#dc2626' }}>{errors.dealerName}</p>}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: 'var(--text-secondary)' }}>
              Delivery Date
            </label>
            <input type="date" value={deliveryDate} onChange={e => setDeliveryDate(e.target.value)} style={inputStyle()} />
          </div>

          {/* Vehicle batches */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>
                Vehicles <span className="font-normal normal-case" style={{ color: 'var(--text-muted)' }}>({total} total)</span>
              </label>
              <button type="button" onClick={() => setBatches(p => [...p, { color: '', count: 1, city: '' }])}
                className="flex items-center gap-1 text-xs font-medium transition-opacity hover:opacity-70"
                style={{ color: 'var(--blue)' }}>
                <Plus className="w-3 h-3" /> Add row
              </button>
            </div>

            <div className="rounded-lg overflow-hidden" style={{ border: '1px solid var(--border)' }}>
              <div className="grid grid-cols-12 gap-0 px-3 py-2 text-xs font-semibold uppercase tracking-wide"
                style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                <span className="col-span-4">Color</span>
                <span className="col-span-2">Qty</span>
                <span className="col-span-5">City</span>
                <span className="col-span-1"></span>
              </div>
              {batches.map((b, i) => (
                <div key={i} className="grid grid-cols-12 gap-0 items-center"
                  style={{ borderBottom: i < batches.length - 1 ? '1px solid var(--border)' : 'none' }}>
                  <div className="col-span-4 p-1.5">
                    <select value={b.color} onChange={e => setBatches(p => p.map((x, j) => j === i ? { ...x, color: e.target.value } : x))}
                      className="w-full text-sm focus:outline-none"
                      style={{ ...inputStyle(errors[`b${i}c`]), padding: '6px 8px' }}>
                      <option value="">Color…</option>
                      {COLORS.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="col-span-2 p-1.5">
                    <input type="number" min={1} value={b.count}
                      onChange={e => setBatches(p => p.map((x, j) => j === i ? { ...x, count: parseInt(e.target.value) || 1 } : x))}
                      className="w-full text-sm text-center focus:outline-none"
                      style={{ ...inputStyle(), padding: '6px 8px' }} />
                  </div>
                  <div className="col-span-5 p-1.5">
                    <select value={b.city} onChange={e => setBatches(p => p.map((x, j) => j === i ? { ...x, city: e.target.value } : x))}
                      className="w-full text-sm focus:outline-none"
                      style={{ ...inputStyle(errors[`b${i}ci`]), padding: '6px 8px' }}>
                      <option value="">City…</option>
                      {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="col-span-1 flex justify-center">
                    {batches.length > 1 && (
                      <button type="button" onClick={() => setBatches(p => p.filter((_, j) => j !== i))}
                        className="p-1.5 rounded transition-colors hover:opacity-70"
                        style={{ color: 'var(--text-muted)' }}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: 'var(--text-secondary)' }}>
              Notes
            </label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)}
              placeholder="Special instructions, context, urgency…"
              rows={2}
              className="resize-none focus:outline-none"
              style={{ ...inputStyle(), height: 'auto' }} />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <Link href="/"
              className="flex-1 text-center py-2.5 rounded-lg text-sm font-medium transition-colors"
              style={{ border: '1px solid var(--border)', color: 'var(--text-secondary)', background: 'var(--surface)' }}>
              Cancel
            </Link>
            <button type="submit" disabled={submitting}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all"
              style={{ background: submitting ? 'var(--border)' : 'var(--navy)', color: submitting ? 'var(--text-muted)' : 'white' }}>
              {submitting ? 'Creating…' : (<>Create PO <ArrowRight className="w-4 h-4" /></>)}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
