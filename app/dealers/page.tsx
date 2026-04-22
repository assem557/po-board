'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Plus, Check, X, Pencil, Building2, MapPin, Clock, GitBranch } from 'lucide-react'
import type { Dealer } from '@/lib/types'

const CITIES = ['Riyadh', 'Jeddah', 'Dammam', 'Mecca', 'Medina', 'Khobar', 'Tabuk']

const inputStyle = {
  border: '1px solid var(--border)',
  background: 'var(--surface)',
  color: 'var(--text-primary)',
  borderRadius: 8,
  padding: '7px 11px',
  fontSize: 14,
  width: '100%',
  outline: 'none',
}

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className="w-10 h-5 rounded-full transition-all relative flex-shrink-0"
      style={{ background: value ? '#059669' : 'var(--border)' }}
    >
      <span
        className="absolute top-0.5 w-4 h-4 rounded-full transition-all"
        style={{ background: 'white', left: value ? '22px' : '2px' }}
      />
    </button>
  )
}

export default function DealersPage() {
  const [dealers, setDealers] = useState<Dealer[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showAdd, setShowAdd] = useState(false)

  const [editName, setEditName] = useState('')
  const [editType, setEditType] = useState('')
  const [editCity, setEditCity] = useState('')
  const [editHours, setEditHours] = useState(false)
  const [editBranches, setEditBranches] = useState(false)

  const [newName, setNewName] = useState('')
  const [newType, setNewType] = useState('')
  const [newCity, setNewCity] = useState('')
  const [newHours, setNewHours] = useState(false)
  const [newBranches, setNewBranches] = useState(false)
  const [adding, setAdding] = useState(false)
  const [nameError, setNameError] = useState('')

  async function fetchDealers() {
    const res = await fetch('/api/dealers')
    if (res.ok) setDealers(await res.json())
    setLoading(false)
  }

  useEffect(() => { fetchDealers() }, [])

  function openEdit(d: Dealer) {
    setEditingId(d.id)
    setEditName(d.name)
    setEditType(d.type ?? '')
    setEditCity(d.city ?? '')
    setEditHours(d.has_working_hours)
    setEditBranches(d.has_branches)
  }

  async function saveEdit(id: string) {
    await fetch(`/api/dealers/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: editName, type: editType || null, city: editCity || null, has_working_hours: editHours, has_branches: editBranches }),
    })
    setEditingId(null)
    await fetchDealers()
  }

  async function handleAdd() {
    if (!newName.trim()) { setNameError('Name is required'); return }
    setNameError('')
    setAdding(true)
    await fetch('/api/dealers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName, type: newType || null, city: newCity || null, has_working_hours: newHours, has_branches: newBranches }),
    })
    setNewName(''); setNewType(''); setNewCity(''); setNewHours(false); setNewBranches(false)
    setAdding(false)
    setShowAdd(false)
    await fetchDealers()
  }

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <Link href="/" className="inline-flex items-center gap-1.5 text-sm mb-7 transition-opacity hover:opacity-60"
        style={{ color: 'var(--text-secondary)' }}>
        <ArrowLeft className="w-3.5 h-3.5" /> Board
      </Link>

      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Dealers</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
            {dealers.length} dealer{dealers.length !== 1 ? 's' : ''} configured
          </p>
        </div>
        <button onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium"
          style={{ background: 'var(--navy)', color: 'white' }}>
          <Plus className="w-4 h-4" /> Add Dealer
        </button>
      </div>

      {/* Add form */}
      {showAdd && (
        <div className="rounded-xl p-5 mb-5" style={{ background: 'var(--card)', border: '1px solid var(--blue)' }}>
          <h3 className="font-semibold text-sm mb-4" style={{ color: 'var(--text-primary)' }}>New Dealer</h3>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                Name <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Dealer name" style={inputStyle} />
              {nameError && <p className="text-xs mt-1" style={{ color: '#dc2626' }}>{nameError}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: 'var(--text-secondary)' }}>Type</label>
              <select value={newType} onChange={e => setNewType(e.target.value)} style={inputStyle}>
                <option value="">Select type…</option>
                <option value="STO">STO</option>
                <option value="STS">STS</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: 'var(--text-secondary)' }}>City</label>
              <select value={newCity} onChange={e => setNewCity(e.target.value)} style={inputStyle}>
                <option value="">Select city…</option>
                {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div className="flex items-center gap-6 mb-4">
            <label className="flex items-center gap-2.5 text-sm cursor-pointer" style={{ color: 'var(--text-secondary)' }}>
              <Toggle value={newHours} onChange={setNewHours} />
              Working hours configured
            </label>
            <label className="flex items-center gap-2.5 text-sm cursor-pointer" style={{ color: 'var(--text-secondary)' }}>
              <Toggle value={newBranches} onChange={setNewBranches} />
              Branches configured
            </label>
          </div>
          <div className="flex gap-2">
            <button onClick={handleAdd} disabled={adding}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium"
              style={{ background: 'var(--navy)', color: 'white' }}>
              <Check className="w-3.5 h-3.5" /> {adding ? 'Adding…' : 'Add Dealer'}
            </button>
            <button onClick={() => { setShowAdd(false); setNameError('') }}
              className="px-4 py-2 rounded-lg text-sm"
              style={{ border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Dealer list */}
      {loading ? (
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Loading…</p>
      ) : (
        <div className="space-y-2">
          {dealers.map(d => (
            <div key={d.id} className="rounded-xl overflow-hidden"
              style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
              {editingId === d.id ? (
                <div className="p-5 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: 'var(--text-secondary)' }}>Name</label>
                      <input value={editName} onChange={e => setEditName(e.target.value)} style={inputStyle} />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: 'var(--text-secondary)' }}>Type</label>
                      <select value={editType} onChange={e => setEditType(e.target.value)} style={inputStyle}>
                        <option value="">Select type…</option>
                        <option value="STO">STO</option>
                        <option value="STS">STS</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: 'var(--text-secondary)' }}>City</label>
                      <select value={editCity} onChange={e => setEditCity(e.target.value)} style={inputStyle}>
                        <option value="">Select city…</option>
                        {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <label className="flex items-center gap-2.5 text-sm cursor-pointer" style={{ color: 'var(--text-secondary)' }}>
                      <Toggle value={editHours} onChange={setEditHours} />
                      Working hours
                    </label>
                    <label className="flex items-center gap-2.5 text-sm cursor-pointer" style={{ color: 'var(--text-secondary)' }}>
                      <Toggle value={editBranches} onChange={setEditBranches} />
                      Branches
                    </label>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => saveEdit(d.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium"
                      style={{ background: '#059669', color: 'white' }}>
                      <Check className="w-3 h-3" /> Save
                    </button>
                    <button onClick={() => setEditingId(null)}
                      className="px-3 py-1.5 rounded-lg text-xs"
                      style={{ border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-4 px-5 py-4">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: 'var(--surface)' }}>
                    <Building2 className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{d.name}</span>
                      {d.type && (
                        <span className="text-xs px-1.5 py-0.5 rounded font-medium"
                          style={{ background: 'var(--surface)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
                          {d.type}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 mt-1">
                      {d.city && (
                        <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                          <MapPin className="w-3 h-3" /> {d.city}
                        </span>
                      )}
                      <span className="flex items-center gap-1 text-xs" style={{ color: d.has_working_hours ? '#059669' : 'var(--text-muted)' }}>
                        <Clock className="w-3 h-3" /> Working hours
                      </span>
                      <span className="flex items-center gap-1 text-xs" style={{ color: d.has_branches ? '#059669' : 'var(--text-muted)' }}>
                        <GitBranch className="w-3 h-3" /> Branches
                      </span>
                    </div>
                  </div>
                  <button onClick={() => openEdit(d)}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs transition-all"
                    style={{ color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
                    <Pencil className="w-3 h-3" /> Edit
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
