import { useId } from 'react'
import { Button } from '@/components/ui/button'

export function Formulario({
  titulo, descricao, children, onSubmit,
  textoBotao = 'Salvar', textoEnviando = 'Salvando...',
  enviando = false, desabilitado = false, erro = '', className = '',
}) {
  const tituloId = useId()
  const descricaoId = useId()
  return (
    <form onSubmit={onSubmit} aria-labelledby={titulo ? tituloId : undefined}
      aria-describedby={descricao ? descricaoId : undefined} aria-busy={enviando}
      className={`w-full min-w-0 space-y-5 rounded-2xl bg-white p-6 text-[#142191] shadow-sm sm:p-8 ${className}`}>
      {(titulo || descricao) && (
        <div>
          {titulo && <h2 id={tituloId} className="font-heading text-3xl font-bold">{titulo}</h2>}
          {descricao && <p id={descricaoId} className="mt-2 text-sm leading-6 text-slate-600">{descricao}</p>}
        </div>
      )}
      <fieldset disabled={enviando} className="m-0 min-w-0 space-y-5 border-0 p-0">
        {children}
      </fieldset>
      {erro && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{erro}</p>}
      <Button type="submit" disabled={enviando || desabilitado} className="w-full">
        {enviando ? textoEnviando : textoBotao}
      </Button>
    </form>
  )
}