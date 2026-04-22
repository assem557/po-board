import type { StageDefinition } from './types'

export const STAGES: StageDefinition[] = [
  {
    number: 1,
    title: 'PO Requested',
    team: 'partnership',
    teamLabel: 'Partnership',
    description: 'Partnership creates the PO with dealer info, car count, colors, and delivery cities.',
    gateLabel: 'PO number and vehicle batch details must be filled.',
    requiresDocument: false,
    requiresNote: false,
  },
  {
    number: 2,
    title: 'PO Issued by Finance',
    team: 'finance',
    teamLabel: 'Finance',
    description: 'Finance reviews the request and issues the official Purchase Order document.',
    gateLabel: 'Upload the official PO PDF to advance.',
    requiresDocument: true,
    requiresNote: false,
  },
  {
    number: 3,
    title: 'Pricing Approved',
    team: 'pricing',
    teamLabel: 'Pricing Team',
    description: 'Pricing team approves the dealer price and uploads Enfigo price.',
    gateLabel: 'Enter price confirmation and amount to advance.',
    requiresDocument: false,
    requiresNote: true,
  },
  {
    number: 4,
    title: 'Dealer Notified',
    team: 'partnership',
    teamLabel: 'Partnership',
    description: 'Partnership shares approved prices and branch details with the dealer.',
    gateLabel: 'Confirm dealer has been notified.',
    requiresDocument: false,
    requiresNote: false,
    requiresCheckboxes: ['Dealer notified of prices', 'Branch details shared'],
  },
  {
    number: 5,
    title: 'SKU Created & Uploaded',
    team: 'ops',
    teamLabel: 'Operations',
    description: 'Ops checks specs, creates SKU, updates PO Tracker, and uploads to Committed Vehicles.',
    gateLabel: 'Confirm SKU creation and PO Tracker update.',
    requiresDocument: false,
    requiresNote: false,
    requiresCheckboxes: ['SKU created', 'PO Tracker updated', 'Uploaded to Committed Vehicles'],
  },
  {
    number: 6,
    title: 'Dealer Setup Verified',
    team: 'ops',
    teamLabel: 'Operations (Ahmed)',
    description: 'Verify the dealer has working hours and branches configured. Fill in VIN & Plate numbers.',
    gateLabel: 'Verify working hours, branches, and fill VIN/Plate for all vehicles.',
    requiresDocument: false,
    requiresNote: false,
    requiresCheckboxes: ['Working hours configured', 'Branches configured'],
    skipIfExistingDealer: true,
  },
  {
    number: 7,
    title: 'Prices Live on Platform',
    team: 'pricing',
    teamLabel: 'Pricing (Mohan)',
    description: 'Mohan uploads Enfigo price and dealer price to the platform.',
    gateLabel: 'Confirm prices are live on the platform.',
    requiresDocument: false,
    requiresNote: false,
    requiresCheckboxes: ['Enfigo price uploaded', 'Dealer price uploaded', 'Prices confirmed live'],
  },
  {
    number: 8,
    title: 'Complete',
    team: 'admin',
    teamLabel: 'All Teams',
    description: 'All steps completed. Vehicles are live on the platform.',
    gateLabel: '',
    requiresDocument: false,
    requiresNote: false,
  },
]

export const STAGE_COLORS: Record<number, string> = {
  1: 'bg-purple-100 text-purple-800 border-purple-200',
  2: 'bg-blue-100 text-blue-800 border-blue-200',
  3: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  4: 'bg-purple-100 text-purple-800 border-purple-200',
  5: 'bg-green-100 text-green-800 border-green-200',
  6: 'bg-green-100 text-green-800 border-green-200',
  7: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  8: 'bg-gray-100 text-gray-600 border-gray-200',
}

export const TEAM_COLORS: Record<string, string> = {
  partnership: 'bg-purple-100 text-purple-700',
  finance: 'bg-blue-100 text-blue-700',
  pricing: 'bg-yellow-100 text-yellow-700',
  ops: 'bg-green-100 text-green-700',
  tech: 'bg-red-100 text-red-700',
  admin: 'bg-gray-100 text-gray-600',
}

export function getStage(n: number): StageDefinition {
  return STAGES[n - 1] ?? STAGES[STAGES.length - 1]
}
