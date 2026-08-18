'use client'

import { cn } from '@/lib/utils'
import type { NewWorkInput, WorkType } from '@/lib/works/types'
import { useWorks } from '@/lib/works/use-works'
import {
  ArrowLeft,
  Check,
  Disc3,
  Music2,
  X,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

type Step = 1 | 2 | 3

const STEP_LABELS = ['Tipo', 'Datos', 'Listo']

export function NewWorkFlow() {
  const router = useRouter()
  const { createWork } = useWorks()

  const [step, setStep] = useState<Step>(1)
  const [title, setTitle] = useState('')
  const [artist, setArtist] = useState('')
  const [titleTouched, setTitleTouched] = useState(false)
  const [artistTouched, setArtistTouched] = useState(false)
  const [saving, setSaving] = useState(false)
  const [createdId, setCreatedId] = useState<string | null>(null)

  function goCancel() {
    router.push('/catalog')
  }

  function selectType(type: WorkType) {
    if (type === 'song') setStep(2)
  }

  async function handleSave() {
    if (!title.trim() || !artist.trim() || saving) return
    setSaving(true)
    const input: NewWorkInput = {
      title: title.trim(),
      type: 'song',
      primaryArtist: artist.trim(),
    }
    const work = await createWork(input)
    setSaving(false)
    setCreatedId(work.id)
    setStep(3)
  }

  function viewWork() {
    if (createdId) router.push(`/works/${createdId}`)
  }

  function createAnother() {
    setStep(1)
    setTitle('')
    setArtist('')
    setTitleTouched(false)
    setArtistTouched(false)
    setCreatedId(null)
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
      {step < 3 && (
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
      )}

      {/* Card */}
      <div className="mt-6 rounded-2xl border border-surface-shell bg-surface-card p-6 shadow-card sm:p-8">
        {step === 1 && <StepType onSelectSong={() => selectType('song')} />}

        {step === 2 && (
          <StepDetails
            title={title}
            artist={artist}
            titleError={titleTouched && !title.trim()}
            artistError={artistTouched && !artist.trim()}
            onTitleChange={(v) => {
              setTitle(v)
              if (v.trim()) setTitleTouched(false)
            }}
            onArtistChange={(v) => {
              setArtist(v)
              if (v.trim()) setArtistTouched(false)
            }}
            onBack={() => setStep(1)}
            onSave={handleSave}
            saving={saving}
          />
        )}

        {step === 3 && createdId && (
          <StepConfirmation
            title={title}
            onView={viewWork}
            onCreateAnother={createAnother}
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
/* Step 2 — Basic data (title + artist)                                       */
/* -------------------------------------------------------------------------- */
function StepDetails({
  title,
  artist,
  titleError,
  artistError,
  onTitleChange,
  onArtistChange,
  onBack,
  onSave,
  saving,
}: {
  title: string
  artist: string
  titleError: boolean
  artistError: boolean
  onTitleChange: (v: string) => void
  onArtistChange: (v: string) => void
  onBack: () => void
  onSave: () => void
  saving: boolean
}) {
  const canSave = title.trim().length > 0 && artist.trim().length > 0

  return (
    <div>
      <h2 className="text-xl font-bold tracking-tight text-ink-900">
        Datos básicos
      </h2>
      <p className="mt-1.5 text-sm text-ink-500">
        Solo necesitas título y artista. El resto se completa después.
      </p>

      <div className="mt-6 space-y-5">
        <div>
          <label
            htmlFor="work-title"
            className="mb-1.5 block text-sm font-semibold text-ink-700"
          >
            Título <span className="text-pink">*</span>
          </label>
          <input
            id="work-title"
            autoFocus
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.nativeEvent.isComposing && canSave) {
                onSave()
              }
            }}
            placeholder="Título de la obra"
            className={cn(
              'w-full rounded-xl border bg-surface-card px-4 py-3 text-base text-ink-900 placeholder:text-ink-300 outline-none transition-colors focus:ring-2',
              titleError
                ? 'border-pink focus:border-pink focus:ring-pink/20'
                : 'border-surface-shell focus:border-brand focus:ring-brand/20',
            )}
          />
          {titleError && (
            <p className="mt-1.5 text-sm font-medium text-pink">
              Escribe un título.
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="work-artist"
            className="mb-1.5 block text-sm font-semibold text-ink-700"
          >
            Artista principal <span className="text-pink">*</span>
          </label>
          <input
            id="work-artist"
            value={artist}
            onChange={(e) => onArtistChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.nativeEvent.isComposing && canSave) {
                onSave()
              }
            }}
            placeholder="Nombre del artista"
            className={cn(
              'w-full rounded-xl border bg-surface-card px-4 py-3 text-base text-ink-900 placeholder:text-ink-300 outline-none transition-colors focus:ring-2',
              artistError
                ? 'border-pink focus:border-pink focus:ring-pink/20'
                : 'border-surface-shell focus:border-brand focus:ring-brand/20',
            )}
          />
          {artistError && (
            <p className="mt-1.5 text-sm font-medium text-pink">
              Escribe el nombre del artista.
            </p>
          )}
        </div>
      </div>

      <StepFooter
        onBack={onBack}
        primaryLabel={saving ? 'Guardando...' : 'Crear obra'}
        onPrimary={onSave}
        primaryDisabled={!canSave || saving}
      />
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Step 3 — Confirmation                                                      */
/* -------------------------------------------------------------------------- */
function StepConfirmation({
  title,
  onView,
  onCreateAnother,
}: {
  title: string
  onView: () => void
  onCreateAnother: () => void
}) {
  return (
    <div className="flex flex-col items-center text-center">
      <span className="flex size-16 items-center justify-center rounded-2xl bg-teal-light text-teal">
        <Check className="size-8" strokeWidth={3} />
      </span>
      <h2 className="mt-5 text-xl font-bold tracking-tight text-ink-900">
        ¡Listo! &ldquo;{title}&rdquo; se creó correctamente.
      </h2>
      <p className="mt-2 text-sm text-ink-500">
        Puedes completar los detalles cuando quieras desde el catálogo.
      </p>
      <div className="mt-8 flex items-center gap-3">
        <button
          type="button"
          onClick={onView}
          className="inline-flex items-center gap-2 rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
        >
          Ver obra
        </button>
        <button
          type="button"
          onClick={onCreateAnother}
          className="inline-flex items-center gap-2 rounded-xl border border-surface-shell px-5 py-2.5 text-sm font-semibold text-ink-700 transition-colors hover:bg-surface"
        >
          Crear otra
        </button>
      </div>
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
