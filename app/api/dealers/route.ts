import { NextResponse } from 'next/server'
import { getAllDealers, createDealer } from '@/lib/db'

export async function GET() {
  try {
    const dealers = await getAllDealers()
    return NextResponse.json(dealers)
  } catch (e: unknown) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const body = await req.json()
  const { name, type, city, has_working_hours, has_branches } = body
  if (!name?.trim()) return NextResponse.json({ error: 'Name required' }, { status: 400 })
  try {
    const dealer = await createDealer({ name, type, city, has_working_hours: !!has_working_hours, has_branches: !!has_branches })
    return NextResponse.json(dealer, { status: 201 })
  } catch (e: unknown) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
