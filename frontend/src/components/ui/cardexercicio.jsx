import { Dumbbell, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
export function CardExercicio({
  nome, grupoMuscular, series, repeticoes, descanso,
  concluido = false, onDetalhes, onConcluir, desabilitado = false,
}) {
  const detalhes = [
    { titulo: 'Séries', valor: series },
    { titulo: 'Repetições', valor: repeticoes },
    { titulo: 'Descanso', valor: descanso },
  ].filter((item) => item.valor !== undefined && item.valor !== null && item.valor !== '')
  return (
    <article className="min-w-0 rounded-2xl border border-[#87B7FF]/40 bg-white p-5 text-[#142191] shadow-sm sm:p-6">
      <div className="flex items-start gap-4">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-[#E4F2FD] text-[#004AF7]">
          <Dumbbell size={24} aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="break-words font-heading text-2xl font-bold">{nome}</h3>
          {grupoMuscular && <p className="mt-1 break-words text-sm text-slate-600">{grupoMuscular}</p>}
        </div>
      </div>
      {concluido && <p className="mt-4 flex items-center gap-2 text-sm font-semibold text-[#004AF7]"><Check size={18} aria-hidden="true" />Concluído</p>}
      {detalhes.length > 0 && (
        <dl className="mt-5 grid grid-cols-1 gap-3 min-[400px]:grid-cols-3">
          {detalhes.map((item) => (
            <div key={item.titulo} className="min-w-0 rounded-lg bg-[#E4F2FD] p-3">
              <dt className="text-sm text-slate-600">{item.titulo}</dt>
              <dd className="mt-1 break-words text-base font-semibold">{item.valor}</dd>
            </div>
          ))}
        </dl>
      )}
      {(onDetalhes || onConcluir) && (
        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          {onDetalhes && <Button type="button" variant="outline" onClick={onDetalhes} disabled={desabilitado} className="w-full sm:w-auto">Ver exercício</Button>}
          {onConcluir && <Button type="button" onClick={onConcluir} disabled={desabilitado || concluido} className="w-full sm:w-auto">{concluido ? 'Concluído' : 'Concluir exercício'}</Button>}
        </div>
      )}
    </article>
  )
}