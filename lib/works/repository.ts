// ----------------------------------------------------------------------------
// CST · Works repository
//
// A persistence layer with an async interface. Backed by localStorage so the
// MVP persists for real. The UI only ever talks to this `WorksRepository`
// interface — swapping in a real API later requires no component changes.
// ----------------------------------------------------------------------------

import type {
  Creator,
  ImportCsvRow,
  ImportPreview,
  ImportResult,
  NewWorkInput,
  Work,
  WorkPatch,
} from './types'

export type { WorkPatch }

export interface WorksRepository {
  list(): Promise<Work[]>
  get(id: string): Promise<Work | null>
  create(input: NewWorkInput): Promise<Work>
  update(id: string, patch: WorkPatch): Promise<Work>
  remove(id: string): Promise<void>
  duplicate(id: string): Promise<Work>
  findByIsrc(isrc: string): Promise<Work | null>
  findDuplicate(title: string, writerNames: string[]): Promise<Work | null>
  importPreview(rows: ParsedCsvRow[]): Promise<ImportPreview>
  importExecute(rows: ImportCsvRow[]): Promise<ImportResult>
}

const STORAGE_KEY = 'cst_catalog_works'

export interface ParsedCsvRow {
  rowIndex: number
  title: string
  artist: string
  iswc?: string
  isrc?: string
  writers?: string
}

function createId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `w_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

function createCstId(): string {
  const n = Math.floor(Math.random() * 900000 + 100000)
  return `CST-${n}`
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
      cstId: createCstId(),
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
      registerPending: 1,
      registerIssues: 2,
      iswc: 'T-123.456.789-0',
      isrc: 'US-ABC-26-00001',
      createdAt: iso(86400000 * 14),
      updatedAt: iso(3600000 * 2),
    },
    {
      id: createId(),
      cstId: createCstId(),
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
      registerPending: 0,
      registerIssues: 0,
      iswc: 'T-987.654.321-0',
      isrc: 'US-ABC-26-00002',
      createdAt: iso(86400000 * 10),
      updatedAt: iso(86400000 * 1),
    },
    {
      id: createId(),
      cstId: createCstId(),
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
      registerPending: 0,
      registerIssues: 0,
      iswc: undefined,
      isrc: undefined,
      createdAt: iso(86400000 * 6),
      updatedAt: iso(86400000 * 3),
    },
    {
      id: createId(),
      cstId: createCstId(),
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
      registerPending: 0,
      registerIssues: 0,
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

function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
}

function normalizeIsrc(isrc: string): string {
  return isrc.replace(/[-\s]/g, '').toUpperCase()
}

function normalizeIswc(iswc: string): string {
  return iswc.replace(/[-\s.]/g, '').toUpperCase()
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
      cstId: createCstId(),
      title: input.title.trim(),
      type: input.type,
      status: 'draft',
      primaryArtist: input.primaryArtist.trim(),
      creators: input.creators ?? [],
      compositionShares: [],
      composition: 'not_started',
      recording: 'not_started',
      splits: 'not_started',
      registerPending: 0,
      registerIssues: 0,
      duplicateOf: input.creators?.length
        ? this.checkDuplicate(input.title, input.creators)?.id
        : undefined,
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
      cstId: works[index].cstId,
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
      cstId: createCstId(),
      title: `${original.title} (copia)`,
      status: 'draft',
      registerPending: 0,
      registerIssues: 0,
      iswc: undefined,
      isrc: undefined,
      duplicateOf: undefined,
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

  async findByIsrc(isrc: string): Promise<Work | null> {
    const normalized = normalizeIsrc(isrc)
    if (!normalized) return null
    return ensureSeed().find((w) => w.isrc && normalizeIsrc(w.isrc) === normalized) ?? null
  }

  async findDuplicate(title: string, writerNames: string[]): Promise<Work | null> {
    return this.checkDuplicate(title, writerNames.map((n) => ({ name: n } as Creator))) ?? null
  }

  private checkDuplicate(title: string, creators: { name: string }[]): Work | null {
    const normalizedTitle = normalizeName(title)
    if (!normalizedTitle) return null
    const writerNames = new Set(
      creators.map((c) => normalizeName(c.name)).filter(Boolean),
    )
    if (writerNames.size === 0) return null
    return ensureSeed().find((w) => {
      if (normalizeName(w.title) !== normalizedTitle) return false
      const existingWriters = new Set(
        w.creators.map((c) => normalizeName(c.name)).filter(Boolean),
      )
      // Check if writer sets overlap significantly
      let overlap = 0
      for (const name of writerNames) {
        if (existingWriters.has(name)) overlap++
      }
      return overlap > 0
    })
  }

  // ------------------------------------------------------------------ Import

  async importPreview(parsedRows: ParsedCsvRow[]): Promise<ImportPreview> {
    const existing = ensureSeed()
    const rows: ImportCsvRow[] = []
    let newCount = 0
    let conflictCount = 0
    let invalidCount = 0

    for (const row of parsedRows) {
      // Validate: title and artist required
      if (!row.title.trim() || !row.artist.trim()) {
        invalidCount++
        rows.push({
          ...row,
          classification: 'invalid',
          invalidReason: !row.title.trim() ? 'Falta título' : 'Falta artista',
        })
        continue
      }

      // Check ISRC conflict
      if (row.isrc) {
        const normalizedIsrc = normalizeIsrc(row.isrc)
        const match = existing.find(
          (w) => w.isrc && normalizeIsrc(w.isrc) === normalizedIsrc,
        )
        if (match) {
          conflictCount++
          rows.push({
            ...row,
            classification: 'conflict',
            existingWorkId: match.id,
            existingTitle: match.title,
            existingArtist: match.primaryArtist,
            decision: 'pending',
          })
          continue
        }
      }

      // Check ISWC conflict
      if (row.iswc) {
        const normalizedIswc = normalizeIswc(row.iswc)
        const match = existing.find(
          (w) => w.iswc && normalizeIswc(w.iswc) === normalizedIswc,
        )
        if (match) {
          conflictCount++
          rows.push({
            ...row,
            classification: 'conflict',
            existingWorkId: match.id,
            existingTitle: match.title,
            existingArtist: match.primaryArtist,
            decision: 'pending',
          })
          continue
        }
      }

      newCount++
      rows.push({ ...row, classification: 'new' })
    }

    return { rows, newCount, conflictCount, invalidCount }
  }

  async importExecute(rows: ImportCsvRow[]): Promise<ImportResult> {
    const works = readAll()
    const result: ImportResult = {
      created: [],
      merged: [],
      skipped: [],
      invalid: [],
    }

    for (const row of rows) {
      if (row.classification === 'invalid') {
        result.invalid.push({ title: row.title, reason: row.invalidReason ?? 'Inválida' })
        continue
      }

      if (row.classification === 'conflict') {
        if (row.decision === 'skip' || !row.decision) {
          result.skipped.push({ title: row.title })
          continue
        }
        if (row.decision === 'merge' && row.existingWorkId) {
          const idx = works.findIndex((w) => w.id === row.existingWorkId)
          if (idx !== -1) {
            const existing = works[idx]
            // Merge: only fill empty fields, never overwrite
            const merged: Work = {
              ...existing,
              iswc: existing.iswc || (row.iswc?.trim() || undefined),
              isrc: existing.isrc || (row.isrc?.trim() || undefined),
              updatedAt: new Date().toISOString(),
            }
            works[idx] = merged
            result.merged.push({ id: merged.id, title: merged.title })
          }
          continue
        }
      }

      // New work
      const now = new Date().toISOString()
      const work: Work = {
        id: createId(),
        cstId: createCstId(),
        title: row.title.trim(),
        type: 'song',
        status: 'draft',
        primaryArtist: row.artist.trim(),
        creators: [],
        compositionShares: [],
        composition: 'not_started',
        recording: 'not_started',
        splits: 'not_started',
        registerPending: 0,
        registerIssues: 0,
        iswc: row.iswc?.trim() || undefined,
        isrc: row.isrc?.trim() || undefined,
        createdAt: now,
        updatedAt: now,
      }
      works.push(work)
      result.created.push({ id: work.id, title: work.title })
    }

    writeAll(works)
    return result
  }
}

export const worksRepository: WorksRepository = new LocalWorksRepository()
