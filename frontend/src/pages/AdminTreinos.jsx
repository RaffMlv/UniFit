import { useMemo, useState, useEffect } from 'react'
import {
  ClipboardList,
  Search,
  Dumbbell,
  UserRound,
  UsersRound,
  CalendarDays,
  Eye,
  X,
  Trash2
} from 'lucide-react'
import LayoutAutenticado from '@/components/ui/LayoutAutenticado'
import { api } from '@/services/api'

const situacoes = [
  { id: 'todos', nome: 'Todas as situações' },
  { id: 'rascunho', nome: 'Rascunho' },
  { id: 'aguardando_aprovacao', nome: 'Aguardando aprovação' },
  { id: 'aprovado', nome: 'Aprovado' },
  { id: 'devolvido', nome: 'Devolvido para alteração' },
]

const rotulosSituacao = {
  rascunho: 'Rascunho',
  aguardando_aprovacao: 'Aguardando aprovação',
  aprovado: 'Aprovado',
  devolvido: 'Devolvido para alteração',
}

const coresSituacao = {
  rascunho: 'bg-slate-100 text-slate-700',
  aguardando_aprovacao: 'bg-amber-50 text-amber-800',
  aprovado: 'bg-emerald-50 text-emerald-700',
  devolvido: 'bg-rose-50 text-rose-700',
}

export default function AdminTreinos() {
  const [fichas, setFichas] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')
  const [busca, setBusca] = useState('')
  const [situacao, setSituacao] = useState('todos')
  const [fichaSelecionada, setFichaSelecionada] = useState(null)

  useEffect(() => {
    async function carregarFichas() {
      try {
        setCarregando(true)
        setErro('')

        const resposta = await api('/fichas/admin/todas')

        setFichas(resposta.fichas)
      } catch (error) {
        console.error('Erro ao carregar fichas:', error)
        setErro(error.message || 'Não foi possível carregar as fichas.')
      } finally {
        setCarregando(false)
      }
    }

    carregarFichas()
  }, [])

  const lista = useMemo(() => {
    const termo = busca.trim().toLocaleLowerCase('pt-BR')
    return fichas.filter((ficha) => {
      const estado = ficha.situacao || ficha.status
      const correspondeSituacao = situacao === 'todos' || estado === situacao
      const correspondeBusca = !termo || [
        ficha.nome,
        ficha.objetivo,
        ficha.aluno?.nome,
        ficha.aluno?.matricula,
        ficha.monitor?.nome,
      ].filter(Boolean).some((valor) => valor.toLocaleLowerCase('pt-BR').includes(termo))
      return correspondeSituacao && correspondeBusca
    })
  }, [fichas, busca, situacao])

  const excluirFicha = async (ficha) => {
    const confirmou = window.confirm(
      `Tem certeza de que deseja excluir a ficha "${ficha.nome}"? Essa ação não poderá ser desfeita.`
    )

    if (!confirmou) return

    try {
      await api(`/fichas/${ficha.id}`, {
        method: 'DELETE'
      })

      setFichas(fichasAtuais =>
        fichasAtuais.filter(item => item.id !== ficha.id)
      )

      if (fichaSelecionada?.id === ficha.id) {
        setFichaSelecionada(null)
      }

      window.alert('Ficha excluída com sucesso!')
    } catch (error) {
      console.error('Erro ao excluir ficha:', error)
      window.alert(error.message || 'Não foi possível excluir a ficha.')
    }
  }

  return (
    <LayoutAutenticado titulo="Gerenciar treinos">
      <main className="space-y-6 text-[#142191]">
        <header>
          <p className="text-sm font-semibold uppercase tracking-wide text-[#004AF7]">Administração</p>
          <h1 className="mt-1 font-heading text-3xl font-bold sm:text-4xl">Gerenciar treinos</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            Consulte as fichas, veja a quem foram atribuídas e acompanhe o estado de revisão e aprovação.
          </p>
        </header>

        <section className="grid gap-3 rounded-2xl bg-white p-4 shadow-sm sm:grid-cols-[minmax(0,1fr)_15rem] sm:p-5" aria-label="Filtros das fichas">
          <label className="relative block">
            <span className="sr-only">Pesquisar ficha de treino</span>
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" />
            <input
              type="search"
              value={busca}
              onChange={(evento) => setBusca(evento.target.value)}
              placeholder="Buscar por ficha, aluno, matrícula ou monitor"
              className="min-h-11 w-full rounded-lg border border-slate-300 bg-white pl-10 pr-3 text-sm text-slate-800 outline-none focus:border-[#004AF7] focus:ring-2 focus:ring-[#004AF7]/20"
            />
          </label>
          <label className="block">
            <span className="sr-only">Filtrar por situação</span>
            <select
              value={situacao}
              onChange={(evento) => setSituacao(evento.target.value)}
              className="min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-800 outline-none focus:border-[#004AF7] focus:ring-2 focus:ring-[#004AF7]/20"
            >
              {situacoes.map((item) => <option key={item.id} value={item.id}>{item.nome}</option>)}
            </select>
          </label>
        </section>

        {carregando && (
            <p>Carregando fichas...</p>
          )}

          {erro && (
            <p className="text-red-500">{erro}</p>
          )}

          {!carregando && !erro && fichas.length === 0 && (
            <p>Nenhuma ficha encontrada.</p>
          )}


        <section className="overflow-hidden rounded-2xl bg-white shadow-sm" aria-label="Fichas de treino">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-5 py-4 sm:px-6">
            <h2 className="font-heading text-xl font-bold">Fichas cadastradas</h2>
            <span className="text-sm text-slate-500">{lista.length} {lista.length === 1 ? 'ficha' : 'fichas'}</span>
          </div>

          {lista.length === 0 ? (
            <div className="px-6 py-14 text-center">
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E4F2FD] text-[#004AF7]">
                <ClipboardList size={26} aria-hidden="true" />
              </span>
              <h3 className="mt-4 font-heading text-lg font-bold text-[#142191]">
                {busca || situacao !== 'todos' ? 'Nenhuma ficha encontrada' : 'Nenhuma ficha disponível'}
              </h3>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">
                {busca || situacao !== 'todos'
                  ? 'Tente alterar a busca ou o filtro de situação.'
                  : 'As fichas serão exibidas aqui quando forem carregadas pelo sistema.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th scope="col" className="px-5 py-3 font-semibold">Ficha</th>
                    <th scope="col" className="px-5 py-3 font-semibold">Aluno</th>
                    <th scope="col" className="px-5 py-3 font-semibold">Monitor</th>
                    <th scope="col" className="px-5 py-3 font-semibold">Divisões</th>
                    <th scope="col" className="px-5 py-3 font-semibold">Situação</th>
                    <th scope="col" className="px-5 py-3 font-semibold">Atualização</th>
                    <th scope="col" className="px-5 py-3 font-semibold">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {lista.map((ficha) => {
                    const estado = ficha.situacao || ficha.status || 'rascunho'
                    return (
                      <tr key={ficha.id} className="text-slate-700 hover:bg-slate-50/70">
                        <td className="px-5 py-4">
                          <div className="font-semibold text-[#142191]">{ficha.nome || 'Ficha sem nome'}</div>
                          {ficha.objetivo && <div className="mt-1 text-xs text-slate-500">{ficha.objetivo}</div>}
                        </td>
                        <td className="px-5 py-4">
                          <div>{ficha.aluno?.nome || 'Aluno não informado'}</div>
                          {ficha.aluno?.matricula && <div className="mt-1 text-xs text-slate-500">{ficha.aluno.matricula}</div>}
                        </td>
                        <td className="px-5 py-4">{ficha.monitor?.nome || 'Não informado'}</td>
                        <td className="px-5 py-4">{ficha.divisoes?.length || 0}</td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${coresSituacao[estado] || 'bg-slate-100 text-slate-700'}`}>
                            {rotulosSituacao[estado] || estado}
                          </span>
                        </td>
                        <td className="px-5 py-4">{ficha.atualizadoEm || '—'}</td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setFichaSelecionada(ficha)}
                              className="inline-flex min-h-9 items-center gap-2 rounded-lg px-2 text-sm font-semibold text-[#004AF7] hover:bg-[#E4F2FD]"
                              aria-label={`Visualizar ficha ${ficha.nome || ''}`}
                            >
                              <Eye size={17} aria-hidden="true" />
                              Visualizar
                            </button>

                            <button
                              type="button"
                              onClick={() => excluirFicha(ficha)}
                              className="inline-flex min-h-9 items-center gap-2 rounded-lg px-2 text-sm font-semibold text-red-600 hover:bg-red-50"
                              aria-label={`Excluir ficha ${ficha.nome || ''}`}
                            >
                              <Trash2 size={17} aria-hidden="true" />
                              Excluir
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <p className="text-xs leading-5 text-slate-500">
          Os estados de rascunho, aguardando aprovação, aprovado e devolvido mantêm a revisão supervisionada visível. A consulta e a alteração das fichas dependem da API e das permissões configuradas no servidor.
        </p>
      </main>

      {fichaSelecionada && <FichaModal ficha={fichaSelecionada} aoFechar={() => setFichaSelecionada(null)} />}
    </LayoutAutenticado>
  )
}

const diasSemana = [
  'Domingo',
  'Segunda-feira',
  'Terça-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
  'Sábado',
]

function FichaModal({ ficha, aoFechar }) {
  const divisoes = ficha.divisoes || []
  const estado = ficha.situacao || ficha.status || 'rascunho'

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#142191]/60 p-4"
      onMouseDown={(evento) =>
        evento.target === evento.currentTarget && aoFechar()
      }
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="tituloFicha"
        className="my-6 max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-5 shadow-xl sm:p-7"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-[#004AF7]">
              Detalhes da ficha
            </p>
            <h2
              id="tituloFicha"
              className="mt-1 font-heading text-2xl font-bold text-[#142191]"
            >
              {ficha.nome || 'Ficha de treino'}
            </h2>
          </div>

          <button
            type="button"
            onClick={aoFechar}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
            aria-label="Fechar detalhes"
          >
            <X size={20} />
          </button>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <Resumo
            icon={UserRound}
            label="Aluno"
            value={ficha.aluno?.nome || 'Não informado'}
          />
          <Resumo
            icon={UsersRound}
            label="Monitor responsável"
            value={ficha.monitor?.nome || 'Não informado'}
          />
          <Resumo
            icon={Dumbbell}
            label="Objetivo"
            value={ficha.objetivo || 'Não informado'}
          />
          <Resumo
            icon={CalendarDays}
            label="Situação"
            value={rotulosSituacao[estado] || estado}
          />
        </div>

        <div className="mt-6 space-y-4">
          <h3 className="font-heading text-lg font-bold text-[#142191]">
            Divisões e exercícios
          </h3>

          {divisoes.length === 0 ? (
            <p className="rounded-lg bg-slate-50 p-4 text-sm text-slate-500">
              Esta ficha não possui divisões carregadas.
            </p>
          ) : (
            divisoes.map((divisao, indice) => (
              <section
                key={divisao.id || divisao.letra || indice}
                className="rounded-xl border border-slate-200 p-4"
              >
                <h4 className="font-semibold text-[#142191]">
                  Divisão {divisao.letra || indice + 1}
                </h4>

                <div className="mt-3">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Dias de treinamento
                  </p>

                  {divisao.diasSemana?.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {divisao.diasSemana
                        .slice()
                        .sort((a, b) => a - b)
                        .map((dia) => (
                          <span
                            key={dia}
                            className="rounded-full bg-[#E4F2FD] px-3 py-1 text-xs font-semibold text-[#004AF7]"
                          >
                            {diasSemana[dia]}
                          </span>
                        ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500">
                      Nenhum dia associado.
                    </p>
                  )}
                </div>

                {!divisao.exercicios?.length ? (
                  <p className="mt-4 text-sm text-slate-500">
                    Nenhum exercício informado.
                  </p>
                ) : (
                  <div className="mt-4 overflow-x-auto">
                    <table className="w-full min-w-[560px] text-left text-sm">
                      <thead className="text-xs uppercase text-slate-500">
                        <tr>
                          <th className="py-2 pr-3">Exercício</th>
                          <th className="py-2 pr-3">Séries</th>
                          <th className="py-2 pr-3">Repetições</th>
                          <th className="py-2 pr-3">Carga</th>
                          <th className="py-2">Descanso</th>
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-slate-100">
                        {divisao.exercicios.map((exercicio, exIndice) => (
                          <tr
                            key={exercicio.itemId || exercicio.exercicioId || exIndice}
                            className="text-slate-700"
                          >
                            <td className="py-2 pr-3 font-medium">
                              {exercicio.nome || 'Exercício'}
                            </td>
                            <td className="py-2 pr-3">
                              {exercicio.series ?? '—'}
                            </td>
                            <td className="py-2 pr-3">
                              {exercicio.repeticoes ?? '—'}
                            </td>
                            <td className="py-2 pr-3">
                              {exercicio.carga ?? '—'}
                            </td>
                            <td className="py-2">
                              {exercicio.descanso ?? '—'} s
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            ))
          )}
        </div>

        <button
          type="button"
          onClick={aoFechar}
          className="mt-6 min-h-11 w-full rounded-lg border border-slate-300 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          Fechar
        </button>
      </section>
    </div>
  )
}
function Resumo({ icon: Icone, label, value }) {
  return (
    <div className="flex gap-3 rounded-xl bg-[#E4F2FD] p-3">
      <Icone size={18} className="mt-0.5 shrink-0 text-[#004AF7]" aria-hidden="true" />
      <div className="min-w-0">
        <p className="text-xs text-slate-500">{label}</p>
        <p className="mt-1 break-words text-sm font-semibold text-[#142191]">{value}</p>
      </div>
    </div>
  )
}
