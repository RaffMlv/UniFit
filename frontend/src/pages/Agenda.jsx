import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Plus,
} from 'lucide-react'
import LayoutAutenticado from '@/components/ui/LayoutAutenticado'

const categorias = {
  treino: { nome: 'Treinos', cor: 'bg-blue-500', fundo: 'bg-blue-50 text-blue-900' },
  aula: { nome: 'Aulas', cor: 'bg-emerald-500', fundo: 'bg-emerald-50 text-emerald-900' },
  avaliacao: { nome: 'Avaliações', cor: 'bg-amber-500', fundo: 'bg-amber-50 text-amber-900' },
  consulta: { nome: 'Consultas', cor: 'bg-violet-500', fundo: 'bg-violet-50 text-violet-900' },
  cancelado: { nome: 'Cancelados', cor: 'bg-rose-500', fundo: 'bg-rose-50 text-rose-900' },
}

const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
const horas = Array.from({ length: 16 }, (_, indice) => indice + 6)

function chaveData(data) {
  return [
    data.getFullYear(),
    String(data.getMonth() + 1).padStart(2, '0'),
    String(data.getDate()).padStart(2, '0'),
  ].join('-')
}

function adicionarDias(data, quantidade) {
  const nova = new Date(data)
  nova.setDate(nova.getDate() + quantidade)
  return nova
}

function inicioSemana(data) {
  return adicionarDias(data, -data.getDay())
}

function formatarDia(data) {
  return data.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
  })
}

function estiloEvento(evento) {
  const categoria = evento.status === 'cancelado'
    ? 'cancelado'
    : evento.categoria

  return categorias[categoria] || {
    nome: 'Outro',
    cor: 'bg-slate-500',
    fundo: 'bg-slate-100 text-slate-800',
  }
}

const botao =
  'inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-[#87B7FF] px-4 py-2 text-sm font-semibold text-[#142191] hover:bg-[#E4F2FD] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#004AF7]'

export default function Agenda() {
  const [visao, setVisao] = useState('semanal')
  const [referencia, setReferencia] = useState(() => new Date())
  const [selecionadoId, setSelecionadoId] = useState(null)


  
  const [eventos] = useState([])

  const hoje = chaveData(new Date())
  const primeiroDia = inicioSemana(referencia)
  const diasDaSemana = Array.from(
    { length: 7 },
    (_, indice) => adicionarDias(primeiroDia, indice)
  )

  const primeiroDoMes = new Date(
    referencia.getFullYear(),
    referencia.getMonth(),
    1
  )
  const inicioGrade = inicioSemana(primeiroDoMes)
  const diasDoMes = Array.from(
    { length: 42 },
    (_, indice) => adicionarDias(inicioGrade, indice)
  )

  const selecionado = eventos.find(evento => evento.id === selecionadoId)

  const tituloPeriodo = visao === 'mensal'
    ? referencia.toLocaleDateString('pt-BR', {
        month: 'long',
        year: 'numeric',
      })
    : `${formatarDia(diasDaSemana[0])}/${diasDaSemana[0].getFullYear()} — ${
        formatarDia(diasDaSemana[6])
      }/${diasDaSemana[6].getFullYear()}`

  const eventosNoPeriodo = eventos.filter(evento =>
    visao === 'semanal'
      ? evento.data >= chaveData(diasDaSemana[0]) &&
        evento.data <= chaveData(diasDaSemana[6])
      : evento.data.startsWith(chaveData(primeiroDoMes).slice(0, 7))
  )

  function mudarPeriodo(direcao) {
    setReferencia(atual =>
      visao === 'semanal'
        ? adicionarDias(atual, direcao * 7)
        : new Date(atual.getFullYear(), atual.getMonth() + direcao, 1)
    )
    setSelecionadoId(null)
  }

  function mudarVisao(novaVisao) {
    setVisao(novaVisao)
    setSelecionadoId(null)
  }

  function eventosDoDia(dia) {
    return eventos
      .filter(evento => evento.data === chaveData(dia))
      .sort((a, b) => a.inicio.localeCompare(b.inicio))
  }

  function renderizarEvento(evento) {
    const estilo = estiloEvento(evento)

    return (
      <button
        key={evento.id}
        type="button"
        onClick={() => setSelecionadoId(evento.id)}
        aria-pressed={selecionadoId === evento.id}
        aria-controls="detalhes-agenda"
        className={`block w-full rounded-md border-l-4 border-current p-2 text-left text-xs leading-5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#004AF7] ${
          estilo.fundo
        } ${selecionadoId === evento.id ? 'ring-2 ring-[#004AF7]' : ''}`}
      >
        <span className="block font-bold">{evento.titulo}</span>
        <span>{evento.inicio}–{evento.fim}</span>
        {evento.status === 'cancelado' && (
          <span className="block font-semibold">Cancelado</span>
        )}
      </button>
    )
  }

  return (
    <LayoutAutenticado titulo="Agenda">
      <div className="space-y-6 text-[#142191]">
        <header>
          <p className="text-sm font-semibold tracking-wide text-[#004AF7]">
            SUA ROTINA NO UNIFIT
          </p>
          <h2 className="mt-2 font-heading text-4xl font-bold">
            MINHA AGENDA
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Acompanhe seus treinos, aulas, avaliações e consultas.
          </p>
        </header>

        <section
          aria-label="Controles da agenda"
          className="rounded-2xl bg-white p-5 shadow-sm sm:p-6"
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div
              role="group"
              aria-label="Visualização da agenda"
              className="flex rounded-xl bg-[#E4F2FD] p-1"
            >
              {['mensal', 'semanal'].map(item => (
                <button
                  key={item}
                  type="button"
                  aria-pressed={visao === item}
                  onClick={() => mudarVisao(item)}
                  className={`min-h-10 rounded-lg px-4 text-sm font-semibold capitalize ${
                    visao === item
                      ? 'bg-[#004AF7] text-white shadow-sm'
                      : 'text-[#142191] hover:bg-white'
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>

            <Link
              to="/agendamentos"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#004AF7] px-4 py-2 text-sm font-semibold text-white hover:bg-[#142191]"
            >
              <Plus size={18} aria-hidden="true" />
              Novo agendamento
            </Link>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-slate-100 pt-5">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => mudarPeriodo(-1)}
                aria-label={visao === 'mensal' ? 'Mês anterior' : 'Semana anterior'}
                className={botao}
              >
                <ChevronLeft size={18} aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => mudarPeriodo(1)}
                aria-label={visao === 'mensal' ? 'Próximo mês' : 'Próxima semana'}
                className={botao}
              >
                <ChevronRight size={18} aria-hidden="true" />
              </button>
            </div>

            <h3
              aria-live="polite"
              className="flex-1 text-base font-bold capitalize"
            >
              {tituloPeriodo}
            </h3>

            <button
              type="button"
              onClick={() => {
                setReferencia(new Date())
                setSelecionadoId(null)
              }}
              className={botao}
            >
              Hoje
            </button>
          </div>

          <ul
            aria-label="Legenda de categorias"
            className="mt-5 flex flex-wrap gap-x-5 gap-y-3"
          >
            {Object.entries(categorias).map(([chave, categoria]) => (
              <li
                key={chave}
                className="flex items-center gap-2 text-xs text-slate-600"
              >
                <span
                  aria-hidden="true"
                  className={`h-3 w-3 rounded-sm ${categoria.cor}`}
                />
                {categoria.nome}
              </li>
            ))}
          </ul>
        </section>

        <section
          aria-label={`Calendário ${visao}`}
          className="overflow-hidden rounded-2xl bg-white shadow-sm"
        >
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 p-5">
            <h2 className="flex items-center gap-2 font-heading text-2xl font-bold">
              <CalendarDays size={22} aria-hidden="true" />
              {visao === 'semanal' ? 'Agenda da semana' : 'Agenda do mês'}
            </h2>
            <span className="text-sm text-slate-500">
              {eventosNoPeriodo.length} compromisso(s)
            </span>
          </div>

          <div
            className="overflow-x-auto"
            tabIndex={0}
            role="region"
            aria-label="Grade da agenda, com rolagem horizontal em telas pequenas"
          >
            {visao === 'semanal' ? (
              <table className="w-full min-w-[800px] table-fixed border-collapse">
                <thead>
                  <tr className="bg-slate-50">
                    <th scope="col" className="w-20 p-3 text-xs text-slate-500">
                      Horário
                    </th>
                    {diasDaSemana.map(dia => (
                      <th
                        key={chaveData(dia)}
                        scope="col"
                        className={`border-l border-slate-100 p-3 text-center ${
                          chaveData(dia) === hoje ? 'bg-[#E4F2FD]' : ''
                        }`}
                      >
                        <span className="block text-xs font-medium text-slate-500">
                          {diasSemana[dia.getDay()]}
                        </span>
                        <span className="mt-1 block text-sm font-bold">
                          {formatarDia(dia)}
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {horas.map(hora => (
                    <tr key={hora}>
                      <th
                        scope="row"
                        className="border-t border-slate-100 p-3 align-top text-xs font-medium text-slate-500"
                      >
                        {String(hora).padStart(2, '0')}:00
                      </th>
                      {diasDaSemana.map(dia => (
                        <td
                          key={chaveData(dia)}
                          className={`h-20 border-l border-t border-slate-100 p-1.5 align-top ${
                            chaveData(dia) === hoje ? 'bg-blue-50/40' : ''
                          }`}
                        >
                          <div className="space-y-1">
                            {eventosDoDia(dia)
                              .filter(evento =>
                                Number(evento.inicio.split(':')[0]) === hora
                              )
                              .map(renderizarEvento)}
                          </div>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <table className="w-full min-w-[750px] table-fixed border-collapse">
                <thead>
                  <tr className="bg-slate-50">
                    {diasSemana.map(dia => (
                      <th key={dia} scope="col" className="p-3 text-xs text-slate-500">
                        {dia}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: 6 }, (_, semana) => (
                    <tr key={semana}>
                      {diasDoMes.slice(semana * 7, semana * 7 + 7).map(dia => (
                        <td
                          key={chaveData(dia)}
                          className={`h-32 border border-slate-100 p-2 align-top ${
                            dia.getMonth() !== referencia.getMonth()
                              ? 'bg-slate-50 text-slate-400'
                              : ''
                          }`}
                        >
                          <span
                            className={`mb-2 inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${
                              chaveData(dia) === hoje
                                ? 'bg-[#004AF7] text-white'
                                : ''
                            }`}
                          >
                            {dia.getDate()}
                          </span>
                          <div className="space-y-1">
                            {eventosDoDia(dia).map(renderizarEvento)}
                          </div>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {eventosNoPeriodo.length === 0 && (
            <p className="border-t border-slate-100 p-5 text-center text-sm text-slate-500">
              Nenhum compromisso para exibir neste período.
            </p>
          )}
        </section>

        <section
          id="detalhes-agenda"
          aria-labelledby="titulo-detalhes"
          className="rounded-2xl bg-white p-6 shadow-sm"
        >
          <h2
            id="titulo-detalhes"
            className="font-heading text-2xl font-bold"
          >
            Detalhes do compromisso
          </h2>

          {!selecionado ? (
            <p className="mt-3 text-sm leading-6 text-slate-500">
              Selecione um compromisso no calendário para consultar suas informações.
            </p>
          ) : (
            <div className="mt-5">
              <h3 className="font-heading text-xl font-bold">
                {selecionado.titulo}
              </h3>

              <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
                {[
                  ['Categoria', categorias[selecionado.categoria]?.nome || 'Outro'],
                  ['Data', selecionado.data.split('-').reverse().join('/')],
                  ['Horário', `${selecionado.inicio}–${selecionado.fim}`],
                  ['Responsável', selecionado.responsavel || 'A definir'],
                  ['Local', selecionado.local || 'A definir'],
                  ['Situação', selecionado.status || 'Não informada'],
                ].map(([rotulo, valor]) => (
                  <div key={rotulo}>
                    <dt className="text-xs text-slate-500">{rotulo}</dt>
                    <dd className="mt-1 font-semibold">{valor}</dd>
                  </div>
                ))}
              </dl>

              {selecionado.descricao && (
                <p className="mt-4 text-sm leading-6 text-slate-600">
                  {selecionado.descricao}
                </p>
              )}

              <div className="mt-6 flex flex-wrap gap-3">
                {  }
                <button
                  type="button"
                  disabled
                  className="rounded-lg border border-red-200 px-4 py-3 text-sm font-semibold text-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancelar agendamento
                </button>
                <button
                  type="button"
                  disabled
                  className={`${botao} disabled:cursor-not-allowed disabled:opacity-50`}
                >
                  Ver detalhes do agendamento
                </button>
              </div>
            </div>
          )}
        </section>
      </div>
    </LayoutAutenticado>
  )
}