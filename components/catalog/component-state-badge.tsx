import { cn } from '@/lib/utils'
import type { ComponentState, SplitsState } from '@/lib/works/types'
import { Check, Circle, Clock, Minus } from 'lucide-react'

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
