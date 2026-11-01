import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Activity,
  HeartPulse,
  Apple,
  CalendarDays,
  UserRound,
} from 'lucide-react'
import LayoutAutenticado from '@/components/ui/LayoutAutenticado'

const areas = [
  {
    id: 'educacao-fisica',
    nome: 'Educação Física',
    descricao: 'Orientações para seus treinos e sua evolução física.',
    Icone: Activity,
  },
  {
    id: 'fisioterapia',
    nome: 'Fisioterapia',
    descricao: 'Acompanhamento especializado, exercícios e recomendações.',
    Icone: HeartPulse,
  },
  {
    id: 'nutricao',
    nome: 'Nutrição',
    descricao: 'Orientações nutricionais e acompanhamento da sua evolução.',
    Icone: Apple,
  },
]

function dataBR(data) {
  return data ? data.split('-').reverse().join('/') : '—'
}

export default function Acompanhamento({
  acompanhamentos = [],
  proximosAtendimentos = [],
  historico = [],
}) {
  const [areaSelecionada, setAreaSelecionada] = useState(null)

  const dadosDaArea = area =>
    acompanhamentos.find(item => item.area === area.id && item.ativo)

  const selecionada = areas.find(item => item.id === areaSelecionada)
  const dadosSelecionados = selecionada ? dadosDaArea(selecionada) : null

  return (
    <LayoutAutenticado titulo="Acompanhamento">
      <div className="space-y-6 text-[#142191]">
        <header>
          <p className="text-sm font-semibold tracking-wide text-[#004AF7]">
            CUIDADO INTEGRADO
          </p>
          <h2 className="mt-2 font-heading text-4xl font-bold">
            MEU ACOMPANHAMENTO
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            Consulte os serviços de acompanhamento disponíveis e seus próximos atendimentos.
          </p>
        </header>

        <section aria-labelledby="titulo-areas">
          <h2 id="titulo-areas" className="mb-4 font-heading text-2xl font-bold">
            Áreas de acompanhamento
          </h2>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {areas.map(({ id, nome, descricao, Icone }) => {
              const acompanhamento = dadosDaArea({ id })

              return (
                <article
                  key={id}
                  className="flex flex-col rounded-2xl bg-white p-6 shadow-sm"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#E4F2FD] text-[#004AF7]">
                      <Icone size={24} aria-hidden="true" />
                    </div>
                    <div>
                      <h3 className="font-heading text-xl font-bold">{nome}</h3>
                      <p className="mt-1 text-sm leading-5 text-slate-600">
                        {descricao}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 min-h-12">
                    {acompanhamento?.responsavel ? (
                      <p className="flex items-center gap-2 text-sm text-slate-600">
                        <UserRound size={16} aria-hidden="true" />
                        Responsável: {acompanhamento.responsavel}
                      </p>
                    ) : (
                      <p className="text-sm text-slate-500">
                        Nenhum acompanhamento ativo informado.
                      </p>
                    )}
                  </div>

                  <div className="mt-auto grid gap-3 pt-5">
                    {acompanhamento ? (
                      <button
                        type="button"
                        aria-expanded={areaSelecionada === id}
                        aria-controls="detalhe-acompanhamento"
                        onClick={() =>
                          setAreaSelecionada(atual => atual === id ? null : id)
                        }
                        className="min-h-11 rounded-lg border border-[#87B7FF] px-4 py-3 text-sm font-semibold text-[#142191] hover:bg-[#E4F2FD]"
                      >
                        {areaSelecionada === id ? 'Fechar acompanhamento' : 'Ver acompanhamento'}
                      </button>
                    ) : (
                      <Link
                        to="/agendamentos"
                        className="inline-flex min-h-11 items-center justify-center rounded-lg bg-[#004AF7] px-4 py-3 text-sm font-semibold text-white hover:bg-[#142191]"
                      >
                        Solicitar acompanhamento
                      </Link>
                    )}
                  </div>
                </article>
              )
            })}
          </div>
        </section>

        {selecionada && (
          <section
            id="detalhe-acompanhamento"
            aria-labelledby="titulo-detalhe"
            className="rounded-2xl bg-white p-6 shadow-sm"
          >
            <h2 id="titulo-detalhe" className="font-heading text-2xl font-bold">
              {selecionada.nome}
            </h2>

            {dadosSelecionados?.resumo ? (
              <p className="mt-3 text-sm leading-6 text-slate-600">
                {dadosSelecionados.resumo}
              </p>
            ) : (
              <p className="mt-3 text-sm leading-6 text-slate-500">
                Os detalhes deste acompanhamento aparecerão aqui quando forem
                disponibilizados pelo profissional.
              </p>
            )}

            <p className="mt-4 text-xs text-slate-500">
              Orientações e informações devem ser fornecidas pelo responsável
              do acompanhamento.
            </p>
          </section>
        )}

        <section
          aria-labelledby="titulo-proximos"
          className="rounded-2xl bg-white p-6 shadow-sm"
        >
          <h2
            id="titulo-proximos"
            className="flex items-center gap-2 font-heading text-2xl font-bold"
          >
            <CalendarDays size={22} aria-hidden="true" />
            Próximos atendimentos
          </h2>

          {proximosAtendimentos.length === 0 ? (
            <div className="mt-4 rounded-xl bg-slate-50 p-5 text-sm text-slate-600">
              Nenhum atendimento próximo disponível.
              {' '}
              <Link to="/agendamentos" className="font-semibold text-[#004AF7] underline">
                Consultar agendamentos
              </Link>
            </div>
          ) : (
            <ul className="mt-4 divide-y divide-slate-100">
              {proximosAtendimentos.map(item => (
                <li
                  key={item.id}
                  className="flex flex-wrap items-center justify-between gap-3 py-4"
                >
                  <div>
                    <p className="font-semibold">{item.area}</p>
                    <p className="mt-1 text-sm text-slate-600">
                      {dataBR(item.data)} · {item.horario}
                    </p>
                    {item.responsavel && (
                      <p className="mt-1 text-sm text-slate-600">
                        Responsável: {item.responsavel}
                      </p>
                    )}
                    {item.local && (
                      <p className="mt-1 text-sm text-slate-600">{item.local}</p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section
          aria-labelledby="titulo-historico"
          className="overflow-hidden rounded-2xl bg-white shadow-sm"
        >
          <h2 id="titulo-historico" className="p-6 font-heading text-2xl font-bold">
            Histórico resumido dos atendimentos
          </h2>

          {historico.length === 0 ? (
            <p className="px-6 pb-6 text-sm text-slate-600">
              Nenhum atendimento anterior disponível.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[620px] text-left text-sm">
                <thead className="bg-[#E4F2FD]">
                  <tr>
                    {['Data', 'Área', 'Atendimento', 'Responsável', 'Resumo'].map(titulo => (
                      <th key={titulo} scope="col" className="px-5 py-4 font-semibold">
                        {titulo}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {historico.map(item => (
                    <tr key={item.id} className="border-b border-slate-100">
                      <td className="px-5 py-4">{dataBR(item.data)}</td>
                      <td className="px-5 py-4">{item.area}</td>
                      <td className="px-5 py-4">{item.tipo}</td>
                      <td className="px-5 py-4">{item.responsavel || '—'}</td>
                      <td className="px-5 py-4">{item.resumo || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </LayoutAutenticado>
  )
}