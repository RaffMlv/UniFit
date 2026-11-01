import { useMemo, useState } from 'react'
import {
  BarChart3,
  CalendarDays,
  Download,
  FileSpreadsheet,
  FileText,
} from 'lucide-react'
import LayoutAutenticado from '@/components/ui/LayoutAutenticado'

const tiposRelatorio = [
  { id: 'frequencia', nome: 'Frequência dos alunos', descricao: 'Acompanhe a presença dos alunos na academia.' },
  { id: 'utilizacao', nome: 'Utilização da academia', descricao: 'Consulte os registros de utilização no período.' },
  { id: 'aulas', nome: 'Aulas', descricao: 'Veja os dados das aulas coletivas.' },
  { id: 'atendimentos_ef', nome: 'Atendimentos de Educação Física', descricao: 'Consulte atendimentos dessa área.' },
  { id: 'atendimentos_fisio', nome: 'Atendimentos de Fisioterapia', descricao: 'Consulte atendimentos dessa área.' },
  { id: 'atendimentos_nutricao', nome: 'Atendimentos de Nutrição', descricao: 'Consulte atendimentos dessa área.' },
  { id: 'monitores', nome: 'Atividades dos monitores', descricao: 'Consulte as atividades registradas pelos monitores.' },
  { id: 'financeiro', nome: 'Financeiro', descricao: 'Relatório financeiro, quando o módulo estiver habilitado.' },
]

/**
 * Relatórios administrativos (RF47).
 * Recebe `relatorios` no formato { [tipo]: { colunas: [{ chave, titulo }],
 * linhas: [{ ... }], resumo: [{ titulo, valor }] } e `onGerar(filtros)`.
 * Nenhum dado de demonstração é incluído nesta tela.
 */
export default function AdminRelatorios({ relatorios = {}, onGerar, financeiroHabilitado = false }) {
  const [tipo, setTipo] = useState('frequencia')
  const [dataInicial, setDataInicial] = useState('')
  const [dataFinal, setDataFinal] = useState('')
  const [filtrosAplicados, setFiltrosAplicados] = useState(null)
  const [erro, setErro] = useState('')

  const tiposDisponiveis = tiposRelatorio.filter((item) => item.id !== 'financeiro' || financeiroHabilitado)
  const definicao = tiposDisponiveis.find((item) => item.id === tipo)
  const resultado = relatorios[tipo] || { colunas: [], linhas: [], resumo: [] }
  const colunas = resultado.colunas || []
  const linhas = resultado.linhas || []
  const resumo = resultado.resumo || []
  const periodoValido = !dataInicial || !dataFinal || dataInicial <= dataFinal

  const periodoTexto = useMemo(() => {
    if (!filtrosAplicados) return 'Defina um período e selecione “Gerar relatório”.'
    if (!filtrosAplicados.dataInicial && !filtrosAplicados.dataFinal) return 'Período não limitado por datas.'
    return `${filtrosAplicados.dataInicial ? formatarData(filtrosAplicados.dataInicial) : 'Início'} até ${filtrosAplicados.dataFinal ? formatarData(filtrosAplicados.dataFinal) : 'hoje'}`
  }, [filtrosAplicados])

  function aplicarFiltros(evento) {
    evento.preventDefault()
    if (!periodoValido) {
      setErro('A data inicial precisa ser anterior ou igual à data final.')
      return
    }
    setErro('')
    const filtros = { tipo, dataInicial, dataFinal }
    setFiltrosAplicados(filtros)
    onGerar?.(filtros)
  }

  function alterarTipo(novoTipo) {
    setTipo(novoTipo)
    setFiltrosAplicados(null)
    setErro('')
  }

  function exportarCSV() {
    if (!linhas.length || !colunas.length) return
    const csv = [
      colunas.map((coluna) => escaparCSV(coluna.titulo)).join(','),
      ...linhas.map((linha) => colunas.map((coluna) => escaparCSV(linha[coluna.chave])).join(',')),
    ].join('\r\n')
    const arquivo = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(arquivo)
    const link = document.createElement('a')
    link.href = url
    link.download = `unifit-relatorio-${tipo}.csv`
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
  }

  return (
    <LayoutAutenticado titulo="Relatórios">
      <main className="space-y-6 text-[#142191]">
        <header>
          <p className="text-sm font-semibold uppercase tracking-wide text-[#004AF7]">Administração</p>
          <h1 className="mt-1 font-heading text-3xl font-bold sm:text-4xl">Relatórios</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            Consulte informações de frequência, utilização, aulas, atendimentos e atividades administrativas.
          </p>
        </header>

        <section className="rounded-2xl bg-white p-5 shadow-sm sm:p-6">
          <form onSubmit={aplicarFiltros} className="space-y-5">
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_1fr_1fr_auto] lg:items-end">
              <label className="block">
                <span className="mb-1.5 block text-sm font-semibold text-[#142191]">Tipo de relatório</span>
                <select value={tipo} onChange={(evento) => alterarTipo(evento.target.value)} className="min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-800 outline-none focus:border-[#004AF7] focus:ring-2 focus:ring-[#004AF7]/20">
                  {tiposDisponiveis.map((item) => <option key={item.id} value={item.id}>{item.nome}</option>)}
                </select>
              </label>
              <CampoData rotulo="Período inicial" valor={dataInicial} aoMudar={(valor) => { setDataInicial(valor); setFiltrosAplicados(null) }} />
              <CampoData rotulo="Período final" valor={dataFinal} aoMudar={(valor) => { setDataFinal(valor); setFiltrosAplicados(null) }} />
              <button type="submit" className="min-h-11 rounded-lg bg-[#004AF7] px-5 text-sm font-semibold text-white hover:bg-[#142191] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#004AF7]">Gerar relatório</button>
            </div>
            {erro && <p role="alert" className="text-sm font-medium text-red-700">{erro}</p>}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#E4F2FD] text-[#004AF7]"><BarChart3 size={20} aria-hidden="true" /></span>
                <div><h2 className="font-heading text-lg font-bold">{definicao?.nome}</h2><p className="mt-0.5 text-sm text-slate-600">{definicao?.descricao}</p></div>
              </div>
              <p className="text-sm text-slate-500">{periodoTexto}</p>
            </div>
          </form>
        </section>

        {resumo.length > 0 && (
          <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Resumo do relatório">
            {resumo.map((item, indice) => <article key={item.id || `${item.titulo}-${indice}`} className="rounded-2xl bg-white p-4 shadow-sm"><p className="text-sm text-slate-600">{item.titulo}</p><p className="mt-2 font-heading text-2xl font-bold text-[#142191]">{item.valor}</p></article>)}
          </section>
        )}

        <section className="overflow-hidden rounded-2xl bg-white shadow-sm" aria-label="Resultados do relatório">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4 sm:px-6">
            <div className="flex items-center gap-2"><FileSpreadsheet size={20} className="text-[#004AF7]" aria-hidden="true" /><h2 className="font-heading text-xl font-bold">Resultados</h2></div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-slate-500">{linhas.length} registros</span>
              <button type="button" onClick={exportarCSV} disabled={!linhas.length || !colunas.length} className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-[#004AF7] px-3 text-sm font-semibold text-white hover:bg-[#142191] disabled:cursor-not-allowed disabled:bg-slate-300" title={!linhas.length ? 'Não há resultados para exportar' : 'Exportar arquivo CSV'}><Download size={16} aria-hidden="true" /> Exportar CSV</button>
            </div>
          </div>

          {!filtrosAplicados ? (
            <EstadoVazio titulo="Gere um relatório para ver os resultados" texto="Selecione o tipo e o período acima. Os dados serão carregados pelo sistema." />
          ) : linhas.length === 0 || colunas.length === 0 ? (
            <EstadoVazio titulo="Nenhum resultado encontrado" texto="Não há registros para os filtros selecionados ou os dados ainda não foram carregados." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr>{colunas.map((coluna) => <th key={coluna.chave} scope="col" className="px-5 py-3 font-semibold">{coluna.titulo}</th>)}</tr></thead>
                <tbody className="divide-y divide-slate-100">
                  {linhas.map((linha, indice) => <tr key={linha.id || indice} className="text-slate-700 hover:bg-slate-50/70">{colunas.map((coluna) => <td key={coluna.chave} className="px-5 py-3.5">{formatarValor(linha[coluna.chave])}</td>)}</tr>)}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <p className="text-xs leading-5 text-slate-500">
          Os dados do relatório e os totais devem ser fornecidos pelo backend conforme o período e o tipo selecionados. O CSV exporta apenas as linhas já carregadas nesta tela.
        </p>
      </main>
    </LayoutAutenticado>
  )
}

function CampoData({ rotulo, valor, aoMudar }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold text-[#142191]">{rotulo}</span>
      <span className="relative block">
        <CalendarDays size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" />
        <input type="date" value={valor} onChange={(evento) => aoMudar(evento.target.value)} className="min-h-11 w-full rounded-lg border border-slate-300 bg-white pl-9 pr-2 text-sm text-slate-800 outline-none focus:border-[#004AF7] focus:ring-2 focus:ring-[#004AF7]/20" />
      </span>
    </label>
  )
}

function EstadoVazio({ titulo, texto }) {
  return (
    <div className="px-6 py-14 text-center">
      <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E4F2FD] text-[#004AF7]"><FileText size={25} aria-hidden="true" /></span>
      <h3 className="mt-4 font-heading text-lg font-bold text-[#142191]">{titulo}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">{texto}</p>
    </div>
  )
}

function formatarData(valor) {
  const [ano, mes, dia] = String(valor).split('-').map(Number)
  if (!ano || !mes || !dia) return valor
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeZone: 'UTC' }).format(new Date(Date.UTC(ano, mes - 1, dia, 12)))
}

function formatarValor(valor) {
  if (valor === null || valor === undefined || valor === '') return '—'
  if (typeof valor === 'boolean') return valor ? 'Sim' : 'Não'
  return String(valor)
}

function escaparCSV(valor) {
  let texto = valor === null || valor === undefined ? '' : String(valor)
  if (/^[=+\-@]/.test(texto)) texto = `'${texto}`
  return `"${texto.replaceAll('"', '""')}"`
}
