'use client'
import { useUserStore } from '@/lib/store'
import type { UserRole } from '@/lib/types'

const DEMO_USERS: { name: string; role: UserRole }[] = [
  { name: 'Abdullah Al-Amoudi', role: 'partnership' },
  { name: 'Finance Team', role: 'finance' },
  { name: 'Mohan', role: 'pricing' },
  { name: 'Islam', role: 'ops' },
  { name: 'Ahmed Abd Al-Hay', role: 'ops' },
  { name: 'Mohamed Faisal', role: 'tech' },
]

const ROLE_STYLES: Record<UserRole, string> = {
  partnership: '#7c3aed',
  finance: '#2563eb',
  pricing: '#ca8a04',
  ops: '#059669',
  tech: '#dc2626',
  admin: '#475569',
}

export default function UserSwitcher() {
  const { name, role, setUser } = useUserStore()

  return (
    <div className="flex items-center gap-2">
      <div
        className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
        style={{ background: ROLE_STYLES[role] }}
      >
        {name.charAt(0)}
      </div>
      <select
        value={`${name}|${role}`}
        onChange={e => {
          const [n, r] = e.target.value.split('|')
          setUser(n, r as UserRole)
        }}
        className="text-xs font-medium border-0 focus:outline-none focus:ring-0 cursor-pointer pr-1"
        style={{ background: 'transparent', color: 'rgba(255,255,255,0.8)' }}
      >
        {DEMO_USERS.map(u => (
          <option key={u.name} value={`${u.name}|${u.role}`} style={{ color: '#0f172a', background: 'white' }}>
            {u.name}
          </option>
        ))}
      </select>
      <span
        className="text-xs px-2 py-0.5 rounded-full font-medium"
        style={{ background: ROLE_STYLES[role] + '33', color: ROLE_STYLES[role], border: `1px solid ${ROLE_STYLES[role]}66` }}
      >
        {role}
      </span>
    </div>
  )
}
