'use client'

import { ComponentStateBadge, RegisterCell } from '@/components/catalog/component-state-badge'
import { WorkStatusBadge } from '@/components/catalog/work-status-badge'
import { EditWorkDrawer } from '@/components/work-detail/edit-work-drawer'
import { useWork } from '@/lib/works/use-works'
import { roleLabel } from '@/lib/works/roles'
import { ArrowLeft, Link2, Pencil, TriangleAlert } from 'lucide-react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

export function WorkDetailView({ id }: { id: string }) {
  const { work, loading, refresh } = useWork(id)
  const router = useRouter()
  const searchParams = useSearchParams()
  const editMode = searchParams.get('edit') === '1'
  const [duplicateWork, setDuplicateWork] = useState<{ id: string; title: string } | null>(null)

  function openEdit() {
    router.push(`/works/${id}?edit=1`, { scroll: false })
  }

  function closeEdit() {
    router.push(`/works/${id}`, { scroll: false })
    void refresh()
  }

  useEffect(() => {
    return () => {
      if (editMode) {
        router.replace(`/works/${id}`, { scroll: false })
      }
    }
  }, [editMode, id, router])

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
    <div className="mx-auto w-full max-w-2xl px-5 py-8 sm:px-8 sm:py-10">
      <Link
        href="/catalog"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-500 transition-colors hover:text-ink-700"
      >
        <ArrowLeft className="size-4" />
        Catálogo
      </Link>

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
            <div className="min-w-0">
              <h1 className="text-3xl font-bold tracking-tight text-ink-900">
                {work.title}
              </h1>
              <p className="mt-2 text-base text-ink-700">{work.primaryArtist}</p>
              <div className="mt-3">
                <WorkStatusBadge status={work.status} />
              </div>
            </div>
            <button
              type="button"
              onClick={openEdit}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-surface-shell px-3 py-2 text-sm font-semibold text-ink-700 transition-colors hover:bg-surface"
            >
              <Pencil className="size-3.5" />
              Editar
            </button>
          </div>

          {/* Identifiers */}
          <section className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {work.iswc && (
              <div className="rounded-xl border border-surface-shell bg-surface-card px-4 py-3">
                <p className="text-xs font-semibold tracking-wider text-ink-500 uppercase">
                  ISWC
                </p>
                <p className="mt-1 text-sm font-medium text-ink-900">{work.iswc}</p>
              </div>
            )}
            {work.isrc && (
              <div className="rounded-xl border border-surface-shell bg-surface-card px-4 py-3">
                <p className="text-xs font-semibold tracking-wider text-ink-500 uppercase">
                  ISRC
                </p>
                <p className="mt-1 text-sm font-medium text-ink-900">{work.isrc}</p>
              </div>
            )}
            <div className="rounded-xl border border-surface-shell bg-surface-card px-4 py-3">
              <p className="text-xs font-semibold tracking-wider text-ink-500 uppercase">
                CstId
              </p>
              <p className="mt-1 inline-flex items-center gap-1.5 text-sm font-medium text-ink-700">
                <Link2 className="size-3 text-ink-300" />
                {work.cstId}
              </p>
            </div>
          </section>

          {/* Component states */}
          <section className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StateCard label="Composición" state={work.composition} />
            <StateCard label="Grabación" state={work.recording} />
            <StateCard label="Splits" state={work.splits} type="splits" />
          </section>

          {/* Composition shares */}
          <section className="mt-8 rounded-2xl border border-surface-shell bg-surface-card p-6 shadow-card">
            <h2 className="text-xs font-semibold tracking-wider text-ink-500 uppercase">
              Composición
            </h2>
            {work.compositionShares.length > 0 ? (
              <ul className="mt-4 divide-y divide-surface">
                {work.compositionShares.map((share) => (
                  <li
                    key={share.personId}
                    className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
                  >
                    <span className="text-sm font-medium text-ink-900">
                      {share.name}
                    </span>
                    <span className="text-sm font-semibold text-ink-700">
                      {share.percentage}%
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm text-ink-300">
                Sin datos de composición. Edita la obra para agregarlos.
              </p>
            )}
          </section>

          {/* Creators */}
          {work.creators.length > 0 && (
            <section className="mt-6 rounded-2xl border border-surface-shell bg-surface-card p-6 shadow-card">
              <h2 className="text-xs font-semibold tracking-wider text-ink-500 uppercase">
                Participantes
              </h2>
              <ul className="mt-4 divide-y divide-surface">
                {work.creators.map((c) => (
                  <li
                    key={c.personId}
                    className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
                  >
                    <span className="text-sm font-medium text-ink-900">{c.name}</span>
                    <span className="text-sm text-ink-500">{roleLabel(c.role)}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Register */}
          <section className="mt-6 rounded-2xl border border-surface-shell bg-surface-card p-6 shadow-card">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-semibold tracking-wider text-ink-500 uppercase">
                Registros
              </h2>
              <RegisterCell
                pending={work.registerPending}
                issues={work.registerIssues}
                status={work.status}
              />
            </div>
            {(work.registerPending > 0 || work.registerIssues > 0) && (
              <div className="mt-3 space-y-1.5 text-sm">
                {work.registerIssues > 0 && (
                  <p className="flex items-center gap-1.5 text-orange">
                    <TriangleAlert className="size-3.5" strokeWidth={2.5} />
                    {work.registerIssues} organismo{work.registerIssues > 1 ? 's' : ''} con problema
                  </p>
                )}
                {work.registerPending > 0 && (
                  <p className="text-ink-500">
                    {work.registerPending} organismo{work.registerPending > 1 ? 's' : ''} sin iniciar
                  </p>
                )}
              </div>
            )}
            {work.registerPending === 0 && work.registerIssues === 0 && work.status !== 'registered' && (
              <p className="mt-3 text-sm text-ink-300">Not evaluated</p>
            )}
          </section>
        </>
      )}

      {editMode && work && <EditWorkDrawer workId={id} onClose={closeEdit} />}
    </div>
  )
}

function StateCard({
  label,
  state,
  type = 'component',
}: {
  label: string
  state: 'complete' | 'incomplete' | 'not_started' | 'pending'
  type?: 'component' | 'splits'
}) {
  return (
    <div className="rounded-xl border border-surface-shell bg-surface-card px-4 py-3">
      <p className="text-xs font-semibold tracking-wider text-ink-500 uppercase">
        {label}
      </p>
      <div className="mt-1.5">
        <ComponentStateBadge state={state as never} type={type} />
      </div>
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
      <div className="h-8 w-48 rounded bg-surface-shell" />
      <div className="mt-3 h-4 w-32 rounded bg-surface-shell" />
      <div className="mt-8 h-40 rounded-2xl bg-surface-shell" />
    </div>
  )
}
