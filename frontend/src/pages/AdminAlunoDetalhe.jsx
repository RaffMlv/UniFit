import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, UserCheck, UserX } from 'lucide-react'
import LayoutAutenticado from '@/components/ui/LayoutAutenticado'
import { api } from '@/services/api'

const dataBR = (v) => (v ? new Date(v).toLocaleDateString('pt-BR') : '—')

function Linha({ rotulo, valor }) {
  return (
    <div className="flex justify-between gap-4 border-b border-slate-100 py-3 text-sm last:border-0">
      <dt className="text-slate-500">{rotulo}</dt>
      <dd className="text-right font-semibold text-[#142191]">{valor}</dd>
    </div>
  )
}

export default function AdminAlunoDetalhe() {
  const { id } = useParams()
  const [aluno, setAluno] = useState(null)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')
  const [aviso, setAviso] = useState(null)
  const [enviando, setEnviando] = useState(false)

  useEffect(() => {
    let cancelado = false
    setCarregando(true)
    setErro('')
    api(`/admin/alunos/${id}`)
      .then((d) => { if (!cancelado) setAluno(d) })
      .catch((err) => { if (!cancelado) setErro(err.message) })
      .finally(() => { if (!cancelado) setCarregando(false) })
    return () => { cancelado = true }
  }, [id])

  async function alterarSituacao() {
    if (enviando) return
    const acao = aluno.ativo ? 'desativar' : 'ativar'
    if (!window.confirm(`Deseja ${acao} o acesso de "${aluno.nome}"?`)) return
    setEnviando(true)
    try {
      await api(`/admin/alunos/${id}/situacao`, { method: 'PATCH', body: { ativo: !aluno.ativo } })
      setAluno((prev) => ({ ...prev, ativo: !prev.ativo }))
      setAviso({ tipo: 'ok', texto: aluno.ativo ? 'Acesso desativado.' : 'Acesso ativado.' })
    } catch (err) {
      setAviso({ tipo: 'erro', texto: err.message })
    } finally {
      setEnviando(false)
    }
  }

  return (
    <LayoutAutenticado titulo="Aluno">
      <div className="space-y-6">
        <Link to="/admin/alunos" className="inline-flex items-center gap-2 text-sm font-semibold text-[#004AF7] hover:underline">
          <ArrowLeft size={18} aria-hidden="true" /> Voltar para a lista de alunos
        </Link>

        {carregando && <p className="rounded-xl bg-white p-6 text-sm text-[#142191]">Carregando aluno...</p>}
        {erro && <p role="alert" className="rounded-xl bg-red-50 p-6 text-sm text-red-700">{erro}</p>}

        {aviso && (
          <div role={aviso.tipo === 'erro' ? 'alert' : 'status'}
            className={`rounded-lg border p-3 text-sm ${aviso.tipo === 'erro' ? 'border-red-200 bg-red-50 text-red-700' : 'border-[#87B7FF] bg-[#E4F2FD] text-[#142191]'}`}>
            {aviso.texto}
          </div>
        )}

        {aluno && (
          <>
            <section className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-white p-6 shadow-sm">
              <div className="min-w-0">
                <h2 className="break-words font-heading text-3xl font-bold text-[#142191]">{aluno.nome}</h2>
                <p className="break-all text-sm text-slate-600">{aluno.email}</p>
                <span className={`mt-2 inline-block rounded-full px-3 py-1 text-xs font-semibold ${aluno.ativo ? 'bg-[#E4F2FD] text-[#142191]' : 'bg-slate-100 text-slate-600'}`}>
                  {aluno.ativo ? 'Acesso ativo' : 'Acesso desativado'}
                </span>
              </div>
              <button type="button" onClick={alterarSituacao} disabled={enviando}
                className="inline-flex items-center gap-2 rounded-lg border border-[#004AF7] px-4 py-2.5 text-sm font-semibold text-[#004AF7] hover:bg-[#E4F2FD] disabled:opacity-60">
                {aluno.ativo
                  ? <><UserX size={17} aria-hidden="true" /> Desativar acesso</>
                  : <><UserCheck size={17} aria-hidden="true" /> Ativar acesso</>}
              </button>
            </section>

            <div className="grid gap-6 md:grid-cols-2">
              <section className="rounded-2xl bg-white p-6 shadow-sm md:col-span-2">
                <h3 className="font-heading text-2xl font-bold text-[#142191]">DADOS CADASTRAIS</h3>
                <dl className="mt-3">
                  <Linha rotulo="CPF" valor={aluno.cpf} />
                  <Linha rotulo="E-mail" valor={aluno.email} />
                  <Linha rotulo="Cadastrado em" valor={dataBR(aluno.criadoEm)} />
                </dl>
              </section>

              <section className="rounded-2xl bg-white p-6 shadow-sm">
                <h3 className="font-heading text-2xl font-bold text-[#142191]">TRIAGEM</h3>
                {aluno.triagem.concluida ? (
                  <dl className="mt-3">
                    <Linha rotulo="Situação" valor="Concluída" />
                    <Linha rotulo="Objetivo" valor={aluno.triagem.objetivo} />
                    <Linha rotulo="Frequência desejada" valor={aluno.triagem.frequencia} />
                    <Linha rotulo="Atualizada em" valor={dataBR(aluno.triagem.atualizadaEm)} />
                  </dl>
                ) : (
                  <p className="mt-3 text-sm text-slate-600">O aluno ainda não respondeu a triagem inicial.</p>
                )}
                <p className="mt-4 text-xs text-slate-500">
                  As respostas sobre saúde ficam restritas ao monitor responsável pelo aluno.
                </p>
              </section>

              <section className="rounded-2xl bg-white p-6 shadow-sm">
                <h3 className="font-heading text-2xl font-bold text-[#142191]">FREQUÊNCIA</h3>
                <p className="mt-3 text-sm text-slate-600">Disponível quando houver treinos registrados.</p>
              </section>

              <section className="rounded-2xl bg-white p-6 shadow-sm">
                <h3 className="font-heading text-2xl font-bold text-[#142191]">ACOMPANHAMENTO</h3>
                <p className="mt-3 text-sm text-slate-600">Nenhum monitor vinculado ainda.</p>
              </section>

              <SecaoFichas alunoId={aluno.id} />
            </div>
          </>
        )}
      </div>
    </LayoutAutenticado>
  )
}

function SecaoFichas({ alunoId }) {
  const [fichas, setFichas] = useState(null)
  useEffect(() => {
    api(`/fichas/aluno/${alunoId}`).then((d) => setFichas(d.fichas)).catch(() => setFichas([]))
  }, [alunoId])

  return (
    <section className="rounded-2xl bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="font-heading text-2xl font-bold text-[#142191]">FICHAS DE TREINO</h3>
        <Link to={`/fichas/nova/${alunoId}`} className="rounded-lg bg-[#004AF7] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#142191]">Criar ficha</Link>
      </div>
      {fichas === null && <p className="mt-3 text-sm text-slate-600">Carregando...</p>}
      {fichas?.length === 0 && <p className="mt-3 text-sm text-slate-600">Nenhuma ficha criada para este aluno.</p>}
      <ul className="mt-3 divide-y divide-slate-100">
        {fichas?.map((f) => (
          <li key={f.id} className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm">
            <span><strong className="text-[#142191]">{f.nome}</strong> · {f.objetivo} · {f.status === 'publicada' ? 'Publicada' : 'Rascunho'}</span>
            <Link to={`/fichas/${f.id}/editar`} className="font-semibold text-[#004AF7] hover:underline">Editar</Link>
          </li>
        ))}
      </ul>
    </section>
  )
}