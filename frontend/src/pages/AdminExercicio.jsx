import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Eye, Pencil, Plus, Search, SlidersHorizontal, X } from 'lucide-react'
import LayoutAutenticado from '@/components/ui/LayoutAutenticado'
import { api } from '@/services/api'

const vazio = {
  nome: '', musculo: '', secundarios: '', equipamento: '', nivel: 'Iniciante',
  categoria: 'Força', instrucoes: '', observacoes: '', imagem: '', video: '', ativo: true,
}
const campo = 'mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-[#004AF7] focus:ring-2 focus:ring-[#87B7FF]'
const primario = 'inline-flex items-center justify-center gap-2 rounded-lg bg-[#004AF7] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#142191] disabled:cursor-not-allowed disabled:opacity-60'
const secundario = 'inline-flex items-center justify-center gap-2 rounded-lg border border-[#87B7FF] bg-white px-4 py-2.5 text-sm font-semibold text-[#142191] hover:bg-[#E4F2FD]'

function CampoAdmin({ titulo, nome, obrigatorio = false, tipo = 'text', children, form, alterar }) {
  return (
    <label className="block text-sm font-semibold text-[#142191]">
      {titulo}{obrigatorio && ' *'}
      {children ?? (
        <input
          type={tipo}
          required={obrigatorio}
          value={form[nome]}
          onChange={(e) => alterar(nome, e.target.value)}
          className={campo}
        />
      )}
    </label>
  )
}

export default function AdminExercicios() {
  const [lista, setLista] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erroCarga, setErroCarga] = useState('')
  const [busca, setBusca] = useState('')
  const [situacao, setSituacao] = useState('todos')
  const [editando, setEditando] = useState(null) // null = fechado, 'novo' ou o id
  const [form, setForm] = useState(vazio)
  const [visualizando, setVisualizando] = useState(null)
  const [aviso, setAviso] = useState(null) // { tipo: 'ok' | 'erro', texto }
  const [erroForm, setErroForm] = useState('')
  const [enviando, setEnviando] = useState(false)

  const carregar = useCallback(async () => {
    setErroCarga('')
    try {
      const dados = await api('/exercicios?situacao=todos&limite=100')
      setLista(dados.itens)
    } catch (err) {
      setErroCarga(err.message)
    } finally {
      setCarregando(false)
    }
  }, [])

  useEffect(() => { carregar() }, [carregar])

  // Esc fecha qualquer janela aberta.
  useEffect(() => {
    function aoTeclar(e) {
      if (e.key === 'Escape') { setEditando(null); setVisualizando(null) }
    }
    document.addEventListener('keydown', aoTeclar)
    return () => document.removeEventListener('keydown', aoTeclar)
  }, [])

  const filtrados = useMemo(() => {
    const termo = busca.trim().toLowerCase()
    return lista.filter((e) => {
      const corresponde = `${e.nome} ${e.musculo} ${e.equipamento}`.toLowerCase().includes(termo)
      return corresponde && (situacao === 'todos' || (situacao === 'ativos' ? e.ativo : !e.ativo))
    })
  }, [lista, busca, situacao])

  function alterar(nome, valor) { setForm((prev) => ({ ...prev, [nome]: valor })) }

  function abrirNovo() {
    setEditando('novo'); setForm({ ...vazio }); setErroForm(''); setAviso(null)
  }

  function abrirEdicao(item) {
    setEditando(item.id); setErroForm(''); setAviso(null)
    setForm({
      nome: item.nome, musculo: item.musculo, secundarios: item.secundarios ?? '',
      equipamento: item.equipamento, nivel: item.nivel, categoria: item.categoria,
      instrucoes: item.instrucoes, observacoes: item.observacoes ?? '',
      imagem: item.imagem ?? '', video: item.video ?? '', ativo: item.ativo,
    })
  }

  async function salvar(evento) {
    evento.preventDefault()
    if (enviando) return
    if (!form.nome.trim() || !form.musculo.trim() || !form.equipamento.trim() || !form.instrucoes.trim()) {
      setErroForm('Preencha nome, músculo principal, equipamento e instruções.')
      return
    }
    setEnviando(true)
    setErroForm('')
    try {
      const novo = editando === 'novo'
      await api(novo ? '/exercicios' : `/exercicios/${editando}`, {
        method: novo ? 'POST' : 'PUT',
        body: form,
      })
      setEditando(null)
      setAviso({ tipo: 'ok', texto: novo ? 'Exercício cadastrado.' : 'Exercício atualizado.' })
      await carregar()
    } catch (err) {
      setErroForm(err.message) // ex.: "Já existe um exercício com esse nome"
    } finally {
      setEnviando(false)
    }
  }

  async function alterarSituacao(item) {
    const acao = item.ativo ? 'desativar' : 'ativar'
    if (!window.confirm(`Deseja ${acao} o exercício "${item.nome}"?`)) return
    try {
      await api(`/exercicios/${item.id}/situacao`, { method: 'PATCH', body: { ativo: !item.ativo } })
      setLista((prev) => prev.map((e) => (e.id === item.id ? { ...e, ativo: !e.ativo } : e)))
      setAviso({
        tipo: 'ok',
        texto: item.ativo ? 'Exercício desativado. Ele deixa de aparecer para os alunos.' : 'Exercício ativado.',
      })
    } catch (err) {
      setAviso({ tipo: 'erro', texto: err.message })
    }
  }

  return (
    <LayoutAutenticado titulo="Administração de exercícios">
      <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-slate-600">Cadastre, edite e gerencie a biblioteca de exercícios da academia.</p>
          <button type="button" onClick={abrirNovo} className={primario}><Plus size={18} aria-hidden="true" /> Novo exercício</button>
        </div>

        {aviso && (
          <div
            role={aviso.tipo === 'erro' ? 'alert' : 'status'}
            className={`rounded-lg border p-3 text-sm ${aviso.tipo === 'erro' ? 'border-red-200 bg-red-50 text-red-700' : 'border-[#87B7FF] bg-[#E4F2FD] text-[#142191]'}`}
          >
            {aviso.texto}
          </div>
        )}

        <div className="grid gap-3 rounded-xl bg-white p-4 shadow-sm sm:grid-cols-[1fr_180px]">
          <label className="relative">
            <span className="sr-only">Pesquisar exercícios</span>
            <Search size={18} className="absolute left-3 top-3 text-slate-400" aria-hidden="true" />
            <input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Pesquisar nome, músculo ou equipamento" className={`${campo} mt-0 pl-10`} />
          </label>
          <label>
            <span className="sr-only">Filtrar por situação</span>
            <select value={situacao} onChange={(e) => setSituacao(e.target.value)} className={`${campo} mt-0`}>
              <option value="todos">Todos</option>
              <option value="ativos">Ativos</option>
              <option value="inativos">Inativos</option>
            </select>
          </label>
        </div>

        {carregando && <p className="rounded-xl bg-white p-6 text-sm text-[#142191]">Carregando exercícios...</p>}
        {erroCarga && <p role="alert" className="rounded-xl bg-red-50 p-6 text-sm text-red-700">{erroCarga}</p>}

        {!carregando && !erroCarga && (
          <div className="overflow-x-auto rounded-xl bg-white shadow-sm">
            <table className="w-full min-w-[730px] text-left text-sm">
              <thead className="bg-[#E4F2FD] text-[#142191]">
                <tr>
                  {['Exercício', 'Músculo', 'Equipamento', 'Nível', 'Situação', 'Ações'].map((c) => (
                    <th key={c} className="px-4 py-3 font-semibold">{c}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtrados.map((e) => (
                  <tr key={e.id} className="border-t border-slate-100 text-slate-700">
                    <td className="px-4 py-3 font-semibold text-[#142191]">{e.nome}</td>
                    <td className="px-4 py-3">{e.musculo}</td>
                    <td className="px-4 py-3">{e.equipamento}</td>
                    <td className="px-4 py-3">{e.nivel}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${e.ativo ? 'bg-[#E4F2FD] text-[#142191]' : 'bg-slate-100 text-slate-600'}`}>
                        {e.ativo ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button type="button" title="Visualizar" aria-label={`Visualizar ${e.nome}`} onClick={() => setVisualizando(e)} className="rounded p-2 hover:bg-[#E4F2FD]"><Eye size={17} aria-hidden="true" /></button>
                        <button type="button" title="Editar" aria-label={`Editar ${e.nome}`} onClick={() => abrirEdicao(e)} className="rounded p-2 hover:bg-[#E4F2FD]"><Pencil size={17} aria-hidden="true" /></button>
                        <button type="button" title={e.ativo ? 'Desativar' : 'Ativar'} aria-label={`${e.ativo ? 'Desativar' : 'Ativar'} ${e.nome}`} onClick={() => alterarSituacao(e)} className="rounded p-2 text-[#004AF7] hover:bg-[#E4F2FD]"><SlidersHorizontal size={17} aria-hidden="true" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtrados.length === 0 && (
                  <tr><td colSpan={6} className="p-8 text-center text-slate-500">Nenhum exercício encontrado.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        <p className="text-xs text-slate-500">
          A exclusão permanente foi substituída por ativação e desativação, para preservar o histórico das fichas.
        </p>
      </div>

      {editando !== null && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 p-4" role="presentation"
          onMouseDown={(e) => { if (e.target === e.currentTarget) setEditando(null) }}>
          <section role="dialog" aria-modal="true" aria-label="Cadastro de exercício" className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <h2 className="font-heading text-3xl font-bold text-[#142191]">{editando === 'novo' ? 'Novo exercício' : 'Editar exercício'}</h2>
              <button type="button" aria-label="Fechar formulário" onClick={() => setEditando(null)}><X size={22} aria-hidden="true" /></button>
            </div>

            <form onSubmit={salvar} className="mt-5 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <CampoAdmin form={form} alterar={alterar} titulo="Nome" nome="nome" obrigatorio />
                <CampoAdmin form={form} alterar={alterar} titulo="Músculo principal" nome="musculo" obrigatorio />
                <CampoAdmin form={form} alterar={alterar} titulo="Músculos secundários (separe por vírgula)" nome="secundarios" />
                <CampoAdmin form={form} alterar={alterar} titulo="Equipamento" nome="equipamento" obrigatorio />
                <CampoAdmin form={form} alterar={alterar} titulo="Nível" nome="nivel">
                  <select value={form.nivel} onChange={(e) => alterar('nivel', e.target.value)} className={campo}>
                    <option>Iniciante</option><option>Intermediário</option><option>Avançado</option>
                  </select>
                </CampoAdmin>
                <CampoAdmin form={form} alterar={alterar} titulo="Categoria" nome="categoria" obrigatorio />
                <CampoAdmin form={form} alterar={alterar} titulo="Link da imagem (https://...)" nome="imagem" tipo="url" />
                <CampoAdmin form={form} alterar={alterar} titulo="Link do vídeo (https://...)" nome="video" tipo="url" />
              </div>

              <CampoAdmin form={form} alterar={alterar} titulo="Instruções passo a passo" nome="instrucoes" obrigatorio>
                <textarea required rows={5} value={form.instrucoes} onChange={(e) => alterar('instrucoes', e.target.value)} className={campo} placeholder="Escreva um passo por linha" />
              </CampoAdmin>
              <CampoAdmin form={form} alterar={alterar} titulo="Observações" nome="observacoes">
                <textarea rows={2} value={form.observacoes} onChange={(e) => alterar('observacoes', e.target.value)} className={campo} />
              </CampoAdmin>

              <label className="flex items-center gap-2 text-sm text-[#142191]">
                <input type="checkbox" checked={form.ativo} onChange={(e) => alterar('ativo', e.target.checked)} className="accent-[#004AF7]" /> Exercício ativo
              </label>

              {erroForm && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{erroForm}</p>}

              <div className="flex flex-wrap justify-end gap-2">
                <button type="button" onClick={() => setEditando(null)} className={secundario}>Cancelar</button>
                <button type="submit" disabled={enviando} className={primario}>{enviando ? 'Salvando...' : 'Salvar exercício'}</button>
              </div>
            </form>
          </section>
        </div>
      )}

      {visualizando && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 p-4" role="presentation"
          onMouseDown={(e) => { if (e.target === e.currentTarget) setVisualizando(null) }}>
          <section role="dialog" aria-modal="true" aria-label="Prévia do exercício" className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <h2 className="font-heading text-3xl font-bold text-[#142191]">Prévia do exercício</h2>
              <button type="button" aria-label="Fechar prévia" onClick={() => setVisualizando(null)}><X size={22} aria-hidden="true" /></button>
            </div>
            <h3 className="mt-4 text-lg font-bold text-[#142191]">{visualizando.nome}</h3>
            <p className="mt-2 text-sm text-slate-700">{visualizando.musculo} · {visualizando.equipamento} · {visualizando.nivel}</p>
            <p className="mt-4 whitespace-pre-line text-sm leading-6 text-slate-700">{visualizando.instrucoes}</p>
            <p className="mt-3 break-all text-xs text-slate-500">
              Imagem: {visualizando.imagem || 'não cadastrada'} · Vídeo: {visualizando.video || 'não cadastrado'}
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Link to={`/exercicios/${visualizando.id}`} className={primario}>Abrir como o aluno vê</Link>
              <button type="button" onClick={() => setVisualizando(null)} className={secundario}>Fechar</button>
            </div>
          </section>
        </div>
      )}
    </LayoutAutenticado>
  )
}