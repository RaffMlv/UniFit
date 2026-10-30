import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowDown, ArrowLeft, ArrowUp, Check, Eye, Plus, Save, Search, Trash2, X } from 'lucide-react'
import LayoutAutenticado from '@/components/ui/LayoutAutenticado'
import { api } from '@/services/api'

const LETRAS = 'ABCDEF'
const campo = 'w-full min-w-0 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-[#004AF7] focus:ring-2 focus:ring-[#87B7FF]'
const botaoPrimario = 'inline-flex items-center justify-center gap-2 rounded-lg bg-[#004AF7] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#142191] disabled:cursor-not-allowed disabled:opacity-60'
const botaoSecundario = 'inline-flex items-center justify-center gap-2 rounded-lg border border-[#87B7FF] bg-white px-4 py-2.5 text-sm font-medium text-[#142191] hover:bg-[#E4F2FD] disabled:cursor-not-allowed disabled:opacity-60'

let sequencia = 0
const novoUid = () => `i${++sequencia}`
const criarItem = (ex) => ({
  uid: novoUid(), exercicioId: ex.id, nome: ex.nome, musculo: ex.musculo, equipamento: ex.equipamento,
  series: '3', repeticoes: '12', carga: '', descanso: '60', observacoes: '',
})
const doServidor = (x) => ({
  uid: novoUid(), exercicioId: x.exercicioId, nome: x.nome, musculo: x.musculo, equipamento: x.equipamento,
  series: String(x.series), repeticoes: String(x.repeticoes),
  carga: x.carga === null ? '' : String(x.carga), descanso: String(x.descanso), observacoes: x.observacoes ?? '',
})

export default function EditarFicha() {
  const { id, alunoId } = useParams() // /fichas/nova/:alunoId ou /fichas/:id/editar
  const navigate = useNavigate()
  const [aluno, setAluno] = useState(null)
  const [nome, setNome] = useState('')
  const [objetivo, setObjetivo] = useState('')
  const [status, setStatus] = useState('rascunho')
  const [divisoes, setDivisoes] = useState([{ id: 'A', exercicios: [] }])
  const [ativa, setAtiva] = useState('A')
  const [biblioteca, setBiblioteca] = useState([])
  const [modalBiblioteca, setModalBiblioteca] = useState(false)
  const [busca, setBusca] = useState('')
  const [revisao, setRevisao] = useState(false)
  const [mensagem, setMensagem] = useState(null) // { tipo: 'ok' | 'erro', texto }
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [alterado, setAlterado] = useState(false)

  useEffect(() => {
    let cancelado = false
    setCarregando(true)
    setErro('')
    const pedido = id ? api(`/fichas/${id}`) : api(`/fichas/aluno/${alunoId}`)
    pedido
      .then((d) => {
        if (cancelado) return
        setAluno(d.aluno)
        if (id) {
          setNome(d.ficha.nome)
          setObjetivo(d.ficha.objetivo)
          setStatus(d.ficha.status)
          const divs = d.ficha.divisoes.map((x) => ({ id: x.letra, exercicios: x.exercicios.map(doServidor) }))
          if (divs.length) { setDivisoes(divs); setAtiva(divs[0].id) }
        }
      })
      .catch((err) => { if (!cancelado) setErro(err.message) })
      .finally(() => { if (!cancelado) setCarregando(false) })
    return () => { cancelado = true }
  }, [id, alunoId])

  useEffect(() => {
    api('/exercicios?limite=100').then((d) => setBiblioteca(d.itens)).catch(() => setBiblioteca([]))
  }, [])

  // Avisa ao fechar ou recarregar a aba com alterações não salvas.
  useEffect(() => {
    if (!alterado) return
    const aviso = (e) => { e.preventDefault(); e.returnValue = '' }
    window.addEventListener('beforeunload', aviso)
    return () => window.removeEventListener('beforeunload', aviso)
  }, [alterado])

  const divisaoAtual = divisoes.find((d) => d.id === ativa)
  const encontrados = useMemo(() => {
    const termo = busca.trim().toLocaleLowerCase('pt-BR')
    return biblioteca.filter((e) =>
      `${e.nome} ${e.musculo} ${e.equipamento}`.toLocaleLowerCase('pt-BR').includes(termo))
  }, [biblioteca, busca])

  const mudou = () => setAlterado(true)

  function editarExercicio(uid, chave, valor) {
    mudou()
    setDivisoes((ant) => ant.map((d) => (d.id !== ativa ? d : {
      ...d, exercicios: d.exercicios.map((e) => (e.uid === uid ? { ...e, [chave]: valor } : e)),
    })))
  }
  function incluirExercicio(exercicio) {
    mudou()
    setDivisoes((ant) => ant.map((d) => (d.id !== ativa ? d : { ...d, exercicios: [...d.exercicios, criarItem(exercicio)] })))
    setModalBiblioteca(false)
    setBusca('')
    setMensagem({ tipo: 'ok', texto: 'Exercício adicionado.' })
  }
  function removerExercicio(uid) {
    mudou()
    setDivisoes((ant) => ant.map((d) => (d.id !== ativa ? d : { ...d, exercicios: d.exercicios.filter((e) => e.uid !== uid) })))
  }
  function moverExercicio(indice, direcao) {
    mudou()
    setDivisoes((ant) => ant.map((d) => {
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
    mudou()
    const nova = LETRAS[divisoes.length]
    setDivisoes((ant) => [...ant, { id: nova, exercicios: [] }])
    setAtiva(nova)
  }

  function problemaNaFicha(publicar) {
    if (!nome.trim() || !objetivo.trim()) return 'Informe o nome e o objetivo da ficha.'
    const itens = divisoes.flatMap((d) => d.exercicios)
    if (itens.some((e) => !(Number(e.series) >= 1) || !(Number(e.repeticoes) >= 1))) {
      return 'Séries e repetições precisam ser maiores que zero.'
    }
    if (publicar && divisoes.some((d) => d.exercicios.length === 0)) {
      return 'Adicione pelo menos um exercício a cada divisão antes de publicar.'
    }
    return ''
  }

  function revisarPublicacao() {
    const problema = problemaNaFicha(true)
    if (problema) { setMensagem({ tipo: 'erro', texto: problema }); return }
    setRevisao(true)
  }

  async function salvar(novoStatus) {
    if (enviando) return
    const problema = problemaNaFicha(novoStatus === 'publicada')
    if (problema) { setMensagem({ tipo: 'erro', texto: problema }); return }
    setEnviando(true)
    setMensagem(null)
    const corpo = {
      nome: nome.trim(),
      objetivo: objetivo.trim(),
      status: novoStatus,
      divisoes: divisoes.map((d) => ({
        letra: d.id,
        exercicios: d.exercicios.map((e) => ({
          exercicioId: e.exercicioId, series: e.series, repeticoes: e.repeticoes,
          carga: e.carga, descanso: e.descanso, observacoes: e.observacoes,
        })),
      })),
    }
    try {
      if (id) {
        await api(`/fichas/${id}`, { method: 'PUT', body: corpo })
        setStatus(novoStatus)
        setAlterado(false)
        setMensagem({ tipo: 'ok', texto: novoStatus === 'publicada' ? 'Ficha publicada. O aluno já pode vê-la.' : 'Rascunho salvo.' })
      } else {
        const nova = await api('/fichas', { method: 'POST', body: { ...corpo, alunoId: Number(alunoId) } })
        setAlterado(false)
        navigate(`/fichas/${nova.id}/editar`, { replace: true })
      }
    } catch (err) {
      setMensagem({ tipo: 'erro', texto: err.message })
    } finally {
      setEnviando(false)
    }
  }

  if (carregando) {
    return <LayoutAutenticado titulo="Editor de fichas"><p className="rounded-xl bg-white p-6 text-sm text-[#142191]">Carregando...</p></LayoutAutenticado>
  }
  if (erro) {
    return (
      <LayoutAutenticado titulo="Editor de fichas">
        <div role="alert" className="rounded-xl bg-white p-6 text-sm text-red-700">
          <p>{erro}</p>
          <button type="button" onClick={() => navigate(-1)} className={`mt-4 ${botaoSecundario}`}><ArrowLeft size={16} /> Voltar</button>
        </div>
      </LayoutAutenticado>
    )
  }

  return (
    <LayoutAutenticado titulo="Editor de fichas">
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-slate-600">Monte a ficha do aluno, organize as divisões e revise antes de publicar.</p>
          <button type="button" className={botaoSecundario} onClick={() => navigate(-1)}><ArrowLeft size={16} /> Voltar</button>
        </div>

        {mensagem && (
          <div role={mensagem.tipo === 'erro' ? 'alert' : 'status'}
            className={`rounded-lg border px-4 py-3 text-sm ${mensagem.tipo === 'erro' ? 'border-red-200 bg-red-50 text-red-700' : 'border-[#87B7FF] bg-[#E4F2FD] text-[#142191]'}`}>
            {mensagem.texto}
          </div>
        )}

        <section className="grid gap-4 rounded-xl bg-white p-5 shadow-sm md:grid-cols-3">
          <div className="text-sm font-semibold text-[#142191]">
            Aluno
            <p className="mt-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 font-normal">{aluno?.nome}</p>
            <span className={`mt-2 inline-block rounded-full px-3 py-1 text-xs font-semibold ${status === 'publicada' ? 'bg-[#E4F2FD] text-[#142191]' : 'bg-amber-100 text-amber-900'}`}>
              {status === 'publicada' ? 'Publicada' : 'Rascunho'}
            </span>
          </div>
          <label className="text-sm font-semibold text-[#142191]">Nome da ficha
            <input value={nome} onChange={(e) => { setNome(e.target.value); mudou() }} placeholder="Ex.: Ficha de hipertrofia" className={`mt-2 ${campo}`} />
          </label>
          <label className="text-sm font-semibold text-[#142191]">Objetivo
            <input value={objetivo} onChange={(e) => { setObjetivo(e.target.value); mudou() }} placeholder="Ex.: Hipertrofia" className={`mt-2 ${campo}`} />
          </label>
        </section>

        <section className="rounded-xl bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-heading text-3xl font-bold text-[#142191]">Divisões de treino</h2>
            <button type="button" disabled={divisoes.length === 6} onClick={adicionarDivisao} className={botaoSecundario}><Plus size={16} /> Adicionar divisão</button>
          </div>
          <div role="tablist" aria-label="Divisões" className="mt-4 flex flex-wrap gap-2">
            {divisoes.map((d) => (
              <button key={d.id} type="button" role="tab" aria-selected={ativa === d.id} onClick={() => setAtiva(d.id)}
                className={`rounded-lg px-5 py-2 text-sm font-semibold ${ativa === d.id ? 'bg-[#004AF7] text-white' : 'bg-[#E4F2FD] text-[#142191]'}`}>
                Treino {d.id}
              </button>
            ))}
          </div>

          <div className="mt-5 space-y-4">
            {divisaoAtual?.exercicios.length === 0 && (
              <p className="rounded-lg border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">Nenhum exercício nesta divisão.</p>
            )}
            {divisaoAtual?.exercicios.map((ex, indice) => (
              <article key={ex.uid} className="rounded-xl border border-slate-200 p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <h3 className="font-semibold text-[#142191]">
                      {indice + 1}.{' '}
                      <Link to={`/exercicios/${ex.exercicioId}`} target="_blank" rel="noopener noreferrer"
                        title="Abrir os detalhes em outra aba" className="text-[#004AF7] hover:underline">
                        {ex.nome}
                      </Link>
                    </h3>
                    <p className="text-xs text-slate-500">{ex.musculo} · {ex.equipamento}</p>
                  </div>
                  <div className="flex gap-1">
                    <button type="button" aria-label="Mover para cima" disabled={indice === 0} onClick={() => moverExercicio(indice, -1)} className="rounded p-2 hover:bg-[#E4F2FD] disabled:opacity-30"><ArrowUp size={18} /></button>
                    <button type="button" aria-label="Mover para baixo" disabled={indice === divisaoAtual.exercicios.length - 1} onClick={() => moverExercicio(indice, 1)} className="rounded p-2 hover:bg-[#E4F2FD] disabled:opacity-30"><ArrowDown size={18} /></button>
                    <button type="button" aria-label={`Remover ${ex.nome}`} onClick={() => removerExercicio(ex.uid)} className="rounded p-2 text-red-600 hover:bg-red-50"><Trash2 size={18} /></button>
                  </div>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {[['Séries', 'series'], ['Repetições', 'repeticoes'], ['Carga inicial (kg)', 'carga'], ['Descanso (segundos)', 'descanso']].map(([rotulo, chave]) => (
                    <label key={chave} className="text-xs font-semibold text-[#142191]">{rotulo}
                      <input type="number" min="0" step={chave === 'carga' ? '0.5' : '1'} value={ex[chave]}
                        onChange={(e) => editarExercicio(ex.uid, chave, e.target.value)} className={`mt-1 ${campo}`} />
                    </label>
                  ))}
                </div>
                <label className="mt-3 block text-xs font-semibold text-[#142191]">Observações
                  <textarea rows={2} maxLength={500} value={ex.observacoes} onChange={(e) => editarExercicio(ex.uid, 'observacoes', e.target.value)}
                    placeholder="Instruções e ajustes deste exercício" className={`mt-1 ${campo}`} />
                </label>
              </article>
            ))}
          </div>
          <button type="button" className={`mt-5 ${botaoPrimario}`} onClick={() => setModalBiblioteca(true)}><Plus size={17} /> Adicionar exercício</button>
        </section>

        <div className="flex flex-wrap justify-end gap-3">
          <button type="button" disabled={enviando} onClick={() => salvar('rascunho')} className={botaoSecundario}><Save size={17} /> {enviando ? 'Salvando...' : 'Salvar rascunho'}</button>
          <button type="button" disabled={enviando} onClick={revisarPublicacao} className={botaoPrimario}><Eye size={17} /> Revisar e publicar</button>
        </div>
      </div>

      {modalBiblioteca && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 p-4" role="presentation"
          onMouseDown={(e) => { if (e.target === e.currentTarget) setModalBiblioteca(false) }}>
          <section role="dialog" aria-modal="true" aria-label="Adicionar exercício da biblioteca" className="max-h-[85vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white p-5 shadow-xl">
            <div className="flex items-center justify-between">
              <h2 className="font-heading text-3xl font-bold text-[#142191]">Biblioteca de exercícios</h2>
              <button type="button" aria-label="Fechar" onClick={() => setModalBiblioteca(false)}><X size={22} /></button>
            </div>
            <div className="relative mt-4">
              <Search size={18} className="absolute left-3 top-3 text-slate-400" aria-hidden="true" />
              <input autoFocus value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Pesquisar exercício, músculo ou equipamento" className={`${campo} pl-10`} />
            </div>
            <div className="mt-4 space-y-2">
              {encontrados.map((ex) => (
                <div key={ex.id} className="flex items-center justify-between gap-3 rounded-lg border p-3">
                  <div>
                    <p className="font-semibold text-[#142191]">{ex.nome}</p>
                    <p className="text-xs text-slate-500">{ex.musculo} · {ex.equipamento}</p>
                  </div>
                  <button type="button" onClick={() => incluirExercicio(ex)} className={botaoPrimario}><Plus size={16} /> Incluir</button>
                </div>
              ))}
              {encontrados.length === 0 && <p className="py-5 text-center text-slate-500">Nenhum exercício encontrado.</p>}
            </div>
          </section>
        </div>
      )}

      {revisao && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 p-4" role="presentation"
          onMouseDown={(e) => { if (e.target === e.currentTarget) setRevisao(false) }}>
          <section role="dialog" aria-modal="true" aria-label="Revisão da ficha" className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="font-heading text-3xl font-bold text-[#142191]">Revisar ficha</h2>
            <p className="mt-2 text-sm text-slate-600">{aluno?.nome} · {nome} · {objetivo}</p>
            {divisoes.map((d) => (
              <div key={d.id} className="mt-4 rounded-lg bg-[#E4F2FD] p-3">
                <p className="font-bold text-[#142191]">Treino {d.id}</p>
                {d.exercicios.map((e) => <p key={e.uid} className="mt-1 text-sm text-[#142191]">{e.nome} · {e.series} x {e.repeticoes}</p>)}
              </div>
            ))}
            <p className="mt-4 text-xs text-slate-500">Ao publicar, a ficha aparece na conta do aluno.</p>
            <div className="mt-5 flex flex-wrap justify-end gap-2">
              <button type="button" onClick={() => setRevisao(false)} className={botaoSecundario}>Voltar para editar</button>
              <button type="button" disabled={enviando} onClick={() => { setRevisao(false); salvar('publicada') }} className={botaoPrimario}><Check size={16} /> Publicar ficha</button>
            </div>
          </section>
        </div>
      )}
    </LayoutAutenticado>
  )
}