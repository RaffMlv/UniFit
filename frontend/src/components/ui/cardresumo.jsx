export function CardResumo({ titulo, valor, descricao, icone: Icone }) {
    return (
      <article className="min-w-0 rounded-2xl border border-[#87B7FF]/40 bg-white p-5 text-[#142191] shadow-sm sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <h3 className="min-w-0 break-words text-sm font-medium text-slate-600">{titulo}</h3>
          {Icone && (
            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#E4F2FD] text-[#004AF7]">
            <Icone size={22} aria-hidden="true" />
            </div>
            )
        }
        </div>
        <p className="mt-3 break-words font-heading text-4xl font-bold">{valor ?? '—'}</p>
        {descricao && <p className="mt-2 break-words text-sm leading-6 text-slate-600">{descricao}</p>}
      </article>
    )
  }