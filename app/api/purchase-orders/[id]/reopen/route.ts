import { NextResponse } from 'next/server'
import { reopenPO } from '@/lib/db'

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    await reopenPO(id)
    return NextResponse.json({ ok: true })
  } catch (e: unknown) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
