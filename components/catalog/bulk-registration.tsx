'use client'

// ----------------------------------------------------------------------------
// CST · Bulk Registration
//
// Information-architecture rule (CST spec): an action that operates over a
// SELECTION of multiple works belongs to the Catálogo, not to a single
// Composition. This component lives next to "Nueva obra" and drives the flow:
//
//   selección → destino/formato → validación → generar plantilla/archivo
//
// The generation step itself is not modeled yet, so it surfaces as a disabled
// "Disponible próximamente" action — consistent with the rest of the MVP — but
// the destinations (MLC, SoundExchange, PRO, CWR) and the multi-work selection
// context are fully wired.
// ----------------------------------------------------------------------------

import { compositionComplete } from '@/lib/works/status'
import type { Work } from '@/lib/works/types'
import { cn } from '@/lib/utils'
import { Check, FileStack, Layers, X } from 'lucide-react'
import { useEffect, useState } from 'react'

type DestinationId = 'mlc' | 'soundexchange' | 'pro' | 'cwr'

interface Destination {
  id: DestinationId
  label: string
  description: string
}

const DESTINATIONS: Destination[] = [
  {
    id: 'mlc',
    label: 'The MLC',
    description: 'Regalías mecánicas de streaming/descarga en EE. UU.',
  },
  {
    id: 'soundexchange',
    label: 'SoundExchange',
    description: 'Regalías digitales de la grabación (performance).',
  },
  {
    id: 'pro',
    label: 'PRO',
    description: 'Sociedad de gestión (ASCAP, BMI, SESAC…).',
  },
  {
    id: 'cwr',
    label: 'CWR',
    description: 'Common Works Registration para registro masivo.',
  },
]

export function BulkRegistration({ selectedWorks }: { selectedWorks: Work[] }) {
  const [open, setOpen] = useState(false)
  const count = selectedWorks.length
  const disabled = count === 0

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        disabled={disabled}
        title={
          disabled ? 'Selecciona una o más obras primero' : undefined
        }
        className={cn(
          'inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition-colors',
          disabled
            ? 'cursor-not-allowed border-surface-shell text-ink-300'
            : 'border-brand/30 bg-brand-light text-brand hover:bg-brand/10',
        )}
      >
        <Layers className="size-4" strokeWidth={2.5} />
        Bulk Registration
        {count > 0 && (
          <span className="ml-0.5 inline-flex min-w-5 items-center justify-center rounded-full bg-brand px-1.5 text-xs font-bold text-white">
            {count}
          </span>
        )}
      </button>

      {open && (
        <BulkRegistrationDialog
          selectedWorks={selectedWorks}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  )
}

function BulkRegistrationDialog({
  selectedWorks,
  onClose,
}: {
  selectedWorks: Work[]
  onClose: () => void
}) {
  const [destination, setDestination] = useState<DestinationId | null>(null)

  // Close on Escape.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  const readyCount = selectedWorks.filter(compositionComplete).length
  const allReady = readyCount === selectedWorks.length

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink-900/50 p-0 sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Bulk Registration"
      onClick={onClose}
    >
      <div
        className="flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-t-2xl bg-surface-card shadow-card sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-surface-shell px-5 py-4">
          <div className="flex items-center gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-brand-light text-brand">
              <FileStack className="size-4" />
            </span>
            <div>
              <h2 className="text-base font-bold text-ink-900">
                Bulk Registration
              </h2>
              <p className="text-xs text-ink-500">
                {selectedWorks.length}{' '}
                {selectedWorks.length === 1 ? 'obra seleccionada' : 'obras seleccionadas'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="rounded-lg p-1.5 text-ink-500 transition-colors hover:bg-surface hover:text-ink-900"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {/* Selected works */}
          <div className="flex flex-wrap gap-1.5">
            {selectedWorks.map((w) => (
              <span
                key={w.id}
                className="inline-flex max-w-[16rem] items-center gap-1.5 truncate rounded-lg bg-surface px-2.5 py-1 text-xs font-medium text-ink-700"
              >
                {w.title}
              </span>
            ))}
          </div>

          {/* Destination selection */}
          <p className="mt-5 text-[11px] font-semibold tracking-wider text-ink-500 uppercase">
            Elegir destino / formato
          </p>
          <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {DESTINATIONS.map((d) => {
              const active = destination === d.id
              return (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => setDestination(d.id)}
                  className={cn(
                    'flex flex-col items-start gap-1 rounded-xl border p-3 text-left transition-colors',
                    active
                      ? 'border-brand bg-brand-light'
                      : 'border-surface-shell hover:border-ink-300',
                  )}
                >
                  <span className="flex w-full items-center justify-between gap-2">
                    <span className="text-sm font-semibold text-ink-900">
                      {d.label}
                    </span>
                    {active && (
                      <Check className="size-4 text-brand" strokeWidth={2.5} />
                    )}
                  </span>
                  <span className="text-xs leading-snug text-ink-500">
                    {d.description}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Validation preview */}
          {destination && (
            <>
              <p className="mt-5 text-[11px] font-semibold tracking-wider text-ink-500 uppercase">
                Validación
              </p>
              <div className="mt-2 rounded-xl border border-surface-shell">
                <div className="flex items-center justify-between gap-3 border-b border-surface px-3 py-2.5 text-sm">
                  <span className="text-ink-700">
                    Obras con composición completa
                  </span>
                  <span
                    className={cn(
                      'font-semibold',
                      allReady ? 'text-teal' : 'text-orange',
                    )}
                  >
                    {readyCount}/{selectedWorks.length}
                  </span>
                </div>
                <ul className="divide-y divide-surface">
                  {selectedWorks.map((w) => {
                    const ready = compositionComplete(w)
                    return (
                      <li
                        key={w.id}
                        className="flex items-center justify-between gap-3 px-3 py-2 text-sm"
                      >
                        <span className="truncate text-ink-700">{w.title}</span>
                        <span
                          className={cn(
                            'shrink-0 text-xs font-medium',
                            ready ? 'text-teal' : 'text-orange',
                          )}
                        >
                          {ready ? 'Lista' : 'Revisar shares'}
                        </span>
                      </li>
                    )
                  })}
                </ul>
              </div>
              {!allReady && (
                <p className="mt-2 text-xs text-ink-500">
                  Algunas obras tienen información pendiente. Puedes seguir
                  preparando la plantilla, pero revisa las obras marcadas antes
                  de registrar.
                </p>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 border-t border-surface-shell px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl px-3 py-2 text-sm font-medium text-ink-500 transition-colors hover:text-ink-900"
          >
            Cancelar
          </button>
          <button
            type="button"
            disabled
            title="Disponible próximamente"
            className={cn(
              'inline-flex cursor-not-allowed items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white opacity-60',
              destination ? 'bg-brand' : 'bg-ink-300',
            )}
          >
            Generar plantilla
          </button>
        </div>
      </div>
    </div>
  )
}
