'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type NotifType = 'stage_advanced' | 'stage_idle' | 'comment' | 'info'

export interface Notification {
  id: string
  type: NotifType
  title: string
  body: string
  poId: string
  poNumber: string
  dealerName: string
  forTeam: string        // which team this notification targets
  createdAt: string
  readAt?: string
}

interface NotifState {
  notifications: Notification[]
  add: (n: Omit<Notification, 'id' | 'createdAt'>) => void
  markRead: (id: string) => void
  markAllRead: (team: string) => void
  clear: () => void
}

export const useNotifStore = create<NotifState>()(
  persist(
    (set) => ({
      notifications: [],
      add: (n) =>
        set(s => ({
          notifications: [
            { ...n, id: `notif-${Date.now()}`, createdAt: new Date().toISOString() },
            ...s.notifications,
          ].slice(0, 50), // keep latest 50
        })),
      markRead: (id) =>
        set(s => ({
          notifications: s.notifications.map(n =>
            n.id === id ? { ...n, readAt: new Date().toISOString() } : n
          ),
        })),
      markAllRead: (team) =>
        set(s => ({
          notifications: s.notifications.map(n =>
            n.forTeam === team && !n.readAt ? { ...n, readAt: new Date().toISOString() } : n
          ),
        })),
      clear: () => set({ notifications: [] }),
    }),
    { name: 'po-board-notifications' }
  )
)

// Stage → next team mapping (who gets notified when stage N completes)
export const STAGE_NEXT_TEAM: Record<number, string> = {
  1: 'finance',       // Partnership done → notify Finance
  2: 'pricing',       // Finance done → notify Pricing
  3: 'partnership',   // Pricing done → notify Partnership
  4: 'ops',           // Partnership done → notify Ops
  5: 'ops',           // Ops done → notify Ops (Ahmed)
  6: 'pricing',       // Ops done → notify Pricing (Mohan)
  7: 'admin',         // Pricing done → complete
}

export const STAGE_NEXT_LABEL: Record<number, string> = {
  1: 'Finance needs to issue the PO',
  2: 'Pricing needs to approve prices',
  3: 'Partnership needs to notify the dealer',
  4: 'Operations needs to create SKU & upload',
  5: 'Operations (Ahmed) needs to verify dealer setup',
  6: 'Pricing (Mohan) needs to upload prices to platform',
  7: 'PO is now complete',
}
