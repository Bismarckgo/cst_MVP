'use client'

import { AppSidebar } from '@/components/app-sidebar'
import { cn } from '@/lib/utils'
import { Menu } from 'lucide-react'
import { useState } from 'react'

export function AppShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-surface">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 border-r border-surface-shell lg:block">
        <div className="sticky top-0 h-screen">
          <AppSidebar />
        </div>
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            aria-label="Cerrar menú"
            className="absolute inset-0 bg-ink-900/30 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 w-72 max-w-[80%] border-r border-surface-shell shadow-card-hover">
            <AppSidebar onNavigate={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile top bar */}
        <header className="flex items-center gap-3 border-b border-surface-shell bg-surface-card px-4 py-3 lg:hidden">
          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label={mobileOpen ? 'Cerrar menú' : 'Abrir menú'}
            className="flex size-9 items-center justify-center rounded-xl text-ink-700 hover:bg-surface"
          >
            <Menu className="size-5" />
          </button>
          <span className="text-sm font-bold text-ink-900">CST</span>
        </header>

        <main className={cn('flex-1')}>{children}</main>
      </div>
    </div>
  )
}
