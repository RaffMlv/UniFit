import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { MapPin, Search, CalendarDays, Stethoscope } from 'lucide-react'
import LayoutAutenticado from '@/components/ui/LayoutAutenticado'

const campo =
  'w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#004AF7]'

const botao =
  'inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#004AF7] px-5 py-3 text-sm font-semibold text-white hover:bg-[#142191]'

/*
Formato esperado da API:
{
  id,
  nome,
  endereco,
  servicos: ['Nutrição', 'Fisioterapia'],
  responsaveis: ['Nome do profissional'],
  descricao
}
*/
export default function Consulta({ unidades = [] }) {
  const [busca, setBusca] = useState('')
  const [buscaAplicada, setBuscaAplicada] = useState('')

  const resultados = useMemo(() => {
    const termo = buscaAplicada.trim().toLocaleLowerCase('pt-BR')

    if (!termo) return unidades

    return unidades.filter(unidade => {
      const texto = [
        unidade.nome,
        unidade.endereco,
        unidade.descricao,
        ...(unidade.servicos || []),
      ].filter(Boolean).join(' ').toLocaleLowerCase('pt-BR')

      return texto.includes(termo)
    })
  }, [unidades, buscaAplicada])

  function pesquisar(evento) {
    evento.preventDefault()
    setBuscaAplicada(busca)
  }

  function limparBusca() {
    setBusca('')
    setBuscaAplicada('')
  }

  return (
    <LayoutAutenticado titulo="Consulta">
      <div className="space-y-6 text-[#142191]">
        <header>
          <p className="text-sm font-semibold tracking-wide text-[#004AF7]">
            SERVIÇOS DE ATENDIMENTO
          </p>
          <h2 className="mt-2 font-heading text-4xl font-bold">
            CONSULTA DAS UNIDADES
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            Encontre unidades e serviços de atendimento oferecidos pela academia.
            Para escolher uma data e horário, acesse Agendamentos.
          </p>
        </header>

        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="font-heading text-2xl font-bold">
            Encontre uma unidade
          </h2>

          <form
            onSubmit={pesquisar}
            className="mt-5 flex flex-col gap-3 sm:flex-row"
          >
            <label htmlFor="busca-unidade" className="sr-only">
              Pesquisar unidade ou serviço
            </label>
            <div className="relative flex-1">
              <Search
                size={18}
                aria-hidden="true"
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                id="busca-unidade"
                value={busca}
                onChange={evento => setBusca(evento.target.value)}
                placeholder="Digite o nome da unidade ou serviço"
                className={`${campo} pl-10`}
              />
            </div>

            <button type="submit" className={botao}>
              <Search size={17} aria-hidden="true" />
              Buscar
            </button>

            {(busca || buscaAplicada) && (
              <button
                type="button"
                onClick={limparBusca}
                className="min-h-11 rounded-lg border border-[#87B7FF] px-4 py-2 text-sm font-semibold text-[#142191] hover:bg-[#E4F2FD]"
              >
                Limpar
              </button>
            )}
          </form>
        </section>

        <section aria-labelledby="titulo-resultados">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <h2 id="titulo-resultados" className="font-heading text-2xl font-bold">
              Unidades da academia
            </h2>
            <span className="text-sm text-slate-500">
              {resultados.length} resultado(s)
            </span>
          </div>

          {resultados.length === 0 ? (
            <div className="rounded-2xl bg-white px-6 py-12 text-center shadow-sm">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#E4F2FD] text-[#004AF7]">
                <MapPin size={25} aria-hidden="true" />
              </div>
              <h3 className="mt-4 font-heading text-xl font-bold">
                {unidades.length === 0
                  ? 'As unidades ainda não estão disponíveis'
                  : 'Nenhuma unidade encontrada'}
              </h3>
              <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-600">
                {unidades.length === 0
                  ? 'A lista de unidades e serviços aparecerá aqui quando for conectada ao sistema.'
                  : 'Tente pesquisar por outro nome de unidade ou serviço.'}
              </p>
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {resultados.map(unidade => (
                <article
                  key={unidade.id}
                  className="flex flex-col rounded-2xl bg-white p-6 shadow-sm"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#E4F2FD] text-[#004AF7]">
                      <Stethoscope size={22} aria-hidden="true" />
                    </div>
                    <div>
                      <h3 className="font-heading text-xl font-bold">
                        {unidade.nome}
                      </h3>
                      {unidade.endereco && (
                        <p className="mt-1 flex items-start gap-1 text-sm text-slate-600">
                          <MapPin size={15} className="mt-0.5 shrink-0" aria-hidden="true" />
                          {unidade.endereco}
                        </p>
                      )}
                    </div>
                  </div>

                  {unidade.descricao && (
                    <p className="mt-4 text-sm leading-6 text-slate-600">
                      {unidade.descricao}
                    </p>
                  )}

                  <div className="mt-5">
                    <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Serviços
                    </h4>
                    <ul className="mt-2 flex flex-wrap gap-2">
                      {(unidade.servicos || []).map(servico => (
                        <li
                          key={servico}
                          className="rounded-full bg-[#E4F2FD] px-3 py-1 text-xs font-medium"
                        >
                          {servico}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {unidade.responsaveis?.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Responsáveis
                      </h4>
                      <p className="mt-2 text-sm text-slate-700">
                        {unidade.responsaveis.join(', ')}
                      </p>
                    </div>
                  )}

                  <Link
                    to="/agendamentos"
                    className={`${botao} mt-6 w-full`}
                  >
                    <CalendarDays size={17} aria-hidden="true" />
                    Ver agendamentos
                  </Link>
                </article>
              ))}
            </div>
          )}
        </section>

        <p className="rounded-xl border border-[#87B7FF] bg-white p-4 text-sm leading-6 text-slate-600">
          A disponibilidade de datas, horários e profissionais é consultada
          na página de Agendamentos.
        </p>
      </div>
    </LayoutAutenticado>
  )
}