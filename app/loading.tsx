export default function Loading() {
  return (
    <div>
      {/* Stats skeleton */}
      <div className="flex gap-3 mb-6 flex-wrap">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-16 w-40 rounded-xl animate-pulse" style={{ background: 'var(--border)' }} />
        ))}
      </div>
      {/* Filter bar skeleton */}
      <div className="flex gap-3 mb-5">
        <div className="h-9 w-56 rounded-lg animate-pulse" style={{ background: 'var(--border)' }} />
        <div className="h-9 w-72 rounded-lg animate-pulse" style={{ background: 'var(--border)' }} />
      </div>
      {/* Kanban skeleton */}
      <div className="flex gap-3 overflow-hidden">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="w-60 flex-shrink-0">
            <div className="h-20 rounded-lg animate-pulse mb-3" style={{ background: 'var(--border)' }} />
            <div className="space-y-2.5">
              {Array.from({ length: i % 3 === 0 ? 2 : 1 }).map((_, j) => (
                <div key={j} className="h-28 rounded-xl animate-pulse" style={{ background: 'var(--border)' }} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
