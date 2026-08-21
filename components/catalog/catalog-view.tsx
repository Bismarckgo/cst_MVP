'use client'

import { BulkRegistration } from '@/components/catalog/bulk-registration'
import { WorkStatusBadge } from '@/components/catalog/work-status-badge'
import { ImportCsvModal } from '@/components/catalog/import-csv-modal'
import { normalizeSearch, relativeTime, shortName } from '@/lib/works/format'
import type { Work, WorkStatus, WorkType } from '@/lib/works/types'
import { useWorks } from '@/lib/works/use-works'
import { cn } from '@/lib/utils'
import {
  Check,
  Copy,
  Music2,
  Pencil,
  Plus,
  Search,
  Trash2,
  TriangleAlert,
  Upload,
  X,
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'

const STATUS_ORDER: WorkStatus[] = ['draft', 'attention', 'ready', 'registered']

const STATUS_LABELS: Record<WorkStatus, string> = {
  draft: 'Draft',
  attention: 'Attention',
  ready: 'Ready',
  registered: 'Registered',
}

const TYPE_LABELS: Record<WorkType, string> = {
  song: 'Composition',
  recording: 'Recording',
}

type RegistrationFilter = 'missing' | 'submitted' | 'complete'

function workMatches(work: Work, q: string): boolean {
  const n = normalizeSearch(q)
  if (!n) return true
  return (
    normalizeSearch(work.title).includes(n) ||
    normalizeSearch(work.primaryArtist).includes(n) ||
    normalizeSearch(work.iswc ?? '').includes(n) ||
    normalizeSearch(work.isrc ?? '').includes(n)
  )
}

export function CatalogView() {
  const { works, loading, deleteWork, duplicateWork } = useWorks()
  const router = useRouter()
  const [searchInput, setSearchInput] = useState('')
  const [query, setQuery] = useState('')
  const [activeStatuses, setActiveStatuses] = useState<Set<WorkStatus>>(new Set())
  const [activeTypes, setActiveTypes] = useState<Set<WorkType>>(new Set())
  const [showImport, setShowImport] = useState(false)

  // Debounce search 300ms
  useEffect(() => {
    const t = setTimeout(() => setQuery(searchInput), 300)
    return () => clearTimeout(t)
  }, [searchInput])

  const filtered = useMemo(() => {
    if (!works) return []
    let result = works.filter((w) => workMatches(w, query))
    if (activeStatuses.size > 0) {
      result = result.filter((w) => activeStatuses.has(w.status))
    }
    if (activeTypes.size > 0) {
      result = result.filter((w) => activeTypes.has(w.type))
    }
    return result
  }, [works, query, activeStatuses, activeTypes])

  const hasWorks = (works?.length ?? 0) > 0
  const hasActiveFilters = activeStatuses.size > 0 || activeTypes.size > 0 || searchInput

  function toggleStatus(status: WorkStatus) {
    setActiveStatuses((prev) => {
      const next = new Set(prev)
      if (next.has(status)) next.delete(status)
      else next.add(status)
      return next
    })
  }

  function toggleType(type: WorkType) {
    setActiveTypes((prev) => {
      const next = new Set(prev)
      if (next.has(type)) next.delete(type)
      else next.add(type)
      return next
    })
  }

  function clearFilters() {
    setActiveStatuses(new Set())
    setActiveTypes(new Set())
    setSearchInput('')
  }

  async function handleDelete(id: string) {
    await deleteWork(id)
  }

  async function handleDuplicate(id: string) {
    await duplicateWork(id)
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-5 py-8 sm:px-8 sm:py-10">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-ink-900">
            Catálogo
          </h1>
          <p className="mt-1 text-sm text-ink-500">
            Tus obras, créditos y splits de composición.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowImport(true)}
            className="inline-flex items-center gap-2 rounded-xl border border-surface-shell bg-surface-card px-4 py-2.5 text-sm font-semibold text-ink-700 transition-colors hover:bg-surface"
          >
            <Upload className="size-4" />
            Importar CSV
          </button>
          <Link
            href="/catalog/new"
            className="inline-flex items-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white shadow-card transition-colors hover:bg-brand-dark"
          >
            <Plus className="size-4" strokeWidth={2.5} />
            Nueva obra
          </Link>
        </div>
      </div>

      {/* Search + Filters */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-ink-300" />
          <input
            type="search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Buscar título, artista, ISRC, ISWC..."
            className="w-full rounded-xl border border-surface-shell bg-surface-card py-2.5 pr-4 pl-10 text-sm text-ink-700 placeholder:text-ink-300 outline-none transition-colors focus:border-brand focus:ring-2 focus:ring-brand/20"
          />
        </div>
      </div>

      {/* Filter groups */}
      <div className="mt-3 space-y-2">
        <FilterGroup label="Estado">
          {STATUS_ORDER.map((status) => (
            <FilterToggle
              key={status}
              label={STATUS_LABELS[status]}
              active={activeStatuses.has(status)}
              onClick={() => toggleStatus(status)}
            />
          ))}
        </FilterGroup>
        <FilterGroup label="Tipo">
          {(['song', 'recording'] as WorkType[]).map((type) => (
            <FilterToggle
              key={type}
              label={TYPE_LABELS[type]}
              active={activeTypes.has(type)}
              onClick={() => toggleType(type)}
            />
          ))}
        </FilterGroup>
      </div>

      {/* Active filter chips */}
      {hasActiveFilters && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {searchInput && (
            <FilterChip
              label={`"${searchInput}"`}
              onRemove={() => setSearchInput('')}
            />
          )}
          {Array.from(activeStatuses).map((status) => (
            <FilterChip
              key={status}
              label={STATUS_LABELS[status]}
              onRemove={() => toggleStatus(status)}
            />
          ))}
          {Array.from(activeTypes).map((type) => (
            <FilterChip
              key={type}
              label={TYPE_LABELS[type]}
              onRemove={() => toggleType(type)}
            />
          ))}
          <button
            type="button"
            onClick={clearFilters}
            className="text-xs font-medium text-ink-500 underline-offset-2 hover:text-ink-700 hover:underline"
          >
            Limpiar todo
          </button>
        </div>
      )}

      {/* Content */}
      <div className="mt-6">
        {loading ? (
          <CatalogSkeleton />
        ) : !hasWorks ? (
          <EmptyState />
        ) : filtered.length === 0 ? (
          <NoResults query={query} />
        ) : (
          <div className="overflow-hidden rounded-2xl border border-surface-shell bg-surface-card shadow-card">
            {/* Column headers */}
            <div className="hidden grid-cols-[minmax(0,2.4fr)_1fr_0.9fr_1fr_0.9fr_0.8fr_0.9fr] items-center gap-4 border-b border-surface-shell px-5 py-3 text-[11px] font-semibold tracking-wider text-ink-500 uppercase md:grid">
              <div>Obra</div>
              <div>Artista</div>
              <div>Estado</div>
              <div>Composition</div>
              <div>Recording</div>
              <div>Splits</div>
              <div>Register</div>
            </div>

            <ul>
              {filtered.map((work) => (
                <li key={work.id} className="group relative border-b border-surface last:border-b-0">
                  <button
                    type="button"
                    onClick={() => router.push(`/works/${work.id}`)}
                    className="grid w-full grid-cols-1 items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-surface md:grid-cols-[minmax(0,2.4fr)_1fr_0.9fr_1fr_0.9fr_0.8fr_0.9fr]"
                  >
                    {/* Obra */}
                    <div className="flex items-center gap-3">
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-brand-light text-brand">
                        <Music2 className="size-4" />
                      </span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="truncate text-sm font-semibold text-ink-900">
                            {work.title}
                          </p>
                          {work.duplicateOf && (
                            <span
                              title="Posible duplicado"
                              className="inline-flex shrink-0 items-center gap-0.5 rounded-full bg-orange-light px-1.5 py-0.5 text-[10px] font-semibold text-orange"
                            >
                              <TriangleAlert className="size-2.5" strokeWidth={2.5} />
                              Dup
                            </span>
                          )}
                        </div>
                        <p className="truncate text-xs text-ink-500">
                          Updated {relativeTime(work.updatedAt)}
                        </p>
                      </div>
                    </div>

                    {/* Artista */}
                    <div className="text-sm text-ink-700">
                      {work.primaryArtist ? shortName(work.primaryArtist) : '—'}
                    </div>

                    {/* Estado */}
                    <div>
                      <WorkStatusBadge status={work.status} />
                    </div>

                    {/* Composition */}
                    <div>
                      <ComponentStateBadge state={work.composition} />
                    </div>

                    {/* Recording */}
                    <div>
                      <ComponentStateBadge state={work.recording} />
                    </div>

                    {/* Splits */}
                    <div>
                      <ComponentStateBadge state={work.splits} type="splits" />
                    </div>

                    {/* Register */}
                    <div>
                      <RegisterCell
                        pending={work.registerPending}
                        issues={work.registerIssues}
                        status={work.status}
                      />
                    </div>
                  </button>

                  {/* Row actions — visible on hover (desktop) and always (touch) */}
                  <div className="absolute top-1/2 right-3 flex -translate-y-1/2 items-center gap-1 rounded-xl bg-surface-card shadow-card-hover md:opacity-0 md:transition-opacity md:group-hover:md:opacity-100">
                    <RowAction
                      icon={Pencil}
                      label="Editar"
                      onClick={(e) => {
                        e.stopPropagation()
                        router.push(`/works/${work.id}?edit=1`)
                      }}
                    />
                    <RowAction
                      icon={Copy}
                      label="Duplicar"
                      onClick={(e) => {
                        e.stopPropagation()
                        void handleDuplicate(work.id)
                      }}
                    />
                    <RowAction
                      icon={Trash2}
                      label="Eliminar"
                      variant="danger"
                      onClick={(e) => {
                        e.stopPropagation()
                        void handleDelete(work.id)
                      }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {showImport && (
        <ImportCsvModal onClose={() => setShowImport(false)} />
      )}
    </div>
  )
}

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-16 shrink-0 text-[11px] font-semibold tracking-wider text-ink-300 uppercase">
        {label}
      </span>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  )
}

function FilterToggle({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors',
        active
          ? 'border-brand bg-brand-light text-brand'
          : 'border-surface-shell bg-surface-card text-ink-500 hover:text-ink-700',
      )}
    >
      {active && <Check className="size-3" strokeWidth={3} />}
      {label}
    </button>
  )
}

function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-lg bg-brand-light px-2.5 py-1 text-xs font-semibold text-brand">
      {label}
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Quitar filtro ${label}`}
        className="flex size-4 items-center justify-center rounded-full hover:bg-brand/20"
      >
        <X className="size-3" strokeWidth={2.5} />
      </button>
    </span>
  )
}

function RowAction({
  icon: Icon,
  label,
  onClick,
  variant = 'default',
}: {
  icon: typeof Pencil
  label: string
  onClick: (e: React.MouseEvent) => void
  variant?: 'default' | 'danger'
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={cn(
        'flex size-8 items-center justify-center rounded-lg transition-colors',
        variant === 'danger'
          ? 'text-ink-500 hover:bg-pink-light hover:text-pink'
          : 'text-ink-500 hover:bg-surface hover:text-ink-700',
      )}
    >
      <Icon className="size-4" />
    </button>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-surface-shell bg-surface-card px-6 py-16 text-center">
      <span className="flex size-14 items-center justify-center rounded-2xl bg-brand-light text-brand">
        <Music2 className="size-6" />
      </span>
      <h2 className="mt-5 text-lg font-bold text-ink-900">
        No hay obras todavía
      </h2>
      <p className="mt-2 max-w-sm text-pretty text-sm leading-relaxed text-ink-500">
        Comienza creando tu primera obra para registrar créditos y splits de
        composición.
      </p>
      <Link
        href="/catalog/new"
        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
      >
        <Plus className="size-4" strokeWidth={2.5} />
        Nueva obra
      </Link>
    </div>
  )
}

function NoResults({ query }: { query: string }) {
  return (
    <div className="rounded-2xl border border-surface-shell bg-surface-card px-6 py-12 text-center">
      <p className="text-sm font-medium text-ink-700">
        Sin resultados{query ? ` para “${query}”` : ''}
      </p>
      <p className="mt-1 text-sm text-ink-500">
        Prueba con otro título, artista, ISRC o ISWC.
      </p>
    </div>
  )
}

function CatalogSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-surface-shell bg-surface-card shadow-card">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={cn(
            'flex items-center gap-3 px-5 py-4',
            i < 2 && 'border-b border-surface',
          )}
        >
          <div className="size-9 animate-pulse rounded-xl bg-surface" />
          <div className="space-y-2">
            <div className="h-3.5 w-40 animate-pulse rounded bg-surface" />
            <div className="h-3 w-24 animate-pulse rounded bg-surface" />
          </div>
        </div>
      ))}
    </div>
  )
}
