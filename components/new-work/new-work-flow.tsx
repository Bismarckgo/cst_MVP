'use client'

import { cn } from '@/lib/utils'
import type { NewWorkInput } from '@/lib/works/types'
import { useWorks } from '@/lib/works/use-works'
import {
  ArrowLeft,
  Check,
  Disc3,
  Music2,
  Plus,
  Trash2,
  X,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'

interface Participant {
  id: string
  name: string
  percentage: number
}

type Step = 1 | 2 | 3 | 4

const STEP_LABELS = ['Tipo', 'Título', 'Participantes', 'Splits']

function newId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `p_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

// Distribute 100% as evenly as possible, remainder goes to the first person.
function evenSplit(count: number): number[] {
  if (count === 0) return []
  const base = Math.floor(100 / count)
  const shares = new Array(count).fill(base)
  shares[0] += 100 - base * count
  return shares
}

export function NewWorkFlow() {
  const router = useRouter()
  const { createWork } = useWorks()

  const [step, setStep] = useState<Step>(1)
  const [title, setTitle] = useState('')
  const [titleTouched, setTitleTouched] = useState(false)
  const [participants, setParticipants] = useState<Participant[]>([
    { id: newId(), name: '', percentage: 100 },
  ])
  const [saving, setSaving] = useState(false)

  const total = useMemo(
    () => participants.reduce((sum, p) => sum + (p.percentage || 0), 0),
    [participants],
  )
  const namedParticipants = participants.filter((p) => p.name.trim().length > 0)
  const splitValid =
    Math.round(total) === 100 && namedParticipants.length === participants.length

  function goCancel() {
    router.push('/catalog')
  }

  function goToParticipants() {
    if (!title.trim()) {
      setTitleTouched(true)
      return
    }
    setStep(3)
  }

  function goToSplits() {
    // Redistribute evenly across named participants entering the split step.
    const named = participants.filter((p) => p.name.trim())
    const shares = evenSplit(named.length)
    let i = 0
    setParticipants(
      participants
        .filter((p) => p.name.trim())
        .map((p) => ({ ...p, percentage: shares[i++] })),
    )
    setStep(4)
  }

  function addParticipant() {
    setParticipants((prev) => [
      ...prev,
      { id: newId(), name: '', percentage: 0 },
    ])
  }

  function updateParticipantName(id: string, name: string) {
    setParticipants((prev) =>
      prev.map((p) => (p.id === id ? { ...p, name } : p)),
    )
  }

  function updateParticipantPct(id: string, value: string) {
    const pct = Math.max(0, Math.min(100, Number.parseInt(value, 10) || 0))
    setParticipants((prev) =>
      prev.map((p) => (p.id === id ? { ...p, percentage: pct } : p)),
    )
  }

  function removeParticipant(id: string) {
    setParticipants((prev) =>
      prev.length > 1 ? prev.filter((p) => p.id !== id) : prev,
    )
  }

  async function handleSave() {
    if (!splitValid || saving) return
    setSaving(true)
    const input: NewWorkInput = {
      title: title.trim(),
      type: 'song',
      primaryArtist: namedParticipants[0]?.name.trim() ?? '',
      creators: namedParticipants.map((p) => ({
        personId: p.id,
        name: p.name.trim(),
        role: 'Compositor',
      })),
      compositionShares: namedParticipants.map((p) => ({
        personId: p.id,
        name: p.name.trim(),
        percentage: p.percentage,
      })),
    }
    const work = await createWork(input)
    router.push(`/works/${work.id}`)
  }

  return (
    <div className="mx-auto w-full max-w-xl px-5 py-8 sm:py-12">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={goCancel}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-500 transition-colors hover:text-ink-700"
        >
          <ArrowLeft className="size-4" />
          Catálogo
        </button>
        <button
          type="button"
          onClick={goCancel}
          aria-label="Cancelar"
          className="flex size-8 items-center justify-center rounded-lg text-ink-500 transition-colors hover:bg-surface hover:text-ink-700"
        >
          <X className="size-4" />
        </button>
      </div>

      {/* Stepper */}
      <div className="mt-6 flex items-center gap-2">
        {STEP_LABELS.map((label, i) => {
          const index = (i + 1) as Step
          const done = index < step
          const current = index === step
          return (
            <div key={label} className="flex flex-1 items-center gap-2">
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    'flex size-6 items-center justify-center rounded-full text-[11px] font-semibold transition-colors',
                    current && 'bg-brand text-white',
                    done && 'bg-brand-light text-brand',
                    !current && !done && 'bg-surface-shell text-ink-500',
                  )}
                >
                  {done ? <Check className="size-3.5" strokeWidth={3} /> : i + 1}
                </span>
                <span
                  className={cn(
                    'hidden text-xs font-medium sm:block',
                    current ? 'text-ink-900' : 'text-ink-500',
                  )}
                >
                  {label}
                </span>
              </div>
              {i < STEP_LABELS.length - 1 && (
                <span
                  className={cn(
                    'h-px flex-1',
                    done ? 'bg-brand-light' : 'bg-surface-shell',
                  )}
                />
              )}
            </div>
          )
        })}
      </div>

      {/* Card */}
      <div className="mt-6 rounded-2xl border border-surface-shell bg-surface-card p-6 shadow-card sm:p-8">
        {step === 1 && (
          <StepType
            onSelectSong={() => setStep(2)}
          />
        )}

        {step === 2 && (
          <StepTitle
            title={title}
            error={titleTouched && !title.trim()}
            onChange={(v) => {
              setTitle(v)
              if (v.trim()) setTitleTouched(false)
            }}
            onBack={() => setStep(1)}
            onContinue={goToParticipants}
          />
        )}

        {step === 3 && (
          <StepParticipants
            participants={participants}
            onChangeName={updateParticipantName}
            onAdd={addParticipant}
            onRemove={removeParticipant}
            onBack={() => setStep(2)}
            onContinue={goToSplits}
          />
        )}

        {step === 4 && (
          <StepSplits
            participants={participants}
            total={total}
            valid={splitValid}
            saving={saving}
            onChangePct={updateParticipantPct}
            onBack={() => setStep(3)}
            onSave={handleSave}
          />
        )}
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Step 1 — Type                                                              */
/* -------------------------------------------------------------------------- */
function StepType({ onSelectSong }: { onSelectSong: () => void }) {
  return (
    <div>
      <h2 className="text-xl font-bold tracking-tight text-ink-900">
        ¿Qué estás creando?
      </h2>
      <p className="mt-1.5 text-sm text-ink-500">
        Elige el tipo de obra para empezar.
      </p>

      <div className="mt-6 grid grid-cols-2 gap-4">
        <button
          type="button"
          onClick={onSelectSong}
          className="group flex flex-col items-start gap-3 rounded-2xl border-2 border-surface-shell bg-surface-card p-5 text-left transition-colors hover:border-brand hover:bg-brand-light"
        >
          <span className="flex size-11 items-center justify-center rounded-xl bg-brand-light text-brand group-hover:bg-white">
            <Music2 className="size-5" />
          </span>
          <span className="text-sm font-semibold text-ink-900">Canción</span>
          <span className="text-xs text-ink-500">
            Una composición con letra y música.
          </span>
        </button>

        <div
          aria-disabled
          className="relative flex cursor-not-allowed flex-col items-start gap-3 rounded-2xl border-2 border-surface-shell bg-surface p-5 text-left opacity-70"
        >
          <span className="absolute top-3 right-3 rounded-full bg-surface-shell px-2 py-0.5 text-[10px] font-semibold text-ink-500">
            Pronto
          </span>
          <span className="flex size-11 items-center justify-center rounded-xl bg-surface-shell text-ink-500">
            <Disc3 className="size-5" />
          </span>
          <span className="text-sm font-semibold text-ink-700">Grabación</span>
          <span className="text-xs text-ink-500">
            Un master o grabación sonora.
          </span>
        </div>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Step 2 — Title                                                             */
/* -------------------------------------------------------------------------- */
function StepTitle({
  title,
  error,
  onChange,
  onBack,
  onContinue,
}: {
  title: string
  error: boolean
  onChange: (v: string) => void
  onBack: () => void
  onContinue: () => void
}) {
  return (
    <div>
      <h2 className="text-xl font-bold tracking-tight text-ink-900">
        ¿Cómo se llama?
      </h2>
      <p className="mt-1.5 text-sm text-ink-500">
        Puedes cambiar el título más adelante.
      </p>

      <input
        autoFocus
        value={title}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.nativeEvent.isComposing) onContinue()
        }}
        placeholder="Título de la obra"
        className={cn(
          'mt-6 w-full rounded-xl border bg-surface-card px-4 py-3 text-base text-ink-900 placeholder:text-ink-300 outline-none transition-colors focus:ring-2',
          error
            ? 'border-pink focus:border-pink focus:ring-pink/20'
            : 'border-surface-shell focus:border-brand focus:ring-brand/20',
        )}
      />
      {error && (
        <p className="mt-2 text-sm font-medium text-pink">
          Escribe un título para continuar.
        </p>
      )}

      <StepFooter
        onBack={onBack}
        primaryLabel="Continuar"
        onPrimary={onContinue}
        primaryDisabled={false}
      />
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Step 3 — Participants                                                      */
/* -------------------------------------------------------------------------- */
function StepParticipants({
  participants,
  onChangeName,
  onAdd,
  onRemove,
  onBack,
  onContinue,
}: {
  participants: Participant[]
  onChangeName: (id: string, name: string) => void
  onAdd: () => void
  onRemove: (id: string) => void
  onBack: () => void
  onContinue: () => void
}) {
  const canContinue = participants.some((p) => p.name.trim().length > 0)
  return (
    <div>
      <h2 className="text-xl font-bold tracking-tight text-ink-900">
        ¿Quién participa?
      </h2>
      <p className="mt-1.5 text-sm text-ink-500">
        Agrega a las personas que crearon esta obra.
      </p>

      <div className="mt-6 space-y-3">
        {participants.map((p, i) => (
          <div key={p.id} className="flex items-center gap-2">
            <input
              autoFocus={i === 0}
              value={p.name}
              onChange={(e) => onChangeName(p.id, e.target.value)}
              placeholder="Nombre de la persona"
              className="w-full rounded-xl border border-surface-shell bg-surface-card px-4 py-2.5 text-sm text-ink-900 placeholder:text-ink-300 outline-none transition-colors focus:border-brand focus:ring-2 focus:ring-brand/20"
            />
            {participants.length > 1 && (
              <button
                type="button"
                onClick={() => onRemove(p.id)}
                aria-label="Quitar persona"
                className="flex size-9 shrink-0 items-center justify-center rounded-xl text-ink-500 transition-colors hover:bg-pink-light hover:text-pink"
              >
                <Trash2 className="size-4" />
              </button>
            )}
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={onAdd}
        className="mt-3 inline-flex items-center gap-2 rounded-xl border border-dashed border-ink-300 px-3 py-2 text-sm font-medium text-ink-700 transition-colors hover:border-brand hover:text-brand"
      >
        <Plus className="size-4" />
        Agregar persona
      </button>

      <StepFooter
        onBack={onBack}
        primaryLabel="Continuar"
        onPrimary={onContinue}
        primaryDisabled={!canContinue}
      />
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Step 4 — Splits                                                            */
/* -------------------------------------------------------------------------- */
function StepSplits({
  participants,
  total,
  valid,
  saving,
  onChangePct,
  onBack,
  onSave,
}: {
  participants: Participant[]
  total: number
  valid: boolean
  saving: boolean
  onChangePct: (id: string, value: string) => void
  onBack: () => void
  onSave: () => void
}) {
  const totalOk = Math.round(total) === 100
  return (
    <div>
      <h2 className="text-xl font-bold tracking-tight text-ink-900">
        ¿Cómo se dividió la composición?
      </h2>
      <p className="mt-1.5 text-sm text-ink-500">
        Los porcentajes deben sumar 100%.
      </p>

      <div className="mt-6 space-y-2">
        {participants.map((p) => (
          <div
            key={p.id}
            className="flex items-center justify-between gap-4 rounded-xl border border-surface-shell bg-surface-card px-4 py-3"
          >
            <span className="truncate text-sm font-medium text-ink-900">
              {p.name}
            </span>
            <div className="flex items-center rounded-lg border border-surface-shell bg-surface px-2 focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/20">
              <input
                type="number"
                min={0}
                max={100}
                value={p.percentage}
                onChange={(e) => onChangePct(p.id, e.target.value)}
                className="w-14 bg-transparent py-1.5 text-right text-sm font-semibold text-ink-900 outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              />
              <span className="pl-1 text-sm font-medium text-ink-500">%</span>
            </div>
          </div>
        ))}
      </div>

      {/* Total */}
      <div
        className={cn(
          'mt-4 flex items-center justify-between rounded-xl px-4 py-3 text-sm font-semibold',
          totalOk ? 'bg-teal-light text-teal' : 'bg-orange-light text-orange',
        )}
      >
        <span className="uppercase tracking-wide">Total</span>
        <span className="inline-flex items-center gap-1.5">
          {total}%
          {totalOk && <Check className="size-4" strokeWidth={3} />}
        </span>
      </div>
      {!totalOk && (
        <p className="mt-2 text-sm font-medium text-orange">
          Los porcentajes deben sumar 100%.
        </p>
      )}

      <StepFooter
        onBack={onBack}
        primaryLabel={saving ? 'Guardando...' : 'Guardar obra'}
        onPrimary={onSave}
        primaryDisabled={!valid || saving}
      />
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Shared footer                                                              */
/* -------------------------------------------------------------------------- */
function StepFooter({
  onBack,
  primaryLabel,
  onPrimary,
  primaryDisabled,
}: {
  onBack: () => void
  primaryLabel: string
  onPrimary: () => void
  primaryDisabled: boolean
}) {
  return (
    <div className="mt-8 flex items-center justify-between">
      <button
        type="button"
        onClick={onBack}
        className="text-sm font-medium text-ink-500 transition-colors hover:text-ink-700"
      >
        Atrás
      </button>
      <button
        type="button"
        onClick={onPrimary}
        disabled={primaryDisabled}
        className="inline-flex items-center gap-2 rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-40"
      >
        {primaryLabel}
      </button>
    </div>
  )
}
