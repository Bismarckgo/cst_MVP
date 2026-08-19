import { cn } from '@/lib/utils'
import type { ComponentState, SplitsState } from '@/lib/works/types'
import { Check, Circle, Clock, Minus, TriangleAlert } from 'lucide-react'

type CellState = ComponentState | SplitsState

interface StateConfig {
  label: string
  icon: typeof Check
  className: string
}

const STATE_CONFIG: Record<CellState, StateConfig> = {
  complete: {
    label: 'Complete',
    icon: Check,
    className: 'text-teal',
  },
  incomplete: {
    label: 'Incomplete',
    icon: Circle,
    className: 'size-2.5 fill-current stroke-0 text-orange',
  },
  pending: {
    label: 'Review',
    icon: Clock,
    className: 'text-orange',
  },
  not_started: {
    label: '—',
    icon: Minus,
    className: 'text-ink-300',
  },
}

export function ComponentStateBadge({
  state,
  type = 'component',
}: {
  state: CellState
  type?: 'component' | 'splits'
}) {
  const config = STATE_CONFIG[state]
  const Icon = config.icon

  if (state === 'not_started') {
    return <span className="text-sm text-ink-300">—</span>
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 text-sm font-medium',
        config.className,
      )}
    >
      <Icon
        className={cn(
          'shrink-0',
          state === 'incomplete' ? 'size-2.5 fill-current stroke-0' : 'size-4',
        )}
        strokeWidth={state === 'incomplete' ? 0 : 2.5}
      />
      {type === 'splits' && state === 'complete' ? '100%' : config.label}
    </span>
  )
}

// Register cell: distinguishes "N not started" (informational) from
// "⚠ N with problem" (actionable) from "Not evaluated" (no info).
export function RegisterCell({
  pending,
  issues,
  status,
}: {
  pending: number
  issues: number
  status: string
}) {
  if (issues > 0) {
    return (
      <span className="inline-flex items-center gap-1 text-sm font-medium text-orange">
        <TriangleAlert className="size-4" strokeWidth={2.5} />
        {issues}
      </span>
    )
  }
  if (pending > 0) {
    return <span className="text-sm font-medium text-ink-500">{pending}</span>
  }
  if (status === 'registered') {
    return (
      <span className="inline-flex items-center text-teal">
        <Check className="size-4" strokeWidth={2.5} />
      </span>
    )
  }
  return <span className="text-sm text-ink-300">Not evaluated</span>
}
