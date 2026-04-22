import { NextResponse } from 'next/server'
import { cancelPO, addComment } from '@/lib/db'

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { reason, author_name, author_role } = await req.json()
  try {
    await cancelPO(id)
    if (reason?.trim()) {
      await addComment(id, {
        author_name: author_name ?? 'System',
        author_role: author_role ?? 'admin',
        body: `Cancelled: ${reason}`,
      })
    }
    return NextResponse.json({ ok: true })
  } catch (e: unknown) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
