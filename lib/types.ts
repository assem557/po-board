export type UserRole = 'admin' | 'ops' | 'partnership' | 'finance' | 'pricing' | 'tech'

export interface Dealer {
  id: string
  name: string
  type?: string
  city?: string
  status: string
  has_working_hours: boolean
  has_branches: boolean
}

export interface VehicleBatch {
  id: string
  po_id: string
  color: string
  count: number
  city: string
  vin?: string
  plate?: string
}

export interface POStageCompletion {
  id: string
  po_id: string
  stage: number
  completed_by_name: string
  completed_by_role: string
  notes?: string
  document_url?: string
  document_name?: string
  extra_data?: Record<string, unknown>
  completed_at: string
}

export interface POComment {
  id: string
  po_id: string
  author_name: string
  author_role: string
  body: string
  attachments: { name: string; url: string }[]
  created_at: string
}

export interface PurchaseOrder {
  id: string
  po_number: string
  dealer_id?: string
  dealer_name: string
  current_stage: number
  status: 'active' | 'complete' | 'cancelled'
  delivery_date?: string
  notes?: string
  created_by?: string
  created_at: string
  vehicle_batches?: VehicleBatch[]
  stage_completions?: POStageCompletion[]
  comments?: POComment[]
}

export interface StageDefinition {
  number: number
  title: string
  team: UserRole
  teamLabel: string
  description: string
  gateLabel: string
  requiresDocument: boolean
  requiresNote: boolean
  requiresCheckboxes?: string[]
  skipIfExistingDealer?: boolean
}
