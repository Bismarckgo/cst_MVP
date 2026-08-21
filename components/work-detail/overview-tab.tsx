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
import type { ParticipantRole, Work, WorkPatch } from '@/lib/works/types'
import { AlertTriangle, ArrowRight, Check, Disc3, Pencil, UserPlus, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

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

export function OverviewTab({
  work,
  updateWork,
}: {
  work: Work
  updateWork: (patch: WorkPatch) => Promise<Work>
}) {
  const modules = deriveModules(work)
  const people = buildPeople(work)
  const compTotal = Math.round(compositionTotal(work))
  const compComplete = compositionComplete(work)
  const action = nextAction(modules)
  const [editing, setEditing] = useState(false)
  const [title, setTitle] = useState(work.title)
  const [artist, setArtist] = useState(work.primaryArtist)
  const [iswc, setIswc] = useState(work.iswc ?? '')
  const [isrc, setIsrc] = useState(work.isrc ?? '')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setTitle(work.title)
    setArtist(work.primaryArtist)
    setIswc(work.iswc ?? '')
    setIsrc(work.isrc ?? '')
  }, [work])

  useEffect(() => {
    if (!editing) return

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        handleCancel()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [editing, work])

  const canSave = useMemo(
    () => title.trim().length > 0 && artist.trim().length > 0,
    [title, artist],
  )

  async function handleSave() {
    if (!canSave || saving) return
    setSaving(true)
    try {
      await updateWork({
        title: title.trim(),
        primaryArtist: artist.trim(),
        iswc: iswc.trim() || undefined,
        isrc: isrc.trim() || undefined,
      })
      setEditing(false)
    } finally {
      setSaving(false)
    }
  }

  function handleCancel() {
    setTitle(work.title)
    setArtist(work.primaryArtist)
    setIswc(work.iswc ?? '')
    setIsrc(work.isrc ?? '')
    setEditing(false)
  }

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

        <Panel
          title="Identificadores"
          action={
            !editing ? (
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-700 hover:text-brand"
              >
                <Pencil className="size-3.5" />
                Editar
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-surface-shell px-2.5 py-1.5 text-[11px] font-semibold text-ink-700 hover:bg-surface"
                >
                  <X className="size-3.5" />
                  Cancelar
                </button>
                <button
                  type="button"
                  disabled={!canSave || saving}
                  onClick={void handleSave}
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold text-white transition-colors',
                    canSave && !saving ? 'bg-brand hover:bg-brand-dark' : 'cursor-not-allowed bg-ink-300',
                  )}
                >
                  <Check className="size-3.5" />
                  {saving ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            )
          }
        >
          {editing ? (
            <div className="space-y-3">
              <label className="block text-sm">
                <span className="mb-1 block text-[11px] font-semibold tracking-wider text-ink-500 uppercase">Title</span>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-xl border border-surface-shell bg-surface px-3 py-2 text-sm text-ink-900 outline-none ring-0 transition-colors focus:border-brand"
                />
              </label>
              <label className="block text-sm">
                <span className="mb-1 block text-[11px] font-semibold tracking-wider text-ink-500 uppercase">Artist</span>
                <input
                  value={artist}
                  onChange={(e) => setArtist(e.target.value)}
                  className="w-full rounded-xl border border-surface-shell bg-surface px-3 py-2 text-sm text-ink-900 outline-none ring-0 transition-colors focus:border-brand"
                />
              </label>
              <label className="block text-sm">
                <span className="mb-1 block text-[11px] font-semibold tracking-wider text-ink-500 uppercase">ISWC</span>
                <input
                  value={iswc}
                  onChange={(e) => setIswc(e.target.value)}
                  className="w-full rounded-xl border border-surface-shell bg-surface px-3 py-2 text-sm text-ink-900 outline-none ring-0 transition-colors focus:border-brand"
                />
              </label>
              <label className="block text-sm">
                <span className="mb-1 block text-[11px] font-semibold tracking-wider text-ink-500 uppercase">ISRC</span>
                <input
                  value={isrc}
                  onChange={(e) => setIsrc(e.target.value)}
                  className="w-full rounded-xl border border-surface-shell bg-surface px-3 py-2 text-sm text-ink-900 outline-none ring-0 transition-colors focus:border-brand"
                />
              </label>
            </div>
          ) : (
            <div className="divide-y divide-surface">
              <CopyField label="ISWC" value={work.iswc ?? null} />
              <CopyField label="ISRC" value={work.isrc ?? null} />
              <CopyField label="CST ID" value={cstId(work)} />
            </div>
          )}
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
