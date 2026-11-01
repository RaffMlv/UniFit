import { useMemo, useState } from 'react'
import {
  UsersRound,
  Search,
  Plus,
  UserRound,
  GraduationCap,
  ShieldCheck,
  Clock3,
  Eye,
  Pencil,
  UserRoundX,
  X,
} from 'lucide-react'
import LayoutAutenticado from '@/components/ui/LayoutAutenticado'

const areas = [
  { id: 'educacao_fisica', nome: 'Educação Física' },
  { id: 'fisioterapia', nome: 'Fisioterapia' },
  { id: 'nutricao', nome: 'Nutrição' },
]

const permissoesDisponiveis = [
  { id: 'alunos', nome: 'Consultar alunos vinculados' },
  { id: 'triagem', nome: 'Consultar triagem autorizada' },
  { id: 'treinos', nome: 'Consultar e elaborar treinos' },
  { id: 'acompanhamento', nome: 'Registrar acompanhamento' },
]

/**
 * Tela administrativa de monitores (RF38).
 * Recebe `monitores` da API quando a integração estiver disponível.
 * Cada registro esperado: { id, nome, matricula, curso, periodo, supervisor,
 * ativo, disponibilidade, permissoes, alunos, historico }.
 */
export default function AdminMonitores({ monitores = [] }) {
  const [areaAtiva, setAreaAtiva] = useState('educacao_fisica')
  const [busca, setBusca] = useState('')
  const [situacao, setSituacao] = useState('todos')
  const [modalAberto, setModalAberto] = useState(false)
  const [monitorSelecionado, setMonitorSelecionado] = useState(null)

  const lista = useMemo(() => {
    const termo = busca.trim().toLocaleLowerCase('pt-BR')
    return monitores.filter((monitor) => {
      const correspondeArea = monitor.area === areaAtiva
      const correspondeSituacao = situacao === 'todos'
        || (situacao === 'ativos' ? monitor.ativo : !monitor.ativo)
      const correspondeBusca = !termo
        || [monitor.nome, monitor.matricula, monitor.curso, monitor.supervisor]
          .filter(Boolean)
          .some((valor) => valor.toLocaleLowerCase('pt-BR').includes(termo))
      return correspondeArea && correspondeSituacao && correspondeBusca
    })
  }, [monitores, areaAtiva, busca, situacao])

  return (
    <LayoutAutenticado titulo="Monitores">
      <main className="space-y-6 text-[#142191]">
        <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-[#004AF7]">
              Administração
            </p>
            <h1 className="mt-1 font-heading text-3xl font-bold sm:text-4xl">
              Gerenciar monitores
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Cadastre monitores, defina supervisão e permissões e consulte os vínculos de acompanhamento.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setModalAberto(true)}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#004AF7] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#142191] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#004AF7]"
          >
            <Plus size={18} aria-hidden="true" /> Adicionar monitor
          </button>
        </header>

        <section className="rounded-2xl bg-white p-4 shadow-sm sm:p-6" aria-label="Filtros de monitores">
          <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-4" role="tablist" aria-label="Área profissional">
            {areas.map((area) => {
              const selecionada = areaAtiva === area.id
              return (
                <button
                  key={area.id}
                  type="button"
                  role="tab"
                  aria-selected={selecionada}
                  onClick={() => setAreaAtiva(area.id)}
                  className={`min-h-10 rounded-lg px-3 py-2 text-sm font-semibold transition ${selecionada ? 'bg-[#004AF7] text-white' : 'bg-[#E4F2FD] text-[#142191] hover:bg-blue-100'}`}
                >
                  {area.nome}
                </button>
              )
            })}
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-[minmax(0,1fr)_12rem]">
            <label className="relative block">
              <span className="sr-only">Pesquisar monitores</span>
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" />
              <input
                type="search"
                value={busca}
                onChange={(evento) => setBusca(evento.target.value)}
                placeholder="Buscar por nome, matrícula, curso ou supervisor"
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
                <option value="todos">Todas as situações</option>
                <option value="ativos">Ativos</option>
                <option value="inativos">Inativos</option>
              </select>
            </label>
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl bg-white shadow-sm" aria-label={`Monitores de ${areas.find((area) => area.id === areaAtiva)?.nome}`}>
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-5 py-4 sm:px-6">
            <h2 className="font-heading text-xl font-bold">{areas.find((area) => area.id === areaAtiva)?.nome}</h2>
            <span className="text-sm text-slate-500">{lista.length} {lista.length === 1 ? 'monitor' : 'monitores'}</span>
          </div>

          {lista.length === 0 ? (
            <div className="px-6 py-14 text-center">
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E4F2FD] text-[#004AF7]">
                <UsersRound size={26} aria-hidden="true" />
              </span>
              <h3 className="mt-4 font-heading text-lg font-bold text-[#142191]">
                {busca || situacao !== 'todos' ? 'Nenhum monitor encontrado' : 'Nenhum monitor cadastrado nesta área'}
              </h3>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">
                {busca || situacao !== 'todos'
                  ? 'Tente mudar os termos da busca ou o filtro de situação.'
                  : 'Quando houver monitores cadastrados, eles aparecerão aqui com situação, supervisor e curso.'}
              </p>
              {!busca && situacao === 'todos' && (
                <button
                  type="button"
                  onClick={() => setModalAberto(true)}
                  className="mt-5 inline-flex min-h-10 items-center gap-2 rounded-lg border border-[#004AF7] px-4 py-2 text-sm font-semibold text-[#004AF7] hover:bg-[#E4F2FD]"
                >
                  <Plus size={17} aria-hidden="true" /> Adicionar primeiro monitor
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th scope="col" className="px-5 py-3 font-semibold">Monitor</th>
                    <th scope="col" className="px-5 py-3 font-semibold">Matrícula / curso</th>
                    <th scope="col" className="px-5 py-3 font-semibold">Supervisor</th>
                    <th scope="col" className="px-5 py-3 font-semibold">Situação</th>
                    <th scope="col" className="px-5 py-3 font-semibold">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {lista.map((monitor) => (
                    <tr key={monitor.id} className="text-slate-700 hover:bg-slate-50/70">
                      <td className="px-5 py-4">
                        <div className="font-semibold text-[#142191]">{monitor.nome}</div>
                        {monitor.periodo && <div className="mt-1 text-xs text-slate-500">{monitor.periodo}</div>}
                      </td>
                      <td className="px-5 py-4">
                        <div>{monitor.matricula || '—'}</div>
                        <div className="mt-1 text-xs text-slate-500">{monitor.curso || 'Curso não informado'}</div>
                      </td>
                      <td className="px-5 py-4">{monitor.supervisor || 'Não definido'}</td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${monitor.ativo ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                          {monitor.ativo ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1">
                          <button type="button" onClick={() => setMonitorSelecionado(monitor)} className="rounded-md p-2 text-[#004AF7] hover:bg-[#E4F2FD]" aria-label={`Ver detalhes de ${monitor.nome}`} title="Ver detalhes">
                            <Eye size={17} aria-hidden="true" />
                          </button>
                          <button type="button" onClick={() => setMonitorSelecionado({ ...monitor, modoEdicao: true })} className="rounded-md p-2 text-[#004AF7] hover:bg-[#E4F2FD]" aria-label={`Editar ${monitor.nome}`} title="Editar">
                            <Pencil size={17} aria-hidden="true" />
                          </button>
                          <span className="rounded-md p-2 text-slate-400" title="Ativação de acesso será ligada à API">
                            <UserRoundX size={17} aria-hidden="true" />
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <p className="text-xs leading-5 text-slate-500">
          A listagem e as ações de cadastro, edição, permissões e situação precisam ser conectadas às rotas administrativas da API.
        </p>
      </main>

      {modalAberto && <CadastroModal area={areaAtiva} aoFechar={() => setModalAberto(false)} />}
      {monitorSelecionado && <DetalhesModal monitor={monitorSelecionado} aoFechar={() => setMonitorSelecionado(null)} />}
    </LayoutAutenticado>
  )
}

function CadastroModal({ area, aoFechar }) {
  const [permissoes, setPermissoes] = useState([])
  const [disponibilidade, setDisponibilidade] = useState('')
  const nomeArea = areas.find((item) => item.id === area)?.nome

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#142191]/60 p-4" onMouseDown={(evento) => evento.target === evento.currentTarget && aoFechar()}>
      <section role="dialog" aria-modal="true" aria-labelledby="tituloCadastroMonitor" className="my-6 w-full max-w-2xl rounded-2xl bg-white p-5 shadow-xl sm:p-7">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-[#004AF7]">{nomeArea}</p>
            <h2 id="tituloCadastroMonitor" className="mt-1 font-heading text-2xl font-bold text-[#142191]">Adicionar monitor</h2>
            <p className="mt-2 text-sm text-slate-600">Preencha os dados que serão enviados à API quando a integração estiver pronta.</p>
          </div>
          <button type="button" onClick={aoFechar} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100" aria-label="Fechar cadastro"><X size={20} /></button>
        </div>

        <form className="mt-6 space-y-5" onSubmit={(evento) => evento.preventDefault()}>
          <div className="grid gap-4 sm:grid-cols-2">
            <Campo rotulo="Nome completo" placeholder="Nome do monitor" />
            <Campo rotulo="Matrícula" placeholder="Matrícula institucional" />
            <Campo rotulo="Curso" placeholder="Curso de formação" />
            <Campo rotulo="Semestre / período" placeholder="Ex.: 5º semestre" />
            <Campo rotulo="Supervisor" placeholder="Nome do professor supervisor" />
            <Campo rotulo="Situação" select options={['Ativo', 'Inativo']} />
          </div>

          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-[#142191]">Disponibilidade</span>
            <textarea value={disponibilidade} onChange={(evento) => setDisponibilidade(evento.target.value)} rows={2} placeholder="Dias e horários disponíveis" className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-[#004AF7] focus:ring-2 focus:ring-[#004AF7]/20" />
          </label>

          <fieldset>
            <legend className="text-sm font-semibold text-[#142191]">Permissões específicas</legend>
            <p className="mb-2 mt-1 text-xs text-slate-500">Conceda somente os acessos necessários para a função.</p>
            <div className="grid gap-2 sm:grid-cols-2">
              {permissoesDisponiveis.map((permissao) => (
                <label key={permissao.id} className="flex min-h-10 items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700">
                  <input type="checkbox" checked={permissoes.includes(permissao.id)} onChange={(evento) => setPermissoes((atual) => evento.target.checked ? [...atual, permissao.id] : atual.filter((item) => item !== permissao.id))} className="h-4 w-4 accent-[#004AF7]" />
                  {permissao.nome}
                </label>
              ))}
            </div>
          </fieldset>

          <div className="rounded-lg border border-blue-100 bg-[#E4F2FD] p-3 text-sm text-[#142191]">
            O formulário é visual por enquanto. Salvar e enviar convite dependem da integração com o backend.
          </div>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={aoFechar} className="min-h-11 rounded-lg border border-slate-300 px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50">Fechar</button>
            <button type="button" disabled className="min-h-11 cursor-not-allowed rounded-lg bg-slate-300 px-4 text-sm font-semibold text-white" title="Aguardando integração com a API">Salvar monitor</button>
          </div>
        </form>
      </section>
    </div>
  )
}

function Campo({ rotulo, placeholder, select = false, options = [] }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold text-[#142191]">{rotulo}</span>
      {select ? (
        <select defaultValue={options[0]} className="min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-800 outline-none focus:border-[#004AF7] focus:ring-2 focus:ring-[#004AF7]/20">
          {options.map((option) => <option key={option}>{option}</option>)}
        </select>
      ) : (
        <input placeholder={placeholder} className="min-h-11 w-full rounded-lg border border-slate-300 px-3 text-sm text-slate-800 outline-none focus:border-[#004AF7] focus:ring-2 focus:ring-[#004AF7]/20" />
      )}
    </label>
  )
}

function DetalhesModal({ monitor, aoFechar }) {
  const alunos = monitor.alunos || []
  const historico = monitor.historico || []
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#142191]/60 p-4" onMouseDown={(evento) => evento.target === evento.currentTarget && aoFechar()}>
      <section role="dialog" aria-modal="true" aria-labelledby="tituloDetalheMonitor" className="my-6 w-full max-w-xl rounded-2xl bg-white p-5 shadow-xl sm:p-7">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-[#004AF7]">Detalhes do monitor</p>
            <h2 id="tituloDetalheMonitor" className="mt-1 font-heading text-2xl font-bold text-[#142191]">{monitor.nome}</h2>
          </div>
          <button type="button" onClick={aoFechar} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100" aria-label="Fechar detalhes"><X size={20} /></button>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <Resumo icon={GraduationCap} label="Curso" value={monitor.curso || 'Não informado'} />
          <Resumo icon={UserRound} label="Supervisor" value={monitor.supervisor || 'Não definido'} />
          <Resumo icon={Clock3} label="Disponibilidade" value={monitor.disponibilidade || 'Não informada'} />
          <Resumo icon={ShieldCheck} label="Permissões" value={monitor.permissoes?.length ? monitor.permissoes.join(', ') : 'Não definidas'} />
        </div>
        <div className="mt-6">
          <h3 className="font-semibold text-[#142191]">Alunos vinculados</h3>
          {alunos.length ? <ul className="mt-2 divide-y divide-slate-100">{alunos.map((aluno) => <li key={aluno.id} className="py-2 text-sm text-slate-700">{aluno.nome}</li>)}</ul> : <p className="mt-2 rounded-lg bg-slate-50 p-3 text-sm text-slate-500">Nenhum vínculo disponível para exibição.</p>}
        </div>
        <div className="mt-5">
          <h3 className="font-semibold text-[#142191]">Atividades administrativas</h3>
          {historico.length ? <ul className="mt-2 divide-y divide-slate-100">{historico.map((registro) => <li key={registro.id} className="py-2 text-sm text-slate-700">{registro.acao} <span className="text-slate-500">· {registro.data}</span></li>)}</ul> : <p className="mt-2 rounded-lg bg-slate-50 p-3 text-sm text-slate-500">Nenhum registro de atividade disponível.</p>}
        </div>
        <button type="button" onClick={aoFechar} className="mt-6 min-h-11 w-full rounded-lg border border-slate-300 text-sm font-semibold text-slate-700 hover:bg-slate-50">Fechar</button>
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
