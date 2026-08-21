import { cn } from '@/lib/utils'
import type { WorkStatus } from '@/lib/works/types'
import { Check, Circle, ShieldCheck, TriangleAlert } from 'lucide-react'

interface BadgeConfig {
  label: string
  icon: typeof Check
  iconClass: string
  textClass: string
}

const BADGES: Record<WorkStatus, BadgeConfig> = {
  draft: {
    label: 'Draft',
    icon: Circle,
    iconClass: 'size-2.5 fill-current stroke-0',
    textClass: 'text-ink-500',
  },
  ready: {
    label: 'Ready',
    icon: Check,
    iconClass: 'size-4',
    textClass: 'text-teal',
  },
  attention: {
    label: 'Attention',
    icon: TriangleAlert,
    iconClass: 'size-4',
    textClass: 'text-orange',
  },
  registered: {
    label: 'Registered',
    icon: ShieldCheck,
    iconClass: 'size-4',
    textClass: 'text-brand',
  },
}

export function WorkStatusBadge({
  status,
  className,
}: {
  status: WorkStatus
  className?: string
}) {
  const config = BADGES[status]
  const Icon = config.icon

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 text-sm font-medium',
        config.textClass,
        className,
      )}
    >
      <Icon className={cn('shrink-0', config.iconClass)} strokeWidth={2.5} />
      {config.label}
    </span>
  )
}
