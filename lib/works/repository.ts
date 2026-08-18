// ----------------------------------------------------------------------------
// CST · Works repository
//
// A tiny persistence layer with an async interface. Backed by localStorage so
// the MVP persists for real. The UI only ever talks to this
// `WorksRepository` interface — swapping in a real API later requires no
// component changes.
// ----------------------------------------------------------------------------

import type { NewWorkInput, Work, WorkPatch } from './types'

export type { WorkPatch }

export interface WorksRepository {
  list(): Promise<Work[]>
  get(id: string): Promise<Work | null>
  create(input: NewWorkInput): Promise<Work>
  update(id: string, patch: WorkPatch): Promise<Work>
  remove(id: string): Promise<void>
  duplicate(id: string): Promise<Work>
}

const STORAGE_KEY = 'cst_catalog_works'

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

// ------------------------------------------------------------------ Seed data

function seedWorks(): Work[] {
  const now = Date.now()
  const iso = (offset: number) => new Date(now - offset).toISOString()
  return [
    {
      id: createId(),
      title: 'Midnight',
      type: 'song',
      status: 'attention',
      primaryArtist: 'Bismarck García',
      creators: [
        { personId: createId(), name: 'Bismarck García', role: 'compositor' },
        { personId: createId(), name: 'Bismarck García', role: 'letrista' },
      ],
      compositionShares: [
        { personId: 's1', name: 'Bismarck García', percentage: 100 },
      ],
      composition: 'complete',
      recording: 'complete',
      splits: 'complete',
      register: 2,
      iswc: 'T-123.456.789-0',
      isrc: 'US-ABC-26-00001',
      createdAt: iso(86400000 * 14),
      updatedAt: iso(3600000 * 2),
    },
    {
      id: createId(),
      title: 'Summer Nights',
      type: 'song',
      status: 'ready',
      primaryArtist: 'Bismarck García',
      creators: [
        { personId: createId(), name: 'Bismarck García', role: 'compositor' },
      ],
      compositionShares: [
        { personId: 's2', name: 'Bismarck García', percentage: 100 },
      ],
      composition: 'complete',
      recording: 'complete',
      splits: 'complete',
      register: 0,
      iswc: 'T-987.654.321-0',
      isrc: 'US-ABC-26-00002',
      createdAt: iso(86400000 * 10),
      updatedAt: iso(86400000 * 1),
    },
    {
      id: createId(),
      title: 'No More',
      type: 'song',
      status: 'draft',
      primaryArtist: 'Bismarck García',
      creators: [
        { personId: createId(), name: 'Bismarck García', role: 'compositor' },
      ],
      compositionShares: [
        { personId: 's3', name: 'Bismarck García', percentage: 100 },
      ],
      composition: 'complete',
      recording: 'not_started',
      splits: 'pending',
      register: 0,
      iswc: undefined,
      isrc: undefined,
      createdAt: iso(86400000 * 6),
      updatedAt: iso(86400000 * 3),
    },
    {
      id: createId(),
      title: 'Aurora',
      type: 'song',
      status: 'registered',
      primaryArtist: 'María López',
      creators: [
        { personId: createId(), name: 'María López', role: 'compositor' },
        { personId: createId(), name: 'María López', role: 'letrista' },
      ],
      compositionShares: [
        { personId: 's4', name: 'María López', percentage: 100 },
      ],
      composition: 'complete',
      recording: 'complete',
      splits: 'complete',
      register: 0,
      iswc: 'T-555.111.222-0',
      isrc: 'US-ABC-26-00003',
      createdAt: iso(86400000 * 20),
      updatedAt: iso(86400000 * 5),
    },
  ]
}

function ensureSeed(): Work[] {
  const existing = readAll()
  if (existing.length > 0) return existing
  const seed = seedWorks()
  writeAll(seed)
  return seed
}

class LocalWorksRepository implements WorksRepository {
  async list(): Promise<Work[]> {
    const works = ensureSeed()
    return works.slice().sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
  }

  async get(id: string): Promise<Work | null> {
    return ensureSeed().find((w) => w.id === id) ?? null
  }

  async create(input: NewWorkInput): Promise<Work> {
    const now = new Date().toISOString()
    const work: Work = {
      id: createId(),
      title: input.title.trim(),
      type: input.type,
      status: 'draft',
      primaryArtist: input.primaryArtist.trim(),
      creators: [],
      compositionShares: [],
      composition: 'not_started',
      recording: 'not_started',
      splits: 'not_started',
      register: 0,
      createdAt: now,
      updatedAt: now,
    }
    const works = readAll()
    works.unshift(work)
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
      id: works[index].id,
      createdAt: works[index].createdAt,
      updatedAt: new Date().toISOString(),
    }
    works[index] = updated
    writeAll(works)
    return updated
  }

  async remove(id: string): Promise<void> {
    const works = readAll().filter((w) => w.id !== id)
    writeAll(works)
  }

  async duplicate(id: string): Promise<Work> {
    const works = readAll()
    const original = works.find((w) => w.id === id)
    if (!original) {
      throw new Error(`Work not found: ${id}`)
    }
    const now = new Date().toISOString()
    const copy: Work = {
      ...original,
      id: createId(),
      title: `${original.title} (copia)`,
      status: 'draft',
      register: 0,
      iswc: undefined,
      isrc: undefined,
      createdAt: now,
      updatedAt: now,
      creators: original.creators.map((c) => ({ ...c, personId: createId() })),
      compositionShares: original.compositionShares.map((s) => ({
        ...s,
        personId: createId(),
      })),
    }
    works.unshift(copy)
    writeAll(works)
    return copy
  }
}

export const worksRepository: WorksRepository = new LocalWorksRepository()
