'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function KeyboardShortcuts() {
  const router = useRouter()

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement).tagName
      const isTyping = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || (e.target as HTMLElement).isContentEditable

      // ⌘K — command palette
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        window.dispatchEvent(new CustomEvent('convoy:open-palette'))
        return
      }

      // Esc — close palette (handled in palette component)
      if (e.key === 'Escape') {
        window.dispatchEvent(new CustomEvent('convoy:close-palette'))
        return
      }

      if (isTyping) return

      // N — new PO
      if (e.key === 'n' || e.key === 'N') {
        router.push('/po/new')
        return
      }

      // / — focus board search
      if (e.key === '/') {
        e.preventDefault()
        window.dispatchEvent(new CustomEvent('convoy:focus-search'))
        return
      }

      // D — dealers
      if (e.key === 'd' || e.key === 'D') {
        router.push('/dealers')
        return
      }

      // B — back to board
      if (e.key === 'b' || e.key === 'B') {
        router.push('/')
        return
      }
    }

    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [router])

  return null
}
