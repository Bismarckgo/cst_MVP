'use client'

import { ComponentStateBadge } from '@/components/catalog/component-state-badge'
import { WorkStatusBadge } from '@/components/catalog/work-status-badge'
import { EditWorkDrawer } from '@/components/work-detail/edit-work-drawer'
import { useWork } from '@/lib/works/use-works'
import { roleLabel } from '@/lib/works/roles'
import { ArrowLeft, Pencil, ShieldCheck, TriangleAlert } from 'lucide-react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'

export function WorkDetailView({ id }: { id: string }) {
  const { work, loading, refresh } = useWork(id)
  const router = useRouter()
  const searchParams = useSearchParams()
  const editMode = searchParams.get('edit') === '1'

  function openEdit() {
    router.push(`/works/${id}?edit=1`, { scroll: false })
  }

  function closeEdit() {
    router.push(`/works/${id}`, { scroll: false })
    void refresh()
  }

  // Close edit on Escape is handled inside drawer; also clean URL on unmount
  useEffect(() => {
    return () => {
      if (editMode) {
        router.replace(`/works/${id}`, { scroll: false })
      }
    }
  }, [editMode, id, router])

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
          {(work.iswc || work.isrc) && (
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
            </section>
          )}

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
              {work.register > 0 ? (
                <span className="inline-flex items-center gap-1.5 text-sm font-medium text-orange">
                  <TriangleAlert className="size-4" strokeWidth={2.5} />
                  {work.register} pendiente{work.register > 1 ? 's' : ''}
                </span>
              ) : work.status === 'registered' ? (
                <span className="inline-flex items-center gap-1.5 text-sm font-medium text-teal">
                  <ShieldCheck className="size-4" strokeWidth={2.5} />
                  Completo
                </span>
              ) : (
                <span className="text-sm text-ink-300">—</span>
              )}
            </div>
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
