import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Check, CheckCircle2, ClipboardList } from 'lucide-react'


const Objetivos = [
  'Perder peso / reduzir gordura',
  'Ganhar massa muscular (hipertrofia)',
  'Melhorar condicionamento físico e resistência',
  'Ganhar força',
  'Saúde, bem-estar e qualidade de vida',
  'Reabilitação ou prevenção de lesões',
]

const Biotipos = [
  'Ectomorfo: magro, dificuldade para ganhar peso e massa muscular',
  'Mesomorfo: estrutura atlética, ganha músculo com facilidade',
  'Endomorfo: tendência a acumular gordura, ganha peso com facilidade',
  'Não sei / quero uma avaliação física',
]

const Experiencia = [
  'Nunca pratiquei',
  'Já pratiquei, mas estou parado há mais de 6 meses',
  'Pratico atualmente há menos de 6 meses',
  'Pratico atualmente há mais de 6 meses',
]

const Esportes = ['Musculação', 'Corrida', 'Lutas', 'Natação', 'Esportes coletivos', 'Outros']
const Frequencia = ['Dois treinos', 'Três treinos', 'Quatro ou mais treinos']
const Regioes = ['Joelho', 'Coluna', 'Ombro', 'Tornozelo', 'Quadril', 'Outra']
const Condicoes = ['Hipertensão','Diabetes','Problemas cardíacos','Asma ou problemas respiratórios','Gestante','Nenhuma','Outra']

const TITULOS = [
  'Qual é o seu principal objetivo?',
  'Qual alternativa melhor descreve seu corpo naturalmente?',
  'Você pratica ou já praticou atividade física regularmente?',
  'Quantos treinos por semana você deseja fazer?',
  'Por gentileza, informe seu peso e sua altura.',
  'Você possui alguma lesão, dor crônica, cirurgia ou limitação física?',
  'Você tem alguma condição de saúde ou usa medicamentos de forma contínua?',
  'Revise suas informações',
]

const INICIAL = {
  objetivo: '',
  biotipo: '',
  experiencia: '',
  esportes: [],
  outroEsporte: '',
  frequencia: '',
  peso: '',
  altura: '',
  prefiroNaoInformar: false,
  possuiLimitacao: '',
  regioes: [],
  descricaoLimitacao: '',
  condicoes: [],
  outraCondicao: '',
  aceitouTermo: false,
}

function Opcao({ texto, selecionada, aoClicar, multipla = false }) {
  return (
    <button
      type="button"
      aria-pressed={selecionada}
      onClick={aoClicar}
      className={`flex w-full items-center gap-3 rounded-xl border p-4 text-left text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#004AF7] ${
        selecionada
          ? 'border-[#004AF7] bg-[#E4F2FD] text-[#142191]'
          : 'border-slate-200 bg-white text-slate-700 hover:border-[#87B7FF] hover:bg-[#E4F2FD]/50'
      }`}
    >
      <span
        aria-hidden="true"
        className={`flex h-5 w-5 shrink-0 items-center justify-center border-2 ${multipla ? 'rounded' : 'rounded-full'} ${
          selecionada ? 'border-[#004AF7] bg-[#004AF7]' : 'border-slate-400'
        }`}
      >
        {selecionada && (multipla ? <Check className="h-3.5 w-3.5 text-white" /> : <span className="h-2 w-2 rounded-full bg-white" />)}
      </span>
      <span>{texto}</span>
    </button>
  )
}

function Texto({ rotulo, valor, onChange, placeholder, tipo = 'text', min, step }) {
  return (
    <label className="flex flex-col gap-2 text-sm font-medium text-[#142191]">
      {rotulo}
      <input
        type={tipo}
        min={min}
        step={step}
        value={valor}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 font-normal text-slate-800 outline-none focus:border-[#004AF7] focus:ring-2 focus:ring-[#87B7FF]"
      />
    </label>
  )
}

function ResumoLinha({ titulo, valor }) {
  return (
    <div className="border-b border-slate-100 py-3 last:border-0">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{titulo}</p>
      <p className="mt-1 whitespace-pre-line text-sm text-[#142191]">{valor || 'Não informado'}</p>
    </div>
  )
}

export default function Triagem({ onConcluir }) {
  const navigate = useNavigate()
  const [etapa, setEtapa] = useState(0)
  const [dados, setDados] = useState(INICIAL)
  const [erro, setErro] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [finalizada, setFinalizada] = useState(false)

  const atualizar = (campo, valor) => {
    setDados((anteriores) => ({ ...anteriores, [campo]: valor }))
    setErro('')
  }

  const alternar = (campo, item) => {
    setDados((anteriores) => {
      const atuais = anteriores[campo]
      let proximos
      if (campo === 'condicoes') {
        proximos = item === 'Nenhuma'
          ? (atuais.includes('Nenhuma') ? [] : ['Nenhuma'])
          : (atuais.includes(item)
            ? atuais.filter((opcao) => opcao !== item)
            : [...atuais.filter((opcao) => opcao !== 'Nenhuma'), item])
      } else {
        proximos = atuais.includes(item)
          ? atuais.filter((opcao) => opcao !== item)
          : [...atuais, item]
      }
      return { ...anteriores, [campo]: proximos }
    })
    setErro('')
  }

  function validar() {
    if (etapa === 0 && !dados.objetivo) return 'Selecione seu objetivo principal.'
    if (etapa === 1 && !dados.biotipo) return 'Selecione uma opção de biotipo.'
    if (etapa === 2) {
      if (!dados.experiencia) return 'Selecione seu histórico de atividade física.'
      if (dados.experiencia !== 'Nunca pratiquei' && dados.esportes.length === 0) {
        return 'Selecione pelo menos uma atividade que já praticou.'
      }
      if (dados.esportes.includes('Outros') && !dados.outroEsporte.trim()) {
        return 'Descreva a outra atividade praticada.'
      }
    }
    if (etapa === 3 && !dados.frequencia) return 'Selecione sua frequência de treinos.'
    if (etapa === 4 && !dados.prefiroNaoInformar) {
      if (!dados.peso || !dados.altura) return 'Informe peso e altura ou marque “Prefiro não informar”.'
      if (Number(dados.peso) <= 0 || Number(dados.altura) <= 0) return 'Peso e altura devem ser maiores que zero.'
    }
    if (etapa === 5) {
      if (!dados.possuiLimitacao) return 'Selecione Sim ou Não.'
      if (dados.possuiLimitacao === 'Sim' && !dados.descricaoLimitacao.trim()) {
        return 'Descreva a limitação, região afetada e há quanto tempo ocorre.'
      }
    }
    if (etapa === 6) {
      if (!dados.condicoes.length) return 'Selecione pelo menos uma opção, inclusive “Nenhuma”.'
      if (dados.condicoes.includes('Outra') && !dados.outraCondicao.trim()) {
        return 'Descreva a outra condição ou o uso contínuo de medicamento.'
      }
    }
    if (etapa === 7 && !dados.aceitouTermo) return 'Confirme o termo de responsabilidade.'
    return ''
  }

  function proximaEtapa() {
    const mensagem = validar()
    if (mensagem) return setErro(mensagem)
    setErro('')
    setEtapa((atual) => Math.min(atual + 1, 7))
  }

  function voltarEtapa() {
    setErro('')
    if (etapa === 0) return navigate(-1)
    setEtapa((atual) => atual - 1)
  }
  async function concluir() {
    const mensagem = validar()
    if (mensagem) return setErro(mensagem)
    if (!onConcluir) {
      setFinalizada(true)
      return
    }
    try {
      setEnviando(true)
      setErro('')
      await onConcluir(dados)
      setFinalizada(true)
    } catch {
      setErro('Nao foi possível salvar sua triagem, tente novamente.')
    } finally {
      setEnviando(false)
    }
  }
  if (finalizada) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#E4F2FD] p-5">
        <section className="w-full max-w-lg rounded-2xl bg-white p-8 text-center shadow-sm">
          <CheckCircle2 className="mx-auto h-16 w-16 text-[#004AF7]" aria-hidden="true" />
          <h1 className="mt-4 font-heading text-4xl font-bold text-[#142191]">Triagem concluída!</h1>
          <p className="mt-3 text-slate-600">
            {onConcluir
              ? 'Suas respostas foram encaminhadas para o sistema'
              : 'Protótipo finalizado. As respostas não foram enviadas nem armazenadas'}
          </p>
          <button type="button" onClick={() => navigate('/inicio')} className="mt-7 rounded-xl bg-[#004AF7] px-6 py-3 font-semibold text-white hover:bg-[#142191]">
            Ir para o início
          </button>
        </section>
      </main>
    )
  }
  const progresso = Math.round(((etapa + 1) / 8) * 100)
  return (
    <div className="min-h-screen bg-[#E4F2FD] text-[#142191]">
      <header className="bg-[#142191] px-5 py-5 text-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <span className="font-heading text-3xl font-bold">UNI<span className="text-[#87B7FF]">FIT</span></span>
          <span className="text-sm text-[#E4F2FD]">Triagem inicial</span>
        </div>
      </header>
      <main className="mx-auto grid max-w-6xl gap-8 px-4 py-8 md:grid-cols-[260px_minmax(0,1fr)] md:px-6 md:py-12">
        <aside className="h-fit rounded-2xl bg-[#142191] p-6 text-white md:sticky md:top-6">
          <ClipboardList className="mb-4 h-8 w-8 text-[#87B7FF]" aria-hidden="true" />
          <h2 className="font-heading text-3xl font-bold">Sua jornada começa aqui.</h2>
          <p className="mt-3 text-sm leading-6 text-[#E4F2FD]">
            Responda às perguntas para orientar seu acompanhamento na academia.
          </p>
          <div className="mt-7 hidden space-y-3 md:block">
            {['Objetivo', 'Biotipo', 'Histórico esportivo', 'Frequência', 'Medidas', 'Limitações', 'Saúde', 'Revisão'].map((nome, i) => (
              <div key={nome} className="flex items-center gap-3 text-sm">
                <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border ${i <= etapa ? 'border-[#87B7FF] bg-[#87B7FF] text-[#142191]' : 'border-white/40 text-white'}`}>
                  {i < etapa ? <Check className="h-4 w-4" /> : i + 1}
                </span>
                <span className={i === etapa ? 'font-bold' : 'text-[#E4F2FD]'}>{nome}</span>
              </div>
            ))}
          </div>
        </aside>
        <section className="min-w-0 rounded-2xl bg-white p-5 shadow-sm sm:p-8">
          <div className="mb-8">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-sm font-semibold">
              <span>{etapa === 7 ? 'Revisão final' : `Pergunta ${etapa + 1} de 7`}</span>
              <span className="text-[#004AF7]">{progresso}% concluído</span>
            </div>
            <div role="progressbar" aria-valuenow={progresso} aria-valuemin={0} aria-valuemax={100} aria-label="Progresso da triagem" className="h-2 overflow-hidden rounded-full bg-[#E4F2FD]">
              <div className="h-full rounded-full bg-[#004AF7] transition-all" style={{ width: `${progresso}%` }} />
            </div>
          </div>
          <h1 className="font-heading text-3xl font-bold leading-tight text-[#142191] sm:text-4xl">{TITULOS[etapa]}</h1>
          <p className="mt-2 mb-7 text-sm text-slate-500">
            {etapa === 7 ? 'Confira as respostas antes de concluir.' : 'Selecione a opção que melhor representa sua situação.'}
          </p>
          <div className="space-y-3">
            {etapa === 0 && Objetivos.map((item) => <Opcao key={item} texto={item} selecionada={dados.objetivo === item} aoClicar={() => atualizar('objetivo', item)} />)}

            {etapa === 1 && (
              <>
                {Biotipos.map((item) => <Opcao key={item} texto={item} selecionada={dados.biotipo === item} aoClicar={() => atualizar('biotipo', item)} />)}
                <p className="text-xs text-slate-500">Essa classificação é autodeclarada e não substitui uma avaliação física profissional.</p>
              </>
            )}
            {etapa === 2 && (
              <>
                {Experiencia.map((item) => <Opcao key={item} texto={item} selecionada={dados.experiencia === item} aoClicar={() => {
                  setDados((anterior) => ({ ...anterior, experiencia: item, ...(item === 'Nunca pratiquei' ? { esportes: [], outroEsporte: '' } : {}) }))
                  setErro('')
                }} />)}
                {dados.experiencia && dados.experiencia !== 'Nunca pratiquei' && (
                  <div className="mt-5 rounded-xl bg-[#E4F2FD] p-4 sm:p-5">
                    <h2 className="mb-3 font-semibold">Quais atividades você já praticou? (múltipla escolha)</h2>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {Esportes.map((item) => <Opcao key={item} texto={item} multipla selecionada={dados.esportes.includes(item)} aoClicar={() => alternar('esportes', item)} />)}
                    </div>
                    {dados.esportes.includes('Outros') && <div className="mt-4"><Texto rotulo="Qual outra atividade?" valor={dados.outroEsporte} onChange={(v) => atualizar('outroEsporte', v)} placeholder="Descreva a atividade" /></div>}
                  </div>
                )}
              </>
            )}
            {etapa === 3 && Frequencia.map((item) => <Opcao key={item} texto={item} selecionada={dados.frequencia === item} aoClicar={() => atualizar('frequencia', item)} />)}

            {etapa === 4 && (
              <>
                <Opcao texto="Prefiro não informar" selecionada={dados.prefiroNaoInformar} aoClicar={() => {
                  setDados((anterior) => ({ ...anterior, prefiroNaoInformar: !anterior.prefiroNaoInformar }))
                  setErro('')
                }} />
                {!dados.prefiroNaoInformar && (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Texto rotulo="Peso (kg)" tipo="number" min="0.1" step="0.1" valor={dados.peso} onChange={(v) => atualizar('peso', v)} placeholder="Ex.: 70,5" />
                    <Texto rotulo="Altura (cm)" tipo="number" min="0.1" step="0.1" valor={dados.altura} onChange={(v) => atualizar('altura', v)} placeholder="Ex.: 175" />
                  </div>
                )}
              </>
            )}
            {etapa === 5 && (
              <>
                {['Sim', 'Não'].map((item) => <Opcao key={item} texto={item} selecionada={dados.possuiLimitacao === item} aoClicar={() => {
                  setDados((anterior) => ({ ...anterior, possuiLimitacao: item, ...(item === 'Não' ? { regioes: [], descricaoLimitacao: '' } : {}) }))
                  setErro('')
                }} />)}
                {dados.possuiLimitacao === 'Sim' && (
                  <div className="mt-5 rounded-xl bg-[#E4F2FD] p-4 sm:p-5">
                    <h2 className="mb-3 font-semibold">Região afetada (selecione as aplicáveis)</h2>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {Regioes.map((item) => <Opcao key={item} texto={item} multipla selecionada={dados.regioes.includes(item)} aoClicar={() => alternar('regioes', item)} />)}
                    </div>
                    <label className="mt-4 flex flex-col gap-2 text-sm font-semibold text-[#142191]">
                      Descreva a limitação e há quanto tempo ela ocorre
                      <textarea rows={4} value={dados.descricaoLimitacao} onChange={(e) => atualizar('descricaoLimitacao', e.target.value)} placeholder="Ex.: Dor no joelho direito há três meses..." className="w-full rounded-xl border border-slate-300 bg-white p-3 font-normal outline-none focus:border-[#004AF7] focus:ring-2 focus:ring-[#87B7FF]" />
                    </label>
                  </div>
                )}
              </>
            )}
            {etapa === 6 && (
              <>
                <p className="text-sm text-slate-500">Você pode selecionar mais de uma opção. “Nenhuma” desmarca as demais.</p>
                {Condicoes.map((item) => <Opcao key={item} texto={item} multipla selecionada={dados.condicoes.includes(item)} aoClicar={() => alternar('condicoes', item)} />)}
                {dados.condicoes.includes('Outra') && (
                  <Texto rotulo="Descreva a outra condição ou o medicamento de uso contínuo" valor={dados.outraCondicao} onChange={(v) => atualizar('outraCondicao', v)} placeholder="Descreva aqui" />
                )}
              </>
            )}
            {etapa === 7 && (
              <>
                <ResumoLinha titulo="Objetivo" valor={dados.objetivo} />
                <ResumoLinha titulo="Biotipo" valor={dados.biotipo} />
                <ResumoLinha titulo="Histórico esportivo" valor={[dados.experiencia, dados.esportes.join(', '), dados.outroEsporte].filter(Boolean).join(' — ')} />
                <ResumoLinha titulo="Frequência" valor={dados.frequencia} />
                <ResumoLinha titulo="Peso e altura" valor={dados.prefiroNaoInformar ? 'Prefiro não informar' : `${dados.peso} kg; ${dados.altura} cm`} />
                <ResumoLinha titulo="Lesões ou limitações" valor={dados.possuiLimitacao === 'Sim' ? `${dados.regioes.join(', ')} — ${dados.descricaoLimitacao}` : 'Não'} />
                <ResumoLinha titulo="Condições de saúde" valor={`${dados.condicoes.join(', ')}${dados.outraCondicao ? ` — ${dados.outraCondicao}` : ''}`} />
                <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-xl border border-[#87B7FF] bg-[#E4F2FD] p-4 text-sm">
                  <input type="checkbox" checked={dados.aceitouTermo} onChange={(e) => atualizar('aceitouTermo', e.target.checked)} className="mt-1 h-4 w-4 accent-[#004AF7]" />
                  <span>Declaro que as informações fornecidas são verdadeiras e compreendo que esta triagem não substitui avaliação por profissional habilitado.</span>
                </label>
              </>
            )}
          </div>
          {erro && <p role="alert" className="mt-5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700">{erro}</p>}
          <div className="mt-10 flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:justify-between">
            <button type="button" onClick={voltarEtapa} className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#87B7FF] px-5 py-3 font-semibold text-[#142191] hover:bg-[#E4F2FD]">
              <ArrowLeft className="h-4 w-4" /> Voltar
            </button>
            <button type="button" onClick={etapa === 7 ? concluir : proximaEtapa} disabled={enviando} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#004AF7] px-6 py-3 font-semibold text-white hover:bg-[#142191] disabled:cursor-not-allowed disabled:opacity-60">
              {etapa === 7 ? (enviando ? 'Enviando...' : 'Vamos lá!') : 'Continuar'}
              {etapa !== 7 && <ArrowRight className="h-4 w-4" />}
            </button>
          </div>
        </section>
      </main>
    </div>
  )
}
