'use client'

import { BulkRegistrationDialog } from '@/components/catalog/bulk-registration'
import { ComponentStateBadge, RegisterCell } from '@/components/catalog/component-state-badge'
import { WorkStatusBadge } from '@/components/catalog/work-status-badge'
import { ImportCsvModal } from '@/components/catalog/import-csv-modal'
import { normalizeSearch, relativeTime, shortName } from '@/lib/works/format'
import type { ParticipantRole, Work, WorkStatus, WorkType } from '@/lib/works/types'
import { useWorks } from '@/lib/works/use-works'
import { cn } from '@/lib/utils'
import {
  Check,
  Copy,
  LayoutGrid,
  Layers,
  List,
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

type CatalogView = 'list' | 'grid'

// People filter maps the UI concepts (Writer/Producer/Artist) to the MVP's
// ParticipantRole values stored in creators[].role.
type PeopleRole = 'writer' | 'producer' | 'artist'

const PEOPLE_OPTIONS: { id: PeopleRole; label: string; roles: ParticipantRole[] }[] = [
  { id: 'writer', label: 'Writer', roles: ['compositor', 'letrista'] },
  { id: 'producer', label: 'Producer', roles: ['productor'] },
  { id: 'artist', label: 'Artist', roles: ['artista'] },
]

function workHasRole(work: Work, role: ParticipantRole): boolean {
  return work.creators?.some((c) => c.role === role) ?? false
}

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
  const [activePeople, setActivePeople] = useState<Set<PeopleRole>>(new Set())
  const [showImport, setShowImport] = useState(false)
  const [selectedWorkIds, setSelectedWorkIds] = useState<Set<string>>(new Set())
  const [showBulkDialog, setShowBulkDialog] = useState(false)
  const [view, setView] = useState<CatalogView>('list')

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
    if (activePeople.size > 0) {
      // Multiselect: match a work if it has ANY of the selected People roles (OR).
      const selectedRoles = new Set<ParticipantRole>()
      for (const p of activePeople) {
        const option = PEOPLE_OPTIONS.find((o) => o.id === p)
        option?.roles.forEach((r) => selectedRoles.add(r))
      }
      result = result.filter((w) => {
        for (const role of selectedRoles) {
          if (workHasRole(w, role)) return true
        }
        return false
      })
    }
    return result
  }, [works, query, activeStatuses, activeTypes, activePeople])

  const hasWorks = (works?.length ?? 0) > 0
  const hasActiveFilters =
    activeStatuses.size > 0 || activeTypes.size > 0 || activePeople.size > 0 || searchInput

  // Selection helpers
  const selectedCount = selectedWorkIds.size
  const visibleIds = filtered.map((w) => w.id)
  const allVisibleSelected = visibleIds.length > 0 && visibleIds.every((id) => selectedWorkIds.has(id))

  function toggleSelect(id: string) {
    setSelectedWorkIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleSelectAll() {
    setSelectedWorkIds((prev) => {
      const next = new Set(prev)
      if (allVisibleSelected) {
        // Deselect all visible
        visibleIds.forEach((id) => next.delete(id))
      } else {
        // Select all visible
        visibleIds.forEach((id) => next.add(id))
      }
      return next
    })
  }

  function clearSelection() {
    setSelectedWorkIds(new Set())
  }

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

  function togglePeople(role: PeopleRole) {
    setActivePeople((prev) => {
      const next = new Set(prev)
      if (next.has(role)) next.delete(role)
      else next.add(role)
      return next
    })
  }

  function clearFilters() {
    setActiveStatuses(new Set())
    setActiveTypes(new Set())
    setActivePeople(new Set())
    setSearchInput('')
  }

  async function handleDelete(id: string) {
    await deleteWork(id)
  }

  async function handleDuplicate(id: string) {
    await duplicateWork(id)
  }

  const selectedWorks = useMemo(() => {
    if (!works) return []
    return works.filter((w) => selectedWorkIds.has(w.id))
  }, [works, selectedWorkIds])

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
            {hasWorks && (
              <span className="ml-1.5 text-ink-300">
                · {works?.length ?? 0} {works?.length === 1 ? 'obra' : 'obras'}
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex items-center gap-1 rounded-xl border border-surface-shell bg-surface-card p-1">
            <ViewToggleButton
              active={view === 'list'}
              onClick={() => setView('list')}
              icon={List}
              label="Vista lista"
            />
            <ViewToggleButton
              active={view === 'grid'}
              onClick={() => setView('grid')}
              icon={LayoutGrid}
              label="Vista grid"
            />
          </div>
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
        <FilterGroup label="People">
          {PEOPLE_OPTIONS.map((p) => (
            <FilterToggle
              key={p.id}
              label={p.label}
              active={activePeople.has(p.id)}
              onClick={() => togglePeople(p.id)}
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
          {Array.from(activePeople).map((p) => (
            <FilterChip
              key={p}
              label={`People: ${PEOPLE_OPTIONS.find((o) => o.id === p)?.label ?? p}`}
              onRemove={() => togglePeople(p)}
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

      {/* Bulk action bar */}
      {selectedCount > 0 && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-brand/30 bg-brand-light px-4 py-2.5">
          <div className="flex items-center gap-2 text-sm font-semibold text-brand">
            <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-brand px-1.5 text-xs font-bold text-white">
              {selectedCount}
            </span>
            {selectedCount === 1 ? 'obra seleccionada' : 'obras seleccionadas'}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowBulkDialog(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
            >
              <Layers className="size-4" strokeWidth={2.5} />
              Registrar por lotes
            </button>
            <button
              type="button"
              onClick={clearSelection}
              className="rounded-xl px-3 py-2 text-sm font-medium text-ink-500 transition-colors hover:text-ink-900"
            >
              Cancelar selección
            </button>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="mt-6">
        {loading ? (
          <CatalogSkeleton view={view} />
        ) : !hasWorks ? (
          <EmptyState />
        ) : filtered.length === 0 ? (
          <NoResults query={query} />
        ) : view === 'list' ? (
          <ListCatalog
            filtered={filtered}
            selectedWorkIds={selectedWorkIds}
            allVisibleSelected={allVisibleSelected}
            toggleSelect={toggleSelect}
            toggleSelectAll={toggleSelectAll}
            onOpen={(id) => router.push(`/works/${id}`)}
            onEdit={(id) => router.push(`/works/${id}?edit=1`)}
            onDuplicate={handleDuplicate}
            onDelete={handleDelete}
          />
        ) : (
          <GridCatalog
            filtered={filtered}
            selectedWorkIds={selectedWorkIds}
            allVisibleSelected={allVisibleSelected}
            toggleSelect={toggleSelect}
            toggleSelectAll={toggleSelectAll}
            onOpen={(id) => router.push(`/works/${id}`)}
            onEdit={(id) => router.push(`/works/${id}?edit=1`)}
            onDuplicate={handleDuplicate}
            onDelete={handleDelete}
          />
        )}
      </div>

      {showImport && (
        <ImportCsvModal onClose={() => setShowImport(false)} />
      )}

      {showBulkDialog && selectedWorks.length > 0 && (
        <BulkRegistrationDialog
          selectedWorks={selectedWorks}
          onClose={() => setShowBulkDialog(false)}
        />
      )}
    </div>
  )
}

// ----------------------------------------------------------------------------
// View toggle helpers
// ----------------------------------------------------------------------------

function ViewToggleButton({
  active,
  onClick,
  icon: Icon,
  label,
}: {
  active: boolean
  onClick: () => void
  icon: typeof List
  label: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={cn(
        'flex size-8 items-center justify-center rounded-lg transition-colors',
        active
          ? 'bg-brand text-white shadow-card-hover'
          : 'text-ink-500 hover:bg-surface hover:text-ink-700',
      )}
    >
      <Icon className="size-4" strokeWidth={2.5} />
    </button>
  )
}

// ---- List view (existing catalog) ----

function ListCatalog({
  filtered,
  selectedWorkIds,
  allVisibleSelected,
  toggleSelect,
  toggleSelectAll,
  onOpen,
  onEdit,
  onDuplicate,
  onDelete,
}: {
  filtered: Work[]
  selectedWorkIds: Set<string>
  allVisibleSelected: boolean
  toggleSelect: (id: string) => void
  toggleSelectAll: () => void
  onOpen: (id: string) => void
  onEdit: (id: string) => void
  onDuplicate: (id: string) => void
  onDelete: (id: string) => void
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-surface-shell bg-surface-card shadow-card">
      {/* Column headers */}
      <div className="hidden grid-cols-[2.5rem_minmax(0,2.4fr)_1fr_0.9fr_1fr_0.9fr_0.8fr_0.9fr] items-center gap-4 border-b border-surface-shell px-5 py-3 text-[11px] font-semibold tracking-wider text-ink-500 uppercase md:grid">
        <div>
          <input
            type="checkbox"
            checked={allVisibleSelected}
            onChange={toggleSelectAll}
            aria-label="Seleccionar todas las obras visibles"
            className="size-4 rounded border-surface-shell text-brand focus:ring-brand/30"
          />
        </div>
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
              onClick={() => onOpen(work.id)}
              className="grid w-full grid-cols-1 items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-surface md:grid-cols-[2.5rem_minmax(0,2.4fr)_1fr_0.9fr_1fr_0.9fr_0.8fr_0.9fr]"
            >
              {/* Checkbox */}
              <div className="hidden md:block">
                <input
                  type="checkbox"
                  checked={selectedWorkIds.has(work.id)}
                  onChange={() => toggleSelect(work.id)}
                  onClick={(e) => e.stopPropagation()}
                  aria-label={`Seleccionar ${work.title}`}
                  className="size-4 rounded border-surface-shell text-brand focus:ring-brand/30"
                />
              </div>

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
                  onEdit(work.id)
                }}
              />
              <RowAction
                icon={Copy}
                label="Duplicar"
                onClick={(e) => {
                  e.stopPropagation()
                  void onDuplicate(work.id)
                }}
              />
              <RowAction
                icon={Trash2}
                label="Eliminar"
                variant="danger"
                onClick={(e) => {
                  e.stopPropagation()
                  void onDelete(work.id)
                }}
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

// ---- Grid view ----

function GridCatalog({
  filtered,
  selectedWorkIds,
  allVisibleSelected,
  toggleSelect,
  toggleSelectAll,
  onOpen,
  onEdit,
  onDuplicate,
  onDelete,
}: {
  filtered: Work[]
  selectedWorkIds: Set<string>
  allVisibleSelected: boolean
  toggleSelect: (id: string) => void
  toggleSelectAll: () => void
  onOpen: (id: string) => void
  onEdit: (id: string) => void
  onDuplicate: (id: string) => void
  onDelete: (id: string) => void
}) {
  return (
    <div>
      {/* Grid header with select all */}
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm text-ink-500">
          {filtered.length} {filtered.length === 1 ? 'obra' : 'obras'}
        </p>
        <label className="inline-flex items-center gap-2 text-sm font-medium text-ink-700">
          <input
            type="checkbox"
            checked={allVisibleSelected}
            onChange={toggleSelectAll}
            aria-label="Seleccionar todas las obras visibles"
            className="size-4 rounded border-surface-shell text-brand focus:ring-brand/30"
          />
          Seleccionar todo
        </label>
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((work) => (
          <article
            key={work.id}
            className={cn(
              'group relative flex flex-col rounded-2xl border bg-surface-card p-4 shadow-card transition-colors',
              selectedWorkIds.has(work.id)
                ? 'border-brand/50 bg-brand-light/30'
                : 'border-surface-shell hover:border-ink-200 hover:bg-surface',
            )}
          >
            {/* Card top */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-light text-brand">
                  <Music2 className="size-5" />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-ink-900">
                    {work.title}
                  </p>
                  <p className="truncate text-xs text-ink-500">
                    {work.primaryArtist ? shortName(work.primaryArtist) : '—'}
                  </p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={selectedWorkIds.has(work.id)}
                onChange={() => toggleSelect(work.id)}
                aria-label={`Seleccionar ${work.title}`}
                className="size-4 shrink-0 rounded border-surface-shell text-brand focus:ring-brand/30"
              />
            </div>

            {/* Duplicate warning */}
            {work.duplicateOf && (
              <span
                title="Posible duplicado"
                className="mt-3 inline-flex w-fit shrink-0 items-center gap-0.5 rounded-full bg-orange-light px-1.5 py-0.5 text-[10px] font-semibold text-orange"
              >
                <TriangleAlert className="size-2.5" strokeWidth={2.5} />
                Dup
              </span>
            )}

            {/* Status + updated */}
            <div className="mt-3 flex items-center justify-between gap-2">
              <WorkStatusBadge status={work.status} />
              <span className="text-xs text-ink-300">
                Updated {relativeTime(work.updatedAt)}
              </span>
            </div>

            {/* Component states */}
            <div className="mt-4 grid grid-cols-3 gap-2 border-t border-surface pt-3">
              <GridStat label="Comp" value={<ComponentStateBadge state={work.composition} />} />
              <GridStat label="Rec" value={<ComponentStateBadge state={work.recording} />} />
              <GridStat label="Splits" value={<ComponentStateBadge state={work.splits} type="splits" />} />
            </div>

            {/* Register + actions */}
            <div className="mt-3 flex items-center justify-between gap-2 border-t border-surface pt-3">
              <RegisterCell
                pending={work.registerPending}
                issues={work.registerIssues}
                status={work.status}
              />
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => onOpen(work.id)}
                  aria-label={`Abrir ${work.title}`}
                  title="Abrir"
                  className="flex size-8 items-center justify-center rounded-lg text-ink-500 transition-colors hover:bg-surface hover:text-ink-700"
                >
                  <Search className="size-4" strokeWidth={2.5} />
                </button>
                <button
                  type="button"
                  onClick={() => onEdit(work.id)}
                  aria-label={`Editar ${work.title}`}
                  title="Editar"
                  className="flex size-8 items-center justify-center rounded-lg text-ink-500 transition-colors hover:bg-surface hover:text-ink-700"
                >
                  <Pencil className="size-4" strokeWidth={2.5} />
                </button>
                <button
                  type="button"
                  onClick={() => void onDuplicate(work.id)}
                  aria-label={`Duplicar ${work.title}`}
                  title="Duplicar"
                  className="flex size-8 items-center justify-center rounded-lg text-ink-500 transition-colors hover:bg-surface hover:text-ink-700"
                >
                  <Copy className="size-4" strokeWidth={2.5} />
                </button>
                <button
                  type="button"
                  onClick={() => void onDelete(work.id)}
                  aria-label={`Eliminar ${work.title}`}
                  title="Eliminar"
                  className="flex size-8 items-center justify-center rounded-lg text-ink-500 transition-colors hover:bg-pink-light hover:text-pink"
                >
                  <Trash2 className="size-4" strokeWidth={2.5} />
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}

function GridStat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[10px] font-semibold tracking-wider text-ink-300 uppercase">
        {label}
      </span>
      <div className="text-xs">{value}</div>
    </div>
  )
}

// ---- Shared helpers ----

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

function CatalogSkeleton({ view }: { view: CatalogView }) {
  if (view === 'grid') {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="rounded-2xl border border-surface-shell bg-surface-card p-4 shadow-card"
          >
            <div className="flex items-center gap-3">
              <div className="size-10 animate-pulse rounded-xl bg-surface" />
              <div className="flex-1 space-y-2">
                <div className="h-3.5 w-3/4 animate-pulse rounded bg-surface" />
                <div className="h-3 w-1/2 animate-pulse rounded bg-surface" />
              </div>
            </div>
            <div className="mt-4 h-3 w-1/3 animate-pulse rounded bg-surface" />
            <div className="mt-4 grid grid-cols-3 gap-2 border-t border-surface pt-3">
              <div className="h-8 animate-pulse rounded bg-surface" />
              <div className="h-8 animate-pulse rounded bg-surface" />
              <div className="h-8 animate-pulse rounded bg-surface" />
            </div>
          </div>
        ))}
      </div>
    )
  }

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