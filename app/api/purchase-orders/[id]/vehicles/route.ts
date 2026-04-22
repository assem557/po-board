import { NextResponse } from 'next/server'
import { addVehicleBatch } from '@/lib/db'

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { color, count, city } = await req.json()
  if (!color || !city || !count) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  try {
    const batch = await addVehicleBatch(id, { color, count: Number(count), city })
    return NextResponse.json(batch, { status: 201 })
  } catch (e: unknown) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
