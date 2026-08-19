'use client'

import { BulkRegistration } from '@/components/catalog/bulk-registration'
import { WorkStatusBadge } from '@/components/catalog/work-status-badge'
import { relativeTime, shortName } from '@/lib/works/format'
import type { Work } from '@/lib/works/types'
import { useWorks } from '@/lib/works/use-works'
import { cn } from '@/lib/utils'
import { Check, Music2, Plus, Search } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'

function compositionComplete(work: Work): boolean {
  if (work.compositionShares.length === 0) return false
  const total = work.compositionShares.reduce((sum, s) => sum + s.percentage, 0)
  return Math.round(total) === 100
}

function Empty({ dash = '—' }: { dash?: string }) {
  return <span className="text-ink-300">{dash}</span>
}

export function CatalogView() {
  const { works, loading } = useWorks()
  const router = useRouter()
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    if (!works) return []
    const q = query.trim().toLowerCase()
    if (!q) return works
    return works.filter(
      (w) =>
        w.title.toLowerCase().includes(q) ||
        w.primaryArtist.toLowerCase().includes(q) ||
        w.creators.some((c) => c.name.toLowerCase().includes(q)),
    )
  }, [works, query])

  const hasWorks = (works?.length ?? 0) > 0

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
        <Link
          href="/catalog/new"
          className="inline-flex items-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white shadow-card transition-colors hover:bg-brand-dark"
        >
          <Plus className="size-4" strokeWidth={2.5} />
          Nueva obra
        </Link>
      </div>

      {/* Search */}
      <div className="relative mt-6">
        <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-ink-300" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar título, creador..."
          className="w-full rounded-xl border border-surface-shell bg-surface-card py-2.5 pr-4 pl-10 text-sm text-ink-700 placeholder:text-ink-300 outline-none transition-colors focus:border-brand focus:ring-2 focus:ring-brand/20"
        />
      </div>

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
                <li key={work.id}>
                  <button
                    type="button"
                    onClick={() => router.push(`/works/${work.id}`)}
                    className="grid w-full grid-cols-1 items-center gap-4 border-b border-surface px-5 py-4 text-left transition-colors last:border-b-0 hover:bg-surface md:grid-cols-[minmax(0,2.4fr)_1fr_0.9fr_1fr_0.9fr_0.8fr_0.9fr]"
                  >
                    {/* Obra */}
                    <div className="flex items-center gap-3">
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-brand-light text-brand">
                        <Music2 className="size-4" />
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-ink-900">
                          {work.title}
                        </p>
                        <p className="truncate text-xs text-ink-500">
                          Actualizada {relativeTime(work.updatedAt)}
                        </p>
                      </div>
                    </div>

                    {/* Artista */}
                    <div className="text-sm text-ink-700">
                      {work.primaryArtist ? (
                        shortName(work.primaryArtist)
                      ) : (
                        <Empty />
                      )}
                    </div>

                    {/* Estado */}
                    <div>
                      <WorkStatusBadge status={work.status} />
                    </div>

                    {/* Composition */}
                    <div className="text-sm">
                      {compositionComplete(work) ? (
                        <span className="inline-flex items-center gap-1.5 font-medium text-teal">
                          <Check className="size-4" strokeWidth={2.5} />
                          Complete
                        </span>
                      ) : (
                        <Empty />
                      )}
                    </div>

                    {/* Recording */}
                    <div className="text-sm">
                      <Empty />
                    </div>

                    {/* Splits */}
                    <div className="text-sm">
                      <Empty />
                    </div>

                    {/* Register */}
                    <div className="text-sm">
                      <Empty />
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-surface-shell bg-surface-card px-6 py-16 text-center">
      <span className="flex size-14 items-center justify-center rounded-2xl bg-brand-light text-brand">
        <Music2 className="size-6" />
      </span>
      <h2 className="mt-5 text-lg font-bold text-ink-900">
        Tu catálogo está vacío
      </h2>
      <p className="mt-2 max-w-sm text-pretty text-sm leading-relaxed text-ink-500">
        Crea tu primera obra para empezar a registrar créditos y splits de
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
        Sin resultados para “{query}”
      </p>
      <p className="mt-1 text-sm text-ink-500">
        Prueba con otro título o nombre de creador.
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
