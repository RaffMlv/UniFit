import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'

export default function Inicio() {
  const { usuario, logout } = useAuth()
  const primeiroNome = usuario?.nome?.split(' ')[0] ?? 'usuário'

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-bold">Olá, {primeiroNome}!</h1>
      <p>Seu perfil: <strong>{usuario?.papel ?? 'desconhecido'}</strong></p>
      <Button variant="outline" onClick={logout}>Sair</Button>
    </div>
  )
}