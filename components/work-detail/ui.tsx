'use client'

import { cn } from '@/lib/utils'
import type { ModuleState } from '@/lib/works/status'
import {
  AlertTriangle,
  Check,
  Circle,
  Copy,
  OctagonAlert,
} from 'lucide-react'
import { useState } from 'react'

/* -------------------------------------------------------------------------- */
/* Panel — the boxed sections that make up the 360° summary                   */
/* -------------------------------------------------------------------------- */
export function Panel({
  title,
  action,
  className,
  children,
}: {
  title?: string
  action?: React.ReactNode
  className?: string
  children: React.ReactNode
}) {
  return (
    <section
      className={cn(
        'rounded-2xl border border-surface-shell bg-surface-card p-5 shadow-card sm:p-6',
        className,
      )}
    >
      {(title || action) && (
        <div className="flex items-center justify-between gap-3">
          {title && (
            <h2 className="text-[11px] font-semibold tracking-wider text-ink-500 uppercase">
              {title}
            </h2>
          )}
          {action}
        </div>
      )}
      <div className={cn(title || action ? 'mt-4' : undefined)}>{children}</div>
    </section>
  )
}

/* -------------------------------------------------------------------------- */
/* State visuals — one shared mapping for every module / row state            */
/* -------------------------------------------------------------------------- */
const STATE_STYLES: Record<
  ModuleState,
  { text: string; icon: typeof Check }
> = {
  complete: { text: 'text-teal', icon: Check },
  attention: { text: 'text-orange', icon: AlertTriangle },
  blocked: { text: 'text-pink', icon: OctagonAlert },
  pending: { text: 'text-ink-500', icon: Circle },
}

export function StateIcon({
  state,
  className,
}: {
  state: ModuleState
  className?: string
}) {
  const { text, icon: Icon } = STATE_STYLES[state]
  if (state === 'pending') {
    return (
      <Circle
        className={cn('size-2.5 shrink-0 fill-current', text, className)}
        strokeWidth={0}
      />
    )
  }
  return (
    <Icon className={cn('size-4 shrink-0', text, className)} strokeWidth={2.5} />
  )
}

export function StatePill({ state }: { state: ModuleState }) {
  const label: Record<ModuleState, string> = {
    complete: 'Ready',
    attention: 'Attention',
    blocked: 'Blocked',
    pending: 'Pending',
  }
  const bg: Record<ModuleState, string> = {
    complete: 'bg-teal-light text-teal',
    attention: 'bg-orange-light text-orange',
    blocked: 'bg-pink-light text-pink',
    pending: 'bg-surface-shell text-ink-500',
  }
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold',
        bg[state],
      )}
    >
      <StateIcon state={state} />
      {label[state]}
    </span>
  )
}

/* -------------------------------------------------------------------------- */
/* CopyField — identifier row with a copy-to-clipboard affordance             */
/* -------------------------------------------------------------------------- */
export function CopyField({
  label,
  value,
}: {
  label: string
  value: string | null
}) {
  const [copied, setCopied] = useState(false)
  const empty = !value

  async function handleCopy() {
    if (!value) return
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // clipboard unavailable — ignore silently
    }
  }

  return (
    <div className="flex items-center justify-between gap-3 py-2.5">
      <div className="min-w-0">
        <p className="text-[11px] font-semibold tracking-wider text-ink-500 uppercase">
          {label}
        </p>
        <p
          className={cn(
            'mt-0.5 truncate font-mono text-sm',
            empty ? 'text-ink-300' : 'text-ink-900',
          )}
        >
          {value ?? 'Pendiente'}
        </p>
      </div>
      <button
        type="button"
        onClick={handleCopy}
        disabled={empty}
        className={cn(
          'inline-flex items-center gap-1.5 rounded-lg border border-surface-shell px-2.5 py-1.5 text-xs font-semibold transition-colors',
          empty
            ? 'cursor-not-allowed text-ink-300'
            : 'text-ink-700 hover:border-brand hover:text-brand',
        )}
        aria-label={`Copiar ${label}`}
      >
        {copied ? (
          <Check className="size-3.5 text-teal" strokeWidth={3} />
        ) : (
          <Copy className="size-3.5" />
        )}
        {copied ? 'Copiado' : 'Copy'}
      </button>
    </div>
  )
}
