import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | undefined): string {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function daysSince(date: string): number {
  return Math.floor((Date.now() - new Date(date).getTime()) / 86400000)
}

export function totalVehicles(batches: { count: number }[]): number {
  return batches.reduce((sum, b) => sum + b.count, 0)
}
