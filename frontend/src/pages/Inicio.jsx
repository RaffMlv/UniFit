import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'

export default function Inicio() {
  const { usuario, logout } = useAuth()
  const primeiroNome = usuario?.nome?.split(' ')[0] ?? 'usuário'
  const funcionalidades = [
    {nome:'Meus treinos', descricao: 'Veja sua rotina de exercicios'},
    {nome:'Aulas', descricao: 'Organize seus horarios'},
    {nome:'Minha evolução', descricao: 'Acompanhe seu desempenho'},
    {nome:'Exercícios', descricao: 'Conheça novos exercícios'},
    {nome:'Consultas', descricao: 'Apoio dos profissionais'}
  ]
  return (
    <div className="min-h-screen bg-[#E4F2FD]">
      <header className="bg-[#142191] px-6 py-5 text-white">
        <div className="mx-auto flex max-w-7x1 itams-center justify-between">
          <h1 className="font-heading text-3x1 font-bold">
            <span className="text-[#87B7FF]">
              UNIFIT
            </span>
          </h1>
          <div className="flex items-center gap-5">
            <span className='hidden text-smsm:inline'>
              {primeiroNome}
            </span>
            <Button variant='outline' onClick={logout}>
              Sair
            </Button>
          </div>
        </div>

      </header>

      <main className="mx-auto max-w-7xl px-6 py-10">
      <section className='mb-8'>
        <h2 className="font-heading text-4xl font-bold text-[#142191]">
        Olá, {primeiroNome}!
      </h2>
      <p className='mt-2 text-gray-600'>
        Bem-vindo ao seu espaço de saúde e treinamento
      </p>
      </section>
      <section className="mb-10 rounded-2xl bg-[#004AF7] p-8 text-white md:p-12">
        <p className="text-sm font-semibold uppercase">
          Academia da Unifor
        </p>
        <h2 className='mt-4 font-heading text-5x1 font-bold'>
          SUA EVOLUÇÃO COMEÇA AQUI
        </h2>
        <p className="mt-4 max-w-xl text-blue-100">
            Organize seus treinos e acompanhe sua jornada
            de saúde e bem-estar.
          </p>
      </section>
      <section>
      <h2 className="mb-6 font-heading text-3xl font-bold text-[#142191]">
            Explore o UniFit
          </h2>
          
      </section>
      </main>
    </div>
    
  )
}
/*<div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-bold">Olá, {primeiroNome}!</h1>
      <p>Seu perfil: <strong>{usuario?.papel ?? 'desconhecido'}</strong></p>
      <Button variant="outline" onClick={logout}>Sair</Button>
    </div>*/