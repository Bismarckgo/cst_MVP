'use client'

import { cn } from '@/lib/utils'
import {
  Building2,
  Home,
  type LucideIcon,
  Music2,
  Rocket,
  Settings,
  Wallet,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface NavItem {
  label: string
  href: string
  icon: LucideIcon
  ready?: boolean
  badge?: string
}

const primaryNav: NavItem[] = [
  { label: 'Inicio', href: '/home', icon: Home },
  { label: 'Catálogo', href: '/catalog', icon: Music2, ready: true },
  { label: 'Organizaciones', href: '/organizations', icon: Building2 },
  { label: 'Lanzamiento', href: '/releases', icon: Rocket },
  { label: 'Royalties', href: '/royalties', icon: Wallet, badge: 'beta' },
]

const settingsNav: NavItem = {
  label: 'Configuración',
  href: '/settings',
  icon: Settings,
}

function NavLink({
  item,
  active,
  onNavigate,
}: {
  item: NavItem
  active: boolean
  onNavigate?: () => void
}) {
  const Icon = item.icon
  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors',
        active
          ? 'bg-brand-light font-semibold text-brand'
          : 'font-medium text-ink-500 hover:bg-surface hover:text-ink-700',
      )}
    >
      <Icon
        className={cn(
          'size-5 shrink-0',
          active ? 'text-brand' : 'text-ink-300 group-hover:text-ink-500',
        )}
        strokeWidth={2}
      />
      <span className="flex-1 truncate">{item.label}</span>
      {item.badge && (
        <span className="rounded-full bg-teal-light px-2 py-0.5 text-[10px] font-semibold tracking-wide text-teal uppercase">
          {item.badge}
        </span>
      )}
      {!item.ready && (
        <span className="rounded-full bg-surface px-2 py-0.5 text-[10px] font-medium text-ink-300 group-hover:bg-surface-shell">
          Pronto
        </span>
      )}
    </Link>
  )
}

export function AppSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()

  const isActive = (href: string) =>
    href === '/catalog'
      ? pathname === '/catalog' || pathname.startsWith('/catalog/') || pathname.startsWith('/works/')
      : pathname === href

  return (
    <div className="flex h-full flex-col bg-surface-card">
      {/* Brand */}
      <div className="flex items-center gap-3 px-5 py-6">
        <div className="flex size-10 items-center justify-center rounded-xl bg-brand text-base font-bold text-white shadow-card">
          C
        </div>
        <div className="leading-tight">
          <p className="text-base font-bold tracking-tight text-ink-900">CST</p>
          <p className="text-xs font-medium text-ink-500">Credit Session Track</p>
        </div>
      </div>

      {/* Primary navigation */}
      <nav className="flex-1 space-y-1 px-3 py-2">
        {primaryNav.map((item) => (
          <NavLink
            key={item.href}
            item={item}
            active={isActive(item.href)}
            onNavigate={onNavigate}
          />
        ))}
      </nav>

      {/* Settings */}
      <div className="border-t border-surface-shell px-3 py-3">
        <NavLink
          item={settingsNav}
          active={isActive(settingsNav.href)}
          onNavigate={onNavigate}
        />
      </div>
    </div>
  )
}
