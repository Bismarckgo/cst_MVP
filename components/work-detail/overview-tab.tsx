'use client'

import { CopyField, Panel, StateIcon } from '@/components/work-detail/ui'
import { cn } from '@/lib/utils'
import { roleLabel } from '@/lib/works/roles'
import {
  compositionComplete,
  compositionTotal,
  cstId,
  deriveModules,
  nextAction,
} from '@/lib/works/status'
import type { ParticipantRole, Work } from '@/lib/works/types'
import { AlertTriangle, ArrowRight, Disc3, UserPlus } from 'lucide-react'

interface PersonRow {
  id: string
  name: string
  roles: ParticipantRole[]
  share: number | null
}

// Aggregate creators + composition shares into one row per person.
function buildPeople(work: Work): PersonRow[] {
  const map = new Map<string, PersonRow>()
  for (const c of work.creators) {
    const row = map.get(c.personId) ?? {
      id: c.personId,
      name: c.name,
      roles: [],
      share: null,
    }
    if (!row.roles.includes(c.role)) row.roles.push(c.role)
    map.set(c.personId, row)
  }
  for (const s of work.compositionShares) {
    const row = map.get(s.personId) ?? {
      id: s.personId,
      name: s.name,
      roles: [],
      share: null,
    }
    row.share = s.percentage
    map.set(s.personId, row)
  }
  return [...map.values()]
}

export function OverviewTab({ work }: { work: Work }) {
  const modules = deriveModules(work)
  const people = buildPeople(work)
  const compTotal = Math.round(compositionTotal(work))
  const compComplete = compositionComplete(work)
  const action = nextAction(modules)

  return (
    <div className="space-y-5">
      {/* ESTADO + IDENTIFICADORES */}
      <div className="grid gap-5 md:grid-cols-2">
        <Panel title="Estado">
          <ul>
            {modules.map((m) => (
              <li
                key={m.id}
                className="flex items-center justify-between gap-3 border-b border-surface py-2.5 last:border-b-0"
              >
                <span className="flex items-center gap-2.5">
                  <StateIcon state={m.state} />
                  <span className="text-sm font-medium text-ink-900">
                    {m.label}
                  </span>
                </span>
                <span
                  className={cn(
                    'text-sm',
                    m.state === 'complete'
                      ? 'text-teal'
                      : m.state === 'attention'
                        ? 'text-orange'
                        : 'text-ink-500',
                  )}
                >
                  {m.detail}
                </span>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel title="Identificadores">
          <div className="divide-y divide-surface">
            <CopyField label="ISWC" value={null} />
            <CopyField label="ISRC" value={null} />
            <CopyField label="CST ID" value={cstId(work)} />
          </div>
        </Panel>
      </div>

      {/* PEOPLE / CREDITS */}
      <Panel title="People / Credits">
        {people.length === 0 ? (
          <p className="py-2 text-sm text-ink-500">
            Aún no hay personas acreditadas.
          </p>
        ) : (
          <ul className="divide-y divide-surface">
            {people.map((p) => (
              <li
                key={p.id}
                className="flex items-center justify-between gap-4 py-3 first:pt-0"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-ink-900">
                    {p.name || '—'}
                  </p>
                  <p className="truncate text-xs text-ink-500">
                    {p.roles.length
                      ? p.roles.map(roleLabel).join(' · ')
                      : 'Sin rol'}
                  </p>
                </div>
                <span className="shrink-0 text-sm font-semibold text-ink-700">
                  {p.share != null ? `${p.share}%` : '—'}
                </span>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-4 flex items-center justify-between border-t border-surface pt-4">
          <button
            type="button"
            disabled
            title="Disponible próximamente"
            className="inline-flex cursor-not-allowed items-center gap-1.5 text-sm font-medium text-ink-500 opacity-70"
          >
            <UserPlus className="size-4" />
            Add person
          </button>
          <span className="inline-flex items-center gap-1 text-sm font-medium text-ink-300">
            View all
            <ArrowRight className="size-4" />
          </span>
        </div>
      </Panel>

      {/* RIGHTS & SHARES */}
      <Panel title="Rights & Shares">
        <div className="divide-y divide-surface">
          <RightRow
            label="Composition shares"
            value={`${compTotal}% assigned`}
            state={compComplete ? 'complete' : 'attention'}
            note={compComplete ? 'Complete' : `${100 - compTotal}% sin asignar`}
          />
          <RightRow
            label="Publisher coverage"
            value="Pendiente"
            state="pending"
            note="Sin administración editorial"
          />
        </div>
      </Panel>

      {/* RECORDINGS */}
      <Panel title="Recordings">
        <div className="flex items-center gap-3 rounded-xl border border-dashed border-surface-shell bg-surface px-4 py-5">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-surface-shell text-ink-500">
            <Disc3 className="size-4" />
          </span>
          <div>
            <p className="text-sm font-medium text-ink-700">
              Sin grabaciones registradas
            </p>
            <p className="text-xs text-ink-500">
              Las grabaciones (master, ISRC, distribuidor) se gestionan en la
              pestaña Recording.
            </p>
          </div>
        </div>
      </Panel>

      {/* NEXT ACTION */}
      {action && (
        <div className="flex items-center justify-between gap-4 rounded-2xl border border-orange/30 bg-orange-light px-5 py-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="size-5 shrink-0 text-orange" />
            <div>
              <p className="text-[11px] font-semibold tracking-wider text-orange uppercase">
                Next action
              </p>
              <p className="mt-0.5 text-sm font-medium text-ink-900">
                {action}
              </p>
            </div>
          </div>
          <span className="hidden shrink-0 items-center gap-1 text-sm font-semibold text-orange sm:inline-flex">
            Resolve
            <ArrowRight className="size-4" />
          </span>
        </div>
      )}
    </div>
  )
}

function RightRow({
  label,
  value,
  state,
  note,
}: {
  label: string
  value: string
  state: 'complete' | 'attention' | 'pending'
  note: string
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
      <div className="min-w-0">
        <p className="text-sm font-medium text-ink-900">{label}</p>
        <p
          className={cn(
            'text-xs',
            state === 'complete'
              ? 'text-teal'
              : state === 'attention'
                ? 'text-orange'
                : 'text-ink-500',
          )}
        >
          {note}
        </p>
      </div>
      <span className="inline-flex shrink-0 items-center gap-2 text-sm font-semibold text-ink-700">
        <StateIcon state={state} />
        {value}
      </span>
    </div>
  )
}
