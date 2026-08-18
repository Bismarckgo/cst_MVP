'use client'

import { useCallback, useEffect, useState } from 'react'
import { worksRepository, type WorkPatch } from './repository'
import type { NewWorkInput, Work } from './types'

export function useWorks() {
  const [works, setWorks] = useState<Work[] | null>(null)

  const refresh = useCallback(async () => {
    const list = await worksRepository.list()
    setWorks(list)
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const createWork = useCallback(
    async (input: NewWorkInput) => {
      const work = await worksRepository.create(input)
      await refresh()
      return work
    },
    [refresh],
  )

  const updateWork = useCallback(
    async (id: string, patch: WorkPatch) => {
      const updated = await worksRepository.update(id, patch)
      await refresh()
      return updated
    },
    [refresh],
  )

  const deleteWork = useCallback(
    async (id: string) => {
      await worksRepository.remove(id)
      await refresh()
    },
    [refresh],
  )

  const duplicateWork = useCallback(
    async (id: string) => {
      const copy = await worksRepository.duplicate(id)
      await refresh()
      return copy
    },
    [refresh],
  )

  return {
    works,
    loading: works === null,
    refresh,
    createWork,
    updateWork,
    deleteWork,
    duplicateWork,
  }
}

export function useWork(id: string) {
  const [work, setWork] = useState<Work | null | undefined>(undefined)

  const refresh = useCallback(async () => {
    const w = await worksRepository.get(id)
    setWork(w)
  }, [id])

  useEffect(() => {
    let active = true
    worksRepository.get(id).then((w) => {
      if (active) setWork(w)
    })
    return () => {
      active = false
    }
  }, [id])

  const updateWork = useCallback(
    async (patch: WorkPatch) => {
      const updated = await worksRepository.update(id, patch)
      setWork(updated)
      return updated
    },
    [id],
  )

  const deleteWork = useCallback(async () => {
    await worksRepository.remove(id)
  }, [id])

  return { work, loading: work === undefined, refresh, updateWork, deleteWork }
}
