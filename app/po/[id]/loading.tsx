export default function Loading() {
  return (
    <div style={{ maxWidth: 960, margin: '0 auto' }}>
      {/* Back button */}
      <div className="h-5 w-16 rounded animate-pulse mb-6" style={{ background: 'var(--border)' }} />
      {/* Header card */}
      <div className="rounded-2xl overflow-hidden mb-5 animate-pulse" style={{ background: 'var(--border)', height: 160 }} />
      {/* Body */}
      <div className="grid gap-5" style={{ gridTemplateColumns: '1fr 320px' }}>
        <div className="space-y-5">
          <div className="rounded-xl animate-pulse" style={{ background: 'var(--border)', height: 220 }} />
          <div className="rounded-xl animate-pulse" style={{ background: 'var(--border)', height: 140 }} />
        </div>
        <div className="space-y-5">
          <div className="rounded-xl animate-pulse" style={{ background: 'var(--border)', height: 200 }} />
          <div className="rounded-xl animate-pulse" style={{ background: 'var(--border)', height: 160 }} />
        </div>
      </div>
    </div>
  )
}
