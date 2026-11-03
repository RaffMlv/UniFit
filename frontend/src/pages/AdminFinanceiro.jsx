import { useMemo, useState } from 'react'
import {
  Banknote,
  CalendarDays,
  CreditCard,
  Download,
  FileText,
  Search,
  X,
  Eye,
  CircleDollarSign,
} from 'lucide-react'
import LayoutAutenticado from '@/components/ui/LayoutAutenticado'

const situacoes = [
  { id: 'todas', nome: 'Todas as situações' },
  { id: 'paga', nome: 'Paga' },
  { id: 'pendente', nome: 'Pendente' },
  { id: 'vencida', nome: 'Vencida' },
]

const tiposRelatorio = [
  { id: 'pagamentos', nome: 'Pagamentos' },
  { id: 'inadimplencia', nome: 'Inadimplência' },
]

const rotulosSituacao = { paga: 'Paga', pendente: 'Pendente', vencida: 'Vencida' }
const coresSituacao = {
  paga: 'bg-emerald-50 text-emerald-700',
  pendente: 'bg-amber-50 text-amber-800',
  vencida: 'bg-rose-50 text-rose-700',
}

const moedaBRL = (valor) => {
  if (valor === null || valor === undefined || valor === '') return '—'
  const numero = Number(valor)
  return Number.isFinite(numero)
    ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(numero)
    : '—'
}

function formatarData(valor) {
  if (!valor) return '—'
  const iso = String(valor).slice(0, 10)
  const [ano, mes, dia] = iso.split('-').map(Number)
  if (!ano || !mes || !dia) return valor
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeZone: 'UTC' }).format(new Date(Date.UTC(ano, mes - 1, dia, 12)))
}

const idDaOpcao = (item) => typeof item === 'string' ? item : item.id
const nomeDaOpcao = (item) => typeof item === 'string' ? item : item.nome

export default function AdminFinanceiro({ cobrancas = [], planos = [], unidades = [], resumo = null }) {
  const [aba, setAba] = useState('cobrancas')
  const [busca, setBusca] = useState('')
  const [situacao, setSituacao] = useState('todas')
  const [inicio, setInicio] = useState('')
  const [fim, setFim] = useState('')
  const [plano, setPlano] = useState('todos')
  const [unidade, setUnidade] = useState('todas')
  const [tipoRelatorio, setTipoRelatorio] = useState('pagamentos')
  const [cobrancaSelecionada, setCobrancaSelecionada] = useState(null)

  const cobrancasFiltradas = useMemo(() => {
    const termo = busca.trim().toLocaleLowerCase('pt-BR')
    return cobrancas.filter((item) => {
      const estado = item.situacao || 'pendente'
      const data = String(item.vencimento || '').slice(0, 10)
      const correspondeBusca = !termo || [item.aluno?.nome, item.aluno?.cpf]
        .filter(Boolean)
        .some((valor) => String(valor).toLocaleLowerCase('pt-BR').includes(termo))
      const correspondePeriodo = (!inicio || data >= inicio) && (!fim || data <= fim)
      const correspondeSituacao = situacao === 'todas' || estado === situacao
      const correspondePlano = plano === 'todos' || String(item.planoId ?? item.plano) === plano
      const correspondeUnidade = unidade === 'todas' || String(item.unidadeId ?? item.unidade) === unidade
      return correspondeBusca && correspondePeriodo && correspondeSituacao && correspondePlano && correspondeUnidade
    })
  }, [cobrancas, busca, inicio, fim, situacao, plano, unidade])

  const cobrançasDoAluno = cobrancaSelecionada
    ? cobrancas.filter((item) => item.aluno?.id === cobrancaSelecionada.aluno?.id)
    : []

  function limparFiltros() {
    setBusca('')
    setSituacao('todas')
    setInicio('')
    setFim('')
    setPlano('todos')
    setUnidade('todas')
  }

  return (
    <LayoutAutenticado titulo="Financeiro">
      <main className="space-y-6 text-[#142191]">
        <header>
          <p className="text-sm font-semibold uppercase tracking-wide text-[#004AF7]">Administração</p>
          <h1 className="mt-1 font-heading text-3xl font-bold sm:text-4xl">Financeiro</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            Consulte cobranças, acompanhe pendências e gere relatórios financeiros conforme os filtros.
          </p>
        </header>

        <section className="grid gap-4 sm:grid-cols-3" aria-label="Resumo financeiro do período">
          <ResumoFinanceiro icon={CircleDollarSign} titulo="Total recebido" valor={moedaBRL(resumo?.recebido)} detalhe="No período selecionado" cor="text-emerald-700" />
          <ResumoFinanceiro icon={CreditCard} titulo="Cobranças pendentes" valor={moedaBRL(resumo?.pendente)} detalhe="Aguardando pagamento" cor="text-amber-700" />
          <ResumoFinanceiro icon={Banknote} titulo="Cobranças vencidas" valor={moedaBRL(resumo?.vencido)} detalhe="Com vencimento ultrapassado" cor="text-rose-700" />
        </section>

        <section className="rounded-2xl bg-white p-4 shadow-sm sm:p-5">
          <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-4" role="tablist" aria-label="Área financeira">
            <button type="button" role="tab" aria-selected={aba === 'cobrancas'} onClick={() => setAba('cobrancas')} className={`min-h-10 rounded-lg px-4 py-2 text-sm font-semibold ${aba === 'cobrancas' ? 'bg-[#004AF7] text-white' : 'bg-[#E4F2FD] text-[#142191] hover:bg-blue-100'}`}>Cobranças</button>
            <button type="button" role="tab" aria-selected={aba === 'relatorios'} onClick={() => setAba('relatorios')} className={`min-h-10 rounded-lg px-4 py-2 text-sm font-semibold ${aba === 'relatorios' ? 'bg-[#004AF7] text-white' : 'bg-[#E4F2FD] text-[#142191] hover:bg-blue-100'}`}>Relatórios</button>
          </div>

          {aba === 'cobrancas' ? (
            <>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                <label className="relative block sm:col-span-2 xl:col-span-1">
                  <span className="sr-only">Buscar por aluno</span>
                  <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" />
                  <input type="search" value={busca} onChange={(evento) => setBusca(evento.target.value)} placeholder="Buscar aluno ou CPF, se autorizado" className="min-h-11 w-full rounded-lg border border-slate-300 bg-white pl-10 pr-3 text-sm text-slate-800 outline-none focus:border-[#004AF7] focus:ring-2 focus:ring-[#004AF7]/20" />
                </label>
                <CampoData rotulo="Vencimento a partir de" valor={inicio} aoMudar={setInicio} />
                <CampoData rotulo="Vencimento até" valor={fim} aoMudar={setFim} />
                <SelectFiltro rotulo="Plano" valor={plano} aoMudar={setPlano} todos="Todos os planos" opcoes={planos} />
                <SelectFiltro rotulo="Unidade" valor={unidade} aoMudar={setUnidade} todos="Todas as unidades" opcoes={unidades} />
                <label className="block">
                  <span className="sr-only">Filtrar situação</span>
                  <select value={situacao} onChange={(evento) => setSituacao(evento.target.value)} className="min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-800 outline-none focus:border-[#004AF7] focus:ring-2 focus:ring-[#004AF7]/20">
                    {situacoes.map((item) => <option key={item.id} value={item.id}>{item.nome}</option>)}
                  </select>
                </label>
              </div>
              <div className="mt-3 flex justify-end">
                <button type="button" onClick={limparFiltros} className="min-h-9 rounded-lg px-3 text-sm font-semibold text-[#004AF7] hover:bg-[#E4F2FD]">Limpar filtros</button>
              </div>

              <div className="mt-4 overflow-hidden rounded-xl border border-slate-100">
                <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3">
                  <h2 className="font-heading text-lg font-bold">Cobranças</h2>
                  <span className="text-sm text-slate-500">{cobrancasFiltradas.length} registros</span>
                </div>
                {cobrancasFiltradas.length === 0 ? (
                  <div className="px-5 py-12 text-center">
                    <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#E4F2FD] text-[#004AF7]"><FileText size={22} aria-hidden="true" /></span>
                    <h3 className="mt-3 font-semibold text-[#142191]">Nenhuma cobrança encontrada</h3>
                    <p className="mt-1 text-sm text-slate-500">Os registros aparecerão aqui quando forem carregados pelo sistema.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[900px] text-left text-sm">
                      <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                        <tr><th scope="col" className="px-4 py-3 font-semibold">Aluno</th><th scope="col" className="px-4 py-3 font-semibold">Valor</th><th scope="col" className="px-4 py-3 font-semibold">Vencimento</th><th scope="col" className="px-4 py-3 font-semibold">Pagamento</th><th scope="col" className="px-4 py-3 font-semibold">Forma</th><th scope="col" className="px-4 py-3 font-semibold">Situação</th><th scope="col" className="px-4 py-3 font-semibold">Detalhes</th></tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {cobrancasFiltradas.map((item) => (
                          <tr key={item.id} className="text-slate-700 hover:bg-slate-50/70">
                            <td className="px-4 py-3.5 font-medium text-[#142191]">{item.aluno?.nome || 'Aluno não informado'}</td>
                            <td className="px-4 py-3.5">{moedaBRL(Number(item.valor))}</td>
                            <td className="px-4 py-3.5">{formatarData(item.vencimento)}</td>
                            <td className="px-4 py-3.5">{item.pagamentoEm ? formatarData(item.pagamentoEm) : '—'}</td>
                            <td className="px-4 py-3.5">{item.formaPagamento || '—'}</td>
                            <td className="px-4 py-3.5"><span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${coresSituacao[item.situacao] || 'bg-slate-100 text-slate-700'}`}>{rotulosSituacao[item.situacao] || item.situacao || 'Pendente'}</span></td>
                            <td className="px-4 py-3.5"><button type="button" onClick={() => setCobrancaSelecionada(item)} className="inline-flex min-h-9 items-center gap-1.5 rounded-lg px-2 text-sm font-semibold text-[#004AF7] hover:bg-[#E4F2FD]"><Eye size={16} aria-hidden="true" /> Ver</button></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="mt-5 space-y-5">
              <div>
                <h2 className="font-heading text-xl font-bold">Relatórios financeiros</h2>
                <p className="mt-1 text-sm text-slate-600">Escolha o tipo e aplique filtros para consultar os totais do período.</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
                <label className="block">
                  <span className="mb-1.5 block text-xs font-semibold text-slate-600">Relatório</span>
                  <select value={tipoRelatorio} onChange={(evento) => setTipoRelatorio(evento.target.value)} className="min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-800 outline-none focus:border-[#004AF7] focus:ring-2 focus:ring-[#004AF7]/20">
                    {tiposRelatorio.map((item) => <option key={item.id} value={item.id}>{item.nome}</option>)}
                  </select>
                </label>
                <CampoData rotulo="Período inicial" valor={inicio} aoMudar={setInicio} />
                <CampoData rotulo="Período final" valor={fim} aoMudar={setFim} />
                <SelectFiltro rotulo="Unidade" valor={unidade} aoMudar={setUnidade} todos="Todas as unidades" opcoes={unidades} />
                <SelectFiltro rotulo="Plano" valor={plano} aoMudar={setPlano} todos="Todos os planos" opcoes={planos} />
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50 p-4">
                <div>
                  <p className="text-sm font-semibold text-[#142191]">{tipoRelatorio === 'pagamentos' ? 'Pagamentos no período' : 'Inadimplência no período'}</p>
                  <p className="mt-1 text-sm text-slate-600">Total retornado para os filtros: {moedaBRL(tipoRelatorio === 'pagamentos' ? resumo?.pagamentosFiltrados : resumo?.inadimplenciaFiltrada)}</p>
                </div>
                <button type="button" disabled className="inline-flex min-h-10 cursor-not-allowed items-center gap-2 rounded-lg bg-slate-300 px-4 text-sm font-semibold text-white" title="A exportação será habilitada após integração com a API"><Download size={17} aria-hidden="true" /> Exportar</button>
              </div>
              <p className="text-xs leading-5 text-slate-500">A exportação e os totais filtrados serão fornecidos pela API para evitar divergência entre a tela e os dados financeiros.</p>
            </div>
          )}
        </section>
      </main>

      {cobrancaSelecionada && <DetalheCobrancaModal cobranca={cobrancaSelecionada} historico={cobrancasDoAluno} aoFechar={() => setCobrancaSelecionada(null)} />}
    </LayoutAutenticado>
  )
}

function ResumoFinanceiro({ icon: Icone, titulo, valor, detalhe, cor }) {
  return (
    <article className="rounded-2xl bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div><p className="text-sm text-slate-600">{titulo}</p><p className="mt-2 font-heading text-2xl font-bold text-[#142191]">{valor}</p></div>
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#E4F2FD]"><Icone size={21} className={cor} aria-hidden="true" /></span>
      </div>
      <p className="mt-3 text-xs text-slate-500">{detalhe}</p>
    </article>
  )
}

function CampoData({ rotulo, valor, aoMudar }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold text-slate-600">{rotulo}</span>
      <span className="relative block">
        <CalendarDays size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" />
        <input type="date" value={valor} onChange={(evento) => aoMudar(evento.target.value)} className="min-h-11 w-full rounded-lg border border-slate-300 bg-white pl-9 pr-2 text-sm text-slate-800 outline-none focus:border-[#004AF7] focus:ring-2 focus:ring-[#004AF7]/20" />
      </span>
    </label>
  )
}

function SelectFiltro({ rotulo, valor, aoMudar, todos, opcoes }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold text-slate-600">{rotulo}</span>
      <select value={valor} onChange={(evento) => aoMudar(evento.target.value)} className="min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-800 outline-none focus:border-[#004AF7] focus:ring-2 focus:ring-[#004AF7]/20">
        <option value={rotulo === 'Plano' ? 'todos' : 'todas'}>{todos}</option>
        {opcoes.map((item) => <option key={idDaOpcao(item)} value={idDaOpcao(item)}>{nomeDaOpcao(item)}</option>)}
      </select>
    </label>
  )
}

function DetalheCobrancaModal({ cobranca, historico, aoFechar }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#142191]/60 p-4" onMouseDown={(evento) => evento.target === evento.currentTarget && aoFechar()}>
      <section role="dialog" aria-modal="true" aria-labelledby="tituloDetalheCobranca" className="my-6 max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white p-5 shadow-xl sm:p-7">
        <div className="flex items-start justify-between gap-4">
          <div><p className="text-sm font-semibold text-[#004AF7]">Detalhes da cobrança</p><h2 id="tituloDetalheCobranca" className="mt-1 font-heading text-2xl font-bold text-[#142191]">{cobranca.aluno?.nome || 'Aluno'}</h2></div>
          <button type="button" onClick={aoFechar} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100" aria-label="Fechar detalhes"><X size={20} /></button>
        </div>
        <dl className="mt-5 grid gap-3 sm:grid-cols-2">
          <Detalhe rotulo="Valor" valor={moedaBRL(Number(cobranca.valor))} />
          <Detalhe rotulo="Situação" valor={rotulosSituacao[cobranca.situacao] || cobranca.situacao || 'Pendente'} />
          <Detalhe rotulo="Vencimento" valor={formatarData(cobranca.vencimento)} />
          <Detalhe rotulo="Pagamento" valor={formatarData(cobranca.pagamentoEm)} />
          <Detalhe rotulo="Plano" valor={cobranca.planoNome || cobranca.plano || '—'} />
          <Detalhe rotulo="Unidade" valor={cobranca.unidadeNome || cobranca.unidade || '—'} />
          <Detalhe rotulo="Forma de pagamento" valor={cobranca.formaPagamento || '—'} />
        </dl>
        <p className="mt-4 rounded-lg border border-blue-100 bg-[#E4F2FD] p-3 text-xs leading-5 text-[#142191]">A tela exibe somente a forma de pagamento; não mostra dados de cartão, conta ou outros detalhes financeiros sensíveis.</p>

        <div className="mt-6">
          <h3 className="font-semibold text-[#142191]">Histórico financeiro do aluno</h3>
          {historico.length > 1 ? (
            <ul className="mt-2 divide-y divide-slate-100 rounded-lg border border-slate-100">
              {historico.map((item) => <li key={item.id} className="flex flex-wrap justify-between gap-2 px-3 py-2.5 text-sm"><span>{formatarData(item.vencimento)} · {rotulosSituacao[item.situacao] || item.situacao || 'Pendente'}</span><span className="font-semibold">{moedaBRL(Number(item.valor))}</span></li>)}
            </ul>
          ) : <p className="mt-2 text-sm text-slate-500">Nenhum outro registro financeiro carregado.</p>}
        </div>

        <div className="mt-6 flex flex-wrap justify-end gap-3">
          {cobranca.situacao !== 'paga' && <button type="button" disabled className="min-h-10 cursor-not-allowed rounded-lg border border-slate-300 px-3 text-sm font-semibold text-slate-400" title="A confirmação de pagamento será conectada à API">Registrar pagamento</button>}
          <button type="button" disabled className="min-h-10 cursor-not-allowed rounded-lg border border-slate-300 px-3 text-sm font-semibold text-slate-400" title="A segunda via será conectada à API">Gerar segunda via</button>
          <button type="button" onClick={aoFechar} className="min-h-10 rounded-lg bg-[#004AF7] px-4 text-sm font-semibold text-white hover:bg-[#142191]">Fechar</button>
        </div>
      </section>
    </div>
  )
}

function Detalhe({ rotulo, valor }) {
  return <div className="rounded-xl bg-[#E4F2FD] p-3"><dt className="text-xs text-slate-500">{rotulo}</dt><dd className="mt-1 break-words text-sm font-semibold text-[#142191]">{valor}</dd></div>
}
