import LayoutAutenticado from '@/components/ui/LayoutAutenticado'
import { useAuth } from '@/contexts/AuthContext'

const funcionalidades = [
  { nome: 'Meus treinos', descricao: 'Veja sua rotina de exercícios' },
  { nome: 'Aulas', descricao: 'Organize seus horários' },
  { nome: 'Minha evolução', descricao: 'Acompanhe seu desempenho' },
  { nome: 'Exercícios', descricao: 'Conheça novos exercícios' },
  { nome: 'Consultas', descricao: 'Apoio dos profissionais' },
]

export default function Inicio() {
  const { usuario } = useAuth()
  const primeiroNome = usuario?.nome?.split(' ')[0] ?? 'usuário'

  return (
    <LayoutAutenticado titulo="Página inicial">
      <section className="mb-8">
        <h2 className="font-heading text-4xl font-bold text-[#142191]">
          Olá, {primeiroNome}!
        </h2>
        <p className="mt-2 text-slate-600">
          Bem-vindo ao seu espaço de saúde e treinamento.
        </p>
      </section>

      <section className="mb-10 rounded-2xl bg-[#004AF7] p-8 text-white md:p-12">
        <p className="text-sm font-semibold uppercase tracking-wide">Academia da Unifor</p>
        <h2 className="mt-4 font-heading text-4xl font-bold md:text-5xl">
          SUA EVOLUÇÃO COMEÇA AQUI
        </h2>
        <p className="mt-4 max-w-xl text-blue-100">
          Organize seus treinos e acompanhe sua jornada de saúde e bem-estar.
        </p>
      </section>

      <section>
        <h2 className="mb-6 font-heading text-3xl font-bold text-[#142191]">
          Explore o UniFit
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {funcionalidades.map((item) => (
            <article key={item.nome} className="rounded-2xl bg-white p-6 shadow-sm">
              <h3 className="font-heading text-xl font-bold text-[#142191]">{item.nome}</h3>
              <p className="mt-2 text-sm text-slate-600">{item.descricao}</p>
              <span className="mt-4 inline-block rounded-full bg-[#E4F2FD] px-3 py-1 text-xs font-semibold text-[#142191]">
                Em breve
              </span>
            </article>
          ))}
        </div>
      </section>
    </LayoutAutenticado>
  )
}