'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { UserRole } from './types'

interface UserState {
  name: string
  role: UserRole
  setUser: (name: string, role: UserRole) => void
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      name: 'Assem Soliman',
      role: 'ops',
      setUser: (name, role) => set({ name, role }),
    }),
    { name: 'po-board-user' }
  )
)
