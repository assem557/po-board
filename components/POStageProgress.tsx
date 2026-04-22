'use client'
import { Check } from 'lucide-react'
import { STAGES } from '@/lib/stages'
import { ROLE_ACCENT } from '@/lib/constants'

interface Props { currentStage: number }

export default function POStageProgress({ currentStage }: Props) {
  const isComplete = currentStage >= 8

  return (
    <div className="overflow-x-auto -mx-1 px-1">
      <div className="flex items-start min-w-max w-full">
        {STAGES.slice(0, 7).map((stage, i) => {
          const done = currentStage > stage.number
          const active = currentStage === stage.number && !isComplete
          const accent = ROLE_ACCENT[stage.team]

          return (
            <div key={stage.number} className="flex items-start flex-1 min-w-0">
              {/* Step */}
              <div className="flex flex-col items-center flex-shrink-0" style={{ width: 64 }}>
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all border-2"
                  style={{
                    background: done ? accent : active ? 'var(--card)' : 'var(--surface)',
                    borderColor: done || active ? accent : 'var(--border)',
                    color: done ? 'white' : active ? accent : 'var(--text-muted)',
                    boxShadow: active ? `0 0 0 3px ${accent}22` : 'none',
                  }}
                >
                  {done ? <Check className="w-3.5 h-3.5" /> : stage.number}
                </div>
                <div className="text-center mt-1.5 px-0.5 w-full">
                  <p className="leading-tight truncate"
                    style={{
                      color: active ? accent : done ? 'var(--text-secondary)' : 'var(--text-muted)',
                      fontSize: 10,
                      fontWeight: active ? 600 : 400,
                    }}>
                    {stage.title}
                  </p>
                </div>
              </div>

              {/* Connector — flex-1 so it expands to fill space */}
              {i < 6 && (
                <div className="flex-1 h-0.5 mt-3.5 min-w-2"
                  style={{ background: currentStage > stage.number ? accent : 'var(--border)' }}
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
