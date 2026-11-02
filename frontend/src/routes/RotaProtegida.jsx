import { Navigate } from 'react-router-dom'
import { rotaInicial } from './rotaInicial'
import { useAuth } from '@/contexts/AuthContext'

export default function RotaProtegida({ children, roles, ignorarTriagem = false, monitorCompleto = false }) {
  const { usuario, carregando } = useAuth()

  if (carregando) return <p className="p-6">Carregando...</p>
  if (!usuario) return <Navigate to="/login" replace />
  if (usuario.papel === 'aluno' && !usuario.triagemConcluida && !ignorarTriagem) {
    return <Navigate to="/triagem" replace />
  }
  if (roles && !roles.includes(usuario.papel)) return <Navigate to= {rotaInicial(usuario.papel)}replace />

  if (
    monitorCompleto &&
    usuario.papel === 'monitor' &&
    usuario.tipo_autorizacao !== 'completo'
  ) {
    return <Navigate to={rotaInicial(usuario.papel)} replace />
  }

  return children
}