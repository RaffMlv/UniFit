import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, CheckCircle2, CircleAlert, Dumbbell, PlayCircle, Video } from 'lucide-react'

const exercicios = []

export default function PaginaExercicio() {
  const { id } = useParams()
  const exercicio = exercicios.find(e => e.id === id) ?? null
  if (!exercicio) return <div className="min-h-screen bg-[#E4F2FD] p-6"><main className="mx-auto max-w-7xl"><div className="rounded-xl bg-white p-8"><p className="text-[#142191]">Exercício não encontrado nos dados demonstrativos.</p><Link to="/exercicios" className="mt-3 inline-block font-semibold text-[#004AF7]">Voltar à biblioteca</Link></div></main></div>
  const relacionados = exercicios.filter(e => e.id !== exercicio.id)
  return <div className="min-h-screen bg-[#E4F2FD] px-4 py-8 sm:px-6 lg:px-10"><main className="mx-auto w-full max-w-7xl"><header className="mb-7 border-b border-[#87B7FF] pb-5"><p className="text-xs font-bold uppercase tracking-widest text-[#004AF7]">UNIFIT</p><h1 className="mt-1 font-heading text-4xl font-bold text-[#142191]">Página do exercício</h1><p className="mt-2 text-sm text-slate-600">Consulte a técnica, os equipamentos e as orientações do exercício.</p></header>
    <div className="space-y-6">
      <Link to="/exercicios" className="inline-flex items-center gap-2 text-sm font-semibold text-[#004AF7] hover:underline"><ArrowLeft size={18} /> Voltar à biblioteca</Link>
      <div className="grid gap-6 lg:grid-cols-5">
        <section className="space-y-5 lg:col-span-3">
          <div className="overflow-hidden rounded-xl bg-white shadow-sm">
            <div className="flex aspect-video items-center justify-center bg-gradient-to-br from-[#142191] to-[#004AF7] p-6 text-white">
              {exercicio.video ? <video controls src={exercicio.video} className="h-full w-full" /> : <div className="text-center"><PlayCircle size={54} className="mx-auto mb-3 text-[#87B7FF]" /><p className="font-semibold">Vídeo demonstrativo</p><p className="mt-1 text-sm text-[#E4F2FD]">Mídia ainda não cadastrada</p></div>}
            </div>
            <div className="p-5"><h2 className="font-heading text-4xl font-bold text-[#142191]">{exercicio.nome}</h2><div className="mt-3 flex flex-wrap gap-2"><span className="rounded-full bg-[#E4F2FD] px-3 py-1 text-xs font-semibold text-[#142191]">{exercicio.musculo}</span><span className="rounded-full bg-[#E4F2FD] px-3 py-1 text-xs font-semibold text-[#142191]">{exercicio.nivel}</span></div></div>
          </div>
          <section className="rounded-xl bg-white p-5 shadow-sm"><h3 className="font-heading text-3xl font-bold text-[#142191]">Como executar</h3><ol className="mt-4 space-y-3">{exercicio.passos.map((p, i) => <li key={i} className="flex gap-3"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#004AF7] text-sm font-bold text-white">{i + 1}</span><span className="pt-1 text-sm leading-6 text-slate-700">{p}</span></li>)}</ol></section>
        </section>
        <aside className="space-y-5 lg:col-span-2">
          <section className="rounded-xl bg-white p-5 shadow-sm"><h3 className="font-heading text-2xl font-bold text-[#142191]">Informações</h3><div className="mt-4 space-y-4"><div className="flex gap-3"><Dumbbell className="text-[#004AF7]" size={22} /><div><p className="text-xs text-slate-500">Equipamento necessário</p><p className="font-semibold text-[#142191]">{exercicio.equipamento}</p></div></div><div className="flex gap-3"><CheckCircle2 className="text-[#004AF7]" size={22} /><div><p className="text-xs text-slate-500">Músculo principal</p><p className="font-semibold text-[#142191]">{exercicio.musculo}</p></div></div></div></section>
          <section className="rounded-xl border border-[#87B7FF] bg-[#E4F2FD] p-5"><div className="flex items-center gap-2"><CircleAlert size={20} className="text-[#004AF7]" /><h3 className="font-heading text-2xl font-bold text-[#142191]">Observações</h3></div><p className="mt-3 text-sm leading-6 text-[#142191]">{exercicio.observacoes}</p></section>
          <section className="rounded-xl bg-white p-5 shadow-sm"><h3 className="font-heading text-2xl font-bold text-[#142191]">Exercícios relacionados</h3><p className="mt-2 text-xs text-slate-500">Sugestões gerais para navegação, não recomendações clínicas individualizadas.</p><h4 className="mt-4 text-sm font-semibold text-[#142191]">Recomendados</h4><div className="mt-2 space-y-2">{relacionados.map(e => <Link key={e.id} to={`/exercicios/${e.id}`} className="flex items-center justify-between rounded-lg border border-slate-200 p-3 text-sm text-[#142191] hover:border-[#004AF7]">{e.nome}<ArrowLeft size={16} className="rotate-180" /></Link>)}</div><h4 className="mt-5 text-sm font-semibold text-[#142191]">Não recomendados</h4><p className="mt-2 text-sm text-slate-500">Nenhuma classificação cadastrada. Esse conteúdo deve ser definido por profissionais autorizados.</p></section>
        </aside>
      </div>
    </div>
  </main></div>
}