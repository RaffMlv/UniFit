import { useState } from 'react'
import { Dumbbell, CalendarDays, TrendingUp } from 'lucide-react'
import LayoutAutenticado from '@/components/ui/LayoutAutenticado'

const campo =
  'mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#004AF7]'

const botao =
  'min-h-11 rounded-lg bg-[#004AF7] px-5 py-3 text-sm font-semibold text-white hover:bg-[#142191] disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500'

function dataLocal(data = new Date()) {
  return [
    data.getFullYear(),
    String(data.getMonth() + 1).padStart(2, '0'),
    String(data.getDate()).padStart(2, '0'),
  ].join('-')
}

function dataBR(data) {
  return data ? data.split('-').reverse().join('/') : '—'
}

function instante(data) {
  return Date.parse(`${data}T00:00:00Z`)
}

function periodoInicial(dias = 90) {
  const fim = new Date()
  const inicio = new Date()
  inicio.setDate(inicio.getDate() - dias + 1)

  return { inicio: dataLocal(inicio), fim: dataLocal(fim) }
}

function numero(valor) {
  return Number.isFinite(valor)
    ? valor.toLocaleString('pt-BR', { maximumFractionDigits: 2 })
    : '—'
}

function GraficoCargas({ registros }) {
  if (registros.length === 0) {
    return (
      <div className="flex min-h-64 items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500">
        Nenhum registro de carga disponível para o exercício e período selecionados.
      </div>
    )
  }

  const largura = 720
  const altura = 300
  const esquerda = 65
  const direita = 35
  const topo = 30
  const base = 235
  const primeiro = instante(registros[0].data)
  const ultimo = instante(registros[registros.length - 1].data)
  const maximo = Math.max(1, ...registros.map(item => item.carga)) * 1.15

  const x = data => primeiro === ultimo
    ? (esquerda + largura - direita) / 2
    : esquerda + (
        (instante(data) - primeiro) / (ultimo - primeiro)
      ) * (largura - esquerda - direita)

  const y = carga => base - (carga / maximo) * (base - topo)

  const pontos = registros.map(item => `${x(item.data)},${y(item.carga)}`).join(' ')
  const indicesDatas = [...new Set(
    Array.from(
      { length: Math.min(5, registros.length) },
      (_, indice) => Math.round(
        indice * (registros.length - 1) / Math.max(1, Math.min(5, registros.length) - 1)
      )
    )
  )]

  return (
    <div className="overflow-x-auto">
      <svg
        viewBox={`0 0 ${largura} ${altura}`}
        role="img"
        aria-label="Evolução da carga em quilogramas por data. Valores detalhados na tabela abaixo."
        className="w-full min-w-[540px]"
      >
        {Array.from({ length: 5 }, (_, indice) => {
          const valor = maximo * indice / 4
          return (
            <g key={indice}>
              <line
                x1={esquerda}
                x2={largura - direita}
                y1={y(valor)}
                y2={y(valor)}
                stroke="#E2E8F0"
              />
              <text
                x={esquerda - 10}
                y={y(valor) + 4}
                textAnchor="end"
                fontSize="11"
                fill="#475569"
              >
                {numero(valor)}
              </text>
            </g>
          )
        })}

        <text x={esquerda} y={16} fontSize="12" fill="#475569">
          Carga (kg)
        </text>

        <polyline
          points={pontos}
          fill="none"
          stroke="#004AF7"
          strokeWidth="3"
          strokeLinejoin="round"
        />

        {registros.map((item, indice) => (
          <circle
            key={`${item.data}-${indice}`}
            cx={x(item.data)}
            cy={y(item.carga)}
            r="4"
            fill="#004AF7"
          >
            <title>{dataBR(item.data)}: {numero(item.carga)} kg</title>
          </circle>
        ))}

        {indicesDatas.map(indice => (
          <text
            key={indice}
            x={x(registros[indice].data)}
            y={base + 24}
            textAnchor="middle"
            fontSize="11"
            fill="#475569"
          >
            {dataBR(registros[indice].data).slice(0, 5)}
          </text>
        ))}

        <text
          x={largura / 2}
          y={altura - 8}
          textAnchor="middle"
          fontSize="12"
          fill="#475569"
        >
          Datas
        </text>
      </svg>

      <details className="mt-3 text-sm">
        <summary className="cursor-pointer font-semibold text-[#004AF7]">
          Ver valores do gráfico
        </summary>
        <table className="mt-3 w-full text-left">
          <thead>
            <tr className="border-b border-slate-200">
              <th scope="col" className="p-2">Data</th>
              <th scope="col" className="p-2">Carga (kg)</th>
            </tr>
          </thead>
          <tbody>
            {registros.map((item, indice) => (
              <tr key={`${item.data}-${indice}`} className="border-b border-slate-100">
                <td className="p-2">{dataBR(item.data)}</td>
                <td className="p-2">{numero(item.carga)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </div>
  )
}

export default function Progresso({
  treinos = [],
  exercicios = [],
  avaliacoes = [],
}) {
  const [periodo, setPeriodo] = useState('90')
  const [datas, setDatas] = useState(() => periodoInicial())
  const [filtro, setFiltro] = useState(() => periodoInicial())
  const [erro, setErro] = useState('')
  const [exercicioId, setExercicioId] = useState('')
  const [avaliacaoA, setAvaliacaoA] = useState('')
  const [avaliacaoB, setAvaliacaoB] = useState('')
  const [comparacao, setComparacao] = useState(null)

  const noPeriodo = data => data >= filtro.inicio && data <= filtro.fim

  const historico = treinos
    .filter(treino => noPeriodo(treino.data))
    .sort((a, b) => b.data.localeCompare(a.data))

  const diasTreinados = new Set(historico.map(treino => treino.data)).size
  const quantidadeDias = Math.round(
    (instante(filtro.fim) - instante(filtro.inicio)) / 86400000
  ) + 1

  const frequenciaSemanal = diasTreinados * 7 / quantidadeDias

  const exercicio = exercicios.find(item => String(item.id) === exercicioId)

  const registros = (exercicio?.registros || [])
    .filter(item => noPeriodo(item.data) && Number.isFinite(item.carga) && item.carga >= 0)
    .sort((a, b) => a.data.localeCompare(b.data))

  const variacao = registros.length >= 2
    ? registros[registros.length - 1].carga - registros[0].carga
    : null

  const avaliacoesOrdenadas = [...avaliacoes]
    .sort((a, b) => b.data.localeCompare(a.data))

  const primeira = avaliacoes.find(item => String(item.id) === comparacao?.a)
  const segunda = avaliacoes.find(item => String(item.id) === comparacao?.b)

  const medidas = primeira && segunda
    ? primeira.medidas.map(medida => ({
        primeira: medida,
        segunda: segunda.medidas.find(item => item.chave === medida.chave),
      })).filter(item => item.segunda)
    : []

  function alterarPeriodo(valor) {
    setPeriodo(valor)
    if (valor !== 'personalizado') {
      setDatas(periodoInicial(Number(valor)))
    }
    setErro('')
  }

  function aplicarFiltro(evento) {
    evento.preventDefault()

    if (!datas.inicio || !datas.fim || datas.inicio > datas.fim) {
      setErro('Informe um período válido, com a data inicial anterior ou igual à final.')
      return
    }

    if (datas.fim > dataLocal()) {
      setErro('A data final não pode estar no futuro.')
      return
    }

    setFiltro({ ...datas })
    setErro('')
  }

  function selecionarAvaliacao(lado, valor) {
    if (lado === 'a') setAvaliacaoA(valor)
    else setAvaliacaoB(valor)
    setComparacao(null)
  }

  return (
    <LayoutAutenticado titulo="Progresso">
      <div className="space-y-6 text-[#142191]">
        <header>
          <p className="text-sm font-semibold tracking-wide text-[#004AF7]">
            SUA EVOLUÇÃO NO UNIFIT
          </p>
          <h2 className="mt-2 font-heading text-4xl font-bold">
            MEU PROGRESSO
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Acompanhe sua frequência, seus treinos e a evolução dos exercícios.
          </p>
        </header>

        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="font-heading text-2xl font-bold">Período de acompanhamento</h2>

          <form
            onSubmit={aplicarFiltro}
            className="mt-5 grid items-end gap-4 sm:grid-cols-2 xl:grid-cols-4"
          >
            <div>
              <label htmlFor="periodo" className="text-sm font-semibold">Período</label>
              <select
                id="periodo"
                value={periodo}
                onChange={evento => alterarPeriodo(evento.target.value)}
                className={campo}
              >
                <option value="30">Últimos 30 dias</option>
                <option value="90">Últimos 90 dias</option>
                <option value="180">Últimos 180 dias</option>
                <option value="personalizado">Personalizado</option>
              </select>
            </div>

            <div>
              <label htmlFor="inicio" className="text-sm font-semibold">Data inicial</label>
              <input
                id="inicio"
                type="date"
                required
                max={dataLocal()}
                value={datas.inicio}
                onChange={evento => {
                  setDatas(atuais => ({ ...atuais, inicio: evento.target.value }))
                  setPeriodo('personalizado')
                }}
                className={campo}
              />
            </div>

            <div>
              <label htmlFor="fim" className="text-sm font-semibold">Data final</label>
              <input
                id="fim"
                type="date"
                required
                max={dataLocal()}
                value={datas.fim}
                onChange={evento => {
                  setDatas(atuais => ({ ...atuais, fim: evento.target.value }))
                  setPeriodo('personalizado')
                }}
                className={campo}
              />
            </div>

            <button type="submit" className={botao}>Aplicar filtros</button>
          </form>

          {erro && <p role="alert" className="mt-3 text-sm text-red-700">{erro}</p>}

          <p className="mt-4 text-xs text-slate-500">
            Exibindo de {dataBR(filtro.inicio)} até {dataBR(filtro.fim)}.
          </p>
        </section>

        <section aria-label="Resumo do período" className="grid gap-5 sm:grid-cols-2">
          <article className="rounded-2xl bg-white p-6 shadow-sm">
            <Dumbbell className="text-[#004AF7]" aria-hidden="true" />
            <h2 className="mt-3 text-sm font-semibold text-slate-600">
              Treinos realizados
            </h2>
            <p className="mt-2 font-heading text-4xl font-bold">{historico.length}</p>
            <p className="mt-2 text-xs text-slate-500">Treinos concluídos no período.</p>
          </article>

          <article className="rounded-2xl bg-white p-6 shadow-sm">
            <CalendarDays className="text-[#004AF7]" aria-hidden="true" />
            <h2 className="mt-3 text-sm font-semibold text-slate-600">
              Frequência no período
            </h2>
            <p className="mt-2 font-heading text-4xl font-bold">
              {numero(frequenciaSemanal)}
              <span className="ml-2 font-sans text-sm font-medium">dias/semana</span>
            </p>
            <p className="mt-2 text-xs text-slate-500">
              Média de dias com treino · {diasTreinados} dia(s) no período.
            </p>
          </article>
        </section>

        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="flex items-center gap-2 font-heading text-2xl font-bold">
            <TrendingUp size={23} aria-hidden="true" />
            Evolução de carga por exercício
          </h2>

          <div className="mb-6 mt-5 max-w-md">
            <label htmlFor="exercicio" className="text-sm font-semibold">
              Exercício
            </label>
            <select
              id="exercicio"
              value={exercicioId}
              onChange={evento => setExercicioId(evento.target.value)}
              className={campo}
            >
              <option value="">Selecione um exercício</option>
              {exercicios.map(item => (
                <option key={item.id} value={item.id}>{item.nome}</option>
              ))}
            </select>
          </div>

          {!exercicio ? (
            <div className="flex min-h-64 items-center justify-center rounded-xl bg-slate-50 p-6 text-center text-sm text-slate-500">
              {exercicios.length === 0
                ? 'Nenhum exercício com dados disponíveis para acompanhar.'
                : 'Selecione um exercício para visualizar sua evolução.'}
            </div>
          ) : (
            <GraficoCargas registros={registros} />
          )}

          {variacao !== null && (
            <div className="mt-5 rounded-xl bg-[#E4F2FD] p-4 text-sm">
              <strong>Variação de carga no período: </strong>
              {variacao > 0 ? '+' : ''}{numero(variacao)} kg
            </div>
          )}
        </section>

        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="font-heading text-2xl font-bold">
            Avaliações físicas e comparação
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Escolha duas avaliações do seu histórico. Esta comparação é independente
            do filtro de treinos acima.
          </p>

          {avaliacoes.length === 0 ? (
            <p className="mt-5 rounded-xl bg-slate-50 p-6 text-center text-sm text-slate-500">
              Nenhuma avaliação física disponível.
            </p>
          ) : (
            <>
              <ul className="mt-4 flex flex-wrap gap-2" aria-label="Avaliações disponíveis">
                {avaliacoesOrdenadas.map(item => (
                  <li key={item.id} className="rounded-full bg-[#E4F2FD] px-3 py-1 text-xs">
                    Avaliação #{item.id} · {dataBR(item.data)}
                  </li>
                ))}
              </ul>

              <div className="mt-5 grid items-end gap-4 sm:grid-cols-2 xl:grid-cols-[1fr_1fr_auto]">
                {[
                  ['a', 'Primeira avaliação', avaliacaoA],
                  ['b', 'Segunda avaliação', avaliacaoB],
                ].map(([lado, rotulo, valor]) => (
                  <div key={lado}>
                    <label htmlFor={`avaliacao-${lado}`} className="text-sm font-semibold">
                      {rotulo}
                    </label>
                    <select
                      id={`avaliacao-${lado}`}
                      value={valor}
                      onChange={evento => selecionarAvaliacao(lado, evento.target.value)}
                      className={campo}
                    >
                      <option value="">Selecione uma avaliação</option>
                      {avaliacoesOrdenadas.map(item => (
                        <option key={item.id} value={item.id}>
                          {dataBR(item.data)} — Avaliação #{item.id}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}

                <button
                  type="button"
                  disabled={!avaliacaoA || !avaliacaoB || avaliacaoA === avaliacaoB}
                  onClick={() => setComparacao({ a: avaliacaoA, b: avaliacaoB })}
                  className={botao}
                >
                  Comparar
                </button>
              </div>

              {avaliacoes.length < 2 && (
                <p className="mt-3 text-sm text-slate-500">
                  A comparação estará disponível quando houver pelo menos duas avaliações.
                </p>
              )}
            </>
          )}

          {primeira && segunda && (
            <div className="mt-6 overflow-x-auto">
              <table className="w-full min-w-[580px] text-left text-sm">
                <thead className="bg-[#E4F2FD]">
                  <tr>
                    <th scope="col" className="p-4">Métrica</th>
                    <th scope="col" className="p-4">{dataBR(primeira.data)}</th>
                    <th scope="col" className="p-4">{dataBR(segunda.data)}</th>
                    <th scope="col" className="p-4">Diferença (2ª − 1ª)</th>
                  </tr>
                </thead>
                <tbody>
                  {medidas.map(({ primeira: a, segunda: b }) => {
                    const comparavel = a.unidade === b.unidade &&
                      Number.isFinite(a.valor) && Number.isFinite(b.valor)
                    const diferenca = comparavel ? b.valor - a.valor : null

                    return (
                      <tr key={a.chave} className="border-b border-slate-100">
                        <th scope="row" className="p-4 font-medium">{a.nome}</th>
                        <td className="p-4">{numero(a.valor)} {a.unidade}</td>
                        <td className="p-4">{numero(b.valor)} {b.unidade}</td>
                        <td className="p-4">
                          {diferenca === null
                            ? 'Não comparável'
                            : `${diferenca > 0 ? '+' : ''}${numero(diferenca)} ${
                                  a.unidade === '%' ? 'p.p.' : a.unidade
                                }`}
                        </td>
                      </tr>
                    )
                  })}
                  {medidas.length === 0 && (
                    <tr>
                      <td colSpan={4} className="p-6 text-center text-slate-500">
                        As avaliações não possuem métricas em comum.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="overflow-hidden rounded-2xl bg-white shadow-sm">
          <h2 className="p-6 font-heading text-2xl font-bold">
            Histórico cronológico de treinos
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead className="bg-[#E4F2FD]">
                <tr>
                  {['Data', 'Treino', 'Duração (min)', 'Nº de exercícios'].map(titulo => (
                    <th key={titulo} scope="col" className="px-5 py-4">{titulo}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {historico.map(treino => (
                  <tr key={treino.id} className="border-b border-slate-100">
                    <td className="px-5 py-4">{dataBR(treino.data)}</td>
                    <td className="px-5 py-4 font-semibold">{treino.nome}</td>
                    <td className="px-5 py-4">{numero(treino.duracaoMinutos)}</td>
                    <td className="px-5 py-4">{numero(treino.quantidadeExercicios)}</td>
                  </tr>
                ))}

                {historico.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-10 text-center text-slate-500">
                      Nenhum treino registrado no período selecionado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </LayoutAutenticado>
  )
}