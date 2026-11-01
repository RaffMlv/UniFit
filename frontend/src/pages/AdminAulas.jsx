import { useMemo, useState } from 'react'
import {
  CalendarDays,
  Clock3,
  UsersRound,
  Search,
  Plus,
  Eye,
  Pencil,
  X,
  Dumbbell,
} from 'lucide-react'
import LayoutAutenticado from '@/components/ui/LayoutAutenticado'

const situacoes = [
  { id: 'todas', nome: 'Todas as situações' },
  { id: 'agendada', nome: 'Agendada' },
  { id: 'cancelada', nome: 'Cancelada' },
]

const formatarData = (valor) => {
  if (!valor) return '—'
  const data = new Date(`${valor}T12:00:00`)
  return Number.isNaN(data.getTime()) ? valor : new Intl.DateTimeFormat('pt-BR').format(data)
}

export default function AdminAulas({ aulas = [] }) {
  const [busca, setBusca] = useState('')
  const [situacao, setSituacao] = useState('todas')
  const [modalCadastro, setModalCadastro] = useState(false)
  const [aulaSelecionada, setAulaSelecionada] = useState(null)
  const [aulaEdicao, setAulaEdicao] = useState(null)

  const lista = useMemo(() => {
    const termo = busca.trim().toLocaleLowerCase('pt-BR')
    return aulas.filter((aula) => {
      const estado = aula.situacao || 'agendada'
      const correspondeSituacao = situacao === 'todas' || estado === situacao
      const correspondeBusca = !termo || [
        aula.nome,
        aula.modalidade,
        aula.responsavel,
        aula.descricao,
      ].filter(Boolean).some((valor) => valor.toLocaleLowerCase('pt-BR').includes(termo))
      return correspondeSituacao && correspondeBusca
    })
  }, [aulas, busca, situacao])

  return (
    <LayoutAutenticado titulo="Gerenciar aulas">
      <main className="space-y-6 text-[#142191]">
        <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-[#004AF7]">Administração</p>
            <h1 className="mt-1 font-heading text-3xl font-bold sm:text-4xl">Gerenciar aulas</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Cadastre aulas coletivas e acompanhe horários, capacidade e alunos inscritos.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setModalCadastro(true)}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#004AF7] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#142191] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#004AF7]"
          >
            <Plus size={18} aria-hidden="true" /> Cadastrar aula
          </button>
        </header>

        <section className="grid gap-3 rounded-2xl bg-white p-4 shadow-sm sm:grid-cols-[minmax(0,1fr)_15rem] sm:p-5" aria-label="Filtros de aulas">
          <label className="relative block">
            <span className="sr-only">Pesquisar aulas</span>
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" />
            <input
              type="search"
              value={busca}
              onChange={(evento) => setBusca(evento.target.value)}
              placeholder="Buscar por nome, modalidade ou responsável"
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

        <section className="overflow-hidden rounded-2xl bg-white shadow-sm" aria-label="Aulas cadastradas">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-5 py-4 sm:px-6">
            <h2 className="font-heading text-xl font-bold">Aulas cadastradas</h2>
            <span className="text-sm text-slate-500">{lista.length} {lista.length === 1 ? 'aula' : 'aulas'}</span>
          </div>

          {lista.length === 0 ? (
            <div className="px-6 py-14 text-center">
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E4F2FD] text-[#004AF7]">
                <CalendarDays size={26} aria-hidden="true" />
              </span>
              <h3 className="mt-4 font-heading text-lg font-bold text-[#142191]">
                {busca || situacao !== 'todas' ? 'Nenhuma aula encontrada' : 'Nenhuma aula cadastrada'}
              </h3>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">
                {busca || situacao !== 'todas'
                  ? 'Tente mudar a busca ou o filtro de situação.'
                  : 'Quando as aulas forem cadastradas, elas aparecerão nesta lista.'}
              </p>
              {!busca && situacao === 'todas' && (
                <button type="button" onClick={() => setModalCadastro(true)} className="mt-5 inline-flex min-h-10 items-center gap-2 rounded-lg border border-[#004AF7] px-4 py-2 text-sm font-semibold text-[#004AF7] hover:bg-[#E4F2FD]">
                  <Plus size={17} aria-hidden="true" /> Cadastrar primeira aula
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[980px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th scope="col" className="px-5 py-3 font-semibold">Aula</th>
                    <th scope="col" className="px-5 py-3 font-semibold">Data e horário</th>
                    <th scope="col" className="px-5 py-3 font-semibold">Duração</th>
                    <th scope="col" className="px-5 py-3 font-semibold">Responsável</th>
                    <th scope="col" className="px-5 py-3 font-semibold">Vagas</th>
                    <th scope="col" className="px-5 py-3 font-semibold">Situação</th>
                    <th scope="col" className="px-5 py-3 font-semibold">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {lista.map((aula) => {
                    const cancelada = (aula.situacao || 'agendada') === 'cancelada'
                    const inscritos = aula.inscritos?.length || 0
                    return (
                      <tr key={aula.id} className="text-slate-700 hover:bg-slate-50/70">
                        <td className="px-5 py-4">
                          <div className="font-semibold text-[#142191]">{aula.nome || aula.modalidade}</div>
                          <div className="mt-1 text-xs text-slate-500">{aula.modalidade || 'Modalidade não informada'}</div>
                        </td>
                        <td className="px-5 py-4">
                          <div>{formatarData(aula.data)}</div>
                          <div className="mt-1 text-xs text-slate-500">{aula.horario || 'Horário não informado'}</div>
                        </td>
                        <td className="px-5 py-4">{aula.duracao ? `${aula.duracao} min` : '—'}</td>
                        <td className="px-5 py-4">{aula.responsavel || 'Não definido'}</td>
                        <td className="px-5 py-4">{inscritos} / {aula.capacidade ?? '—'}</td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${cancelada ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700'}`}>
                            {cancelada ? 'Cancelada' : 'Agendada'}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-1">
                            <button type="button" onClick={() => setAulaSelecionada(aula)} className="rounded-md p-2 text-[#004AF7] hover:bg-[#E4F2FD]" aria-label={`Ver aula ${aula.nome || aula.modalidade}`} title="Ver detalhes e inscritos">
                              <Eye size={17} aria-hidden="true" />
                            </button>
                            <button type="button" onClick={() => setAulaEdicao(aula)} className="rounded-md p-2 text-[#004AF7] hover:bg-[#E4F2FD]" aria-label={`Editar aula ${aula.nome || aula.modalidade}`} title="Editar aula">
                              <Pencil size={17} aria-hidden="true" />
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
          Cadastro, edição, cancelamento e notificações aos inscritos dependem da integração com as rotas do backend.
        </p>
      </main>

      {modalCadastro && <AulaFormModal aoFechar={() => setModalCadastro(false)} />}
      {aulaEdicao && <AulaFormModal aula={aulaEdicao} aoFechar={() => setAulaEdicao(null)} />}
      {aulaSelecionada && <AulaDetalhesModal aula={aulaSelecionada} aoFechar={() => setAulaSelecionada(null)} />}
    </LayoutAutenticado>
  )
}

function AulaFormModal({ aula, aoFechar }) {
  const editar = Boolean(aula)
  return (
    <ModalBase titulo={editar ? 'Editar aula' : 'Cadastrar aula'} aoFechar={aoFechar}>
      <p className="mt-2 text-sm text-slate-600">Informe os dados da aula coletiva. O formulário será conectado ao backend depois.</p>
      <form className="mt-5 space-y-4" onSubmit={(evento) => evento.preventDefault()}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Campo rotulo="Nome da aula" placeholder="Ex.: Pilates" defaultValue={aula?.nome} />
          <Campo rotulo="Modalidade" placeholder="Ex.: Pilates, yoga, dança" defaultValue={aula?.modalidade} />
          <Campo rotulo="Data" type="date" defaultValue={aula?.data} />
          <Campo rotulo="Horário" type="time" defaultValue={aula?.horario} />
          <Campo rotulo="Duração (minutos)" type="number" min="1" placeholder="Ex.: 50" defaultValue={aula?.duracao} />
          <Campo rotulo="Capacidade máxima" type="number" min="1" placeholder="Número de vagas" defaultValue={aula?.capacidade} />
          <div className="sm:col-span-2"><Campo rotulo="Responsável" placeholder="Nome do professor ou monitor" defaultValue={aula?.responsavel} /></div>
        </div>
        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold text-[#142191]">Descrição</span>
          <textarea rows={3} defaultValue={aula?.descricao || ''} placeholder="Informações sobre a aula" className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-[#004AF7] focus:ring-2 focus:ring-[#004AF7]/20" />
        </label>
        <div className="rounded-lg border border-blue-100 bg-[#E4F2FD] p-3 text-sm text-[#142191]">
          {editar ? 'As alterações serão aplicadas após a integração com a API.' : 'O cadastro será persistido após a integração com a API.'}
        </div>
        <div className="flex justify-end gap-3">
          <button type="button" onClick={aoFechar} className="min-h-11 rounded-lg border border-slate-300 px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50">Fechar</button>
          <button type="button" disabled className="min-h-11 cursor-not-allowed rounded-lg bg-slate-300 px-4 text-sm font-semibold text-white" title="Aguardando integração com a API">{editar ? 'Salvar alterações' : 'Salvar aula'}</button>
        </div>
      </form>
    </ModalBase>
  )
}

function AulaDetalhesModal({ aula, aoFechar }) {
  const inscritos = aula.inscritos || []
  const cancelada = aula.situacao === 'cancelada'
  return (
    <ModalBase titulo={aula.nome || aula.modalidade || 'Detalhes da aula'} aoFechar={aoFechar}>
      <p className="mt-1 text-sm font-semibold text-[#004AF7]">{aula.modalidade || 'Modalidade não informada'}</p>
      {aula.descricao && <p className="mt-3 text-sm leading-6 text-slate-600">{aula.descricao}</p>}
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <Resumo icon={CalendarDays} label="Data" value={formatarData(aula.data)} />
        <Resumo icon={Clock3} label="Horário e duração" value={`${aula.horario || '—'} · ${aula.duracao ? `${aula.duracao} min` : 'duração não informada'}`} />
        <Resumo icon={UsersRound} label="Responsável" value={aula.responsavel || 'Não definido'} />
        <Resumo icon={Dumbbell} label="Vagas ocupadas" value={`${inscritos.length} de ${aula.capacidade ?? '—'}`} />
      </div>
      <div className="mt-6">
        <div className="flex items-center justify-between gap-3">
          <h3 className="font-semibold text-[#142191]">Alunos inscritos</h3>
          <span className="text-sm text-slate-500">{inscritos.length}</span>
        </div>
        {inscritos.length ? (
          <ul className="mt-2 divide-y divide-slate-100 rounded-lg border border-slate-100">
            {inscritos.map((aluno) => <li key={aluno.id} className="px-3 py-2.5 text-sm text-slate-700">{aluno.nome}</li>)}
          </ul>
        ) : (
          <p className="mt-2 rounded-lg bg-slate-50 p-3 text-sm text-slate-500">Nenhum aluno inscrito consta nos dados carregados.</p>
        )}
      </div>
      {!cancelada && inscritos.length > 0 && (
        <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm leading-5 text-amber-900">
          Ao cancelar esta aula, o sistema deve notificar os alunos inscritos. O envio será realizado pela API.
        </p>
      )}
      <div className="mt-6 flex flex-wrap justify-end gap-3">
        {!cancelada && <button type="button" disabled className="min-h-11 cursor-not-allowed rounded-lg border border-rose-300 px-4 text-sm font-semibold text-rose-400" title="Aguardando integração com a API">Cancelar aula</button>}
        <button type="button" onClick={aoFechar} className="min-h-11 rounded-lg bg-[#004AF7] px-4 text-sm font-semibold text-white hover:bg-[#142191]">Fechar</button>
      </div>
    </ModalBase>
  )
}

function ModalBase({ titulo, aoFechar, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#142191]/60 p-4" onMouseDown={(evento) => evento.target === evento.currentTarget && aoFechar()}>
      <section role="dialog" aria-modal="true" aria-labelledby="tituloModalAula" className="my-6 max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-5 shadow-xl sm:p-7">
        <div className="flex items-start justify-between gap-4">
          <h2 id="tituloModalAula" className="font-heading text-2xl font-bold text-[#142191]">{titulo}</h2>
          <button type="button" onClick={aoFechar} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100" aria-label="Fechar janela"><X size={20} /></button>
        </div>
        {children}
      </section>
    </div>
  )
}

function Campo({ rotulo, placeholder, type = 'text', defaultValue, min }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold text-[#142191]">{rotulo}</span>
      <input type={type} min={min} placeholder={placeholder} defaultValue={defaultValue || ''} className="min-h-11 w-full rounded-lg border border-slate-300 px-3 text-sm text-slate-800 outline-none focus:border-[#004AF7] focus:ring-2 focus:ring-[#004AF7]/20" />
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
