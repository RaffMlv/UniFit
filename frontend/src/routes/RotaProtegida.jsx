import { Navigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

export default function RotaProtegida({ children, roles }) {
  const { usuario, carregando } = useAuth()

  if (carregando) return <p className="p-6">Carregando...</p>
  if (!usuario) return <Navigate to="/login" replace />
  if (roles && !roles.includes(usuario.papel)) return <Navigate to="/inicio" replace />

  return children
}