import { NextResponse } from 'next/server'
import { getPO } from '@/lib/db'

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const po = await getPO(id)
    if (!po) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(po)
  } catch (e: unknown) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
