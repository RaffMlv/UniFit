import {
  Activity,
  CalendarDays,
  ClipboardCheck,
  ClipboardList,
  Clock,
  CreditCard,
  Dumbbell,
  Home,
  Library,
  Settings,
  Stethoscope,
  TriangleAlert,
  User,
  Users,
  Wrench,
} from 'lucide-react'
import LayoutAutenticado from '@/components/ui/LayoutAutenticado'

// As páginas administrativas serão conectadas posteriormente.
const menuAdmin = [
  { nome: 'Página inicial', icone: Home, rota: '/inicio-admin' },
  { nome: 'Treinos', icone: Dumbbell, rota: null },
  { nome: 'Alunos', icone: Users, rota: null },
  { nome: 'Biblioteca de exercícios', icone: Library, rota: null },
  { nome: 'Agenda', icone: CalendarDays, rota: null },
  { nome: 'Exercícios', icone: Activity, rota: null },
  { nome: 'Equipamentos', icone: Wrench, rota: null },
  { nome: 'Aulas', icone: Users, rota: null },
  { nome: 'Atendimentos', icone: Stethoscope, rota: null },
  { nome: 'Finanças', icone: CreditCard, rota: null },
  { nome: 'Perfil', icone: User, rota: null },
  { nome: 'Configurações', icone: Settings, rota: null },
]

// Dados fictícios usados apenas para apresentar o visual.
const indicadores = [
  { titulo: 'Alunos ativos', valor: '450', icone: Users },
  { titulo: 'Aguardando ficha', valor: '5', icone: ClipboardList },
  { titulo: 'Ocupação atual', valor: '65%', icone: Activity },
  { titulo: 'Atendimentos do dia', valor: '12', icone: Clock },
  { titulo: 'Fichas a aprovar', valor: '7', icone: ClipboardCheck },
]

const atividades = [
  { texto: 'Monitor João criou um treino', icone: Dumbbell },
  { texto: 'Novo cadastro efetuado', icone: User },
]

const pendencias = [
  '3 cadastros pendentes',
  'Manutenção de equipamento',
  '7 fichas para aprovação',
]

export default function InicioAdmin() {
  return (
    <LayoutAutenticado
      titulo="Dashboard do Administrador"
      menu={menuAdmin}
    >
      <section className="mb-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-heading text-3xl font-bold text-[#142191] sm:text-4xl">
            Visão geral
          </h2>

          <span className="rounded-full border border-blue-200 bg-white px-3 py-1 text-xs font-semibold text-[#142191]">
            Dados de demonstração
          </span>
        </div>

        <p className="mt-2 text-slate-600">
          Acompanhe os principais indicadores e as pendências da academia.
        </p>
      </section>

      <section aria-label="Indicadores da academia">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-6">
          {indicadores.map(({ titulo, valor, icone: Icone }, indice) => (
            <article
              key={titulo}
              className={`rounded-2xl border border-slate-100 bg-white p-6 shadow-sm lg:col-span-2 ${
                indice === 3 ? 'lg:col-start-2' : ''
              }`}
            >
              <div className="mb-5 flex items-center gap-3">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#E4F2FD] text-[#004AF7]">
                  <Icone size={24} aria-hidden="true" />
                </span>

                <h3 className="font-heading text-xl font-bold text-[#142191]">
                  {titulo}
                </h3>
              </div>

              <p className="text-center text-4xl font-bold tracking-tight text-[#142191]">
                {valor}
              </p>

              {titulo === 'Ocupação atual' && (
                <div
                  aria-hidden="true"
                  className="mt-4 h-2 overflow-hidden rounded-full bg-[#E4F2FD]"
                >
                  <div className="h-full w-[65%] rounded-full bg-[#004AF7]" />
                </div>
              )}
            </article>
          ))}
        </div>
      </section>

      <div className="my-8 border-t border-blue-200/70" />

      <div className="grid gap-6 lg:grid-cols-2">
        <section
          aria-labelledby="titulo-atividades"
          className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm"
        >
          <h2
            id="titulo-atividades"
            className="font-heading text-2xl font-bold text-[#142191]"
          >
            Atividades recentes
          </h2>

          <ul className="mt-5 divide-y divide-slate-100">
            {atividades.map(({ texto, icone: Icone }) => (
              <li
                key={texto}
                className="flex items-center gap-3 py-4 first:pt-0 last:pb-0"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#E4F2FD] text-[#004AF7]">
                  <Icone size={19} aria-hidden="true" />
                </span>

                <p className="text-sm leading-6 text-slate-700">
                  {texto}
                </p>
              </li>
            ))}
          </ul>
        </section>

        <section
          aria-labelledby="titulo-pendencias"
          className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm"
        >
          <h2
            id="titulo-pendencias"
            className="font-heading text-2xl font-bold text-[#142191]"
          >
            Pendências administrativas
          </h2>

          <ul className="mt-5 space-y-3">
            {pendencias.map((texto) => (
              <li
                key={texto}
                className="flex items-center gap-3 rounded-xl bg-amber-50 px-4 py-3"
              >
                <TriangleAlert
                  size={20}
                  aria-hidden="true"
                  className="shrink-0 text-amber-700"
                />

                <p className="text-sm leading-6 text-slate-700">
                  {texto}
                </p>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </LayoutAutenticado>
  )
}