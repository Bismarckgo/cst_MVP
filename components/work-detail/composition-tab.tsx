'use client'

import { Panel, StateIcon } from '@/components/work-detail/ui'
import { cn } from '@/lib/utils'
import { compositionComplete, compositionTotal } from '@/lib/works/status'
import type { Work } from '@/lib/works/types'
import { ArrowRight } from 'lucide-react'

export function CompositionTab({ work }: { work: Work }) {
  const total = Math.round(compositionTotal(work))
  const sharesOk = compositionComplete(work)
  const allNamed =
    work.compositionShares.length > 0 &&
    work.compositionShares.every((s) => s.name.trim().length > 0)

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold tracking-wider text-ink-500 uppercase">
            Composition
          </p>
          <h2 className="mt-1 text-lg font-bold tracking-tight text-ink-900">
            {work.title}
          </h2>
          <p className="text-sm text-ink-500">Obra musical / canción</p>
        </div>
      </div>

      {/* WORK IDENTITY */}
      <Panel title="Work identity">
        <dl className="divide-y divide-surface">
          <IdentityRow label="Title" value={work.title} />
          <IdentityRow label="Alternate titles" value={null} />
          <IdentityRow label="ISWC" value={null} verified={false} />
        </dl>
      </Panel>

      {/* CREATORS */}
      <Panel title="Creators">
        {/* header row (desktop) */}
        <div className="hidden grid-cols-[minmax(0,1.6fr)_1fr_0.7fr_1fr_0.5fr] gap-4 border-b border-surface pb-2 text-[11px] font-semibold tracking-wider text-ink-500 uppercase sm:grid">
          <span>Writer</span>
          <span>IPI</span>
          <span>Share</span>
          <span>Publisher</span>
          <span className="text-right">Status</span>
        </div>
        <ul className="divide-y divide-surface">
          {work.compositionShares.map((s) => (
            <li
              key={s.personId}
              className="grid grid-cols-2 items-center gap-x-4 gap-y-1 py-3 sm:grid-cols-[minmax(0,1.6fr)_1fr_0.7fr_1fr_0.5fr]"
            >
              <span className="truncate text-sm font-medium text-ink-900">
                {s.name || '—'}
              </span>
              <span className="font-mono text-sm text-ink-300 sm:text-ink-500">
                —
              </span>
              <span className="text-sm font-semibold text-ink-700">
                {s.percentage}%
              </span>
              <span className="text-sm text-ink-300">—</span>
              <span className="flex justify-start sm:justify-end">
                <StateIcon state={s.name.trim() ? 'attention' : 'pending'} />
              </span>
            </li>
          ))}
        </ul>
        <button
          type="button"
          disabled
          title="Disponible próximamente"
          className="mt-4 inline-flex cursor-not-allowed items-center gap-2 rounded-xl border border-dashed border-ink-300 px-3 py-2 text-sm font-medium text-ink-500 opacity-70"
        >
          + Add creator
        </button>
      </Panel>

      {/* VALIDATION */}
      <Panel title="Validation">
        <ul className="space-y-3">
          <ValidationRow
            ok={sharesOk}
            okText="Shares sum to 100%"
            failText={`Shares suman ${total}% (deben sumar 100%)`}
          />
          <ValidationRow
            ok={allNamed}
            okText="All creators identified"
            failText="Falta identificar a algún creador"
          />
          <ValidationRow
            ok={false}
            state="attention"
            okText=""
            failText="Publisher pendiente para uno o más writers"
          />
        </ul>
      </Panel>

      {/* NEXT */}
      <div className="flex items-center justify-between gap-4 rounded-2xl border border-brand/30 bg-brand-light px-5 py-4">
        <div className="flex items-center gap-3">
          <ArrowRight className="size-5 shrink-0 text-brand" />
          <div>
            <p className="text-[11px] font-semibold tracking-wider text-brand uppercase">
              Next
            </p>
            <p className="mt-0.5 text-sm font-medium text-ink-900">
              Review registration
            </p>
          </div>
        </div>
        <button
          type="button"
          disabled
          title="Disponible próximamente"
          className="hidden shrink-0 cursor-not-allowed items-center gap-1 text-sm font-semibold text-brand opacity-70 sm:inline-flex"
        >
          Review
          <ArrowRight className="size-4" />
        </button>
      </div>
    </div>
  )
}

function IdentityRow({
  label,
  value,
  verified,
}: {
  label: string
  value: string | null
  verified?: boolean
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-2.5 first:pt-0 last:pb-0">
      <dt className="text-sm text-ink-500">{label}</dt>
      <dd className="flex items-center gap-2 text-right">
        <span
          className={cn(
            'text-sm font-medium',
            value ? 'text-ink-900' : 'text-ink-300',
          )}
        >
          {value ?? 'Pendiente'}
        </span>
        {verified && <StateIcon state="complete" />}
      </dd>
    </div>
  )
}

function ValidationRow({
  ok,
  state,
  okText,
  failText,
}: {
  ok: boolean
  state?: 'attention'
  okText: string
  failText: string
}) {
  return (
    <li className="flex items-center gap-2.5 text-sm">
      <StateIcon state={ok ? 'complete' : (state ?? 'attention')} />
      <span
        className={cn('font-medium', ok ? 'text-ink-900' : 'text-orange')}
      >
        {ok ? okText : failText}
      </span>
    </li>
  )
}
