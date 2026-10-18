import { useMemo, useState } from 'react'
import { Eye, Pencil, Plus, Search, SlidersHorizontal, Trash2, X } from 'lucide-react'

const exercicios = []
const vazio = { nome: '', principal: '', secundarios: '', equipamento: '', nivel: 'Iniciante', instrucoes: '', imagem: '', video: '', ativo: true }
const campo = 'mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-[#004AF7] focus:ring-2 focus:ring-[#87B7FF]'
const primario = 'inline-flex items-center justify-center gap-2 rounded-lg bg-[#004AF7] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#142191]'
const secundario = 'inline-flex items-center justify-center gap-2 rounded-lg border border-[#87B7FF] bg-white px-4 py-2.5 text-sm font-semibold text-[#142191] hover:bg-[#E4F2FD]'

function CampoAdmin({ titulo, nome, obrigatorio = false, children, form, alterar }) {
  return <label className="block text-sm font-semibold text-[#142191]">{titulo}{obrigatorio && ' *'}{children ?? <input required={obrigatorio} value={form[nome]} onChange={e => alterar(nome, e.target.value)} className={campo} />}</label>
}

export default function AdminExercicios() {
  const [lista, setLista] = useState(exercicios)
  const [busca, setBusca] = useState('')
  const [situacao, setSituacao] = useState('todos')
  const [editando, setEditando] = useState(null)
  const [form, setForm] = useState(vazio)
  const [visualizando, setVisualizando] = useState(null)
  const [mensagem, setMensagem] = useState('')
  const filtrados = useMemo(() => lista.filter(e => {
    const corresponde = `${e.nome} ${e.principal} ${e.equipamento}`.toLowerCase().includes(busca.toLowerCase())
    return corresponde && (situacao === 'todos' || (situacao === 'ativos' ? e.ativo : !e.ativo))
  }), [lista, busca, situacao])
  function abrirNovo() { setEditando('novo'); setForm({ ...vazio }); setMensagem('') }
  function abrirEdicao(item) { setEditando(item.id); setForm({ ...item }); setMensagem('') }
  function alterar(campo, valor) { setForm(prev => ({ ...prev, [campo]: valor })) }
  function salvar(evento) {
    evento.preventDefault()
    if (!form.nome.trim() || !form.principal.trim() || !form.equipamento.trim() || !form.instrucoes.trim()) { setMensagem('Preencha nome, músculo principal, equipamento e instruções.'); return }
    if (editando === 'novo') setLista(prev => [{ ...form, id: Date.now() }, ...prev])
    else setLista(prev => prev.map(e => e.id === editando ? { ...form, id: editando } : e))
    setEditando(null)
    setMensagem('Alteração realizada apenas nesta demonstração. Nada foi salvo no servidor.')
  }
  function alterarSituacao(item) {
    const acao = item.ativo ? 'desativar' : 'ativar'
    if (!window.confirm(`Deseja ${acao} o exercício "${item.nome}"?`)) return
    setLista(prev => prev.map(e => e.id === item.id ? { ...e, ativo: !e.ativo } : e))
    setMensagem('Situação alterada somente na interface demonstrativa.')
  }
  return <div className="min-h-screen bg-[#E4F2FD] px-4 py-8 sm:px-6 lg:px-10"><main className="mx-auto w-full max-w-7xl"><header className="mb-7 border-b border-[#87B7FF] pb-5"><p className="text-xs font-bold uppercase tracking-widest text-[#004AF7]">UNIFIT</p><h1 className="mt-1 font-heading text-4xl font-bold text-[#142191]">Administração de exercícios</h1><p className="mt-2 text-sm text-slate-600">Cadastre, edite e gerencie a biblioteca de exercícios.</p></header>
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3"><p className="text-sm text-slate-600">Gerencie a biblioteca de exercícios da academia.</p><button onClick={abrirNovo} className={primario}><Plus size={18} /> Novo exercício</button></div>
      {mensagem && <div role="status" className="rounded-lg border border-[#87B7FF] bg-[#E4F2FD] p-3 text-sm text-[#142191]">{mensagem}</div>}
      <div className="grid gap-3 rounded-xl bg-white p-4 shadow-sm sm:grid-cols-[1fr_180px]">
        <label className="relative"><span className="sr-only">Pesquisar exercícios</span><Search size={18} className="absolute left-3 top-3 text-slate-400" /><input value={busca} onChange={e => setBusca(e.target.value)} placeholder="Pesquisar nome, músculo ou equipamento" className={`${campo} mt-0 pl-10`} /></label>
        <label><span className="sr-only">Filtrar por situação</span><select value={situacao} onChange={e => setSituacao(e.target.value)} className={`${campo} mt-0`}><option value="todos">Todos</option><option value="ativos">Ativos</option><option value="inativos">Inativos</option></select></label>
      </div>
      <div className="overflow-x-auto rounded-xl bg-white shadow-sm"><table className="w-full min-w-[730px] text-left text-sm"><thead className="bg-[#E4F2FD] text-[#142191]"><tr>{['Exercício', 'Músculo', 'Equipamento', 'Nível', 'Situação', 'Ações'].map(c => <th key={c} className="px-4 py-3 font-semibold">{c}</th>)}</tr></thead><tbody>{filtrados.map(e => <tr key={e.id} className="border-t border-slate-100 text-slate-700"><td className="px-4 py-3 font-semibold text-[#142191]">{e.nome}</td><td className="px-4 py-3">{e.principal}</td><td className="px-4 py-3">{e.equipamento}</td><td className="px-4 py-3">{e.nivel}</td><td className="px-4 py-3"><span className={`rounded-full px-3 py-1 text-xs font-semibold ${e.ativo ? 'bg-[#E4F2FD] text-[#142191]' : 'bg-slate-100 text-slate-600'}`}>{e.ativo ? 'Ativo' : 'Inativo'}</span></td><td className="px-4 py-3"><div className="flex gap-1"><button title="Visualizar" aria-label={`Visualizar ${e.nome}`} onClick={() => setVisualizando(e)} className="rounded p-2 hover:bg-[#E4F2FD]"><Eye size={17} /></button><button title="Editar" aria-label={`Editar ${e.nome}`} onClick={() => abrirEdicao(e)} className="rounded p-2 hover:bg-[#E4F2FD]"><Pencil size={17} /></button><button title={e.ativo ? 'Desativar' : 'Ativar'} aria-label={`${e.ativo ? 'Desativar' : 'Ativar'} ${e.nome}`} onClick={() => alterarSituacao(e)} className="rounded p-2 text-[#004AF7] hover:bg-[#E4F2FD]"><SlidersHorizontal size={17} /></button></div></td></tr>)}{filtrados.length === 0 && <tr><td colSpan={6} className="p-8 text-center text-slate-500">Nenhum exercício encontrado.</td></tr>}</tbody></table></div>
      <p className="text-xs text-slate-500">Exclusão permanente foi substituída por ativação/desativação para preservar históricos vinculados às fichas.</p>
    </div>
    {editando !== null && <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 p-4" role="presentation" onMouseDown={e => { if (e.target === e.currentTarget) setEditando(null) }}><section role="dialog" aria-modal="true" aria-label="Cadastro de exercício" className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl"><div className="flex items-center justify-between"><h2 className="font-heading text-3xl font-bold text-[#142191]">{editando === 'novo' ? 'Novo exercício' : 'Editar exercício'}</h2><button aria-label="Fechar formulário" onClick={() => setEditando(null)}><X size={22} /></button></div><form onSubmit={salvar} className="mt-5 space-y-4"><div className="grid gap-4 sm:grid-cols-2"><CampoAdmin form={form} alterar={alterar} titulo="Nome" nome="nome" obrigatorio /><CampoAdmin form={form} alterar={alterar} titulo="Músculo principal" nome="principal" obrigatorio /><CampoAdmin form={form} alterar={alterar} titulo="Músculos secundários" nome="secundarios" /><CampoAdmin form={form} alterar={alterar} titulo="Equipamento" nome="equipamento" obrigatorio /><CampoAdmin form={form} alterar={alterar} titulo="Nível" nome="nivel"><select value={form.nivel} onChange={e => alterar('nivel', e.target.value)} className={campo}><option>Iniciante</option><option>Intermediário</option><option>Avançado</option></select></CampoAdmin><CampoAdmin form={form} alterar={alterar} titulo="Link da imagem" nome="imagem" /><CampoAdmin form={form} alterar={alterar} titulo="Link do vídeo" nome="video" /></div><CampoAdmin form={form} alterar={alterar} titulo="Instruções passo a passo" nome="instrucoes" obrigatorio><textarea required rows={4} value={form.instrucoes} onChange={e => alterar('instrucoes', e.target.value)} className={campo} placeholder="Descreva os passos de execução" /></CampoAdmin><label className="flex items-center gap-2 text-sm text-[#142191]"><input type="checkbox" checked={form.ativo} onChange={e => alterar('ativo', e.target.checked)} className="accent-[#004AF7]" /> Exercício ativo</label><div className="flex flex-wrap justify-end gap-2"><button type="button" onClick={() => setEditando(null)} className={secundario}>Cancelar</button><button type="submit" className={primario}>Salvar exercício</button></div></form></section></div>}
    {visualizando && <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 p-4" role="presentation" onMouseDown={e => { if (e.target === e.currentTarget) setVisualizando(null) }}><section role="dialog" aria-modal="true" aria-label="Prévia do exercício" className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl"><div className="flex items-center justify-between"><h2 className="font-heading text-3xl font-bold text-[#142191]">Prévia do exercício</h2><button aria-label="Fechar prévia" onClick={() => setVisualizando(null)}><X size={22} /></button></div><h3 className="mt-4 text-lg font-bold text-[#142191]">{visualizando.nome}</h3><p className="mt-2 text-sm text-slate-700">{visualizando.principal} · {visualizando.equipamento} · {visualizando.nivel}</p><p className="mt-4 whitespace-pre-line text-sm leading-6 text-slate-700">{visualizando.instrucoes}</p><p className="mt-3 text-xs text-slate-500">Imagem: {visualizando.imagem || 'não cadastrada'} · Vídeo: {visualizando.video || 'não cadastrado'}</p><button onClick={() => setVisualizando(null)} className={`mt-5 ${primario}`}>Fechar</button></section></div>}
  </main></div>
}