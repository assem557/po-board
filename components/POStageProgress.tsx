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
              {/* Step node */}
              <div className="flex flex-col items-center flex-shrink-0" style={{ width: 70 }}>
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all border-2"
                  style={{
                    background: done ? accent : active ? 'var(--card)' : 'var(--surface)',
                    borderColor: done || active ? accent : 'var(--border)',
                    color: done ? 'white' : active ? accent : 'var(--text-muted)',
                    boxShadow: active ? `0 0 0 4px ${accent}20, 0 2px 8px ${accent}30` : done ? `0 2px 8px ${accent}40` : 'none',
                    fontSize: done ? undefined : 13,
                  }}
                >
                  {done ? <Check className="w-4 h-4" /> : stage.number}
                </div>
                <div className="text-center mt-2 px-0.5 w-full">
                  <p className="leading-tight"
                    style={{
                      color: active ? accent : done ? 'var(--text-secondary)' : 'var(--text-muted)',
                      fontSize: 10,
                      fontWeight: active ? 700 : done ? 500 : 400,
                      maxWidth: 64,
                      margin: '0 auto',
                      wordBreak: 'break-word',
                      lineHeight: 1.3,
                    }}>
                    {stage.title}
                  </p>
                  {active && (
                    <p className="text-xs mt-0.5" style={{ color: accent, fontSize: 9, fontWeight: 600, opacity: 0.8 }}>
                      NOW
                    </p>
                  )}
                </div>
              </div>

              {/* Connector */}
              {i < 6 && (
                <div className="flex-1 mt-4 min-w-2" style={{ height: 2, position: 'relative' }}>
                  {/* Background track */}
                  <div style={{ position: 'absolute', inset: 0, background: 'var(--border)', borderRadius: 2 }} />
                  {/* Fill — only if done */}
                  {currentStage > stage.number && (
                    <div style={{
                      position: 'absolute',
                      inset: 0,
                      background: accent,
                      borderRadius: 2,
                    }} />
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
