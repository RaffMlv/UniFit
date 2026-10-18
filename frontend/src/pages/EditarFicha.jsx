import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowDown, ArrowLeft, ArrowUp, BookOpen, Check, ClipboardList, Eye, Plus, Save, Search, Trash2, X } from 'lucide-react'

const COR = '#004AF7'
const bibliotecaInicial = [
  { id: 'supino', nome: 'Supino reto', musculo: 'Peitoral', equipamento: 'Barra' },
  { id: 'puxada', nome: 'Puxada alta', musculo: 'Costas', equipamento: 'Polia' },
  { id: 'agachamento', nome: 'Agachamento livre', musculo: 'Quadríceps', equipamento: 'Barra' },
  { id: 'rosca', nome: 'Rosca direta', musculo: 'Bíceps', equipamento: 'Barra' },
  { id: 'triceps', nome: 'Tríceps na polia', musculo: 'Tríceps', equipamento: 'Polia' },
  { id: 'legpress', nome: 'Leg press', musculo: 'Quadríceps', equipamento: 'Máquina' },
]
const criarItem = (ex) => ({ ...ex, uid: `${ex.id}-${Date.now()}-${Math.random()}`, series: '3', repeticoes: '12', carga: '', descanso: '60', observacoes: '' })
const letraDivisao = (numero) => 'ABCDEF'[numero]

export default function EditarFicha() {
  const navigate = useNavigate()
  const [aluno, setAluno] = useState('Aluno selecionado')
  const [nome, setNome] = useState('Ficha de hipertrofia')
  const [objetivo, setObjetivo] = useState('Hipertrofia')
  const [divisoes, setDivisoes] = useState([{ id: 'A', exercicios: [criarItem(bibliotecaInicial[0])] }])
  const [ativa, setAtiva] = useState('A')
  const [modalBiblioteca, setModalBiblioteca] = useState(false)
  const [busca, setBusca] = useState('')
  const [revisao, setRevisao] = useState(false)
  const [mensagem, setMensagem] = useState('')
  const divisaoAtual = divisoes.find(d => d.id === ativa)
  const encontrados = useMemo(() => bibliotecaInicial.filter(e => `${e.nome} ${e.musculo} ${e.equipamento}`.toLocaleLowerCase('pt-BR').includes(busca.toLocaleLowerCase('pt-BR'))), [busca])

  function editarExercicio(uid, campo, valor) {
    setDivisoes(anteriores => anteriores.map(d => d.id !== ativa ? d : ({ ...d, exercicios: d.exercicios.map(e => e.uid === uid ? { ...e, [campo]: valor } : e) })))
  }
  function incluirExercicio(exercicio) {
    setDivisoes(anteriores => anteriores.map(d => d.id !== ativa ? d : { ...d, exercicios: [...d.exercicios, criarItem(exercicio)] }))
    setModalBiblioteca(false)
    setBusca('')
    setMensagem('Exercício adicionado.')
  }
  function removerExercicio(uid) {
    setDivisoes(anteriores => anteriores.map(d => d.id !== ativa ? d : { ...d, exercicios: d.exercicios.filter(e => e.uid !== uid) }))
  }
  function moverExercicio(indice, direcao) {
    setDivisoes(anteriores => anteriores.map(d => {
      if (d.id !== ativa) return d
      const lista = [...d.exercicios]
      const destino = indice + direcao
      if (destino < 0 || destino >= lista.length) return d
      ;[lista[indice], lista[destino]] = [lista[destino], lista[indice]]
      return { ...d, exercicios: lista }
    }))
  }
  function adicionarDivisao() {
    if (divisoes.length === 6) return
    const id = letraDivisao(divisoes.length)
    setDivisoes(anteriores => [...anteriores, { id, exercicios: [] }])
    setAtiva(id)
  }
  function salvarRascunho() {
    setMensagem('Rascunho salvo.')
  }
  function revisarPublicacao() {
    if (!nome.trim() || !objetivo.trim() || divisoes.some(d => d.exercicios.length === 0)) {
      setMensagem('Informe nome e objetivo e adicione pelo menos um exercício a cada divisão.')
      return
    }
    setRevisao(true)
  }
  const campo = 'w-full min-w-0 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-[#004AF7] focus:ring-2 focus:ring-[#87B7FF]'
  const botaoPrimario = 'inline-flex items-center justify-center gap-2 rounded-lg bg-[#004AF7] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#142191]'
  const botaoSecundario = 'inline-flex items-center justify-center gap-2 rounded-lg border border-[#87B7FF] bg-white px-4 py-2.5 text-sm font-medium text-[#142191] hover:bg-[#E4F2FD]'
  return (
    <div className="min-h-screen bg-[#E4F2FD] px-4 py-8 sm:px-6 lg:px-10"><main className="mx-auto w-full max-w-7xl"><header className="mb-7 border-b border-[#87B7FF] pb-5"><p className="text-xs font-bold uppercase tracking-widest text-[#004AF7]">UNIFIT</p><h1 className="mt-1 font-heading text-4xl font-bold text-[#142191]">Editor de fichas</h1><p className="mt-2 text-sm text-slate-600">Crie e revise divisões de treino para os alunos.</p></header>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-slate-600">Monte a ficha do aluno, organize as divisões e revise antes de publicar.</p>
          <button type="button" className={botaoSecundario} onClick={() => navigate(-1)}><ArrowLeft size={16} /> Voltar</button>
        </div>
        {mensagem && <div role="status" className="rounded-lg border border-[#87B7FF] bg-[#E4F2FD] px-4 py-3 text-sm text-[#142191]">{mensagem}</div>}
        <section className="grid gap-4 rounded-xl bg-white p-5 shadow-sm md:grid-cols-3">
          <label className="text-sm font-semibold text-[#142191]">Aluno selecionado<input value={aluno} onChange={e => setAluno(e.target.value)} className={`mt-2 ${campo}`} /></label>
          <label className="text-sm font-semibold text-[#142191]">Nome da ficha<input value={nome} onChange={e => setNome(e.target.value)} className={`mt-2 ${campo}`} /></label>
          <label className="text-sm font-semibold text-[#142191]">Objetivo<input value={objetivo} onChange={e => setObjetivo(e.target.value)} className={`mt-2 ${campo}`} /></label>
        </section>
        <section className="rounded-xl bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-heading text-3xl font-bold text-[#142191]">Divisões de treino</h2>
            <button type="button" disabled={divisoes.length === 6} onClick={adicionarDivisao} className={`${botaoSecundario} disabled:cursor-not-allowed disabled:opacity-50`}><Plus size={16} /> Adicionar divisão</button>
          </div>
          <div role="tablist" aria-label="Divisões" className="mt-4 flex flex-wrap gap-2">
            {divisoes.map(d => <button key={d.id} type="button" role="tab" aria-selected={ativa === d.id} onClick={() => setAtiva(d.id)} className={`rounded-lg px-5 py-2 text-sm font-semibold ${ativa === d.id ? 'bg-[#004AF7] text-white' : 'bg-[#E4F2FD] text-[#142191]'}`}>Treino {d.id}</button>)}
          </div>
          <div className="mt-5 space-y-4">
            {divisaoAtual?.exercicios.length === 0 && <p className="rounded-lg border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">Nenhum exercício nesta divisão.</p>}
            {divisaoAtual?.exercicios.map((ex, indice) => <article key={ex.uid} className="rounded-xl border border-slate-200 p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div><h3 className="font-semibold text-[#142191]">{indice + 1}. {ex.nome}</h3><p className="text-xs text-slate-500">{ex.musculo} · {ex.equipamento}</p></div>
                <div className="flex gap-1">
                  <button aria-label="Mover para cima" disabled={indice === 0} onClick={() => moverExercicio(indice, -1)} className="rounded p-2 hover:bg-[#E4F2FD] disabled:opacity-30"><ArrowUp size={18} /></button>
                  <button aria-label="Mover para baixo" disabled={indice === divisaoAtual.exercicios.length - 1} onClick={() => moverExercicio(indice, 1)} className="rounded p-2 hover:bg-[#E4F2FD] disabled:opacity-30"><ArrowDown size={18} /></button>
                  <button aria-label={`Remover ${ex.nome}`} onClick={() => removerExercicio(ex.uid)} className="rounded p-2 text-red-600 hover:bg-red-50"><Trash2 size={18} />
		</button>
                </div>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {[['Séries', 'series'], ['Repetições', 'repeticoes'], ['Carga inicial (kg)', 'carga'], ['Descanso (segundos)', 'descanso']].map(([rotulo, chave]) => <label key={chave} className="text-xs font-semibold text-[#142191]">{rotulo}<input type="number" min="0" value={ex[chave]} onChange={e => editarExercicio(ex.uid, chave, e.target.value)} className={`mt-1 ${campo}`} /></label>)}
              </div>
              <label className="mt-3 block text-xs font-semibold text-[#142191]">Observações<textarea rows={2} value={ex.observacoes} onChange={e => editarExercicio(ex.uid, 'observacoes', e.target.value)} placeholder="Instruções e ajustes deste exercício" className={`mt-1 ${campo}`} /></label>
            </article>)}
          </div>
          <button type="button" className={`mt-5 ${botaoPrimario}`} onClick={() => setModalBiblioteca(true)}><Plus size={17} /> 
		Adicionar exercício
	</button>
        </section>
        <div className="flex flex-wrap justify-end gap-3">
          <button type="button" onClick={salvarRascunho} className={botaoSecundario}><Save size={17} /> Salvar rascunho</button>
          <button type="button" onClick={revisarPublicacao} className={botaoPrimario}><Eye size={17} /> Revisar ficha</button>
        </div>
      </div>
      {modalBiblioteca && <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 p-4" role="presentation" onMouseDown={e => { if (e.target === e.currentTarget) setModalBiblioteca(false) }}>
        <section role="dialog" aria-modal="true" aria-label="Adicionar exercício da biblioteca" className="max-h-[85vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white p-5 shadow-xl">
          <div className="flex items-center justify-between"><h2 className="font-heading text-3xl font-bold text-[#142191]">Biblioteca de exercícios</h2><button aria-label="Fechar" onClick={() => setModalBiblioteca(false)}><X size={22} /></button></div>
          <div className="relative mt-4"><Search size={18} className="absolute left-3 top-3 text-slate-400" /><input autoFocus value={busca} onChange={e => setBusca(e.target.value)} placeholder="Pesquisar exercício, músculo ou equipamento" className={`${campo} pl-10`} /></div>
          <div className="mt-4 space-y-2">{encontrados.map(ex => <div key={ex.id} className="flex items-center justify-between gap-3 rounded-lg border p-3"><div><p className="font-semibold text-[#142191]">{ex.nome}</p><p className="text-xs text-slate-500">{ex.musculo} · {ex.equipamento}</p></div><button onClick={() => incluirExercicio(ex)} className={botaoPrimario}><Plus size={16} /> Incluir</button></div>)}{encontrados.length === 0 && <p className="py-5 text-center text-slate-500">Nenhum exercício encontrado.</p>}</div>
        </section>
      </div>}
      {revisao && <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 p-4" role="presentation" onMouseDown={e => { if (e.target === e.currentTarget) setRevisao(false) }}><section role="dialog" aria-modal="true" aria-label="Revisão da ficha" className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
        <h2 className="font-heading text-3xl font-bold text-[#142191]">Revisar ficha</h2>
        <p className="mt-2 text-sm text-slate-600">{aluno} · {nome} · {objetivo}</p>
        {divisoes.map(d => <div key={d.id} className="mt-4 rounded-lg bg-[#E4F2FD] p-3"><p className="font-bold text-[#142191]">Treino {d.id}</p>{d.exercicios.map(e => <p key={e.uid} className="mt-1 text-sm text-[#142191]">{e.nome} · {e.series} x {e.repeticoes}</p>)}</div>)}
        <p className="mt-4 text-xs text-slate-500">Publicação e aprovação dependem do fluxo e das permissões configuradas no servidor.</p>
        <div className="mt-5 flex flex-wrap justify-end gap-2"><button onClick={() => setRevisao(false)} className={botaoSecundario}>Voltar para editar</button><button onClick={() => { setRevisao(false); setMensagem('Ficha revisada. Envio para aprovação/publicação depende da API.') }} className={botaoPrimario}><Check size={16} /> Concluir revisão</button></div>
      </section></div>}
    </main></div>
  )
}