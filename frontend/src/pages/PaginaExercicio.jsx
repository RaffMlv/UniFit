import { useEffect, useState } from 'react'
import { useParams, Link, useLocation } from 'react-router-dom'
import { ArrowLeft, CheckCircle2, CircleAlert, Dumbbell, ImageOff, PlayCircle } from 'lucide-react'
import LayoutAutenticado from '@/components/ui/LayoutAutenticado'
import { api } from '@/services/api'

const separarVirgulas = (texto) => (texto ?? '').split(',').map((t) => t.trim()).filter(Boolean)
const separarLinhas = (texto) => (texto ?? '').split(/\r?\n/).map((t) => t.trim()).filter(Boolean)
const ehArquivoDeVideo = (url) => /\.(mp4|webm|ogg)(\?.*)?$/i.test(url ?? '')

export default function PaginaExercicio() {
  const { id } = useParams()
  const { state } = useLocation()
  const voltarPara = state?.de ?? '/biblioteca'
  const rotuloVoltar = state?.rotulo ?? 'Voltar à biblioteca'
  const [exercicio, setExercicio] = useState(null)
  const [relacionados, setRelacionados] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')

  // Carrega o exercício. Refaz quando o id da URL muda (ao clicar em um relacionado).
  useEffect(() => {
    let cancelado = false
    setCarregando(true)
    setErro('')
    setExercicio(null)
    setRelacionados([])
    api(`/exercicios/${id}`)
      .then((dados) => { if (!cancelado) setExercicio(dados) })
      .catch((err) => { if (!cancelado) setErro(err.message) })
      .finally(() => { if (!cancelado) setCarregando(false) })
    return () => { cancelado = true }
  }, [id])

  // Relacionados: outros exercícios do mesmo grupo muscular.
  useEffect(() => {
    if (!exercicio) return
    let cancelado = false
    api(`/exercicios?musculo=${encodeURIComponent(exercicio.musculo)}&limite=20`)
      .then((dados) => {
        if (!cancelado) setRelacionados(dados.itens.filter((e) => e.id !== exercicio.id).slice(0, 6))
      })
      .catch(() => { if (!cancelado) setRelacionados([]) }) // é um complemento: se falhar, a página segue
    return () => { cancelado = true }
  }, [exercicio])

  const passos = separarLinhas(exercicio?.instrucoes)
  const secundarios = separarVirgulas(exercicio?.secundarios)

  return (
    <LayoutAutenticado titulo="Exercício">
      <div className="space-y-6">
        <Link to={voltarPara} className="inline-flex items-center gap-2 text-sm font-semibold text-[#004AF7] hover:underline">
          <ArrowLeft size={18} aria-hidden="true" /> {rotuloVoltar}
        </Link>

        {carregando && <div className="rounded-xl bg-white p-8 text-[#142191]">Carregando exercício...</div>}

        {erro && (
          <div role="alert" className="rounded-xl bg-white p-8">
            <p className="text-[#142191]">{erro}</p>
            <Link to="/biblioteca" className="mt-3 inline-block font-semibold text-[#004AF7]">Voltar à biblioteca</Link>
          </div>
        )}

        {exercicio && (
          <div className="grid gap-6 lg:grid-cols-5">
            <section className="space-y-5 lg:col-span-3">
              <div className="overflow-hidden rounded-xl bg-white shadow-sm">
                <div className="flex aspect-video items-center justify-center bg-gradient-to-br from-[#142191] to-[#004AF7] text-white">
                  {ehArquivoDeVideo(exercicio.video) ? (
                    <video controls preload="none" src={exercicio.video} className="h-full w-full" />
                  ) : exercicio.imagem ? (
                    <img src={exercicio.imagem} alt={`Demonstração de ${exercicio.nome}`} className="h-full w-full object-cover" />
                  ) : (
                    <div className="p-6 text-center">
                      <PlayCircle size={54} className="mx-auto mb-3 text-[#87B7FF]" aria-hidden="true" />
                      <p className="font-semibold">Vídeo demonstrativo</p>
                      <p className="mt-1 text-sm text-[#E4F2FD]">Mídia ainda não cadastrada</p>
                    </div>
                  )}
                </div>

                {exercicio.video && !ehArquivoDeVideo(exercicio.video) && (
                  <a href={exercicio.video} target="_blank" rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 bg-[#004AF7] px-4 py-3 text-sm font-semibold text-white hover:bg-[#142191]">
                    <PlayCircle size={18} aria-hidden="true" /> Assistir ao vídeo demonstrativo
                  </a>
                )}

                <div className="p-5">
                  <h2 className="font-heading text-4xl font-bold text-[#142191]">{exercicio.nome}</h2>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="rounded-full bg-[#E4F2FD] px-3 py-1 text-xs font-semibold text-[#142191]">{exercicio.musculo}</span>
                    <span className="rounded-full bg-[#E4F2FD] px-3 py-1 text-xs font-semibold text-[#142191]">{exercicio.nivel}</span>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700">{exercicio.categoria}</span>
                    {!exercicio.ativo && (
                      <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-900">
                        Inativo: não aparece para os alunos
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <section className="rounded-xl bg-white p-5 shadow-sm">
                <h3 className="font-heading text-3xl font-bold text-[#142191]">Como executar</h3>
                {passos.length ? (
                  <ol className="mt-4 space-y-3">
                    {passos.map((p, i) => (
                      <li key={i} className="flex gap-3">
                        <span aria-hidden="true" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#004AF7] text-sm font-bold text-white">{i + 1}</span>
                        <span className="pt-1 text-sm leading-6 text-slate-700">{p}</span>
                      </li>
                    ))}
                  </ol>
                ) : (
                  <p className="mt-3 text-sm text-slate-600">Instruções ainda não cadastradas.</p>
                )}
              </section>
            </section>

            <aside className="space-y-5 lg:col-span-2">
              <section className="rounded-xl bg-white p-5 shadow-sm">
                <h3 className="font-heading text-2xl font-bold text-[#142191]">Informações</h3>
                <div className="mt-4 space-y-4">
                  <div className="flex gap-3">
                    <Dumbbell className="text-[#004AF7]" size={22} aria-hidden="true" />
                    <div>
                      <p className="text-xs text-slate-500">Equipamento necessário</p>
                      <p className="font-semibold text-[#142191]">{exercicio.equipamento}</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <CheckCircle2 className="text-[#004AF7]" size={22} aria-hidden="true" />
                    <div>
                      <p className="text-xs text-slate-500">Músculo principal</p>
                      <p className="font-semibold text-[#142191]">{exercicio.musculo}</p>
                      {secundarios.length > 0 && (
                        <p className="mt-1 text-xs text-slate-500">Também trabalha: {secundarios.join(', ')}</p>
                      )}
                    </div>
                  </div>
                </div>
              </section>

              <section className="rounded-xl border border-[#87B7FF] bg-[#E4F2FD] p-5">
                <div className="flex items-center gap-2">
                  <CircleAlert size={20} className="text-[#004AF7]" aria-hidden="true" />
                  <h3 className="font-heading text-2xl font-bold text-[#142191]">Observações</h3>
                </div>
                <p className="mt-3 whitespace-pre-line text-sm leading-6 text-[#142191]">
                  {exercicio.observacoes || 'Nenhuma observação cadastrada.'}
                </p>
              </section>

              <section className="rounded-xl bg-white p-5 shadow-sm">
                <h3 className="font-heading text-2xl font-bold text-[#142191]">Exercícios relacionados</h3>
                <p className="mt-2 text-xs text-slate-500">
                  Sugestões do mesmo grupo muscular, não recomendações clínicas individualizadas.
                </p>
                <h4 className="mt-4 text-sm font-semibold text-[#142191]">Recomendados</h4>
                {relacionados.length ? (
                  <div className="mt-2 space-y-2">
                    {relacionados.map((e) => (
                      <Link key={e.id} to={`/exercicios/${e.id}`}
                        className="flex items-center justify-between rounded-lg border border-slate-200 p-3 text-sm text-[#142191] hover:border-[#004AF7]">
                        {e.nome}
                        <ArrowLeft size={16} className="rotate-180" aria-hidden="true" />
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="mt-2 text-sm text-slate-500">Nenhum outro exercício deste grupo muscular.</p>
                )}
                <h4 className="mt-5 text-sm font-semibold text-[#142191]">Não recomendados</h4>
                <p className="mt-2 text-sm text-slate-500">
                  Nenhuma classificação cadastrada. Esse conteúdo deve ser definido por profissionais autorizados.
                </p>
              </section>
            </aside>
          </div>
        )}
      </div>
    </LayoutAutenticado>
  )
}