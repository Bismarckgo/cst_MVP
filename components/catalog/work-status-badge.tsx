import { cn } from '@/lib/utils'
import type { WorkStatus } from '@/lib/works/types'
import { Check, Circle } from 'lucide-react'

export function WorkStatusBadge({
  status,
  className,
}: {
  status: WorkStatus
  className?: string
}) {
  if (status === 'ready') {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1.5 text-sm font-medium text-teal',
          className,
        )}
      >
        <Check className="size-4" strokeWidth={2.5} />
        Ready
      </span>
    )
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 text-sm font-medium text-ink-500',
        className,
      )}
    >
      <Circle className="size-2.5 fill-current" strokeWidth={0} />
      Draft
    </span>
  )
}
