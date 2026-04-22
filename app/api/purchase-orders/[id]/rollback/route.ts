import { NextResponse } from 'next/server'
import { rollbackStage, getPO } from '@/lib/db'

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    await rollbackStage(id)
    const po = await getPO(id)
    return NextResponse.json(po)
  } catch (e: unknown) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
