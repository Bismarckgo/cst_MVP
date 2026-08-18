import { WorkDetailView } from '@/components/work-detail/work-detail-view'

export default async function WorkDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return <WorkDetailView id={id} />
}
