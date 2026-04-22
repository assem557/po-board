import { NextResponse } from 'next/server'
import { updateVehicleBatch, updateVehicleBatchDetails, deleteVehicleBatch } from '@/lib/db'

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string; batchId: string }> }) {
  const { batchId } = await params
  const body = await req.json()
  try {
    if ('vin' in body || 'plate' in body) {
      await updateVehicleBatch(batchId, body.vin ?? '', body.plate ?? '')
    } else {
      await updateVehicleBatchDetails(batchId, body)
    }
    return NextResponse.json({ ok: true })
  } catch (e: unknown) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string; batchId: string }> }) {
  const { batchId } = await params
  try {
    await deleteVehicleBatch(batchId)
    return NextResponse.json({ ok: true })
  } catch (e: unknown) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
