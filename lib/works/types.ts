// ----------------------------------------------------------------------------
// CST · Domain types
//
// Modeled after the CST Catalog spec. A Work carries enough state to drive
// the catalog table (status, composition/recording/splits progress, register
// counts) plus identifiers (ISWC, ISRC) and the participant/split data used by
// the detail and edit views.
// ----------------------------------------------------------------------------

export type WorkType = 'song' | 'recording'

export type WorkStatus = 'draft' | 'ready' | 'attention' | 'registered'

export type ComponentState = 'complete' | 'incomplete' | 'not_started'

export type SplitsState = 'complete' | 'pending' | 'not_started'

// The role a person plays on a work. Authorship roles (compositor, letrista)
// earn a composition share; the producer and performing artist participate
// but do not split the composition.
export type ParticipantRole = 'compositor' | 'letrista' | 'productor' | 'artista'

export interface Person {
  id: string
  name: string
}

export interface Creator {
  personId: string
  name: string
  role: ParticipantRole
}

export interface CompositionShare {
  personId: string
  name: string
  percentage: number
}

export interface Work {
  id: string
  cstId: string
  title: string
  type: WorkType
  status: WorkStatus
  primaryArtist: string
  creators: Creator[]
  compositionShares: CompositionShare[]
  composition: ComponentState
  recording: ComponentState
  splits: SplitsState
  /** Organisms not yet started — informational, not a problem. */
  registerPending: number
  /** Organisms with a problem (rejection, conflict, actionable condition). */
  registerIssues: number
  iswc?: string
  isrc?: string
  /** ID of a Work this one is a possible duplicate of, if detected. */
  duplicateOf?: string
  createdAt: string
  updatedAt: string
}

// Shape used by the creation flow before an id/timestamps exist.
export interface NewWorkInput {
  title: string
  type: WorkType
  primaryArtist: string
  creators?: Creator[]
}

// Patch shape for editing an existing work.
export type WorkPatch = Partial<
  Omit<Work, 'id' | 'cstId' | 'createdAt' | 'updatedAt'>
>

// ----------------------------------------------------------------------------
// CSV Import types
// ----------------------------------------------------------------------------

export type ImportRowClassification = 'new' | 'conflict' | 'invalid'

export interface ImportCsvRow {
  rowIndex: number
  title: string
  artist: string
  iswc?: string
  isrc?: string
  writers?: string
  classification: ImportRowClassification
  /** For conflicts: the existing work that matched. */
  existingWorkId?: string
  existingTitle?: string
  existingArtist?: string
  /** For invalid: reason. */
  invalidReason?: string
  /** User decision for conflicts. */
  decision?: 'merge' | 'skip' | 'pending'
}

export interface ImportPreview {
  rows: ImportCsvRow[]
  newCount: number
  conflictCount: number
  invalidCount: number
}

export interface ImportResult {
  created: { id: string; title: string }[]
  merged: { id: string; title: string }[]
  skipped: { title: string }[]
  invalid: { title: string; reason: string }[]
}
