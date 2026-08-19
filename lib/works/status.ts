// ----------------------------------------------------------------------------
// CST · Work status derivation
//
// The Work Detail screen is a 360° summary: the user must understand a work
// without visiting 6 modules. This file derives the combined state of every
// module from the (currently minimal) domain data, and applies the precedence
// rule from the CST spec §10:
//
//   1. any Blocked   → overall Blocked
//   2. any Attention → overall Attention
//   3. all Complete  → overall Ready
//
// Modules that are not modeled yet (Recording, Registration, Publisher
// coverage) surface as `pending` so the summary stays honest instead of
// pretending they are done.
// ----------------------------------------------------------------------------

import type { Work } from './types'

export type ModuleState = 'complete' | 'attention' | 'blocked' | 'pending'

export interface ModuleStatus {
  id: string
  label: string
  state: ModuleState
  detail: string
}

export function compositionTotal(work: Work): number {
  return work.compositionShares.reduce((sum, s) => sum + s.percentage, 0)
}

export function compositionComplete(work: Work): boolean {
  return (
    work.compositionShares.length > 0 &&
    Math.round(compositionTotal(work)) === 100 &&
    work.compositionShares.every((s) => s.name.trim().length > 0)
  )
}

/** The five modules shown in the ESTADO panel, in display order. */
export function deriveModules(work: Work): ModuleStatus[] {
  const compComplete = compositionComplete(work)
  const hasShares = work.compositionShares.length > 0

  return [
    {
      id: 'composition',
      label: 'Composition',
      state: compComplete ? 'complete' : hasShares ? 'attention' : 'pending',
      detail: compComplete ? 'Complete' : hasShares ? 'Revisar shares' : 'Pending',
    },
    {
      id: 'recording',
      label: 'Recording',
      state: 'pending',
      detail: 'Pending',
    },
    {
      id: 'credits',
      label: 'Credits',
      state: work.creators.length > 0 ? 'complete' : 'pending',
      detail: work.creators.length > 0 ? 'Complete' : 'Pending',
    },
    {
      id: 'splits',
      label: 'Splits',
      state: compComplete ? 'attention' : 'pending',
      detail: compComplete ? 'Pending confirm' : 'Pending',
    },
    {
      id: 'registration',
      label: 'Registration',
      state: 'pending',
      detail: 'Pending',
    },
  ]
}

export function overallState(modules: ModuleStatus[]): ModuleState {
  if (modules.some((m) => m.state === 'blocked')) return 'blocked'
  if (modules.some((m) => m.state === 'attention' || m.state === 'pending')) {
    return 'attention'
  }
  return 'complete'
}

/** The single most important thing left to do, for the NEXT ACTION banner. */
export function nextAction(modules: ModuleStatus[]): string | null {
  const splits = modules.find((m) => m.id === 'splits')
  if (splits && splits.state !== 'complete') {
    return 'Confirma los splits de composición antes del registro.'
  }
  const attention = modules.find(
    (m) => m.state === 'attention' || m.state === 'pending',
  )
  if (attention) return `Completa ${attention.label.toLowerCase()} para avanzar.`
  return null
}

/** Deterministic display id derived from the work id (CST-00012445). */
export function cstId(work: Work): string {
  let h = 0
  for (const ch of work.id) h = (h * 31 + ch.charCodeAt(0)) >>> 0
  return `CST-${String(h % 100000000).padStart(8, '0')}`
}
