// ----------------------------------------------------------------------------
// CST · Domain types (MVP 1)
//
// These are intentionally minimal. The full CST domain (ISWC, IPI, PRO,
// publishers, recordings, releases, royalties, ...) is NOT modeled here.
// Only what the "Sidebar → Catálogo → Nueva obra → Work" vertical requires.
// ----------------------------------------------------------------------------

export type WorkType = 'song' | 'recording'

export type WorkStatus = 'draft' | 'ready'

export interface Person {
  id: string
  name: string
}

export interface Creator {
  personId: string
  name: string
  role: string
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
  createdAt: string
  updatedAt: string
}

// Shape used by the creation flow before an id/timestamps exist.
export interface NewWorkInput {
  title: string
  type: WorkType
  primaryArtist: string
  creators: Creator[]
  compositionShares: CompositionShare[]
}
