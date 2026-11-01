import { useMemo, useState } from 'react'
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Search,
  UserRound,
  UserRoundCheck,
  Stethoscope,
  Pencil,
  X,
  History,
} from 'lucide-react'
import LayoutAutenticado from '@/components/ui/LayoutAutenticado'

const categorias = [
  { id: 'todas', nome: 'Todas as categorias' },
  { id: 'educacao_fisica', nome: 'Educação Física' },
  { id: 'fisioterapia', nome: 'Fisioterapia' },
  { id: 'nutricao', nome: 'Nutrição' },
]

const situacoes = [
  { id: 'todas', nome: 'Todas as situações' },
  { id: 'agendado', nome: 'Agendado' },
  { id: 'realizado', nome: 'Realizado' },
  { id: 'cancelado', nome: 'Cancelado' },
]

const nomesSituacao = {
  agendado: 'Agendado',
  realizado: 'Realizado',
  cancelado: 'Cancelado',
}

const corSituacao = {
  agendado: 'bg-blue-50 text-blue-800',
  realizado: 'bg-emerald-50 text-emerald-700',
  cancelado: 'bg-rose-50 text-rose-700',
}

const categoriaDo = (id) => categorias.find((categoria) => categoria.id === id)?.nome || id || 'Atendimento'
const dataISO = (data) => `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}-${String(data.getDate()).padStart(2, '0')}`
const extrairData = (valor) => typeof valor === 'string' ? valor.slice(0, 10) : ''

function formatarData(valor, opcoes = { dateStyle: 'full' }) {
  const iso = extrairData(valor)
  const [ano, mes, dia] = iso.split('-').map(Number)
  if (!ano || !mes || !dia) return 'Data não informada'
  return new Intl.DateTimeFormat('pt-BR', { ...opcoes, timeZone: 'UTC' }).format(new Date(Date.UTC(ano, mes - 1, dia, 12)))
}

export default function AdminAtendimentos({ atendimentos = [] }) {
  const hoje = useMemo(() => dataISO(new Date()), [])
  const [mesVisivel, setMesVisivel] = useState(() => {
    const agora = new Date()
    return new Date(agora.getFullYear(), agora.getMonth(), 1)
  })
  const [dataSelecionada, setDataSelecionada] = useState(hoje)
  const [categoria, setCategoria] = useState('todas')
  const [situacao, setSituacao] = useState('todas')
  const [busca, setBusca] = useState('')
  const [atendimentoEdicao, setAtendimentoEdicao] = useState(null)
  const [historicoAberto, setHistoricoAberto] = useState(null)

  const filtrados = useMemo(() => {
    const termo = busca.trim().toLocaleLowerCase('pt-BR')
    return atendimentos.filter((item) => {
      const estado = item.situacao || 'agendado'
      const correspondeCategoria = categoria === 'todas' || item.categoria === categoria
      const correspondeSituacao = situacao === 'todas' || estado === situacao
      const correspondeBusca = !termo || [item.aluno?.nome, item.aluno?.matricula, item.responsavel]
        .filter(Boolean)
        .some((valor) => valor.toLocaleLowerCase('pt-BR').includes(termo))
      return correspondeCategoria && correspondeSituacao && correspondeBusca
    })
  }, [atendimentos, categoria, situacao, busca])

  const diasCalendario = useMemo(() => {
    const primeiroDia = new Date(mesVisivel.getFullYear(), mesVisivel.getMonth(), 1)
    const deslocamento = primeiroDia.getDay()
    const totalDias = new Date(mesVisivel.getFullYear(), mesVisivel.getMonth() + 1, 0).getDate()
    const quantidade = Math.ceil((deslocamento + totalDias) / 7) * 7
    return Array.from({ length: quantidade }, (_, indice) => {
      const data = new Date(mesVisivel.getFullYear(), mesVisivel.getMonth(), indice - deslocamento + 1)
      return { data, iso: dataISO(data), noMes: data.getMonth() === mesVisivel.getMonth() }
    })
  }, [mesVisivel])

  const atendimentosDoDia = filtrados
    .filter((item) => extrairData(item.data) === dataSelecionada)
    .sort((a, b) => (a.horario || '').localeCompare(b.horario || ''))

  function mudarMes(delta) {
    setMesVisivel((atual) => new Date(atual.getFullYear(), atual.getMonth() + delta, 1))
  }

  return (
    <LayoutAutenticado titulo="Gerenciar atendimentos">
      <main className="space-y-6 text-[#142191]">
        <header>
          <p className="text-sm font-semibold uppercase tracking-wide text-[#004AF7]">Administração</p>
          <h1 className="mt-1 font-heading text-3xl font-bold sm:text-4xl">Gerenciar atendimentos</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            Consulte a agenda de Educação Física, Fisioterapia e Nutrição e acompanhe alterações nos agendamentos.
          </p>
        </header>

        <section className="grid gap-3 rounded-2xl bg-white p-4 shadow-sm md:grid-cols-[minmax(0,1fr)_14rem_14rem] sm:p-5" aria-label="Filtros de atendimentos">
          <label className="relative block">
            <span className="sr-only">Pesquisar aluno ou responsável</span>
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" />
            <input type="search" value={busca} onChange={(evento) => setBusca(evento.target.value)} placeholder="Buscar por aluno, matrícula ou responsável" className="min-h-11 w-full rounded-lg border border-slate-300 bg-white pl-10 pr-3 text-sm text-slate-800 outline-none focus:border-[#004AF7] focus:ring-2 focus:ring-[#004AF7]/20" />
          </label>
          <label className="block">
            <span className="sr-only">Filtrar por categoria</span>
            <select value={categoria} onChange={(evento) => setCategoria(evento.target.value)} className="min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-800 outline-none focus:border-[#004AF7] focus:ring-2 focus:ring-[#004AF7]/20">
              {categorias.map((item) => <option key={item.id} value={item.id}>{item.nome}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="sr-only">Filtrar por situação</span>
            <select value={situacao} onChange={(evento) => setSituacao(evento.target.value)} className="min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-800 outline-none focus:border-[#004AF7] focus:ring-2 focus:ring-[#004AF7]/20">
              {situacoes.map((item) => <option key={item.id} value={item.id}>{item.nome}</option>)}
            </select>
          </label>
        </section>

        <section className="grid items-start gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(20rem,0.8fr)]">
          <div className="rounded-2xl bg-white p-4 shadow-sm sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <CalendarDays size={21} className="text-[#004AF7]" aria-hidden="true" />
                <h2 className="font-heading text-xl font-bold">Calendário</h2>
              </div>
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => mudarMes(-1)} className="rounded-lg p-2 text-[#004AF7] hover:bg-[#E4F2FD]" aria-label="Mês anterior"><ChevronLeft size={20} /></button>
                <p className="min-w-32 text-center text-sm font-semibold capitalize">
                  {new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(mesVisivel)}
                </p>
                <button type="button" onClick={() => mudarMes(1)} className="rounded-lg p-2 text-[#004AF7] hover:bg-[#E4F2FD]" aria-label="Próximo mês"><ChevronRight size={20} /></button>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-7 text-center text-xs font-semibold text-slate-500" aria-hidden="true">
              {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((dia) => <div key={dia} className="pb-2">{dia}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-1" role="grid" aria-label="Calendário mensal de atendimentos">
              {diasCalendario.map(({ data, iso, noMes }) => {
                const doDia = filtrados.filter((item) => extrairData(item.data) === iso)
                const selecionado = dataSelecionada === iso
                return (
                  <button key={iso} type="button" role="gridcell" aria-selected={selecionado} aria-label={`${formatarData(iso)}${doDia.length ? `, ${doDia.length} atendimentos` : ''}`} onClick={() => setDataSelecionada(iso)} className={`flex min-h-[4.25rem] flex-col items-center rounded-lg border p-1.5 text-sm transition sm:min-h-[5rem] ${selecionado ? 'border-[#004AF7] bg-[#E4F2FD] ring-1 ring-[#004AF7]' : 'border-transparent hover:border-blue-200 hover:bg-slate-50'} ${noMes ? 'text-[#142191]' : 'text-slate-300'}`}>
                    <span className={`flex h-7 w-7 items-center justify-center rounded-full ${iso === hoje ? 'bg-[#004AF7] font-bold text-white' : ''}`}>{data.getDate()}</span>
                    {doDia.length > 0 && <span className="mt-1 text-[10px] font-semibold text-[#004AF7]">{doDia.length} {doDia.length === 1 ? 'atend.' : 'atend.'}</span>}
                  </button>
                )
              })}
            </div>
            <p className="mt-4 text-xs text-slate-500">Os indicadores no calendário respeitam os filtros aplicados acima.</p>
          </div>

          <section className="overflow-hidden rounded-2xl bg-white shadow-sm" aria-label="Atendimentos da data selecionada">
            <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#004AF7]">Atendimentos do dia</p>
              <h2 className="mt-1 font-heading text-xl font-bold capitalize">{formatarData(dataSelecionada)}</h2>
            </div>
            {atendimentosDoDia.length === 0 ? (
              <div className="px-5 py-10 text-center sm:px-6">
                <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#E4F2FD] text-[#004AF7]"><CalendarDays size={22} aria-hidden="true" /></span>
                <p className="mt-3 font-semibold text-[#142191]">Nenhum atendimento nesta data</p>
                <p className="mt-1 text-sm text-slate-500">Selecione outra data ou ajuste os filtros.</p>
              </div>
            ) : (
              <ul className="divide-y divide-slate-100">
                {atendimentosDoDia.map((item) => (
                  <li key={item.id} className="p-4 sm:p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <span className="inline-flex rounded-full bg-[#E4F2FD] px-2.5 py-1 text-xs font-semibold text-[#142191]">{categoriaDo(item.categoria)}</span>
                        <h3 className="mt-2 truncate font-semibold text-[#142191]">{item.aluno?.nome || 'Aluno não informado'}</h3>
                      </div>
                      <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${corSituacao[item.situacao || 'agendado'] || 'bg-slate-100 text-slate-700'}`}>
                        {nomesSituacao[item.situacao || 'agendado'] || item.situacao || 'Agendado'}
                      </span>
                    </div>
                    <div className="mt-3 grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
                      <p className="flex items-center gap-2"><Clock3 size={16} className="text-[#004AF7]" aria-hidden="true" />{item.horario || 'Horário não informado'}</p>
                      <p className="flex items-center gap-2"><UserRoundCheck size={16} className="text-[#004AF7]" aria-hidden="true" />{item.responsavel || 'Responsável não definido'}</p>
                    </div>
                    {item.aluno?.matricula && <p className="mt-2 text-xs text-slate-500">Matrícula: {item.aluno.matricula}</p>}
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button type="button" onClick={() => setAtendimentoEdicao(item)} className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-[#004AF7] px-3 text-xs font-semibold text-[#004AF7] hover:bg-[#E4F2FD]"><Pencil size={15} aria-hidden="true" /> Alterar</button>
                      <button type="button" onClick={() => setHistoricoAberto(item)} className="inline-flex min-h-9 items-center gap-1.5 rounded-lg px-3 text-xs font-semibold text-slate-600 hover:bg-slate-100"><History size={15} aria-hidden="true" /> Histórico</button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </section>

        <p className="text-xs leading-5 text-slate-500">
          Alterações de data, horário, responsável ou situação precisam ser autorizadas no servidor e registradas no histórico do agendamento.
        </p>
      </main>

      {atendimentoEdicao && <AlterarAtendimentoModal atendimento={atendimentoEdicao} aoFechar={() => setAtendimentoEdicao(null)} />}
      {historicoAberto && <HistoricoModal atendimento={historicoAberto} aoFechar={() => setHistoricoAberto(null)} />}
    </LayoutAutenticado>
  )
}

function AlterarAtendimentoModal({ atendimento, aoFechar }) {
  return (
    <ModalBase titulo="Alterar atendimento" aoFechar={aoFechar}>
      <p className="mt-2 text-sm text-slate-600">{atendimento.aluno?.nome || 'Aluno'} · {categoriaDo(atendimento.categoria)}</p>
      <form className="mt-5 space-y-4" onSubmit={(evento) => evento.preventDefault()}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Campo rotulo="Data" type="date" defaultValue={extrairData(atendimento.data)} />
          <Campo rotulo="Horário" type="time" defaultValue={atendimento.horario} />
          <Campo rotulo="Responsável" defaultValue={atendimento.responsavel} placeholder="Nome do profissional" />
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-[#142191]">Situação</span>
            <select defaultValue={atendimento.situacao || 'agendado'} className="min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-800 outline-none focus:border-[#004AF7] focus:ring-2 focus:ring-[#004AF7]/20">
              {situacoes.filter((item) => item.id !== 'todas').map((item) => <option key={item.id} value={item.id}>{item.nome}</option>)}
            </select>
          </label>
        </div>
        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold text-[#142191]">Motivo / observação da alteração</span>
          <textarea rows={3} placeholder="Descreva o motivo para registro no histórico" className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-[#004AF7] focus:ring-2 focus:ring-[#004AF7]/20" />
        </label>
        <p className="rounded-lg border border-blue-100 bg-[#E4F2FD] p-3 text-sm text-[#142191]">A alteração e seu motivo serão gravados no histórico quando a API estiver integrada.</p>
        <div className="flex justify-end gap-3">
          <button type="button" onClick={aoFechar} className="min-h-11 rounded-lg border border-slate-300 px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50">Fechar</button>
          <button type="button" disabled className="min-h-11 cursor-not-allowed rounded-lg bg-slate-300 px-4 text-sm font-semibold text-white" title="Aguardando integração com a API">Salvar alteração</button>
        </div>
      </form>
    </ModalBase>
  )
}

function HistoricoModal({ atendimento, aoFechar }) {
  const historico = atendimento.historicoAlteracoes || []
  return (
    <ModalBase titulo="Histórico de alterações" aoFechar={aoFechar}>
      <p className="mt-2 text-sm text-slate-600">{atendimento.aluno?.nome || 'Aluno'} · {formatarData(atendimento.data, { dateStyle: 'short' })} às {atendimento.horario || '—'}</p>
      {historico.length === 0 ? (
        <div className="mt-5 rounded-xl bg-slate-50 p-4 text-sm text-slate-600">Nenhum registro de alteração foi carregado.</div>
      ) : (
        <ol className="mt-5 space-y-3">
          {historico.map((registro) => (
            <li key={registro.id} className="rounded-xl border border-slate-200 p-4">
              <p className="font-semibold text-[#142191]">{registro.acao || 'Alteração realizada'}</p>
              <p className="mt-1 text-sm text-slate-600">{registro.observacao || 'Sem observação registrada.'}</p>
              <p className="mt-2 text-xs text-slate-500">{registro.usuario || 'Usuário'} · {registro.dataHora || 'Data não informada'}</p>
            </li>
          ))}
        </ol>
      )}
      <button type="button" onClick={aoFechar} className="mt-6 min-h-11 w-full rounded-lg border border-slate-300 text-sm font-semibold text-slate-700 hover:bg-slate-50">Fechar</button>
    </ModalBase>
  )
}

function ModalBase({ titulo, aoFechar, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#142191]/60 p-4" onMouseDown={(evento) => evento.target === evento.currentTarget && aoFechar()}>
      <section role="dialog" aria-modal="true" aria-labelledby="tituloModalAtendimento" className="my-6 max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-5 shadow-xl sm:p-7">
        <div className="flex items-start justify-between gap-4">
          <h2 id="tituloModalAtendimento" className="font-heading text-2xl font-bold text-[#142191]">{titulo}</h2>
          <button type="button" onClick={aoFechar} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100" aria-label="Fechar janela"><X size={20} /></button>
        </div>
        {children}
      </section>
    </div>
  )
}

function Campo({ rotulo, type = 'text', defaultValue, placeholder }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold text-[#142191]">{rotulo}</span>
      <input type={type} defaultValue={defaultValue || ''} placeholder={placeholder} className="min-h-11 w-full rounded-lg border border-slate-300 px-3 text-sm text-slate-800 outline-none focus:border-[#004AF7] focus:ring-2 focus:ring-[#004AF7]/20" />
    </label>
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
