'use client'

import { cn } from '@/lib/utils'
import type {
  ComponentState,
  Creator,
  ParticipantRole,
  SplitsState,
  Work,
  WorkStatus,
} from '@/lib/works/types'
import { useWork } from '@/lib/works/use-works'
import { ROLES, contributesToComposition } from '@/lib/works/roles'
import { worksRepository } from '@/lib/works/repository'
import {
  Check,
  Music2,
  Plus,
  ShieldCheck,
  Trash2,
  TriangleAlert,
  X,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

type Tab = 'overview' | 'composition' | 'recording' | 'splits' | 'records'

const TABS: { id: Tab; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'composition', label: 'Composition' },
  { id: 'recording', label: 'Recording' },
  { id: 'splits', label: 'Splits' },
  { id: 'records', label: 'Records' },
]

function newId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `p_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

export function EditWorkDrawer({ workId, onClose }: { workId: string; onClose: () => void }) {
  const { work, loading, updateWork } = useWork(workId)
  const [tab, setTab] = useState<Tab>('overview')

  // Form state
  const [title, setTitle] = useState('')
  const [artist, setArtist] = useState('')
  const [iswc, setIswc] = useState('')
  const [isrc, setIsrc] = useState('')
  const [status, setStatus] = useState<WorkStatus>('draft')
  const [creators, setCreators] = useState<Creator[]>([])
  const [shares, setShares] = useState<{ personId: string; name: string; percentage: number }[]>([])
  const [composition, setComposition] = useState<ComponentState>('not_started')
  const [recording, setRecording] = useState<ComponentState>('not_started')
  const [splitsState, setSplitsState] = useState<SplitsState>('not_started')
  const [registerPending, setRegisterPending] = useState(0)
  const [registerIssues, setRegisterIssues] = useState(0)
  const [saving, setSaving] = useState(false)
  const [isrcError, setIsrcError] = useState<string | null>(null)

  useEffect(() => {
    if (work) {
      setTitle(work.title)
      setArtist(work.primaryArtist)
      setIswc(work.iswc ?? '')
      setIsrc(work.isrc ?? '')
      setStatus(work.status)
      setCreators(work.creators)
      setShares(work.compositionShares)
      setComposition(work.composition)
      setRecording(work.recording)
      setSplitsState(work.splits)
      setRegisterPending(work.registerPending)
      setRegisterIssues(work.registerIssues)
    }
  }, [work])

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  const authors = useMemo(
    () => creators.filter((c) => contributesToComposition(c.role)),
    [creators],
  )
  const sharesTotal = useMemo(
    () => shares.reduce((sum, s) => sum + (s.percentage || 0), 0),
    [shares],
  )
  const sharesValid = Math.round(sharesTotal) === 100 && shares.length > 0

  async function checkIsrc(value: string): Promise<boolean> {
    const trimmed = value.trim()
    if (!trimmed) return true
    if (work?.isrc && trimmed.replace(/[-\s]/g, '').toUpperCase() === work.isrc.replace(/[-\s]/g, '').toUpperCase()) {
      return true
    }
    const existing = await worksRepository.findByIsrc(trimmed)
    if (existing) {
      setIsrcError(`ISRC ya existe en "${existing.title}"`)
      return false
    }
    setIsrcError(null)
    return true
  }

  async function handleSave() {
    if (saving) return
    // ISRC blocking validation
    if (isrc.trim()) {
      const ok = await checkIsrc(isrc)
      if (!ok) return
    }
    setSaving(true)
    await updateWork({
      title: title.trim(),
      primaryArtist: artist.trim(),
      iswc: iswc.trim() || undefined,
      isrc: isrc.trim() || undefined,
      status,
      creators,
      compositionShares: shares,
      composition,
      recording,
      splits: splitsState,
      registerPending,
      registerIssues,
    })
    setSaving(false)
    onClose()
  }

  function addCreator() {
    setCreators((prev) => [
      ...prev,
      { personId: newId(), name: '', role: 'compositor' },
    ])
  }

  function updateCreatorName(idx: number, name: string) {
    setCreators((prev) => prev.map((c, i) => (i === idx ? { ...c, name } : c)))
  }

  function updateCreatorRole(idx: number, role: ParticipantRole) {
    setCreators((prev) => prev.map((c, i) => (i === idx ? { ...c, role } : c)))
  }

  function removeCreator(idx: number) {
    setCreators((prev) => prev.filter((_, i) => i !== idx))
  }

  function syncSharesFromAuthors() {
    const authorCreators = creators.filter((c) => contributesToComposition(c.role) && c.name.trim())
    const existing = new Map(shares.map((s) => [s.personId, s]))
    const updated = authorCreators.map((c, i) => {
      const ex = existing.get(c.personId)
      return {
        personId: c.personId,
        name: c.name.trim(),
        percentage: ex?.percentage ?? (authorCreators.length > 0 ? Math.floor(100 / authorCreators.length) : 0),
      }
    })
    if (updated.length > 0) {
      const total = updated.reduce((sum, s) => sum + s.percentage, 0)
      updated[0].percentage += 100 - total
    }
    setShares(updated)
  }

  function updateSharePct(personId: string, value: string) {
    const pct = Math.max(0, Math.min(100, Number.parseInt(value, 10) || 0))
    setShares((prev) => prev.map((s) => (s.personId === personId ? { ...s, percentage: pct } : s)))
  }

  if (loading || !work) {
    return (
      <div className="fixed inset-0 z-50 flex justify-end">
        <div className="absolute inset-0 bg-ink-900/30 backdrop-blur-sm" onClick={onClose} />
        <div className="relative h-full w-full max-w-md bg-surface-card shadow-card-hover">
          <div className="flex h-full items-center justify-center">
            <div className="size-8 animate-pulse rounded-xl bg-surface" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        className="absolute inset-0 bg-ink-900/30 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />
      <div className="relative flex h-full w-full max-w-md flex-col bg-surface-card shadow-card-hover">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-surface-shell px-5 py-4">
          <div>
            <p className="text-xs font-semibold tracking-wider text-ink-500 uppercase">
              Editar obra
            </p>
            <h2 className="mt-0.5 truncate text-lg font-bold text-ink-900">
              {work.title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="flex size-8 items-center justify-center rounded-lg text-ink-500 transition-colors hover:bg-surface hover:text-ink-700"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 overflow-x-auto border-b border-surface-shell px-3 py-2">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={cn(
                'shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors',
                tab === t.id
                  ? 'bg-brand-light text-brand'
                  : 'text-ink-500 hover:bg-surface hover:text-ink-700',
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 py-5">
          {tab === 'overview' && (
            <div className="space-y-5">
              <Field label="Título" required>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className={inputClass}
                />
              </Field>
              <Field label="Artista principal" required>
                <input
                  value={artist}
                  onChange={(e) => setArtist(e.target.value)}
                  className={inputClass}
                />
              </Field>
              <Field label="ISWC">
                <input
                  value={iswc}
                  onChange={(e) => setIswc(e.target.value)}
                  placeholder="T-123.456.789-0"
                  className={inputClass}
                />
              </Field>
              <Field label="ISRC">
                <input
                  value={isrc}
                  onChange={(e) => {
                    setIsrc(e.target.value)
                    setIsrcError(null)
                  }}
                  onBlur={(e) => void checkIsrc(e.target.value)}
                  placeholder="US-ABC-26-00001"
                  className={cn(
                    inputClass,
                    isrcError && 'border-pink focus:border-pink focus:ring-pink/20',
                  )}
                />
                {isrcError && (
                  <p className="mt-1.5 flex items-center gap-1.5 text-sm font-medium text-pink">
                    <TriangleAlert className="size-3.5" strokeWidth={2.5} />
                    {isrcError}
                  </p>
                )}
              </Field>
              <Field label="Estado">
                <div className="flex flex-wrap gap-2">
                  {(['draft', 'attention', 'ready', 'registered'] as WorkStatus[]).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setStatus(s)}
                      className={cn(
                        'inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold transition-colors',
                        status === s
                          ? 'border-brand bg-brand-light text-brand'
                          : 'border-surface-shell text-ink-500 hover:text-ink-700',
                      )}
                    >
                      {status === s && <Check className="size-3" strokeWidth={3} />}
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </button>
                  ))}
                </div>
              </Field>
            </div>
          )}

          {tab === 'composition' && (
            <div className="space-y-5">
              <div>
                <p className="text-sm text-ink-500">
                  Agrega las personas que compusieron la obra. Solo compositores y letristas participan en el split de composición.
                </p>
                <div className="mt-4 space-y-3">
                  {creators.map((c, i) => (
                    <div key={c.personId} className="space-y-2 rounded-xl border border-surface-shell bg-surface p-3">
                      <div className="flex items-center gap-2">
                        <input
                          value={c.name}
                          onChange={(e) => updateCreatorName(i, e.target.value)}
                          placeholder="Nombre"
                          className={cn(inputClass, 'flex-1')}
                        />
                        <button
                          type="button"
                          onClick={() => removeCreator(i)}
                          aria-label="Quitar"
                          className="flex size-9 shrink-0 items-center justify-center rounded-xl text-ink-500 transition-colors hover:bg-pink-light hover:text-pink"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {ROLES.map((r) => (
                          <button
                            key={r.id}
                            type="button"
                            onClick={() => updateCreatorRole(i, r.id)}
                            className={cn(
                              'rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors',
                              c.role === r.id
                                ? 'bg-brand text-white'
                                : 'bg-surface text-ink-500 hover:text-ink-700',
                            )}
                          >
                            {r.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={addCreator}
                  className="mt-3 inline-flex items-center gap-2 rounded-xl border border-dashed border-ink-300 px-3 py-2 text-sm font-medium text-ink-700 transition-colors hover:border-brand hover:text-brand"
                >
                  <Plus className="size-4" />
                  Agregar persona
                </button>
              </div>
              <Field label="Estado de composición">
                <StateToggle value={composition} onChange={setComposition} />
              </Field>
            </div>
          )}

          {tab === 'recording' && (
            <div className="space-y-5">
              <div>
                <div className="flex items-center gap-3 rounded-xl border border-surface-shell bg-surface p-4">
                  <span className="flex size-10 items-center justify-center rounded-xl bg-brand-light text-brand">
                    <Music2 className="size-5" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-ink-900">Grabación</p>
                    <p className="text-xs text-ink-500">Estado de la grabación sonora asociada.</p>
                  </div>
                </div>
              </div>
              <Field label="Estado de grabación">
                <StateToggle value={recording} onChange={setRecording} />
              </Field>
            </div>
          )}

          {tab === 'splits' && (
            <div className="space-y-5">
              <div>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-ink-500">
                    Porcentajes de composición. Deben sumar 100%.
                  </p>
                  <button
                    type="button"
                    onClick={syncSharesFromAuthors}
                    className="text-xs font-semibold text-brand hover:underline"
                  >
                    Sincronizar con autores
                  </button>
                </div>
                <div className="mt-4 space-y-2">
                  {shares.length === 0 && (
                    <p className="rounded-xl border border-dashed border-surface-shell px-4 py-6 text-center text-sm text-ink-300">
                      No hay autores. Agrégalos en la pestaña Composition.
                    </p>
                  )}
                  {shares.map((s) => (
                    <div
                      key={s.personId}
                      className="flex items-center justify-between gap-4 rounded-xl border border-surface-shell bg-surface-card px-4 py-3"
                    >
                      <span className="truncate text-sm font-medium text-ink-900">
                        {s.name}
                      </span>
                      <div className="flex items-center rounded-lg border border-surface-shell bg-surface px-2 focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/20">
                        <input
                          type="number"
                          min={0}
                          max={100}
                          value={s.percentage}
                          onChange={(e) => updateSharePct(s.personId, e.target.value)}
                          className="w-14 bg-transparent py-1.5 text-right text-sm font-semibold text-ink-900 outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                        />
                        <span className="pl-1 text-sm font-medium text-ink-500">%</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div
                  className={cn(
                    'mt-4 flex items-center justify-between rounded-xl px-4 py-3 text-sm font-semibold',
                    sharesValid ? 'bg-teal-light text-teal' : 'bg-orange-light text-orange',
                  )}
                >
                  <span className="uppercase tracking-wide">Total</span>
                  <span className="inline-flex items-center gap-1.5">
                    {sharesTotal}%
                    {sharesValid && <Check className="size-4" strokeWidth={3} />}
                  </span>
                </div>
                {!sharesValid && shares.length > 0 && (
                  <p className="mt-2 text-sm font-medium text-orange">
                    Los porcentajes deben sumar 100%.
                  </p>
                )}
              </div>
              <Field label="Estado de splits">
                <div className="flex gap-2">
                  {(['not_started', 'pending', 'complete'] as SplitsState[]).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSplitsState(s)}
                      className={cn(
                        'rounded-lg border px-3 py-2 text-xs font-semibold transition-colors',
                        splitsState === s
                          ? 'border-brand bg-brand-light text-brand'
                          : 'border-surface-shell text-ink-500 hover:text-ink-700',
                      )}
                    >
                      {s === 'not_started' ? 'No empezado' : s === 'pending' ? 'Pendiente' : 'Completo'}
                    </button>
                  ))}
                </div>
              </Field>
            </div>
          )}

          {tab === 'records' && (
            <div className="space-y-5">
              <div className="flex items-center gap-3 rounded-xl border border-surface-shell bg-surface p-4">
                <span className="flex size-10 items-center justify-center rounded-xl bg-brand-light text-brand">
                  <ShieldCheck className="size-5" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-ink-900">Registros</p>
                  <p className="text-xs text-ink-500">
                    Organismos pendientes y con problema.
                  </p>
                </div>
              </div>
              <Field label="Organismos pendientes (no iniciado)">
                <input
                  type="number"
                  min={0}
                  value={registerPending}
                  onChange={(e) => setRegisterPending(Math.max(0, Number.parseInt(e.target.value, 10) || 0))}
                  className={cn(inputClass, 'w-20')}
                />
              </Field>
              <Field label="Organismos con problema">
                <input
                  type="number"
                  min={0}
                  value={registerIssues}
                  onChange={(e) => setRegisterIssues(Math.max(0, Number.parseInt(e.target.value, 10) || 0))}
                  className={cn(inputClass, 'w-20')}
                />
              </Field>
              {registerIssues > 0 && (
                <div className="flex items-center gap-2 rounded-xl bg-orange-light px-4 py-3 text-sm font-medium text-orange">
                  <TriangleAlert className="size-4" strokeWidth={2.5} />
                  {registerIssues} organismo{registerIssues > 1 ? 's' : ''} con problema
                </div>
              )}
              {registerPending > 0 && registerIssues === 0 && (
                <div className="flex items-center gap-2 rounded-xl bg-surface px-4 py-3 text-sm font-medium text-ink-500">
                  {registerPending} organismo{registerPending > 1 ? 's' : ''} sin iniciar
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-surface-shell px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-surface-shell px-4 py-2.5 text-sm font-semibold text-ink-700 transition-colors hover:bg-surface"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || !!isrcError}
            className="inline-flex items-center gap-2 rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-40"
          >
            {saving ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </div>
    </div>
  )
}

const inputClass =
  'w-full rounded-xl border border-surface-shell bg-surface-card px-4 py-2.5 text-sm text-ink-900 placeholder:text-ink-300 outline-none transition-colors focus:border-brand focus:ring-2 focus:ring-brand/20'

function Field({
  label,
  required,
  children,
}: {
  label: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-semibold text-ink-700">
        {label} {required && <span className="text-pink">*</span>}
      </label>
      {children}
    </div>
  )
}

function StateToggle({
  value,
  onChange,
}: {
  value: ComponentState
  onChange: (v: ComponentState) => void
}) {
  const options: { id: ComponentState; label: string }[] = [
    { id: 'not_started', label: 'No empezado' },
    { id: 'incomplete', label: 'Incompleto' },
    { id: 'complete', label: 'Completo' },
  ]
  return (
    <div className="flex gap-2">
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          onClick={() => onChange(o.id)}
          className={cn(
            'rounded-lg border px-3 py-2 text-xs font-semibold transition-colors',
            value === o.id
              ? 'border-brand bg-brand-light text-brand'
              : 'border-surface-shell text-ink-500 hover:text-ink-700',
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}
