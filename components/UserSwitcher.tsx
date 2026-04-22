'use client'
import { useUserStore } from '@/lib/store'
import { ROLE_ACCENT } from '@/lib/constants'
import type { UserRole } from '@/lib/types'

const DEMO_USERS: { name: string; role: UserRole }[] = [
  { name: 'Abdullah Al-Amoudi', role: 'partnership' },
  { name: 'Finance Team', role: 'finance' },
  { name: 'Mohan', role: 'pricing' },
  { name: 'Islam', role: 'ops' },
  { name: 'Ahmed Abd Al-Hay', role: 'ops' },
  { name: 'Mohamed Faisal', role: 'tech' },
]

export default function UserSwitcher() {
  const { name, role, setUser } = useUserStore()
  const accent = ROLE_ACCENT[role] ?? '#475569'

  return (
    <div className="flex items-center gap-2">
      <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
        style={{ background: accent }}>
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
      <span className="text-xs px-2 py-0.5 rounded-full font-medium"
        style={{ background: accent + '33', color: accent, border: `1px solid ${accent}66` }}>
        {role}
      </span>
    </div>
  )
}
