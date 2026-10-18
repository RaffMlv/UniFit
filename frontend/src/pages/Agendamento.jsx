import { useMemo, useState } from 'react'
import { CalendarDays, Clock3, UserRoundCheck, CheckCircle2, Info, X } from 'lucide-react'

const servicos = ['Educação Física', 'Fisioterapia', 'Nutrição']
const horariosExemplo = ['08:00', '09:30', '11:00', '14:00', '15:30', '17:00']

function dataLocalHoje() {
  const d = new Date()
  const ano = d.getFullYear()
  const mes = String(d.getMonth() + 1).padStart(2, '0')
  const dia = String(d.getDate()).padStart(2, '0')
  return `${ano}-${mes}-${dia}`
}

function diaBR(data) {
  if (!data) return ''
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'full', timeZone: 'UTC' }).format(new Date(`${data}T12:00:00Z`))
}

export default function Agendamento() {
  const [categoria, setCategoria] = useState('Nutricionista')
  const [data, setData] = useState('')
  const [horario, setHorario] = useState('')
  const [confirmando, setConfirmando] = useState(false)
  const [sucesso, setSucesso] = useState(false)
  const [reservas, setReservas] = useState([])
  const [erro, setErro] = useState('')
  const hoje = useMemo(dataLocalHoje, [])

  const conflito = reservas.some(r => r.data === data && r.horario === horario)
function preparar() {
    setErro('')
    if (!data || !horario) return setErro('Escolha uma data e um horário para continuar.')
    if (data < hoje) return setErro('Escolha uma data atual ou futura.')
    if (conflito) return setErro('Você já possui um agendamento nesse horário.')
    setConfirmando(true)
  }

  function confirmar() {
    if (conflito) { setConfirmando(false); return setErro('Você já possui um agendamento nesse horário.') }
    setReservas(r => [...r, { id: Date.now(), categoria, data, horario }])
    setConfirmando(false)
    setSucesso(true)
    setHorario('')
  }

  return (
    <main className="min-h-screen bg-[#E4F2FD] px-4 py-8 text-[#142191] sm:px-6 lg:px-10">
      <div className="mx-auto max-w-5xl space-y-6">
        <div>
          <p className="text-sm font-semibold text-[#004AF7]">SERVIÇOS UNIFIT</p>
          <h1 className="mt-1 font-heading text-4xl font-bold">AGENDAMENTO DE ATENDIMENTO</h1>
          <p className="mt-2 text-sm text-slate-600">Escolha o serviço, a data e um horário para solicitar seu atendimento.</p>
        </div>
        <div className="rounded-xl border border-[#87B7FF] bg-white p-4 text-sm text-slate-600">
          <Info className="mr-2 inline text-[#004AF7]" size={17} /> Os horários abaixo são <strong>ilustrativos</strong>. A disponibilidade real e o responsável deverão ser informados pela API do UniFit.
        </div>
{sucesso && (
          <div role="status" className="flex items-start gap-3 rounded-xl border border-[#87B7FF] bg-white p-4">
            <CheckCircle2 className="shrink-0 text-[#004AF7]" />
            <div><strong>Agendamento registrado no protótipo!</strong><p className="text-sm text-slate-600">Ainda não foi enviado ao servidor. Verifique a lista abaixo.</p></div>
            <button type="button" className="ml-auto" aria-label="Fechar aviso" onClick={() => setSucesso(false)}><X size={18} /></button>
          </div>
        )}
        <section className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <div className="space-y-6">
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <h2 className="mb-4 flex items-center gap-2 font-heading text-2xl font-bold"><UserRoundCheck className="text-[#004AF7]" /> 1. SELECIONE O SERVIÇO</h2>
              <div className="grid gap-3 sm:grid-cols-3">
                {servicos.map(s => (
                  <button key={s} type="button" aria-pressed={s === categoria} onClick={() => { setCategoria(s); setHorario(''); setErro('') }} className={`min-h-16 rounded-xl border p-3 text-sm font-semibold transition ${s === categoria ? 'border-[#004AF7] bg-[#E4F2FD] text-[#142191] ring-2 ring-[#87B7FF]' : 'border-slate-200 bg-white hover:border-[#004AF7]'}`}>{s}</button>
                ))}
              </div>
            </div>
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <h2 className="mb-4 flex items-center gap-2 font-heading text-2xl font-bold"><CalendarDays className="text-[#004AF7]" /> 2. ESCOLHA A DATA</h2>
              <label className="block text-sm font-semibold" htmlFor="dataAtendimento">Data do atendimento</label>
              <input id="dataAtendimento" type="date" min={hoje} value={data} onChange={e => { setData(e.target.value); setHorario(''); setErro('') }} className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-800 focus:border-[#004AF7] sm:max-w-sm" />
              <p className="mt-2 text-xs text-slate-500">Datas sem disponibilidade deverão ser bloqueadas após integração com a agenda real.</p>
            </div>
<div className="rounded-2xl bg-white p-6 shadow-sm">
              <h2 className="mb-4 flex items-center gap-2 font-heading text-2xl font-bold"><Clock3 className="text-[#004AF7]" /> 3. ESCOLHA O HORÁRIO</h2>
              {!data ? <p className="text-sm text-slate-500">Selecione uma data primeiro.</p> : (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {horariosExemplo.map(h => {
                    const ocupado = reservas.some(r => r.data === data && r.horario === h)
                    return <button key={h} type="button" disabled={ocupado} aria-pressed={h === horario} onClick={() => { setHorario(h); setErro('') }} className={`rounded-lg border px-3 py-3 text-sm font-semibold ${ocupado ? 'cursor-not-allowed bg-slate-100 text-slate-400' : h === horario ? 'border-[#004AF7] bg-[#004AF7] text-white' : 'border-[#87B7FF] text-[#142191] hover:bg-[#E4F2FD]'}`}>{h}{ocupado ? ' · ocupado' : ''}</button>
                  })}
                </div>
              )}
              <p className="mt-4 text-sm text-slate-500">Responsável: a definir conforme a escala do serviço.</p>
            </div>
          </div>
          <aside className="h-fit rounded-2xl bg-white p-6 shadow-sm lg:sticky lg:top-6">
            <h2 className="font-heading text-2xl font-bold">RESUMO DA SOLICITAÇÃO</h2>
            <div className="mt-5 space-y-4 text-sm">
              <Resumo rotulo="Serviço" valor={categoria} />
              <Resumo rotulo="Data" valor={data ? diaBR(data) : 'Não selecionada'} />
              <Resumo rotulo="Horário" valor={horario || 'Não selecionado'} />
              <Resumo rotulo="Responsável" valor="A definir" />
            </div>
            {erro && <p role="alert" className="mt-4 text-sm font-medium text-red-700">{erro}</p>}
            <button type="button" onClick={preparar} className="mt-6 w-full rounded-lg bg-[#004AF7] px-5 py-3 font-semibold text-white hover:bg-[#142191]">Continuar</button>
          </aside>
        </section>
 <section className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="font-heading text-2xl font-bold">MEUS AGENDAMENTOS DE DEMONSTRAÇÃO</h2>
          {reservas.length === 0 ? <p className="mt-3 text-sm text-slate-500">Nenhum agendamento feito nesta sessão.</p> : (
            <ul className="mt-4 divide-y divide-slate-200">
              {reservas.map(r => <li key={r.id} className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm"><span>{r.categoria} · {diaBR(r.data)} · {r.horario}</span><button type="button" onClick={() => setReservas(atual => atual.filter(x => x.id !== r.id))} className="font-semibold text-red-700 hover:underline">Cancelar simulação</button></li>)}
            </ul>
          )}
        </section>
      </div>
      {confirmando && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#142191]/60 p-4" role="presentation">
          <div role="dialog" aria-modal="true" aria-labelledby="tituloConfirmacao" className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h2 id="tituloConfirmacao" className="font-heading text-3xl font-bold">CONFIRMAR AGENDAMENTO</h2>
            <p className="mt-4 text-sm text-slate-600">{categoria} — {diaBR(data)} às {horario}</p>
            <p className="mt-2 text-sm text-slate-600">Responsável: a definir. Esta ação salva somente na memória desta página.</p>
            <div className="mt-6 flex gap-3"><button type="button" onClick={() => setConfirmando(false)} className="flex-1 rounded-lg border border-slate-300 py-3 font-semibold">Voltar</button><button type="button" onClick={confirmar} className="flex-1 rounded-lg bg-[#004AF7] py-3 font-semibold text-white">Confirmar</button></div>
          </div>
        </div>
      )}
    </main>
  )
}
function Resumo({ rotulo, valor }) { return <div><p className="text-xs text-slate-500">{rotulo}</p><p className="mt-1 font-semibold">{valor}</p></div> }