// ----------------------------------------------------------------------------
// CST · Domain types
//
// Modeled after the CST Catalog MVP spec. A Work carries enough state to drive
// the catalog table (status, composition/recording/splits progress, register
// count) plus identifiers (ISWC, ISRC) and the participant/split data used by
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
  title: string
  type: WorkType
  status: WorkStatus
  primaryArtist: string
  creators: Creator[]
  compositionShares: CompositionShare[]
  composition: ComponentState
  recording: ComponentState
  splits: SplitsState
  register: number
  iswc?: string
  isrc?: string
  createdAt: string
  updatedAt: string
}

// Shape used by the creation flow before an id/timestamps exist.
export interface NewWorkInput {
  title: string
  type: WorkType
  primaryArtist: string
}

// Patch shape for editing an existing work.
export type WorkPatch = Partial<
  Omit<Work, 'id' | 'createdAt' | 'updatedAt'>
>
