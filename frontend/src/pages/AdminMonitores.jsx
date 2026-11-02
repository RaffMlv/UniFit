import { useMemo, useState, useEffect } from 'react'
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
import { api } from '@/services/api'
import { useAuth } from '@/contexts/AuthContext'

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

export default function AdminMonitores({  }) {
  const [alunos, setAlunos] = useState([])
  const [vinculos, setVinculos] = useState([])

  const [monitores, setMonitores] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState(null)

  const [areaAtiva, setAreaAtiva] = useState('educacao_fisica')
  const [busca, setBusca] = useState('')
  const [situacao, setSituacao] = useState('todos')
  const [modalAberto, setModalAberto] = useState(false)
  const [monitorSelecionado, setMonitorSelecionado] = useState(null)
  const [abaAtiva, setAbaAtiva] = useState('monitores')


  const [especialidadeVinculo, setEspecialidadeVinculo] = useState('educacao_fisica')
  const [alunoSelecionado, setAlunoSelecionado] = useState('')
  const [monitorVinculoSelecionado, setMonitorVinculoSelecionado] = useState('')

  const [carregandoAlunos, setCarregandoAlunos] = useState(false)
  const [carregandoVinculos, setCarregandoVinculos] = useState(false)
  const [salvandoVinculo, setSalvandoVinculo] = useState(false)
  const [erroVinculos, setErroVinculos] = useState(null)
  const [sucessoVinculo, setSucessoVinculo] = useState(null)
  

  async function carregarMonitores() {
    try {
      setCarregando(true)
      setErro(null)

      const dados = await api('/admin/monitores')
      setMonitores(dados)
    } catch (error) {
      setErro(error.message)
    } finally {
      setCarregando(false)
    }
  }

  // 3. Executa a busca quando a página é aberta
  useEffect(() => {
    carregarMonitores()
  }, [])


  const lista = useMemo(() => {
    const termo = busca.trim().toLocaleLowerCase('pt-BR')

    return monitores.filter((monitor) => {
      const correspondeArea = monitor.especialidade === areaAtiva

      const correspondeSituacao = situacao === 'todos'
        || (situacao === 'ativos'
          ? Boolean(monitor.ativo)
          : !Boolean(monitor.ativo))

      const correspondeBusca = !termo
        || [
          monitor.nome,
          monitor.cpf,
          monitor.email,
          monitor.supervisor_nome
        ]
          .filter(Boolean)
          .some((valor) =>
            valor.toLocaleLowerCase('pt-BR').includes(termo)
          )

      return correspondeArea && correspondeSituacao && correspondeBusca
    })
  }, [monitores, areaAtiva, busca, situacao])

  const monitoresDisponiveis = useMemo(() => {
  return monitores.filter((monitor) =>
      monitor.especialidade === especialidadeVinculo &&
      Boolean(monitor.ativo)
    )
  }, [monitores, especialidadeVinculo])

  async function carregarAlunos() {
    try {
      setCarregandoAlunos(true)
      setErroVinculos(null)

      const dados = await api('/admin/alunos?pagina=1&limite=50')

      setAlunos(dados.itens)
    } catch (error) {
      setErroVinculos(error.message)
    } finally {
      setCarregandoAlunos(false)
    }
  }

  async function carregarVinculos(alunoId) {
    if (!alunoId) {
      setVinculos([])
      return
    }

    try {
      setCarregandoVinculos(true)
      setErroVinculos(null)

      const dados = await api(`/vinculos/aluno/${alunoId}`)

      setVinculos(dados)
    } catch (error) {
      setErroVinculos(error.message)
    } finally {
      setCarregandoVinculos(false)
    }
  }

  async function criarVinculo() {
    if (!alunoSelecionado || !monitorVinculoSelecionado) {
      setErroVinculos('Selecione um aluno e um monitor.')
      return
    }

    try {
      setSalvandoVinculo(true)
      setErroVinculos(null)
      setSucessoVinculo(null)

      await api('/vinculos', {
        method: 'POST',
        body: {
          aluno_id: Number(alunoSelecionado),
          monitor_id: Number(monitorVinculoSelecionado),
          especialidade: especialidadeVinculo,
        },
      })

      setSucessoVinculo('Vínculo criado com sucesso!')
      setMonitorVinculoSelecionado('')

      await carregarVinculos(alunoSelecionado)
    } catch (error) {
      setErroVinculos(error.message)
    } finally {
      setSalvandoVinculo(false)
    }
  }

  async function removerVinculo(vinculoId) {
    try {
      setErroVinculos(null)
      setSucessoVinculo(null)

      await api(`/vinculos/${vinculoId}`, {
        method: 'DELETE',
      })

      setSucessoVinculo('Vínculo removido com sucesso!')

      await carregarVinculos(alunoSelecionado)
    } catch (error) {
      setErroVinculos(error.message)
    }
  }

  // Carrega os alunos quando a aba de vínculos é aberta
  useEffect(() => {
    if (abaAtiva === 'vinculos') {
      carregarAlunos()
    }
  }, [abaAtiva])

  // Carrega os vínculos sempre que o aluno selecionado mudar
  useEffect(() => {
    if (!alunoSelecionado) {
      setVinculos([])
      return
    }

    carregarVinculos(alunoSelecionado)
  }, [alunoSelecionado])

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
          {abaAtiva === 'monitores' && (
            <button
              type="button"
              onClick={() => setModalAberto(true)}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#004AF7] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#142191] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#004AF7]"
            >
              Adicionar monitor
            </button>
          )}
        </header>

        <nav
          className="flex gap-2 border-b border-slate-200"
          aria-label="Seções de gerenciamento"
        >
          <button
            type="button"
            onClick={() => setAbaAtiva('monitores')}
            className={`px-4 py-3 text-sm font-semibold ${
              abaAtiva === 'monitores'
                ? 'border-b-2 border-[#004AF7] text-[#004AF7]'
                : 'text-slate-500 hover:text-[#142191]'
            }`}
          >
            Monitores
          </button>

          <button
            type="button"
            onClick={() => setAbaAtiva('vinculos')}
            className={`px-4 py-3 text-sm font-semibold ${
              abaAtiva === 'vinculos'
                ? 'border-b-2 border-[#004AF7] text-[#004AF7]'
                : 'text-slate-500 hover:text-[#142191]'
            }`}
          >
            Vínculos
          </button>
        </nav>
        
        {abaAtiva === 'monitores' && (
        <>

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

        </>
        )}

        {abaAtiva === 'vinculos' && (
          <section className="rounded-2xl bg-white p-4 shadow-sm sm:p-6">

            <div className="mb-6">
              <h2 className="text-lg font-semibold text-slate-800">
                Gerenciamento de vínculos
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Associe alunos aos monitores responsáveis por seu acompanhamento.
              </p>
            </div>

            {/* Mensagens */}
            {erroVinculos && (
              <p role="alert" className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                {erroVinculos}
              </p>
            )}

            {sucessoVinculo && (
              <p role="status" className="mb-4 rounded-lg bg-green-50 p-3 text-sm text-green-700">
                {sucessoVinculo}
              </p>
            )}

            {/* Formulário de criação */}
            <div className="mb-8 rounded-xl border border-slate-200 p-4">

              <h3 className="mb-4 font-semibold text-slate-800">
                Criar novo vínculo
              </h3>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

                {/* Especialidade */}
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Especialidade
                  </label>

                  <select
                    value={especialidadeVinculo}
                    onChange={(e) => {
                      setEspecialidadeVinculo(e.target.value)
                      setMonitorVinculoSelecionado('')
                      setErroVinculos(null)
                      setSucessoVinculo(null)
                    }}
                    className="w-full rounded-lg border border-slate-300 p-2.5 text-sm"
                  >
                    {areas.map((area) => (
                      <option key={area.id} value={area.id}>
                        {area.nome}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Aluno */}
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Aluno
                  </label>

                  <select
                    value={alunoSelecionado}
                    onChange={(e) => {
                      setAlunoSelecionado(e.target.value)
                      setMonitorVinculoSelecionado('')
                      setErroVinculos(null)
                      setSucessoVinculo(null)
                    }}
                    disabled={carregandoAlunos}
                    className="w-full rounded-lg border border-slate-300 p-2.5 text-sm disabled:bg-slate-100"
                  >
                    <option value="">
                      {carregandoAlunos ? 'Carregando alunos...' : 'Selecione um aluno'}
                    </option>

                    {alunos.map((aluno) => (
                      <option key={aluno.id} value={aluno.id}>
                        {aluno.nome}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Monitor */}
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Monitor
                  </label>

                  <select
                    value={monitorVinculoSelecionado}
                    onChange={(e) => setMonitorVinculoSelecionado(e.target.value)}
                    disabled={!alunoSelecionado || carregando}
                    className="w-full rounded-lg border border-slate-300 p-2.5 text-sm disabled:bg-slate-100"
                  >
                    <option value="">Selecione um monitor</option>

                    {monitoresDisponiveis.map((monitor) => (
                      <option key={monitor.id} value={monitor.id}>
                        {monitor.nome}
                      </option>
                    ))}
                  </select>

                  {alunoSelecionado && monitoresDisponiveis.length === 0 && (
                    <p className="mt-1 text-xs text-slate-500">
                      Não há monitores ativos nesta especialidade.
                    </p>
                  )}
                </div>

              </div>

              <button
                type="button"
                onClick={criarVinculo}
                disabled={
                  !alunoSelecionado ||
                  !monitorVinculoSelecionado ||
                  salvandoVinculo
                }
                className="mt-5 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {salvandoVinculo ? 'Criando vínculo...' : 'Criar vínculo'}
              </button>

            </div>

            {/* Lista de vínculos existentes */}
            <div>

              <h3 className="mb-4 font-semibold text-slate-800">
                Vínculos do aluno selecionado
              </h3>

              {!alunoSelecionado ? (
                <p className="rounded-lg bg-slate-50 p-4 text-sm text-slate-500">
                  Selecione um aluno para consultar seus vínculos.
                </p>
              ) : carregandoVinculos ? (
                <p className="p-4 text-sm text-slate-500">
                  Carregando vínculos...
                </p>
              ) : vinculos.length === 0 ? (
                <p className="rounded-lg bg-slate-50 p-4 text-sm text-slate-500">
                  Este aluno ainda não possui vínculos cadastrados.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">

                    <thead className="border-b border-slate-200 text-slate-500">
                      <tr>
                        <th className="px-3 py-3 font-medium">Monitor</th>
                        <th className="px-3 py-3 font-medium">Especialidade</th>
                        <th className="px-3 py-3 text-right font-medium">Ações</th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100">
                      {vinculos.map((vinculo) => (
                        <tr key={vinculo.id}>

                          <td className="px-3 py-3 font-medium text-slate-800">
                            {vinculo.monitor_nome}
                          </td>

                          <td className="px-3 py-3 text-slate-600">
                            {areas.find(
                              (area) => area.id === vinculo.especialidade
                            )?.nome || vinculo.especialidade}
                          </td>

                          <td className="px-3 py-3 text-right">
                            <button
                              type="button"
                              onClick={() => removerVinculo(vinculo.id)}
                              className="font-medium text-red-600 hover:text-red-800"
                            >
                              Remover
                            </button>
                          </td>

                        </tr>
                      ))}
                    </tbody>

                  </table>
                </div>
              )}

            </div>

          </section>
        )}

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

function CadastroModal({ area, aoFechar, aoSalvar }) {
  const { usuario } = useAuth()

  const ehAdmin = usuario?.papel === 'admin'

  const [nome, setNome] = useState('')
  const [cpf, setCpf] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [especialidade, setEspecialidade] = useState(area)
  const [registroProfissional, setRegistroProfissional] = useState('')

  const [tipoAutorizacao, setTipoAutorizacao] = useState(
    ehAdmin ? 'restrito' : 'restrito'
  )

  const [supervisorId, setSupervisorId] = useState('')
  const [supervisores, setSupervisores] = useState([])

  const [permissoes, setPermissoes] = useState([])
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState('')

  const nomeArea = areas.find(
    (item) => item.id === especialidade
  )?.nome

  useEffect(() => {
    if (!ehAdmin) return

    async function carregarSupervisores() {
      try {
        const dados = await api('/admin/monitores')

        setSupervisores(
          dados.filter(
            (monitor) =>
              monitor.ativo &&
              monitor.tipo_autorizacao === 'completo'
          )
        )
      } catch (error) {
        setErro('Não foi possível carregar os supervisores.')
      }
    }

    carregarSupervisores()
  }, [ehAdmin])

  function alterarTipoAutorizacao(tipo) {
    setTipoAutorizacao(tipo)

    if (tipo === 'completo') {
      setSupervisorId('')
      setPermissoes([])
    }
  }

  function alterarPermissao(permissao, marcada) {
    setPermissoes((atuais) =>
      marcada
        ? [...atuais, permissao]
        : atuais.filter((item) => item !== permissao)
    )
  }

  async function cadastrarMonitor(evento) {
    evento.preventDefault()

    try {
      setCarregando(true)
      setErro('')

      const dados = {
        nome,
        cpf,
        email,
        senha,
        especialidade,
        registro_profissional: registroProfissional || null,
        tipo_autorizacao: ehAdmin ? tipoAutorizacao : 'restrito',
        supervisor_id:
          ehAdmin && tipoAutorizacao === 'restrito'
            ? Number(supervisorId)
            : null,
        permissoes:
          tipoAutorizacao === 'restrito' ? permissoes : []
      }

      await api('/admin/monitores', {
        method: 'POST',
        body: dados
      })

      await aoSalvar?.()
      aoFechar()

    } catch (error) {
      setErro(error.message)
    } finally {
      setCarregando(false)
    }
  }

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
        aria-labelledby="tituloCadastroMonitor"
        className="my-6 w-full max-w-2xl rounded-2xl bg-white p-5 shadow-xl sm:p-7"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-[#004AF7]">
              {nomeArea}
            </p>

            <h2
              id="tituloCadastroMonitor"
              className="mt-1 font-heading text-2xl font-bold text-[#142191]"
            >
              Adicionar monitor
            </h2>

            <p className="mt-2 text-sm text-slate-600">
              Preencha os dados para cadastrar um novo monitor.
            </p>
          </div>

          <button
            type="button"
            onClick={aoFechar}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
            aria-label="Fechar cadastro"
          >
            <X size={20} />
          </button>
        </div>

        <form
          className="mt-6 space-y-5"
          onSubmit={cadastrarMonitor}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block sm:col-span-2">
              <span className="mb-1.5 block text-sm font-semibold text-[#142191]">
                Nome completo
              </span>
              <input
                required
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Nome do monitor"
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-[#004AF7]"
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold text-[#142191]">
                CPF
              </span>
              <input
                required
                value={cpf}
                onChange={(e) => setCpf(e.target.value)}
                maxLength={11}
                placeholder="Somente números"
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-[#004AF7]"
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold text-[#142191]">
                E-mail
              </span>
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@exemplo.com"
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-[#004AF7]"
              />
            </label>

            <label className="block sm:col-span-2">
              <span className="mb-1.5 block text-sm font-semibold text-[#142191]">
                Senha inicial
              </span>
              <input
                required
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="Senha de acesso"
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-[#004AF7]"
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold text-[#142191]">
                Especialidade
              </span>
              <select
                required
                value={especialidade}
                onChange={(e) => setEspecialidade(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-[#004AF7]"
              >
                {areas.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.nome}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold text-[#142191]">
                Registro profissional
              </span>
              <input
                value={registroProfissional}
                onChange={(e) => setRegistroProfissional(e.target.value)}
                placeholder="Ex.: CREF123456"
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-[#004AF7]"
              />
            </label>
          </div>

          {ehAdmin && (
            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold text-[#142191]">
                Tipo de autorização
              </span>
              <select
                value={tipoAutorizacao}
                onChange={(e) =>
                  alterarTipoAutorizacao(e.target.value)
                }
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-[#004AF7]"
              >
                <option value="completo">Completa</option>
                <option value="restrito">Restrita</option>
              </select>
            </label>
          )}

          {tipoAutorizacao === 'restrito' && (
            <>
              {ehAdmin && (
                <label className="block">
                  <span className="mb-1.5 block text-sm font-semibold text-[#142191]">
                    Supervisor
                  </span>
                  <select
                    required
                    value={supervisorId}
                    onChange={(e) => setSupervisorId(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-[#004AF7]"
                  >
                    <option value="">Selecione um supervisor</option>
                    {supervisores.map((supervisor) => (
                      <option
                        key={supervisor.id}
                        value={supervisor.id}
                      >
                        {supervisor.nome}
                      </option>
                    ))}
                  </select>
                </label>
              )}

              <fieldset>
                <legend className="text-sm font-semibold text-[#142191]">
                  Permissões específicas
                </legend>

                <p className="mb-2 mt-1 text-xs text-slate-500">
                  Conceda somente os acessos necessários para a função.
                </p>

                <div className="grid gap-2 sm:grid-cols-2">
                  {permissoesDisponiveis.map((permissao) => (
                    <label
                      key={permissao.id}
                      className="flex min-h-10 items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700"
                    >
                      <input
                        type="checkbox"
                        checked={permissoes.includes(permissao.id)}
                        onChange={(e) =>
                          alterarPermissao(permissao.id, e.target.checked)
                        }
                        className="h-4 w-4 accent-[#004AF7]"
                      />
                      {permissao.nome}
                    </label>
                  ))}
                </div>
              </fieldset>
            </>
          )}

          {!ehAdmin && (
            <p className="rounded-lg border border-blue-100 bg-[#E4F2FD] p-3 text-sm text-[#142191]">
              O novo monitor será cadastrado com autorização restrita e
              ficará sob sua supervisão.
            </p>
          )}

          {erro && (
            <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
              {erro}
            </p>
          )}

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={aoFechar}
              disabled={carregando}
              className="min-h-11 rounded-lg border border-slate-300 px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={carregando}
              className="min-h-11 rounded-lg bg-[#004AF7] px-4 text-sm font-semibold text-white hover:bg-[#142191] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {carregando ? 'Salvando...' : 'Salvar monitor'}
            </button>
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
