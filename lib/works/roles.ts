// ----------------------------------------------------------------------------
// CST · Participant roles
//
// A person's role determines what kind of contributor they are and which
// splits apply. Only authorship roles (`composition: true`) share the
// composition; a producer or performing artist is credited on the work but is
// not part of the composition split.
// ----------------------------------------------------------------------------

import type { ParticipantRole } from './types'

export interface RoleDef {
  id: ParticipantRole
  label: string
  hint: string
  /** Whether this role earns a slice of the composition split. */
  composition: boolean
}

export const ROLES: RoleDef[] = [
  {
    id: 'compositor',
    label: 'Compositor',
    hint: 'Escribió la música',
    composition: true,
  },
  {
    id: 'letrista',
    label: 'Letrista',
    hint: 'Escribió la letra',
    composition: true,
  },
  {
    id: 'productor',
    label: 'Productor',
    hint: 'Produjo la grabación',
    composition: false,
  },
  {
    id: 'artista',
    label: 'Artista',
    hint: 'Interpreta la obra',
    composition: false,
  },
]

const ROLE_MAP = Object.fromEntries(ROLES.map((r) => [r.id, r])) as Record<
  ParticipantRole,
  RoleDef
>

export function roleLabel(id: ParticipantRole): string {
  return ROLE_MAP[id]?.label ?? id
}

export function contributesToComposition(id: ParticipantRole): boolean {
  return ROLE_MAP[id]?.composition ?? false
}
