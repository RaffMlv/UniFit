import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  CalendarDays,
  Clock3,
  UserRoundCheck,
  CheckCircle2,
  Info,
  X
} from 'lucide-react'

import LayoutAutenticado from '@/components/ui/LayoutAutenticado'
import { api } from '@/services/api'

const servicos = [
  { nome: 'Educação Física', valor: 'educacao_fisica' },
  { nome: 'Fisioterapia', valor: 'fisioterapia' },
  { nome: 'Nutrição', valor: 'nutricao' }
]

function dataLocalHoje() {
  const d = new Date()
  const ano = d.getFullYear()
  const mes = String(d.getMonth() + 1).padStart(2, '0')
  const dia = String(d.getDate()).padStart(2, '0')

  return `${ano}-${mes}-${dia}`
}

function diaBR(data) {
  if (!data) return ''

  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'full',
    timeZone: 'UTC'
  }).format(new Date(`${data}T12:00:00Z`))
}

export default function Agendamento() {
  const [categoria, setCategoria] = useState('nutricao')
  const [data, setData] = useState('')
  const [horario, setHorario] = useState('')

  const [confirmando, setConfirmando] = useState(false)
  const [sucesso, setSucesso] = useState(false)

  const [reservas, setReservas] = useState([])
  const [horarios, setHorarios] = useState([])

  const [carregandoHorarios, setCarregandoHorarios] = useState(false)
  const [carregandoReservas, setCarregandoReservas] = useState(true)

  const [erro, setErro] = useState('')

  const hoje = useMemo(dataLocalHoje, [])

  // Carrega os agendamentos do aluno
  const carregarReservas = useCallback(async () => {
    try {
      setCarregandoReservas(true)

      const resposta = await api('/agendamentos/meus')

      setReservas(
        Array.isArray(resposta)
          ? resposta
          : resposta.agendamentos || []
      )
    } catch (error) {
      setErro(error.message)
    } finally {
      setCarregandoReservas(false)
    }
  }, [])

  // Carrega os horários disponíveis conforme data e serviço
  const carregarHorarios = useCallback(async () => {
    if (!data) {
      setHorarios([])
      return
    }

    try {
      setCarregandoHorarios(true)
      setErro('')
      setHorario('')

      const resposta = await api(
        `/agendamentos/horarios?data=${data}&especialidade=${categoria}`
      )

      setHorarios(
        Array.isArray(resposta)
          ? resposta
          : resposta.horarios || []
      )
    } catch (error) {
      setHorarios([])
      setErro(error.message)
    } finally {
      setCarregandoHorarios(false)
    }
  }, [data, categoria])

  // Carrega os agendamentos quando a página abre
  useEffect(() => {
    carregarReservas()
  }, [carregarReservas])

  // Atualiza os horários quando data ou serviço mudam
  useEffect(() => {
    carregarHorarios()
  }, [carregarHorarios])

  // Prepara a confirmação
  function preparar() {
    setErro('')

    if (!data || !horario) {
      return setErro(
        'Escolha uma data e um horário para continuar.'
      )
    }

    if (data < hoje) {
      return setErro(
        'Escolha uma data atual ou futura.'
      )
    }

    setConfirmando(true)
  }

  // Registra o agendamento no backend
  async function confirmar() {
    try {
      setErro('')

      await api('/agendamentos', {
        method: 'POST',
        body: {
          data,
          hora_inicio: horario,
          especialidade: categoria
        }
      })

      setConfirmando(false)
      setSucesso(true)
      setHorario('')

      await carregarReservas()
      await carregarHorarios()
    } catch (error) {
      setConfirmando(false)
      setErro(error.message)
    }
  }

  // Cancela um agendamento
  async function cancelar(id) {
    try {
      setErro('')

      await api(`/agendamentos/${id}`, {
        method: 'DELETE'
      })

      await carregarReservas()
      await carregarHorarios()
    } catch (error) {
      setErro(error.message)
    }
  }

  return (
    <LayoutAutenticado titulo="Agendamentos">
      <div className="space-y-6 text-[#142191]">

        {/* Cabeçalho */}
        <div>
          <p className="text-sm font-semibold text-[#004AF7]">
            SERVIÇOS UNIFIT
          </p>

          <h2 className="mt-1 font-heading text-4xl font-bold">
            AGENDAMENTO DE ATENDIMENTO
          </h2>

          <p className="mt-2 text-sm text-slate-600">
            Escolha o serviço, a data e um horário para solicitar seu atendimento.
          </p>
        </div>

        {/* Aviso */}
        <div className="rounded-xl border border-[#87B7FF] bg-white p-4 text-sm text-slate-600">
          <Info className="mr-2 inline text-[#004AF7]" size={17} />
          Os horários exibidos são consultados diretamente na disponibilidade do profissional.
        </div>

        {/* Mensagem de sucesso */}
        {sucesso && (
          <div
            role="status"
            className="flex items-start gap-3 rounded-xl border border-[#87B7FF] bg-white p-4"
          >
            <CheckCircle2 className="shrink-0 text-[#004AF7]" />

            <div>
              <strong>
                Agendamento registrado com sucesso!
              </strong>

              <p className="text-sm text-slate-600">
                Seu atendimento foi registrado no sistema.
              </p>
            </div>

            <button
              type="button"
              className="ml-auto"
              aria-label="Fechar aviso"
              onClick={() => setSucesso(false)}
            >
              <X size={18} />
            </button>
          </div>
        )}

        {/* Formulário de agendamento */}
        <section className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">

          <div className="space-y-6">

            {/* Seleção do serviço */}
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <h2 className="mb-4 flex items-center gap-2 font-heading text-2xl font-bold">
                <UserRoundCheck className="text-[#004AF7]" />
                1. SELECIONE O SERVIÇO
              </h2>

              <div className="grid gap-3 sm:grid-cols-3">
                {servicos.map(s => (
                  <button
                    key={s.valor}
                    type="button"
                    aria-pressed={s.valor === categoria}
                    onClick={() => {
                      setCategoria(s.valor)
                      setHorario('')
                      setErro('')
                    }}
                    className={`min-h-16 rounded-xl border p-3 text-sm font-semibold transition ${
                      s.valor === categoria
                        ? 'border-[#004AF7] bg-[#E4F2FD] text-[#142191] ring-2 ring-[#87B7FF]'
                        : 'border-slate-200 bg-white hover:border-[#004AF7]'
                    }`}
                  >
                    {s.nome}
                  </button>
                ))}
              </div>
            </div>

            {/* Seleção da data */}
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <h2 className="mb-4 flex items-center gap-2 font-heading text-2xl font-bold">
                <CalendarDays className="text-[#004AF7]" />
                2. ESCOLHA A DATA
              </h2>

              <label
                className="block text-sm font-semibold"
                htmlFor="dataAtendimento"
              >
                Data do atendimento
              </label>

              <input
                id="dataAtendimento"
                type="date"
                min={hoje}
                value={data}
                onChange={e => {
                  setData(e.target.value)
                  setHorario('')
                  setErro('')
                  setSucesso(false)
                }}
                className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-800 focus:border-[#004AF7] sm:max-w-sm"
              />

              <p className="mt-2 text-xs text-slate-500">
                A disponibilidade será consultada conforme a data escolhida.
              </p>
            </div>

            {/* Seleção do horário */}
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <h2 className="mb-4 flex items-center gap-2 font-heading text-2xl font-bold">
                <Clock3 className="text-[#004AF7]" />
                3. ESCOLHA O HORÁRIO
              </h2>

              {!data ? (
                <p className="text-sm text-slate-500">
                  Selecione uma data primeiro.
                </p>
              ) : carregandoHorarios ? (
                <p className="text-sm text-slate-500">
                  Consultando horários disponíveis...
                </p>
              ) : horarios.length === 0 ? (
                <p className="text-sm text-slate-500">
                  Nenhum horário disponível para esta data.
                </p>
              ) : (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {horarios.map(h => (
                    <button
                      key={h.hora_inicio}
                      type="button"
                      aria-pressed={
                        horario === h.hora_inicio.slice(0, 5)
                      }
                      onClick={() => {
                        setHorario(h.hora_inicio.slice(0, 5))
                        setErro('')
                      }}
                      className={`rounded-lg border px-3 py-3 text-sm font-semibold ${
                        horario === h.hora_inicio.slice(0, 5)
                          ? 'border-[#004AF7] bg-[#004AF7] text-white'
                          : 'border-[#87B7FF] text-[#142191] hover:bg-[#E4F2FD]'
                      }`}
                    >
                      {h.hora_inicio.slice(0, 5)}
                    </button>
                  ))}
                </div>
              )}

              <p className="mt-4 text-sm text-slate-500">
                Responsável: conforme a escala do serviço.
              </p>
            </div>
          </div>

          {/* Resumo */}
          <aside className="h-fit rounded-2xl bg-white p-6 shadow-sm lg:sticky lg:top-6">
            <h2 className="font-heading text-2xl font-bold">
              RESUMO DA SOLICITAÇÃO
            </h2>

            <div className="mt-5 space-y-4 text-sm">
              <Resumo
                rotulo="Serviço"
                valor={
                  servicos.find(s => s.valor === categoria)?.nome
                }
              />

              <Resumo
                rotulo="Data"
                valor={data ? diaBR(data) : 'Não selecionada'}
              />

              <Resumo
                rotulo="Horário"
                valor={horario || 'Não selecionado'}
              />

              <Resumo
                rotulo="Responsável"
                valor="Conforme a escala do serviço"
              />
            </div>

            {erro && (
              <p
                role="alert"
                className="mt-4 text-sm font-medium text-red-700"
              >
                {erro}
              </p>
            )}

            <button
              type="button"
              onClick={preparar}
              disabled={carregandoHorarios}
              className="mt-6 w-full rounded-lg bg-[#004AF7] px-5 py-3 font-semibold text-white hover:bg-[#142191] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Continuar
            </button>
          </aside>
        </section>

        {/* Meus agendamentos */}
        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="font-heading text-2xl font-bold">
            MEUS AGENDAMENTOS
          </h2>

          {carregandoReservas ? (
            <p className="mt-3 text-sm text-slate-500">
              Carregando agendamentos...
            </p>
          ) : reservas.length === 0 ? (
            <p className="mt-3 text-sm text-slate-500">
              Você ainda não possui agendamentos.
            </p>
          ) : (
            <ul className="mt-4 divide-y divide-slate-200">
              {reservas.map(r => (
                <li
                  key={r.id}
                  className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm"
                >
                  <span>
                    {servicos.find(
                      s => s.valor === r.especialidade
                    )?.nome || r.especialidade}

                    {' · '}

                    {diaBR(String(r.data).slice(0, 10))}

                    {' · '}

                    {String(r.hora_inicio).slice(0, 5)}

                    {' · '}

                    {r.status}
                  </span>

                  {r.status === 'agendado' && (
                    <button
                      type="button"
                      onClick={() => cancelar(r.id)}
                      className="font-semibold text-red-700 hover:underline"
                    >
                      Cancelar
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {/* Modal de confirmação */}
      {confirmando && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#142191]/60 p-4"
          role="presentation"
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="tituloConfirmacao"
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
          >
            <h2
              id="tituloConfirmacao"
              className="font-heading text-3xl font-bold"
            >
              CONFIRMAR AGENDAMENTO
            </h2>

            <p className="mt-4 text-sm text-slate-600">
              {servicos.find(s => s.valor === categoria)?.nome}
              {' — '}
              {diaBR(data)}
              {' às '}
              {horario}
            </p>

            <p className="mt-2 text-sm text-slate-600">
              O agendamento será registrado no sistema.
            </p>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setConfirmando(false)}
                className="flex-1 rounded-lg border border-slate-300 py-3 font-semibold"
              >
                Voltar
              </button>

              <button
                type="button"
                onClick={confirmar}
                className="flex-1 rounded-lg bg-[#004AF7] py-3 font-semibold text-white"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </LayoutAutenticado>
  )
}

function Resumo({ rotulo, valor }) {
  return (
    <div>
      <p className="text-xs text-slate-500">
        {rotulo}
      </p>

      <p className="mt-1 font-semibold">
        {valor}
      </p>
    </div>
  )
}