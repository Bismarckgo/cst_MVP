'use client'

import { WorkStatusBadge } from '@/components/catalog/work-status-badge'
import { useWork } from '@/lib/works/use-works'
import { ArrowLeft, Pencil } from 'lucide-react'
import Link from 'next/link'

export function WorkDetailView({ id }: { id: string }) {
  const { work, loading } = useWork(id)

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
          <div className="mt-6">
            <h1 className="text-3xl font-bold tracking-tight text-ink-900 uppercase">
              {work.title}
            </h1>
            <p className="mt-2 text-base text-ink-700">{work.primaryArtist}</p>
            <div className="mt-3">
              <WorkStatusBadge status={work.status} />
            </div>
          </div>

          {/* Composition */}
          <section className="mt-8 rounded-2xl border border-surface-shell bg-surface-card p-6 shadow-card">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-semibold tracking-wider text-ink-500 uppercase">
                Composición
              </h2>
              <button
                type="button"
                disabled
                title="Disponible próximamente"
                className="inline-flex cursor-not-allowed items-center gap-1.5 rounded-lg border border-surface-shell px-3 py-1.5 text-xs font-semibold text-ink-500 opacity-70"
              >
                <Pencil className="size-3.5" />
                Editar
              </button>
            </div>

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
          </section>
        </>
      )}
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
