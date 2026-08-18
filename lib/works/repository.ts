// ----------------------------------------------------------------------------
// CST · Works repository
//
// A tiny persistence layer with an async interface. Today it is backed by
// localStorage so the MVP persists for real (not a visual-only demo), but the
// UI only ever talks to this `WorksRepository` interface. Swapping the
// implementation for a real API (fetch/route handlers/database) later does not
// require touching any component.
// ----------------------------------------------------------------------------

import type { NewWorkInput, Work } from './types'

export type WorkPatch = Partial<
  Pick<
    Work,
    'title' | 'primaryArtist' | 'creators' | 'compositionShares' | 'status'
  >
>

export interface WorksRepository {
  list(): Promise<Work[]>
  get(id: string): Promise<Work | null>
  create(input: NewWorkInput): Promise<Work>
  update(id: string, patch: WorkPatch): Promise<Work>
}

const STORAGE_KEY = 'cst.works.v1'

function createId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `w_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

function readAll(): Work[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as Work[]) : []
  } catch {
    return []
  }
}

function writeAll(works: Work[]): void {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(works))
}

class LocalWorksRepository implements WorksRepository {
  async list(): Promise<Work[]> {
    // Most-recently-updated first.
    return readAll().sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
  }

  async get(id: string): Promise<Work | null> {
    return readAll().find((w) => w.id === id) ?? null
  }

  async create(input: NewWorkInput): Promise<Work> {
    const now = new Date().toISOString()
    const work: Work = {
      id: createId(),
      title: input.title.trim(),
      type: input.type,
      status: 'draft', // every new Work starts as Draft
      primaryArtist: input.primaryArtist.trim(),
      creators: input.creators,
      compositionShares: input.compositionShares,
      createdAt: now,
      updatedAt: now,
    }
    const works = readAll()
    works.push(work)
    writeAll(works)
    return work
  }

  async update(id: string, patch: WorkPatch): Promise<Work> {
    const works = readAll()
    const index = works.findIndex((w) => w.id === id)
    if (index === -1) {
      throw new Error(`Work not found: ${id}`)
    }
    const updated: Work = {
      ...works[index],
      ...patch,
      updatedAt: new Date().toISOString(),
    }
    works[index] = updated
    writeAll(works)
    return updated
  }
}

export const worksRepository: WorksRepository = new LocalWorksRepository()
