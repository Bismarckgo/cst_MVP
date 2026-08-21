'use client'

import { CompositionTab } from '@/components/work-detail/composition-tab'
import { OverviewTab } from '@/components/work-detail/overview-tab'
import { StatePill } from '@/components/work-detail/ui'
import { cn } from '@/lib/utils'
import { deriveModules, overallState } from '@/lib/works/status'
import type { Work } from '@/lib/works/types'
import { useWork } from '@/lib/works/use-works'
import { ArrowLeft, Music2, Plus, Share2, TriangleAlert } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

const TABS = [
  'Overview',
  'Composition',
  'Recording',
  'Credits',
  'Splits',
  'Records',
] as const
type Tab = (typeof TABS)[number]

export function WorkDetailView({ id }: { id: string }) {
  const { work, loading, updateWork } = useWork(id)
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('Overview')
  const [duplicateWork, setDuplicateWork] = useState<{ id: string; title: string } | null>(null)

  // Load duplicate work info if duplicateOf is set
  useEffect(() => {
    if (work?.duplicateOf) {
      void (async () => {
        const dup = await (await import('@/lib/works/repository')).worksRepository.get(work.duplicateOf!)
        if (dup) setDuplicateWork({ id: dup.id, title: dup.title })
      })()
    } else {
      setDuplicateWork(null)
    }
  }, [work?.duplicateOf])

  return (
    <div className="mx-auto w-full max-w-4xl px-5 py-6 sm:px-8 sm:py-8">
      {/* Breadcrumb + actions */}
      <div className="flex items-center justify-between gap-3">
        <Link
          href="/catalog"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-500 transition-colors hover:text-ink-700"
        >
          <ArrowLeft className="size-4" />
          Catálogo
          {work && (
            <span className="text-ink-300">
              {' / '}
              <span className="text-ink-500">{work.title}</span>
            </span>
          )}
        </Link>
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled
            title="Disponible próximamente"
            className="inline-flex cursor-not-allowed items-center gap-1.5 rounded-lg border border-surface-shell px-3 py-1.5 text-xs font-semibold text-ink-500 opacity-70"
          >
            <Share2 className="size-3.5" />
            Share
          </button>
          <button
            type="button"
            disabled
            title="Disponible próximamente"
            aria-label="Agregar"
            className="flex size-8 cursor-not-allowed items-center justify-center rounded-lg bg-brand text-white opacity-70"
          >
            <Plus className="size-4" strokeWidth={2.5} />
          </button>
        </div>
      </div>

      {loading ? (
        <DetailSkeleton />
      ) : !work ? (
        <NotFound />
      ) : (
        <>
          {/* Possible duplicate banner */}
          {work.duplicateOf && duplicateWork && (
            <div className="mt-4 flex items-center gap-3 rounded-xl border border-orange/30 bg-orange-light/30 px-4 py-3">
              <TriangleAlert className="size-4 shrink-0 text-orange" strokeWidth={2.5} />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-ink-900">
                  Posible duplicado
                </p>
                <p className="text-xs text-ink-500">
                  Vinculado a {duplicateWork.title}
                </p>
              </div>
              <Link
                href={`/works/${duplicateWork.id}`}
                className="shrink-0 text-xs font-semibold text-brand hover:underline"
              >
                Abrir
              </Link>
            </div>
          )}

          {/* Header */}
          <div className="mt-6 flex items-start justify-between gap-4">
            <WorkHeader work={work} />
          </div>

          {/* Tabs */}
          <div className="mt-6 -mx-1 flex gap-1 overflow-x-auto border-b border-surface-shell">
            {TABS.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={cn(
                  'relative shrink-0 px-3 py-2.5 text-sm font-medium transition-colors',
                  tab === t
                    ? 'text-brand'
                    : 'text-ink-500 hover:text-ink-700',
                )}
              >
                {t}
                {tab === t && (
                  <span className="absolute inset-x-1 -bottom-px h-0.5 rounded-full bg-brand" />
                )}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="mt-6">
            {tab === 'Overview' && <OverviewTab work={work} updateWork={updateWork} />}
            {tab === 'Composition' && <CompositionTab work={work} />}
            {tab !== 'Overview' && tab !== 'Composition' && (
              <TabPlaceholder tab={tab} />
            )}
          </div>
        </>
      )}
    </div>
  )
}

function WorkHeader({ work }: { work: Work }) {
  const state = overallState(deriveModules(work))
  const year = new Date(work.createdAt).getFullYear()
  const kind = work.type === 'song' ? 'Single' : 'Recording'

  return (
    <div className="mt-5 flex flex-wrap items-start justify-between gap-4">
      <div className="flex min-w-0 items-start gap-4">
        <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-brand-light text-brand">
          <Music2 className="size-6" />
        </span>
        <div className="min-w-0">
          <h1 className="truncate text-2xl font-bold tracking-tight text-ink-900 uppercase sm:text-3xl">
            {work.title}
          </h1>
          <p className="mt-1 text-sm text-ink-700">
            {work.primaryArtist || '—'}
            <span className="text-ink-300"> · </span>
            {kind}
            <span className="text-ink-300"> · </span>
            {year}
          </p>
        </div>
      </div>
      <StatePill state={state} />
    </div>
  )
}

function TabPlaceholder({ tab }: { tab: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-surface-shell bg-surface-card px-6 py-16 text-center shadow-card">
      <p className="text-sm font-semibold text-ink-700">
        {tab} en construcción
      </p>
      <p className="mx-auto mt-2 max-w-sm text-pretty text-sm leading-relaxed text-ink-500">
        Este módulo se trabajará a profundidad próximamente. El resumen de la
        obra vive en la pestaña Overview.
      </p>
    </div>
  )
}

function NotFound() {
  return (
    <div className="mt-10 rounded-2xl border border-surface-shell bg-surface-card px-6 py-12 text-center shadow-card">
      <p className="text-sm font-medium text-ink-700">
        No encontramos esta obra.
      </p>
      <Link
        href="/catalog"
        className="mt-4 inline-block rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
      >
        Volver al Catálogo
      </Link>
    </div>
  )
}

function DetailSkeleton() {
  return (
    <div className="mt-6 animate-pulse">
      <div className="flex items-center gap-4">
        <div className="size-12 rounded-2xl bg-surface-shell" />
        <div className="space-y-2">
          <div className="h-7 w-48 rounded bg-surface-shell" />
          <div className="h-4 w-32 rounded bg-surface-shell" />
        </div>
      </div>
      <div className="mt-8 grid gap-5 md:grid-cols-2">
        <div className="h-56 rounded-2xl bg-surface-shell" />
        <div className="h-56 rounded-2xl bg-surface-shell" />
      </div>
    </div>
  )
}