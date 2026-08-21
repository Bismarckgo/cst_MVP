import { ComingSoon } from '@/components/coming-soon'
import { Home } from 'lucide-react'

export default function HomePage() {
  return (
    <ComingSoon
      title="Inicio"
      icon={Home}
      description="Aquí verás un resumen de tu actividad reciente y accesos rápidos. Por ahora, tu trabajo vive en el Catálogo."
    />
  )
}
