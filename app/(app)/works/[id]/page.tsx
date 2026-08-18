import { WorkDetailView } from '@/components/work-detail/work-detail-view'
import { Suspense } from 'react'

export default async function WorkDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return (
    <Suspense fallback={null}>
      <WorkDetailView id={id} />
    </Suspense>
  )
}
