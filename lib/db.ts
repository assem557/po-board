import { createClient } from '@supabase/supabase-js'
import type { PurchaseOrder, Dealer, VehicleBatch, POStageCompletion, POComment } from './types'

function getClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// ── READ ──────────────────────────────────────────────────────────────────────

export async function getAllPOs(): Promise<PurchaseOrder[]> {
  const sb = getClient()
  const { data, error } = await sb
    .from('purchase_orders')
    .select(`
      *,
      vehicle_batches (*),
      po_stage_completions (*)
    `)
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data ?? []).map(row => ({
    ...row,
    stage_completions: row.po_stage_completions ?? [],
  }))
}

export async function getPO(id: string): Promise<PurchaseOrder | undefined> {
  const sb = getClient()
  const { data, error } = await sb
    .from('purchase_orders')
    .select(`
      *,
      vehicle_batches (*),
      po_stage_completions (*),
      po_comments (*)
    `)
    .eq('id', id)
    .single()

  if (error || !data) return undefined
  return {
    ...data,
    stage_completions: data.po_stage_completions ?? [],
    comments: data.po_comments ?? [],
  }
}

export async function getAllDealers(): Promise<Dealer[]> {
  const sb = getClient()
  const { data } = await sb.from('dealers').select('*').order('name')
  return data ?? []
}

// ── WRITE ─────────────────────────────────────────────────────────────────────

export async function createPO(input: {
  po_number: string
  dealer_name: string
  dealer_id?: string
  delivery_date?: string
  notes?: string
  batches: { color: string; count: number; city: string }[]
}): Promise<PurchaseOrder> {
  const sb = getClient()

  const { data: po, error: poError } = await sb
    .from('purchase_orders')
    .insert({
      po_number: input.po_number,
      dealer_name: input.dealer_name,
      dealer_id: input.dealer_id ?? null,
      delivery_date: input.delivery_date ?? null,
      notes: input.notes ?? null,
      current_stage: 1,
      status: 'active',
    })
    .select()
    .single()

  if (poError || !po) throw poError ?? new Error('Failed to create PO')

  if (input.batches.length > 0) {
    const { error: batchError } = await sb.from('vehicle_batches').insert(
      input.batches.map(b => ({ ...b, po_id: po.id }))
    )
    if (batchError) throw batchError
  }

  return po
}

export async function advanceStage(
  po_id: string,
  completedBy: { name: string; role: string },
  data: { notes?: string; document_url?: string; document_name?: string; extra_data?: Record<string, unknown> }
): Promise<PurchaseOrder | null> {
  const sb = getClient()

  const { data: po } = await sb
    .from('purchase_orders')
    .select('current_stage, status')
    .eq('id', po_id)
    .single()

  if (!po || po.current_stage >= 8) return null

  const newStage = po.current_stage + 1

  // Record completion
  await sb.from('po_stage_completions').insert({
    po_id,
    stage: po.current_stage,
    completed_by_name: completedBy.name,
    completed_by_role: completedBy.role,
    notes: data.notes ?? null,
    document_url: data.document_url ?? null,
    document_name: data.document_name ?? null,
    extra_data: data.extra_data ?? null,
  })

  // Advance stage
  await sb
    .from('purchase_orders')
    .update({
      current_stage: newStage,
      status: newStage === 8 ? 'complete' : 'active',
    })
    .eq('id', po_id)

  return (await getPO(po_id)) ?? null
}

export async function updateVehicleBatch(id: string, vin: string, plate: string): Promise<void> {
  const sb = getClient()
  await sb.from('vehicle_batches').update({ vin, plate }).eq('id', id)
}

export async function updatePO(
  id: string,
  input: { dealer_name?: string; delivery_date?: string | null; notes?: string | null }
): Promise<void> {
  const sb = getClient()
  await sb.from('purchase_orders').update(input).eq('id', id)
}

export async function cancelPO(id: string): Promise<void> {
  const sb = getClient()
  await sb.from('purchase_orders').update({ status: 'cancelled' }).eq('id', id)
}

export async function reopenPO(id: string): Promise<void> {
  const sb = getClient()
  await sb.from('purchase_orders').update({ status: 'active' }).eq('id', id)
}

export async function rollbackStage(po_id: string): Promise<void> {
  const sb = getClient()
  const { data: po } = await sb
    .from('purchase_orders')
    .select('current_stage')
    .eq('id', po_id)
    .single()

  if (!po || po.current_stage <= 1) return

  const { data: completions } = await sb
    .from('po_stage_completions')
    .select('id')
    .eq('po_id', po_id)
    .order('completed_at', { ascending: false })
    .limit(1)

  if (completions && completions.length > 0) {
    await sb.from('po_stage_completions').delete().eq('id', completions[0].id)
  }

  await sb
    .from('purchase_orders')
    .update({ current_stage: po.current_stage - 1, status: 'active' })
    .eq('id', po_id)
}

export async function createDealer(input: {
  name: string; type?: string; city?: string; has_working_hours: boolean; has_branches: boolean
}): Promise<Dealer> {
  const sb = getClient()
  const { data, error } = await sb.from('dealers').insert(input).select().single()
  if (error || !data) throw error ?? new Error('Failed to create dealer')
  return data
}

export async function updateDealer(id: string, input: Partial<Omit<Dealer, 'id'>>): Promise<void> {
  const sb = getClient()
  await sb.from('dealers').update(input).eq('id', id)
}

export async function addComment(
  po_id: string,
  data: { author_name: string; author_role: string; body: string }
): Promise<POComment> {
  const sb = getClient()
  const { data: comment, error } = await sb
    .from('po_comments')
    .insert({ po_id, ...data })
    .select()
    .single()

  if (error || !comment) throw error ?? new Error('Failed to add comment')
  return comment
}
