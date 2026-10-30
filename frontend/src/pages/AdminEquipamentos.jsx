import { useState } from 'react'
import { Plus, Search, Wrench, ImageIcon } from 'lucide-react'
import LayoutAutenticado from '@/components/ui/LayoutAutenticado'

const STATUS = ['Disponível', 'Em manutenção', 'Indisponível']

const CORES_STATUS = {
  Disponível: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  'Em manutenção': 'border-amber-200 bg-amber-50 text-amber-800',
  Indisponível: 'border-red-200 bg-red-50 text-red-800',
}

const campo =
  'mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#004AF7]'

const botao =
  'inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-[#87B7FF] px-4 py-2 text-sm font-semibold text-[#142191] hover:bg-[#E4F2FD] disabled:cursor-not-allowed disabled:opacity-50'

const botaoPrincipal =
  'inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#004AF7] px-4 py-2 text-sm font-semibold text-white hover:bg-[#142191] disabled:cursor-not-allowed disabled:opacity-50'

function formularioVazio() {
  return {
    codigo: '',
    nome: '',
    imagem: '',
    status: 'Disponível',
    exerciciosIds: [],
    observacoes: '',
  }
}

function normalizar(texto) {
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

function imagemValida(valor) {
  if (!valor.trim()) return true

  try {
    const url = new URL(valor)
    return ['http:', 'https:'].includes(url.protocol)
  } catch {
    return false
  }
}

function ImagemEquipamento({ imagem, nome }) {
  const [falhou, setFalhou] = useState(false)

  if (!imagem || falhou) {
    return (
      <div
        className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-[#E4F2FD] text-[#004AF7]"
        aria-label="Sem imagem disponível"
      >
        <ImageIcon size={23} aria-hidden="true" />
      </div>
    )
  }

  return (
    <img
      src={imagem}
      alt={nome}
      loading="lazy"
      onError={() => setFalhou(true)}
      className="h-14 w-14 shrink-0 rounded-lg border border-slate-100 object-cover"
    />
  )
}

export default function AdminEquipamentos({
  equipamentos = [],
  exercicios = [],
  onSalvar,
  menu,
}) {
  const [busca, setBusca] = useState('')
  const [filtroStatus, setFiltroStatus] = useState('')
  const [formularioAberto, setFormularioAberto] = useState(false)
  const [editandoId, setEditandoId] = useState(null)
  const [dados, setDados] = useState(formularioVazio)
  const [erro, setErro] = useState('')
  const [mensagem, setMensagem] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [impactoId, setImpactoId] = useState(null)

  const termo = normalizar(busca)

  const filtrados = equipamentos.filter(equipamento =>
    (!filtroStatus || equipamento.status === filtroStatus) &&
    normalizar(`${equipamento.codigo} ${equipamento.nome}`).includes(termo)
  )

  const equipamentoImpacto = equipamentos.find(item => item.id === impactoId)

  const comImpacto = equipamentos.filter(item =>
    item.status !== 'Disponível' &&
    Array.isArray(item.fichasAfetadas) &&
    item.fichasAfetadas.length > 0
  )

  function alterar(campoAlterado, valor) {
    setDados(atuais => ({ ...atuais, [campoAlterado]: valor }))
    setErro('')
  }

  function abrirFormulario(equipamento = null) {
    setEditandoId(equipamento?.id ?? null)
    setDados(equipamento ? {
      codigo: equipamento.codigo,
      nome: equipamento.nome,
      imagem: equipamento.imagem || '',
      status: equipamento.status,
      exerciciosIds: [...(equipamento.exerciciosIds || [])],
      observacoes: equipamento.observacoes || '',
    } : formularioVazio())
    setErro('')
    setMensagem('')
    setFormularioAberto(true)
  }

  function selecionarExercicio(id, marcado) {
    setDados(atuais => ({
      ...atuais,
      exerciciosIds: marcado
        ? [...new Set([...atuais.exerciciosIds, id])]
        : atuais.exerciciosIds.filter(item => item !== id),
    }))
  }

  async function salvar(evento) {
    evento.preventDefault()
    if (salvando) return
    setErro('')

    const codigo = dados.codigo.trim()
    const nome = dados.nome.trim()

    if (!codigo || !nome) {
      setErro('Informe o código e o nome do equipamento.')
      return
    }

    if (!imagemValida(dados.imagem)) {
      setErro('Informe um endereço de imagem iniciado por http:// ou https://.')
      return
    }

    const duplicado = equipamentos.some(item =>
      item.id !== editandoId &&
      normalizar(item.codigo) === normalizar(codigo)
    )

    if (duplicado) {
      setErro('Já existe um equipamento com esse código.')
      return
    }

    if (!onSalvar) return

    try {
      setSalvando(true)
      await onSalvar({
        ...(editandoId !== null ? { id: editandoId } : {}),
        ...dados,
        codigo,
        nome,
        imagem: dados.imagem.trim(),
        observacoes: dados.observacoes.trim(),
      })
      setFormularioAberto(false)
      setMensagem('Equipamento salvo com sucesso.')
    } catch (error) {
      setErro(error.message || 'Não foi possível salvar o equipamento.')
    } finally {
      setSalvando(false)
    }
  }

  return (
    <LayoutAutenticado titulo="Gerenciar equipamentos" menu={menu}>
      <div className="space-y-6 text-[#142191]">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold tracking-wide text-[#004AF7]">
              ADMINISTRAÇÃO UNIFIT
            </p>
            <h2 className="mt-2 font-heading text-4xl font-bold">
              EQUIPAMENTOS DA ACADEMIA
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Gerencie os equipamentos, sua disponibilidade e os exercícios compatíveis.
            </p>
          </div>

          <button
            type="button"
            onClick={() => abrirFormulario()}
            className={botaoPrincipal}
          >
            <Plus size={18} aria-hidden="true" />
            Novo equipamento
          </button>
        </header>

        <div role="status" aria-live="polite">
          {mensagem && (
            <p className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
              {mensagem}
            </p>
          )}
        </div>

        <section
          aria-label="Pesquisa de equipamentos"
          className="grid gap-4 rounded-2xl bg-white p-6 shadow-sm sm:grid-cols-[1fr_220px]"
        >
          <div>
            <label htmlFor="busca-equipamento" className="text-sm font-semibold">
              Pesquisar equipamento
            </label>
            <div className="relative">
              <Search
                size={18}
                aria-hidden="true"
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                id="busca-equipamento"
                value={busca}
                onChange={evento => setBusca(evento.target.value)}
                placeholder="Nome ou código"
                className={`${campo} pl-10`}
              />
            </div>
          </div>

          <div>
            <label htmlFor="filtro-status" className="text-sm font-semibold">
              Status
            </label>
            <select
              id="filtro-status"
              value={filtroStatus}
              onChange={evento => setFiltroStatus(evento.target.value)}
              className={campo}
            >
              <option value="">Todos</option>
              {STATUS.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
        </section>

        {formularioAberto && (
          <section
            aria-labelledby="titulo-formulario"
            className="rounded-2xl bg-white p-6 shadow-sm"
          >
            <h2 id="titulo-formulario" className="font-heading text-2xl font-bold">
              {editandoId !== null ? 'Editar equipamento' : 'Novo equipamento'}
            </h2>

            <form onSubmit={salvar} className="mt-5 space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="codigo" className="text-sm font-semibold">
                    Código de identificação *
                  </label>
                  <input
                    id="codigo"
                    required
                    value={dados.codigo}
                    onChange={evento => alterar('codigo', evento.target.value)}
                    className={campo}
                  />
                </div>
                <div>
                  <label htmlFor="nome" className="text-sm font-semibold">
                    Nome *
                  </label>
                  <input
                    id="nome"
                    required
                    value={dados.nome}
                    onChange={evento => alterar('nome', evento.target.value)}
                    className={campo}
                  />
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="status" className="text-sm font-semibold">
                    Status
                  </label>
                  <select
                    id="status"
                    value={dados.status}
                    onChange={evento => alterar('status', evento.target.value)}
                    className={campo}
                  >
                    {STATUS.map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="imagem" className="text-sm font-semibold">
                    Endereço da imagem
                  </label>
                  <input
                    id="imagem"
                    type="url"
                    placeholder="https://..."
                    value={dados.imagem}
                    onChange={evento => alterar('imagem', evento.target.value)}
                    className={campo}
                  />
                </div>
              </div>

              <fieldset>
                <legend className="text-sm font-semibold">
                  Exercícios compatíveis
                </legend>
                {exercicios.length === 0 ? (
                  <p className="mt-2 rounded-lg bg-slate-50 p-4 text-sm text-slate-500">
                    Nenhum exercício disponível para associação.
                  </p>
                ) : (
                  <div className="mt-3 grid max-h-56 gap-3 overflow-y-auto rounded-lg border border-slate-200 p-4 sm:grid-cols-2">
                    {exercicios.map(exercicio => (
                      <label
                        key={exercicio.id}
                        className="flex items-center gap-3 text-sm text-slate-700"
                      >
                        <input
                          type="checkbox"
                          checked={dados.exerciciosIds.includes(exercicio.id)}
                          onChange={evento =>
                            selecionarExercicio(exercicio.id, evento.target.checked)
                          }
                          className="h-4 w-4 accent-[#004AF7]"
                        />
                        {exercicio.nome}
                      </label>
                    ))}
                  </div>
                )}
              </fieldset>

              <div>
                <label htmlFor="observacoes" className="text-sm font-semibold">
                  Observações
                </label>
                <textarea
                  id="observacoes"
                  rows={4}
                  value={dados.observacoes}
                  onChange={evento => alterar('observacoes', evento.target.value)}
                  className={`${campo} resize-y`}
                />
              </div>

              {dados.status === 'Em manutenção' && (
                <p className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                  A mudança pode afetar fichas que utilizam este equipamento.
                  Consulte o impacto após salvar.
                </p>
              )}

              {erro && (
                <p role="alert" className="text-sm text-red-700">{erro}</p>
              )}

              {!onSalvar && (
                <p id="salvar-indisponivel" className="text-sm text-slate-500">
                  O cadastro de equipamentos ainda não está disponível.
                </p>
              )}

              <div className="flex flex-wrap gap-3">
                <button
                  type="submit"
                  disabled={!onSalvar || salvando}
                  aria-describedby={!onSalvar ? 'salvar-indisponivel' : undefined}
                  className={botaoPrincipal}
                >
                  {salvando ? 'Salvando...' : 'Salvar equipamento'}
                </button>
                <button
                  type="button"
                  disabled={salvando}
                  onClick={() => setFormularioAberto(false)}
                  className={botao}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </section>
        )}

        <section
          aria-labelledby="titulo-listagem"
          className="overflow-hidden rounded-2xl bg-white shadow-sm"
        >
          <div className="flex items-center justify-between gap-3 p-6">
            <h2 id="titulo-listagem" className="font-heading text-2xl font-bold">
              Equipamentos
            </h2>
            <span className="text-sm text-slate-500">
              {filtrados.length} resultado(s)
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[740px] text-left text-sm">
              <thead className="bg-[#E4F2FD]">
                <tr>
                  {['Equipamento', 'Código', 'Status', 'Fichas afetadas', 'Ação'].map(titulo => (
                    <th key={titulo} scope="col" className="px-5 py-4 font-semibold">
                      {titulo}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtrados.map(equipamento => (
                  <tr
                    key={equipamento.id}
                    className={equipamento.status === 'Indisponível' ? 'bg-red-50/40' : ''}
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <ImagemEquipamento
                          key={equipamento.imagem || 'sem-imagem'}
                          imagem={equipamento.imagem}
                          nome={equipamento.nome}
                        />
                        <span className="font-semibold">{equipamento.nome}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      {equipamento.codigo}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-block whitespace-nowrap rounded-full border px-3 py-1 text-xs font-semibold ${
                        CORES_STATUS[equipamento.status] || 'bg-slate-100'
                      }`}>
                        {equipamento.status}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      {Array.isArray(equipamento.fichasAfetadas) ? (
                        equipamento.fichasAfetadas.length > 0 ? (
                          <button
                            type="button"
                            onClick={() => setImpactoId(equipamento.id)}
                            className="font-semibold text-[#004AF7] underline"
                          >
                            Ver {equipamento.fichasAfetadas.length} ficha(s)
                          </button>
                        ) : (
                          <span className="text-slate-500">Nenhuma</span>
                        )
                      ) : (
                        <span className="text-slate-500">Não consultado</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <button
                        type="button"
                        onClick={() => abrirFormulario(equipamento)}
                        className={botao}
                      >
                        Editar
                      </button>
                    </td>
                  </tr>
                ))}

                {filtrados.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                      {equipamentos.length === 0
                        ? 'Nenhum equipamento para exibir.'
                        : 'Nenhum equipamento encontrado para os filtros selecionados.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {comImpacto.map(equipamento => (
          <div
            key={equipamento.id}
            className="flex flex-wrap items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"
          >
            <Wrench size={20} aria-hidden="true" />
            <p className="flex-1">
              <strong>{equipamento.codigo} — {equipamento.nome}</strong>
              {' '}está {equipamento.status.toLowerCase()} e pode afetar{' '}
              {equipamento.fichasAfetadas.length} ficha(s).
            </p>
            <button
              type="button"
              onClick={() => setImpactoId(equipamento.id)}
              className="font-semibold underline"
            >
              Ver fichas afetadas
            </button>
          </div>
        ))}

        {equipamentoImpacto && (
          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-heading text-2xl font-bold">
                Fichas potencialmente afetadas
              </h2>
              <button type="button" onClick={() => setImpactoId(null)} className={botao}>
                Fechar
              </button>
            </div>
            <p className="mt-2 text-sm text-slate-600">
              {equipamentoImpacto.codigo} — {equipamentoImpacto.nome}
            </p>
            <ul className="mt-4 divide-y divide-slate-100">
              {(equipamentoImpacto.fichasAfetadas || []).map(ficha => (
                <li key={ficha.id} className="py-3">
                  <p className="text-sm font-semibold">{ficha.nome}</p>
                  <p className="mt-1 text-sm text-slate-500">{ficha.aluno}</p>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </LayoutAutenticado>
  )
}