import { ComingSoon } from '@/components/coming-soon'
import { Rocket } from 'lucide-react'

export default function ReleasesPage() {
  return (
    <ComingSoon
      title="Lanzamiento"
      icon={Rocket}
      description="Prepara y coordina tus lanzamientos. Esta sección llegará en una próxima etapa de CST."
    />
  )
}
