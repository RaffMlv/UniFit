import { useMemo, useState } from 'react'
import { CreditCard, ReceiptText, AlertCircle, CheckCircle2, Wallet, Search } from 'lucide-react'

const cobrancasExemplo = [
  { id: 1, descricao: 'Setembro', valor: 90, vencimento: '2026-09-10', situacao: 'Pago', pagamento: '2026-09-09' },
  { id: 2, descricao: 'Outubro', valor: 90, vencimento: '2026-10-10', situacao: 'Pendente', pagamento: null },
]

const moeda = valor => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor)
const dataBR = data => data ? new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC' }).format(new Date(`${data}T12:00:00Z`)) : '—'

export default function Financeiro() {
  const [filtro, setFiltro] = useState('Todos')
  const [busca, setBusca] = useState('')
  const [selecionada, setSelecionada] = useState(null)
  const cobrancas = cobrancasExemplo

  const visiveis = useMemo(() => cobrancas.filter(c => (filtro === 'Todos' || c.situacao === filtro) && c.descricao.toLowerCase().includes(busca.toLowerCase())), [filtro, busca, cobrancas])
  const totalPendente = cobrancas.filter(c => c.situacao !== 'Pago').reduce((s, c) => s + c.valor, 0)
  const totalPago = cobrancas.filter(c => c.situacao === 'Pago').reduce((s, c) => s + c.valor, 0)

  return (
    <main className="min-h-screen bg-[#E4F2FD] px-4 py-8 text-[#142191] sm:px-6 lg:px-10">
      <div className="mx-auto max-w-6xl space-y-6">
        <div>
          <p className="text-sm font-semibold text-[#004AF7]">ÁREA DO ALUNO</p>
          <h1 className="mt-1 font-heading text-4xl font-bold">FINANCEIRO</h1>
          <p className="mt-2 text-sm text-slate-600">Consulte sua situação financeira e o histórico de cobranças, quando esse módulo estiver habilitado.</p>
        </div>
        <p className="rounded-xl border border-[#87B7FF] bg-white p-4 text-sm text-slate-600"><strong>Dados fictícios para o design.</strong> Os valores abaixo não representam cobranças reais da Unifor. O módulo financeiro só deve ser ativado caso existam cobranças vinculadas à academia.</p>
        <section className="grid gap-4 sm:grid-cols-3">
          <Indicador icone={Wallet} titulo="Situação" valor={totalPendente ? 'Pendente' : 'Regular'} descricao="Exemplo de status" />
          <Indicador icone={AlertCircle} titulo="Total pendente" valor={moeda(totalPendente)} descricao="Valores demonstrativos" />
          <Indicador icone={CheckCircle2} titulo="Total pago" valor={moeda(totalPago)} descricao="Valores demonstrativos" />
        </section>
        <section className="rounded-2xl bg-white p-5 shadow-sm sm:p-7">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-heading text-2xl font-bold">MINHAS COBRANÇAS</h2>
            <div className="flex flex-wrap gap-2">
              {['Todos', 'Pago', 'Pendente'].map(s => <button key={s} type="button" aria-pressed={filtro === s} onClick={() => setFiltro(s)} className={`rounded-lg px-3 py-2 text-sm font-semibold ${filtro === s ? 'bg-[#004AF7] text-white' : 'bg-[#E4F2FD] text-[#142191]'}`}>{s}</button>)}
            </div>
          </div>
          <label className="mt-5 flex max-w-md items-center gap-2 rounded-lg border border-slate-300 px-3"><Search size={18} className="text-slate-500" /><span className="sr-only">Pesquisar cobrança</span><input value={busca} onChange={e => setBusca(e.target.value)} placeholder="Pesquisar cobrança" className="w-full py-3 text-sm outline-none" /></label>
          <div className="mt-5 overflow-x-auto">
            <table className="min-w-[620px] w-full text-left text-sm">
              <thead className="bg-[#E4F2FD] text-[#142191]"><tr><th className="px-3 py-3">Descrição</th><th className="px-3 py-3">Vencimento</th><th className="px-3 py-3">Valor</th><th className="px-3 py-3">Situação</th><th className="px-3 py-3">Detalhes</th></tr></thead>
              <tbody className="divide-y divide-slate-200">{visiveis.map(c => <tr key={c.id}><td className="px-3 py-4">{c.descricao}</td><td className="px-3 py-4">{dataBR(c.vencimento)}</td><td className="px-3 py-4 font-semibold">{moeda(c.valor)}</td><td className="px-3 py-4"><span className={`rounded-full px-3 py-1 text-xs font-semibold ${c.situacao === 'Pago' ? 'bg-[#E4F2FD] text-[#142191]' : 'bg-amber-100 text-amber-900'}`}>{c.situacao}</span></td><td className="px-3 py-4"><button type="button" onClick={() => setSelecionada(c)} className="font-semibold text-[#004AF7] hover:underline">Visualizar</button></td></tr>)}</tbody>
            </table>
            {!visiveis.length && <p className="py-8 text-center text-sm text-slate-500">Nenhuma cobrança encontrada.</p>}
          </div>
        </section>
        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="flex items-center gap-2 font-heading text-2xl font-bold"><ReceiptText className="text-[#004AF7]" /> HISTÓRICO FINANCEIRO</h2>
          <p className="mt-3 text-sm text-slate-600">Os comprovantes, recibos e formas de pagamento serão exibidos aqui somente quando disponibilizados pelo serviço financeiro integrado.</p>
        </section>
      </div>
      {selecionada && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#142191]/60 p-4">
          <div role="dialog" aria-modal="true" aria-labelledby="tituloFinanceiro" className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h2 id="tituloFinanceiro" className="flex items-center gap-2 font-heading text-2xl font-bold"><CreditCard className="text-[#004AF7]" /> DETALHES DA COBRANÇA</h2>
            <dl className="mt-5 space-y-3 text-sm"><Linha rotulo="Descrição" valor={selecionada.descricao}/><Linha rotulo="Valor" valor={moeda(selecionada.valor)}/><Linha rotulo="Vencimento" valor={dataBR(selecionada.vencimento)}/><Linha rotulo="Situação" valor={selecionada.situacao}/><Linha rotulo="Pagamento" valor={dataBR(selecionada.pagamento)}/></dl>
            <p className="mt-4 text-xs text-slate-500">Comprovante e segunda via não estão disponíveis neste protótipo.</p>
            <button type="button" onClick={() => setSelecionada(null)} className="mt-6 w-full rounded-lg bg-[#004AF7] py-3 font-semibold text-white">Fechar</button>
          </div>
        </div>
      )}
    </main>
  )
}
function Indicador({ icone: Icone, titulo, valor, descricao }) { return <div className="rounded-2xl bg-white p-6 shadow-sm"><Icone className="text-[#004AF7]" size={26}/><p className="mt-4 text-sm text-slate-500">{titulo}</p><p className="mt-1 break-words font-heading text-3xl font-bold">{valor}</p><p className="mt-2 text-xs text-slate-500">{descricao}</p></div> }
function Linha({ rotulo, valor }) { return <div className="flex justify-between gap-3"><dt className="text-slate-500">{rotulo}</dt><dd className="text-right font-semibold">{valor}</dd></div> }
