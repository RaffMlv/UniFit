import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ImageOff, CheckCircle } from 'lucide-react'
import LayoutAutenticado from '@/components/ui/LayoutAutenticado'
import { api } from '@/services/api'

function FichaCard({ ficha, onSelecionarAtual }) {
  const [letra, setLetra] = useState(ficha.divisoes[0]?.letra)
  const divisao = ficha.divisoes.find((d) => d.letra === letra)
  const total = ficha.divisoes.reduce((soma, d) => soma + d.exercicios.length, 0)

  return (
    <article className="rounded-2xl bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-heading text-2xl font-bold text-[#142191]">{ficha.nome}</h3>
          <p className="text-sm text-slate-600">Objetivo: {ficha.objetivo}</p>
          <p className="mt-1 text-xs text-slate-500">
            {ficha.divisoes.length} {ficha.divisoes.length === 1 ? 'divisão' : 'divisões'} · {total} exercícios
          </p>
        </div>
        {ficha.atual ? (
          <span className="inline-flex items-center gap-2 rounded-lg bg-green-100 px-4 py-2.5 text-sm font-semibold text-green-700">
            <CheckCircle size={17} aria-hidden="true" />
            Treino atual
          </span>
        ) : (
          <button
            type="button"
            onClick={() => onSelecionarAtual(ficha.id)}
            className="inline-flex items-center gap-2 rounded-lg bg-[#004AF7] px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
          >
            <CheckCircle size={17} aria-hidden="true" />
            Definir como atual
          </button>
        )}
      </div>

      <div role="tablist" aria-label={`Divisões de ${ficha.nome}`} className="mt-4 flex flex-wrap gap-2">
        {ficha.divisoes.map((d) => (
          <button key={d.letra} type="button" role="tab" aria-selected={letra === d.letra}
            onClick={() => setLetra(d.letra)}
            className={`rounded-lg px-4 py-2 text-sm font-semibold ${letra === d.letra ? 'bg-[#004AF7] text-white' : 'bg-[#E4F2FD] text-[#142191]'}`}>
            Treino {d.letra} · {d.exercicios.length}
          </button>
        ))}
      </div>

      <ul className="mt-4 space-y-3">
        {divisao?.exercicios.map((ex, i) => (
          <li key={`${ex.exercicioId}-${i}`} className="flex gap-4 rounded-xl border border-slate-200 p-3">
            <div className="flex h-20 w-24 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[#E4F2FD] text-[#142191]">
              {ex.imagem
                ? <img src={ex.imagem} alt={`Demonstração de ${ex.nome}`} className="h-full w-full object-cover" />
                : <ImageOff size={24} strokeWidth={1.5} aria-label="Imagem não cadastrada" />}
            </div>
            <div className="min-w-0 flex-1">
              {ex.ativo ? (
                <Link to={`/exercicios/${ex.exercicioId}`}
                  state={{ de: '/meus-treinos', rotulo: 'Voltar aos meus treinos' }}
                  className="font-semibold text-[#004AF7] hover:underline">
                  {i + 1}. {ex.nome}
                </Link>
              ) : (
                <span className="font-semibold text-slate-500">
                  {i + 1}. {ex.nome} <span className="text-xs font-normal">(detalhes indisponíveis)</span>
                </span>
              )}
              <p className="text-xs text-slate-500">{ex.musculo} · {ex.equipamento}</p>
              <p className="mt-1 text-sm text-[#142191]">
                {ex.series} séries x {ex.repeticoes} repetições · descanso de {ex.descanso}s
              </p>
              <p className="text-xs text-slate-500">
                Carga inicial: {ex.carga === null ? 'a definir' : `${ex.carga} kg`}
              </p>
              {ex.observacoes && <p className="mt-1 text-xs text-slate-600">{ex.observacoes}</p>}
            </div>
          </li>
        ))}
        {divisao && divisao.exercicios.length === 0 && (
          <li className="rounded-lg border border-dashed border-slate-300 p-5 text-center text-sm text-slate-500">
            Nenhum exercício nesta divisão.
          </li>
        )}
      </ul>
    </article>
  )
}

export default function MeusTreinos() {
  const [fichas, setFichas] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')

  useEffect(() => {
    api('/fichas/minhas')
      .then((d) => setFichas(d.fichas))
      .catch((err) => setErro(err.message))
      .finally(() => setCarregando(false))
  }, [])

  const selecionarFichaAtual = async (fichaId) => {
    try {
      setErro('')

      await api(`/fichas/${fichaId}/definir-atual`, {
        method: 'PATCH'
      })

      setFichas(fichasAtuais =>
        fichasAtuais.map(ficha => ({
          ...ficha,
          atual: ficha.id === fichaId
        }))
      )
    } catch (error) {
      setErro(error.message || 'Não foi possível selecionar a ficha.')
    }
  }

  return (
    <LayoutAutenticado titulo="Meus treinos">
      <div className="space-y-6 text-[#142191]">
        <div>
          <p className="text-sm font-semibold text-[#004AF7]">ÁREA DO ALUNO</p>
          <h2 className="mt-1 font-heading text-4xl font-bold">MEUS TREINOS</h2>
          <p className="mt-2 text-sm text-slate-600">Escolha o treino do dia e toque no exercício para ver como executá-lo.</p>
        </div>

        {carregando && <p className="rounded-2xl bg-white p-6 text-sm">Carregando seus treinos...</p>}
        {erro && <p role="alert" className="rounded-2xl bg-red-50 p-6 text-sm text-red-700">{erro}</p>}

        {!carregando && !erro && fichas.length === 0 && (
          <div className="rounded-2xl bg-white p-8 text-center">
            <h3 className="font-heading text-2xl font-bold">NENHUM TREINO PUBLICADO</h3>
            <p className="mt-2 text-sm text-slate-600">
              Quando um monitor publicar sua ficha, ela aparece aqui.
            </p>
          </div>
        )}

        {fichas.map(f => (
          <FichaCard
            key={f.id}
            ficha={f}
            onSelecionarAtual={selecionarFichaAtual}
          />
        ))}

        <p className="text-xs text-slate-500">
          A carga usada na última sessão aparece aqui depois que a execução do treino for implementada.
        </p>
      </div>
    </LayoutAutenticado>
  )
}