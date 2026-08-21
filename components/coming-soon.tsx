import type { LucideIcon } from 'lucide-react'
import Link from 'next/link'

export function ComingSoon({
  title,
  icon: Icon,
  description,
}: {
  title: string
  icon: LucideIcon
  description: string
}) {
  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-xl flex-col items-center justify-center px-6 text-center">
      <div className="flex size-16 items-center justify-center rounded-2xl bg-brand-light text-brand">
        <Icon className="size-7" />
      </div>
      <h1 className="mt-6 text-2xl font-bold tracking-tight text-ink-900">
        {title}
      </h1>
      <span className="mt-3 rounded-full bg-surface-shell px-3 py-1 text-xs font-semibold tracking-wide text-ink-500 uppercase">
        Próximamente
      </span>
      <p className="mt-4 text-pretty text-sm leading-relaxed text-ink-500">
        {description}
      </p>
      <Link
        href="/catalog"
        className="mt-8 rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
      >
        Ir al Catálogo
      </Link>
    </div>
  )
}
