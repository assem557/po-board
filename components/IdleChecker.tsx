'use client'
import { useEffect, useRef } from 'react'
import { useNotifStore, STAGE_NEXT_TEAM } from '@/lib/notifications'
import type { PurchaseOrder } from '@/lib/types'
import { daysSince } from '@/lib/utils'
import { getStage } from '@/lib/stages'

interface Props { pos: PurchaseOrder[] }

export default function IdleChecker({ pos }: Props) {
  const { notifications, add } = useNotifStore()
  const checked = useRef(false)

  useEffect(() => {
    if (checked.current) return
    checked.current = true

    const IDLE_THRESHOLD_HOURS = 24

    for (const po of pos) {
      if (po.status !== 'active' || po.current_stage >= 8) continue

      const lastAction = [...(po.stage_completions ?? [])]
        .sort((a, b) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime())[0]

      const sinceMs = lastAction
        ? Date.now() - new Date(lastAction.completed_at).getTime()
        : Date.now() - new Date(po.created_at).getTime()

      const hoursIdle = sinceMs / 3_600_000

      if (hoursIdle >= IDLE_THRESHOLD_HOURS) {
        // Only fire if we haven't already notified about this PO at this stage today
        const alreadyNotified = notifications.some(
          n => n.type === 'stage_idle' && n.poId === po.id &&
            daysSince(n.createdAt) < 1
        )
        if (alreadyNotified) continue

        const stage = getStage(po.current_stage)
        const forTeam = STAGE_NEXT_TEAM[po.current_stage - 1] ?? stage.team
        const hoursLabel = hoursIdle >= 48
          ? `${Math.floor(hoursIdle / 24)} days`
          : `${Math.floor(hoursIdle)}h`

        add({
          type: 'stage_idle',
          title: `Idle: ${po.dealer_name} stuck at Stage ${po.current_stage}`,
          body: `No action from ${stage.teamLabel} for ${hoursLabel}. Needs attention.`,
          poId: po.id,
          poNumber: po.po_number,
          dealerName: po.dealer_name,
          forTeam,
        })
      }
    }
  }, [pos])

  return null
}
