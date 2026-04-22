import { NextResponse } from 'next/server'
import { getPO, advanceStage } from '@/lib/db'
import { getStage } from '@/lib/stages'

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const po = await getPO(id)

  if (!po) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (po.current_stage >= 8) return NextResponse.json({ error: 'PO is already complete' }, { status: 400 })

  const body = await req.json()
  const { completedBy, notes, document_url, document_name, extra_data } = body

  if (!completedBy?.name || !completedBy?.role) {
    return NextResponse.json({ error: 'completedBy name and role required' }, { status: 400 })
  }

  const stage = getStage(po.current_stage)

  if (stage.requiresDocument && !document_url) {
    return NextResponse.json({ error: stage.gateLabel }, { status: 422 })
  }
  if (stage.requiresNote && !notes?.trim()) {
    return NextResponse.json({ error: stage.gateLabel }, { status: 422 })
  }

  try {
    const updated = await advanceStage(id, completedBy, { notes, document_url, document_name, extra_data })
    if (!updated) return NextResponse.json({ error: 'Could not advance stage' }, { status: 500 })
    return NextResponse.json(updated)
  } catch (e: unknown) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
