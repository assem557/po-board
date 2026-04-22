import { NextResponse } from 'next/server'
import { getAllPOs, createPO } from '@/lib/db'

export async function GET() {
  try {
    const pos = await getAllPOs()
    return NextResponse.json(pos)
  } catch (e: unknown) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const body = await req.json()
  const { po_number, dealer_name, dealer_id, delivery_date, notes, batches } = body

  if (!po_number || !dealer_name || !batches?.length) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  try {
    const po = await createPO({ po_number, dealer_name, dealer_id, delivery_date, notes, batches })
    return NextResponse.json(po, { status: 201 })
  } catch (e: unknown) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
