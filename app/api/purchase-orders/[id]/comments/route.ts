import { NextResponse } from 'next/server'
import { addComment } from '@/lib/db'

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const { author_name, author_role, body: text } = body

  if (!author_name || !author_role || !text?.trim()) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  try {
    const comment = await addComment(id, { author_name, author_role, body: text })
    return NextResponse.json(comment, { status: 201 })
  } catch (e: unknown) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
