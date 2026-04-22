import { NextResponse } from 'next/server'
import { updateVehicleBatch } from '@/lib/db'

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string; batchId: string }> }) {
  const { batchId } = await params
  const { vin, plate } = await req.json()
  try {
    await updateVehicleBatch(batchId, vin ?? '', plate ?? '')
    return NextResponse.json({ ok: true })
  } catch (e: unknown) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
