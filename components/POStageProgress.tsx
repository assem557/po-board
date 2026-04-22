'use client'
import { Check } from 'lucide-react'
import { STAGES } from '@/lib/stages'

const TEAM_ACCENT: Record<string, string> = {
  partnership: '#7c3aed',
  finance: '#2563eb',
  pricing: '#ca8a04',
  ops: '#059669',
  tech: '#dc2626',
  admin: '#475569',
}

interface Props { currentStage: number }

export default function POStageProgress({ currentStage }: Props) {
  const isComplete = currentStage >= 8

  return (
    <div className="overflow-x-auto -mx-1 px-1">
      <div className="flex items-start gap-0 min-w-max">
        {STAGES.slice(0, 7).map((stage, i) => {
          const done = currentStage > stage.number
          const active = currentStage === stage.number && !isComplete
          const accent = TEAM_ACCENT[stage.team]

          return (
            <div key={stage.number} className="flex items-start">
              {/* Step */}
              <div className="flex flex-col items-center" style={{ width: 72 }}>
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all border-2"
                  style={{
                    background: done ? accent : active ? 'white' : 'var(--surface)',
                    borderColor: done || active ? accent : 'var(--border)',
                    color: done ? 'white' : active ? accent : 'var(--text-muted)',
                    boxShadow: active ? `0 0 0 3px ${accent}22` : 'none',
                  }}
                >
                  {done ? <Check className="w-3.5 h-3.5" /> : stage.number}
                </div>
                <div className="text-center mt-1.5 px-1">
                  <p className="text-xs font-medium leading-tight"
                    style={{ color: active ? accent : done ? 'var(--text-secondary)' : 'var(--text-muted)', fontSize: 10 }}>
                    {stage.title}
                  </p>
                </div>
              </div>

              {/* Connector */}
              {i < 6 && (
                <div
                  className="h-0.5 flex-shrink-0 mt-3.5"
                  style={{
                    width: 20,
                    background: currentStage > stage.number ? accent : 'var(--border)',
                  }}
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
