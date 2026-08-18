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

  return { works, loading: works === null, refresh, createWork }
}

export function useWork(id: string) {
  const [work, setWork] = useState<Work | null | undefined>(undefined)

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

  return { work, loading: work === undefined, updateWork }
}
