import { NextResponse } from 'next/server'
import { getPO, updatePO } from '@/lib/db'

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

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  try {
    await updatePO(id, body)
    const po = await getPO(id)
    return NextResponse.json(po)
  } catch (e: unknown) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
