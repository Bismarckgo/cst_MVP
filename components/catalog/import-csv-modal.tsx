'use client'

import { useWorks } from '@/lib/works/use-works'
import type { ImportCsvRow, ImportPreview, ImportResult } from '@/lib/works/types'
import { cn } from '@/lib/utils'
import { CircleAlert as AlertCircle, ArrowLeft, Check, FileUp, GitMerge, SkipForward, Upload, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useRef, useState } from 'react'

type Phase = 'upload' | 'review' | 'result'

export function ImportCsvModal({ onClose }: { onClose: () => void }) {
  const { importPreview, importExecute } = useWorks()
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [phase, setPhase] = useState<Phase>('upload')
  const [preview, setPreview] = useState<ImportPreview | null>(null)
  const [rows, setRows] = useState<ImportCsvRow[]>([])
  const [result, setResult] = useState<ImportResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [executing, setExecuting] = useState(false)

  async function handleFile(file: File) {
    setError(null)
    try {
      const text = await file.text()
      const parsed = parseCsv(text)
      if (parsed.length === 0) {
        setError('El archivo no contiene filas válidas.')
        return
      }
      const pre = await importPreview(parsed)
      setPreview(pre)
      setRows(pre.rows)
      setPhase('review')
    } catch {
      setError('No se pudo leer el archivo. Verifica que sea CSV válido.')
    }
  }

  function setRowDecision(index: number, decision: 'merge' | 'skip') {
    setRows((prev) =>
      prev.map((r, i) => (i === index ? { ...r, decision } : r)),
    )
  }

  const allConflictsResolved = rows
    .filter((r) => r.classification === 'conflict')
    .every((r) => r.decision === 'merge' || r.decision === 'skip')

  async function handleExecute() {
    if (!allConflictsResolved || executing) return
    setExecuting(true)
    try {
      const res = await importExecute(rows)
      setResult(res)
      setPhase('result')
    } catch {
      setError('Error durante la importación.')
    }
    setExecuting(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink-900/30 backdrop-blur-sm" onClick={onClose} aria-hidden />
      <div className="relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-surface-card shadow-card-hover">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-surface-shell px-5 py-4">
          <div className="flex items-center gap-2">
            {phase === 'review' && (
              <button
                type="button"
                onClick={() => setPhase('upload')}
                className="flex size-7 items-center justify-center rounded-lg text-ink-500 hover:bg-surface"
              >
                <ArrowLeft className="size-4" />
              </button>
            )}
            <h2 className="text-lg font-bold text-ink-900">
              {phase === 'upload' && 'Importar catálogo CSV'}
              {phase === 'review' && 'Revisar importación'}
              {phase === 'result' && 'Importación completa'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="flex size-8 items-center justify-center rounded-lg text-ink-500 transition-colors hover:bg-surface hover:text-ink-700"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 py-5">
          {phase === 'upload' && (
            <div>
              <p className="text-sm text-ink-500">
                Sube un archivo CSV con columnas: <span className="font-semibold text-ink-700">title, artist, iswc, isrc, writers</span>.
                CST no escribirá nada hasta que revises y confirmes.
              </p>
              <div
                onClick={() => fileInputRef.current?.click()}
                className="mt-6 flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-surface-shell bg-surface px-6 py-12 text-center transition-colors hover:border-brand hover:bg-brand-light"
              >
                <FileUp className="size-8 text-ink-300" />
                <p className="mt-3 text-sm font-semibold text-ink-700">
                  Haz clic para seleccionar un CSV
                </p>
                <p className="mt-1 text-xs text-ink-300">
                  o arrastra el archivo aquí
                </p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,text/csv"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) void handleFile(file)
                }}
              />
              {error && (
                <p className="mt-4 text-sm font-medium text-pink">{error}</p>
              )}
            </div>
          )}

          {phase === 'review' && preview && (
            <div>
              {/* Summary */}
              <div className="flex gap-4 rounded-xl bg-surface px-4 py-3">
                <SummaryItem label="Nuevas" count={preview.newCount} color="text-teal" />
                <SummaryItem label="Conflictos" count={preview.conflictCount} color="text-orange" />
                <SummaryItem label="Inválidas" count={preview.invalidCount} color="text-pink" />
              </div>

              {/* Rows */}
              <div className="mt-4 space-y-2">
                {rows.map((row, i) => (
                  <div
                    key={i}
                    className={cn(
                      'rounded-xl border px-4 py-3',
                      row.classification === 'new' && 'border-surface-shell bg-surface-card',
                      row.classification === 'conflict' && 'border-orange/30 bg-orange-light/30',
                      row.classification === 'invalid' && 'border-pink/30 bg-pink-light/30',
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="truncate text-sm font-semibold text-ink-900">
                            {row.title || 'Sin título'}
                          </p>
                          <ClassBadge classification={row.classification} />
                        </div>
                        <p className="mt-0.5 truncate text-xs text-ink-500">
                          {row.artist || 'Sin artista'}
                          {row.isrc && ` · ISRC: ${row.isrc}`}
                          {row.iswc && ` · ISWC: ${row.iswc}`}
                        </p>
                        {row.classification === 'invalid' && row.invalidReason && (
                          <p className="mt-1 text-xs font-medium text-pink">
                            {row.invalidReason}
                          </p>
                        )}
                        {row.classification === 'conflict' && row.existingTitle && (
                          <div className="mt-2 rounded-lg bg-surface-card px-3 py-2 text-xs">
                            <p className="font-semibold text-ink-700">Existente:</p>
                            <p className="text-ink-500">
                              {row.existingTitle} — {row.existingArtist}
                            </p>
                          </div>
                        )}
                      </div>
                      {row.classification === 'conflict' && (
                        <div className="flex shrink-0 gap-1.5">
                          <button
                            type="button"
                            onClick={() => setRowDecision(i, 'merge')}
                            className={cn(
                              'inline-flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition-colors',
                              row.decision === 'merge'
                                ? 'border-brand bg-brand text-white'
                                : 'border-surface-shell text-ink-500 hover:text-ink-700',
                            )}
                          >
                            <GitMerge className="size-3" />
                            Merge
                          </button>
                          <button
                            type="button"
                            onClick={() => setRowDecision(i, 'skip')}
                            className={cn(
                              'inline-flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition-colors',
                              row.decision === 'skip'
                                ? 'border-ink-500 bg-ink-500 text-white'
                                : 'border-surface-shell text-ink-500 hover:text-ink-700',
                            )}
                          >
                            <SkipForward className="size-3" />
                            Skip
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {preview.conflictCount > 0 && !allConflictsResolved && (
                <p className="mt-3 text-sm font-medium text-orange">
                  Resuelve todos los conflictos antes de importar.
                </p>
              )}
            </div>
          )}

          {phase === 'result' && result && (
            <div>
              <div className="flex flex-col items-center text-center">
                <span className="flex size-14 items-center justify-center rounded-2xl bg-teal-light text-teal">
                  <Check className="size-7" strokeWidth={3} />
                </span>
                <h3 className="mt-4 text-lg font-bold text-ink-900">
                  Importación completa
                </h3>
              </div>

              <div className="mt-6 space-y-3">
                {result.created.length > 0 && (
                  <ResultGroup label="Created" items={result.created.map((c) => c.title)} color="text-teal" />
                )}
                {result.merged.length > 0 && (
                  <ResultGroup label="Merged" items={result.merged.map((m) => m.title)} color="text-brand" />
                )}
                {result.skipped.length > 0 && (
                  <ResultGroup label="Skipped" items={result.skipped.map((s) => s.title)} color="text-ink-500" />
                )}
                {result.invalid.length > 0 && (
                  <ResultGroup
                    label="Invalid"
                    items={result.invalid.map((i) => `${i.title} (${i.reason})`)}
                    color="text-pink"
                  />
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-surface-shell px-5 py-4">
          {phase === 'upload' && (
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-surface-shell px-4 py-2.5 text-sm font-semibold text-ink-700 transition-colors hover:bg-surface"
            >
              Cancelar
            </button>
          )}
          {phase === 'review' && (
            <>
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-surface-shell px-4 py-2.5 text-sm font-semibold text-ink-700 transition-colors hover:bg-surface"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleExecute}
                disabled={!allConflictsResolved || executing}
                className="inline-flex items-center gap-2 rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-40"
              >
                {executing ? 'Importando...' : `Importar ${preview?.newCount ?? 0} nuevas, ${rows.filter((r) => r.decision === 'merge').length} merge`}
              </button>
            </>
          )}
          {phase === 'result' && (
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
            >
              Hecho
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function SummaryItem({ label, count, color }: { label: string; count: number; color: string }) {
  return (
    <div className="flex flex-col">
      <span className={cn('text-xl font-bold', color)}>{count}</span>
      <span className="text-xs font-medium text-ink-500">{label}</span>
    </div>
  )
}

function ClassBadge({ classification }: { classification: string }) {
  const config: Record<string, { label: string; className: string }> = {
    new: { label: 'New', className: 'bg-teal-light text-teal' },
    conflict: { label: 'Conflict', className: 'bg-orange-light text-orange' },
    invalid: { label: 'Invalid', className: 'bg-pink-light text-pink' },
  }
  const c = config[classification] ?? config.invalid
  return (
    <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-semibold', c.className)}>
      {c.label}
    </span>
  )
}

function ResultGroup({ label, items, color }: { label: string; items: string[]; color: string }) {
  return (
    <div>
      <p className={cn('text-xs font-semibold tracking-wider uppercase', color)}>
        {label} ({items.length})
      </p>
      <ul className="mt-1 space-y-1">
        {items.map((item, i) => (
          <li key={i} className="text-sm text-ink-700">
            → {item}
          </li>
        ))}
      </ul>
    </div>
  )
}

// ---- CSV parser ----

function parseCsv(text: string): { rowIndex: number; title: string; artist: string; iswc?: string; isrc?: string; writers?: string }[] {
  const lines = text.trim().split(/\r?\n/)
  if (lines.length < 2) return []

  // Parse header
  const headers = splitCsvLine(lines[0]).map((h) => h.trim().toLowerCase())

  // Map headers to known fields
  const titleIdx = headers.findIndex((h) => h === 'title' || h === 'titulo' || h === 'título')
  const artistIdx = headers.findIndex((h) => h === 'artist' || h === 'artista')
  const iswcIdx = headers.findIndex((h) => h === 'iswc')
  const isrcIdx = headers.findIndex((h) => h === 'isrc')
  const writersIdx = headers.findIndex((h) => h === 'writers' || h === 'compositores')

  const rows: { rowIndex: number; title: string; artist: string; iswc?: string; isrc?: string; writers?: string }[] = []

  for (let i = 1; i < lines.length; i++) {
    const cells = splitCsvLine(lines[i])
    const title = titleIdx >= 0 ? (cells[titleIdx] ?? '').trim() : ''
    const artist = artistIdx >= 0 ? (cells[artistIdx] ?? '').trim() : ''
    if (!title && !artist) continue
    rows.push({
      rowIndex: i,
      title,
      artist,
      iswc: iswcIdx >= 0 ? (cells[iswcIdx] ?? '').trim() || undefined : undefined,
      isrc: isrcIdx >= 0 ? (cells[isrcIdx] ?? '').trim() || undefined : undefined,
      writers: writersIdx >= 0 ? (cells[writersIdx] ?? '').trim() || undefined : undefined,
    })
  }

  return rows
}

function splitCsvLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current)
      current = ''
    } else {
      current += char
    }
  }
  result.push(current)
  return result
}
