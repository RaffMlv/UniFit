import { useId } from 'react'

export function IndicadorProgresso({ valor = 0, total = 100, titulo = 'Progresso' }) {
  const tituloId = useId()
  const limite = typeof total === 'number' && Number.isFinite(total) && total > 0 ? total : 0
  const atual = typeof valor === 'number' && Number.isFinite(valor)
    ? Math.min(Math.max(valor, 0), limite) : 0
  const percentual = limite > 0 ? (atual / limite) * 100 : 0

  return (
    <div className="w-full min-w-0 text-[#142191]">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2 text-sm">
        <span id={tituloId} className="font-medium">{titulo}</span>
        <span className="tabular-nums text-slate-600">{Math.round(percentual)}%</span>
      </div>
      <div role="progressbar" aria-labelledby={tituloId} aria-valuemin={0}
        aria-valuemax={100} aria-valuenow={Math.round(percentual)}
        aria-valuetext={limite > 0 ? `${atual} de ${limite}` : 'Nenhuma atividade definida'}
        className="h-3 overflow-hidden rounded-full bg-[#E4F2FD]">
        <div style={{ width: `${percentual}%` }} className="h-full rounded-full bg-[#004AF7] transition-[width] duration-300 motion-reduce:transition-none" />
      </div>
      <p className="mt-2 text-sm text-slate-600">
        {limite > 0 ? `${atual} de ${limite} concluídos` : 'Nenhuma atividade definida.'}
      </p>
    </div>
  )
}