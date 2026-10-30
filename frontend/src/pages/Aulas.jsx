import { useState } from 'react'
import {
  CalendarDays,
  Clock3,
  Users,
  UserRound,
  CheckCircle2,
} from 'lucide-react'
import LayoutAutenticado from '@/components/ui/LayoutAutenticado'

function dataLocal(dia = new Date()) {
  const ano = dia.getFullYear()
  const mes = String(dia.getMonth() + 1).padStart(2, '0')
  const data = String(dia.getDate()).padStart(2, '0')
  return `${ano}-${mes}-${data}`
}

function formatarData(data) {
  return new Intl.DateTimeFormat('pt-BR', {
    timeZone: 'UTC',
  }).format(new Date(`${data}T12:00:00Z`))
}

function criarAulas() {
  return []
}

const botaoPrincipal =
  'rounded-lg bg-[#004AF7] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#142191] disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500'

const botaoSecundario =
  'rounded-lg border border-[#87B7FF] px-4 py-3 text-sm font-semibold text-[#142191] transition hover:bg-[#E4F2FD]'

const campoFiltro =
  'mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#004AF7]'

export default function Aulas() {
  const [aulas] = useState(criarAulas)
  const [data, setData] = useState(() => dataLocal())
  const [modalidade, setModalidade] = useState('')
  const [filtros, setFiltros] = useState(() => ({
    data: dataLocal(),
    modalidade: '',
  }))
  const [reservadas, setReservadas] = useState([])
  const [selecionadaId, setSelecionadaId] = useState(null)
  const [mensagem, setMensagem] = useState('')

  const modalidades = [...new Set(aulas.map(aula => aula.modalidade))]

  const filtradas = aulas.filter(aula =>
    (!filtros.data || aula.data === filtros.data) &&
    (!filtros.modalidade || aula.modalidade === filtros.modalidade)
  )

  const minhasAulas = aulas.filter(aula => reservadas.includes(aula.id))
  const selecionada = aulas.find(aula => aula.id === selecionadaId)

  function estaInscrito(aula) {
    return reservadas.includes(aula.id)
  }

  function ocupacao(aula) {
    return aula.ocupadas + (estaInscrito(aula) ? 1 : 0)
  }

  function vagas(aula) {
    return Math.max(0, aula.capacidade - ocupacao(aula))
  }

  function filtrar(evento) {
    evento.preventDefault()
    setFiltros({ data, modalidade })
    setSelecionadaId(null)
    setMensagem('')
  }

  function limpar() {
    setData('')
    setModalidade('')
    setFiltros({ data: '', modalidade: '' })
    setSelecionadaId(null)
    setMensagem('')
  }

  function reservar(aula) {
    if (estaInscrito(aula) || vagas(aula) === 0) return

    const conflito = minhasAulas.some(reserva =>
      reserva.data === aula.data &&
      reserva.inicio < aula.fim &&
      reserva.fim > aula.inicio
    )

    if (conflito) {
      setMensagem('Você já possui uma aula reservada nesse período.')
      return
    }

    setReservadas(atuais =>
      atuais.includes(aula.id) ? atuais : [...atuais, aula.id]
    )
    setMensagem(`Reserva de ${aula.nome} registrada nesta demonstração.`)
  }

  function cancelar(aula) {
    const confirmou = window.confirm(
      `Cancelar a reserva demonstrativa de ${aula.nome}?`
    )

    if (!confirmou) return

    setReservadas(atuais => atuais.filter(id => id !== aula.id))
    setMensagem(`Reserva demonstrativa de ${aula.nome} cancelada.`)
  }

  function botaoReserva(aula) {
    const inscrito = estaInscrito(aula)
    const lotada = vagas(aula) === 0

    return (
      <button
        type="button"
        disabled={inscrito || lotada}
        onClick={() => reservar(aula)}
        className={`${botaoPrincipal} inline-flex items-center justify-center gap-2`}
      >
        {inscrito && <CheckCircle2 size={17} aria-hidden="true" />}
        {inscrito ? 'Inscrito' : lotada ? 'Lotada' : 'Reservar'}
      </button>
    )
  }

  return (
    <LayoutAutenticado titulo="Aulas coletivas">
      <div className="space-y-6 text-[#142191]">
        <header>
          <p className="text-sm font-semibold tracking-wide text-[#004AF7]">
            MOVIMENTE-SE COM O UNIFIT
          </p>
          <h2 className="mt-2 font-heading text-4xl font-bold">
            AULAS COLETIVAS
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Encontre sua próxima aula e acompanhe suas reservas.
          </p>
        </header>

        <section
          aria-labelledby="titulo-filtros"
          className="rounded-2xl bg-white p-6 shadow-sm"
        >
          <h2
            id="titulo-filtros"
            className="font-heading text-2xl font-bold"
          >
            Encontre sua próxima aula
          </h2>

          <form
            onSubmit={filtrar}
            className="mt-5 grid items-end gap-4 sm:grid-cols-2 xl:grid-cols-[1fr_1fr_auto_auto]"
          >
            <div>
              <label htmlFor="data-aula" className="text-sm font-semibold">
                Data
              </label>
              <input
                id="data-aula"
                type="date"
                value={data}
                onChange={evento => setData(evento.target.value)}
                className={campoFiltro}
              />
            </div>

            <div>
              <label htmlFor="modalidade" className="text-sm font-semibold">
                Modalidade
              </label>
              <select
                id="modalidade"
                value={modalidade}
                onChange={evento => setModalidade(evento.target.value)}
                className={campoFiltro}
              >
                <option value="">Todas as modalidades</option>
                {modalidades.map(item => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
            </div>

            <button type="submit" className={botaoPrincipal}>
              Filtrar
            </button>
            <button type="button" onClick={limpar} className={botaoSecundario}>
              Limpar
            </button>
          </form>
        </section>

        <div role="status" aria-live="polite" aria-atomic="true">
          {mensagem && (
            <p className="rounded-xl border border-[#87B7FF] bg-white p-4 text-sm">
              {mensagem}
            </p>
          )}
        </div>

        <section aria-labelledby="titulo-aulas">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <h2 id="titulo-aulas" className="font-heading text-2xl font-bold">
              Aulas disponíveis
            </h2>
            <span className="text-sm text-slate-600">
              {filtradas.length} resultado(s)
            </span>
          </div>

          {filtradas.length === 0 ? (
            <p className="rounded-2xl bg-white p-8 text-center text-slate-600">
              Nenhuma aula encontrada para os filtros selecionados.
            </p>
          ) : (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {filtradas.map(aula => {
                const inscrito = estaInscrito(aula)
                const lotada = vagas(aula) === 0
                const percentual = Math.round(
                  (ocupacao(aula) / aula.capacidade) * 100
                )

                return (
                  <article
                    key={aula.id}
                    className="flex flex-col rounded-2xl border border-slate-100 bg-white p-6 shadow-sm"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="rounded-full bg-[#E4F2FD] px-3 py-1 text-xs font-semibold">
                        {aula.modalidade}
                      </span>
                      <span className={`text-xs font-semibold ${
                        inscrito ? 'text-[#004AF7]' :
                        lotada ? 'text-red-700' : 'text-slate-600'
                      }`}>
                        {inscrito ? 'Você está inscrito' :
                          lotada ? 'Lotada' : `${vagas(aula)} vagas livres`}
                      </span>
                    </div>

                    <h3 className="mt-4 font-heading text-2xl font-bold">
                      {aula.nome}
                    </h3>

                    <div className="mt-4 space-y-3 text-sm text-slate-600">
                      <p className="flex items-center gap-2">
                        <CalendarDays size={17} aria-hidden="true" />
                        {formatarData(aula.data)}
                      </p>
                      <p className="flex items-center gap-2">
                        <Clock3 size={17} aria-hidden="true" />
                        {aula.inicio}–{aula.fim} · {aula.duracao} min
                      </p>
                      <p className="flex items-center gap-2">
                        <UserRound size={17} aria-hidden="true" />
                        {aula.responsavel || 'Responsável a definir'}
                      </p>
                    </div>

                    <div className="my-5">
                      <div className="mb-2 flex justify-between text-xs text-slate-600">
                        <span>Ocupação</span>
                        <span>{ocupacao(aula)}/{aula.capacidade} · {percentual}%</span>
                      </div>
                      <div
                        role="progressbar"
                        aria-label={`Ocupação da aula ${aula.nome}`}
                        aria-valuemin={0}
                        aria-valuemax={aula.capacidade}
                        aria-valuenow={ocupacao(aula)}
                        className="h-2 overflow-hidden rounded-full bg-slate-100"
                      >
                        <div
                          className={`h-full rounded-full transition-all ${
                            lotada ? 'bg-slate-500' : 'bg-[#004AF7]'
                          }`}
                          style={{ width: `${percentual}%` }}
                        />
                      </div>
                    </div>

                    <div className="mt-auto grid gap-2">
                      {botaoReserva(aula)}
                      <button
                        type="button"
                        onClick={() => setSelecionadaId(aula.id)}
                        aria-expanded={selecionadaId === aula.id}
                        aria-controls="detalhes-aula"
                        className={botaoSecundario}
                      >
                        Ver detalhes
                      </button>
                    </div>
                  </article>
                )
              })}
            </div>
          )}
        </section>

        <section id="detalhes-aula" aria-label="Detalhes da aula selecionada">
          {selecionada && (
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-[#004AF7]">
                    DETALHES DA AULA
                  </p>
                  <h2 className="mt-1 font-heading text-3xl font-bold">
                    {selecionada.nome}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setSelecionadaId(null)}
                  className={botaoSecundario}
                >
                  Fechar detalhes
                </button>
              </div>

              <div className="mt-5 space-y-2 text-sm leading-6 text-slate-600">
                <p>
                  {selecionada.modalidade} · {formatarData(selecionada.data)}
                  {' · '}{selecionada.inicio}–{selecionada.fim}
                </p>
                <p>
                  <strong>Responsável:</strong>{' '}
                  {selecionada.responsavel || 'A definir'}
                </p>
                <p><strong>Local:</strong> {selecionada.local}</p>
                <p><strong>Vagas disponíveis:</strong> {vagas(selecionada)}</p>
                <p>{selecionada.descricao}</p>
                <p><strong>Orientações:</strong> {selecionada.orientacoes}</p>
              </div>

              <div className="mt-5">{botaoReserva(selecionada)}</div>
            </div>
          )}
        </section>

        <section
          aria-labelledby="titulo-reservas"
          className="rounded-2xl bg-white p-6 shadow-sm"
        >
          <h2
            id="titulo-reservas"
            className="flex items-center gap-2 font-heading text-2xl font-bold"
          >
            <Users size={23} aria-hidden="true" />
            Minhas aulas reservadas
          </h2>

          {minhasAulas.length === 0 ? (
            <p className="mt-4 text-sm text-slate-600">
              Você ainda não possui aulas reservadas.
            </p>
          ) : (
            <ul className="mt-4 divide-y divide-slate-200">
              {minhasAulas.map(aula => (
                <li
                  key={aula.id}
                  className="flex flex-wrap items-center justify-between gap-4 py-5"
                >
                  <div>
                    <h3 className="font-semibold">{aula.nome}</h3>
                    <p className="mt-1 text-sm text-slate-600">
                      {formatarData(aula.data)} · {aula.inicio}–{aula.fim}
                    </p>
                    <p className="mt-1 text-sm text-slate-600">
                      {aula.responsavel || 'Responsável a definir'} · {aula.local}
                    </p>
                    <p className="mt-2 text-xs font-semibold text-[#004AF7]">
                      Inscrição confirmada na demonstração
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => cancelar(aula)}
                    className="rounded-lg border border-red-200 px-4 py-3 text-sm font-semibold text-red-700 hover:bg-red-50"
                  >
                    Cancelar reserva
                  </button>
                </li>
              ))}
            </ul>
          )}

          <p className="mt-5 border-t border-slate-100 pt-4 text-xs leading-5 text-slate-500">
            O cancelamento das reservas está sujeito às regras do CCS da Unifor.
          </p>
        </section>
      </div>
    </LayoutAutenticado>
  )
}