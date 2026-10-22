import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { UserRound, Mail, IdCard, Phone, CalendarDays, Target, ShieldCheck, Save, Pencil, LockKeyhole, LogOut } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import LayoutAutenticado from '@/components/ui/LayoutAutenticado'

const formatarData = (valor) => {
  if (!valor) return 'Não informado'
  const [ano, mes, dia] = valor.split('-')
  return ano && mes && dia ? `${dia}/${mes}/${ano}` : valor
}

const mascararCpf = (cpf) => (cpf && cpf.length === 11 ? `•••.•••.•••-${cpf.slice(9)}` : '')

export default function Perfil() {
  const { usuario, logout } = useAuth()
  const navigate = useNavigate()
  const [editando, setEditando] = useState(false)
  const [mensagem, setMensagem] = useState('')
  const [telefone, setTelefone] = useState(usuario?.telefone ?? '')
  const [dataNascimento, setDataNascimento] = useState(usuario?.dataNascimento ?? '')

  function salvar(evento) {
    evento.preventDefault()
    setEditando(false)
    setMensagem('Alterações aplicadas só nesta tela. O salvamento no servidor ainda não foi integrado.')
  }

  return (
    <LayoutAutenticado titulo="Meu perfil">
      <div className="mx-auto max-w-5xl space-y-6 text-[#142191]">
        <div>
          <p className="text-sm font-semibold text-[#004AF7]">ÁREA DO ALUNO</p>
          <h2 className="mt-1 font-heading text-4xl font-bold">MEU PERFIL</h2>
          <p className="mt-2 text-sm text-slate-600">Consulte seus dados e as informações disponíveis na sua conta.</p>
        </div>
        <section className="flex flex-col gap-4 rounded-2xl bg-white p-6 shadow-sm sm:flex-row sm:items-center">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-[#E4F2FD] text-[#004AF7]">
            <UserRound size={38} aria-hidden="true" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="break-words font-heading text-3xl font-bold">{usuario?.nome || 'Usuário UniFit'}</h2>
            <p className="break-all text-sm text-slate-600">{usuario?.email || 'E-mail não disponível'}</p>
            <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-[#004AF7]">Perfil: {usuario?.papel || 'não informado'}		</p>
          </div>
        </section>
        {mensagem && <p role="status" className="rounded-xl border border-[#87B7FF] bg-white px-4 py-3 text-sm">{mensagem}</p>}
        <form onSubmit={salvar} className="rounded-2xl bg-white p-5 shadow-sm sm:p-7">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-heading text-2xl font-bold">DADOS PESSOAIS</h2>
            {!editando && (
              <button type="button" onClick={() => { setEditando(true); setMensagem('') }} className="inline-flex items-center gap-2 rounded-lg border border-[#004AF7] px-4 py-2 text-sm font-semibold text-[#004AF7] hover:bg-[#E4F2FD]">
                <Pencil size={16} /> Editar dados permitidos
              </button>
            )}
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <Dado icone={UserRound} rotulo="Nome completo" valor={usuario?.nome} />
            <Dado icone={IdCard} rotulo="CPF" valor={mascararCpf(usuario?.cpf)} /> 
            <Dado icone={Mail} rotulo="E-mail institucional" valor={usuario?.email} />
            <label className="block">
              <span className="mb-2 flex items-center gap-2 text-sm font-semibold"><Phone size={16} /> Telefone</span>
              <input value={telefone} onChange={e => setTelefone(e.target.value)} disabled={!editando} type="tel" placeholder="Não informado" className="w-full rounded-lg border border-slate-300 bg-white px-3 py-3 text-sm text-slate-800 outline-none focus:border-[#004AF7] disabled:bg-slate-50" />
            </label>
            <label className="block">
              <span className="mb-2 flex items-center gap-2 text-sm font-semibold"><CalendarDays size={16} /> Data de nascimento</span>
              {editando ? (
                <input value={dataNascimento} onChange={e => setDataNascimento(e.target.value)} type="date" className="w-full rounded-lg border border-slate-300 px-3 py-3 text-sm text-slate-800 focus:border-[#004AF7]" />
              ) : (
                <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-800">
			{formatarData(dataNascimento)}
		</div>
              )}
            </label>
          </div>
          {editando && (
            <div className="mt-6 flex flex-wrap gap-3">
              <button type="submit" className="inline-flex items-center gap-2 rounded-lg bg-[#004AF7] px-5 py-3 font-semibold text-white hover:bg-[#142191]"><Save size={17} /> Salvar alterações</button>
              <button type="button" onClick={() => { setEditando(false); setTelefone(usuario?.telefone ?? ''); setDataNascimento(usuario?.dataNascimento ?? '') }} className="rounded-lg border border-slate-300 px-5 py-3 font-semibold">Cancelar</button>
            </div>
          )}
        </form>
        <div className="grid gap-6 md:grid-cols-2">
          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="flex items-center gap-2 font-heading text-2xl font-bold"><Target size={22} className="text-[#004AF7]" /> OBJETIVOS E TRIAGEM</h2>
            <p className="mt-3 text-sm text-slate-600">Objetivo atual: <strong className="text-[#142191]">{usuario?.objetivo || 'Informação ainda não disponível'}</strong></p>
            <p className="mt-2 text-sm text-slate-600">Os dados autorizados da anamnese e os registros de avaliação aparecerão aqui após integração.</p>
            <button type="button" onClick={() => navigate('/triagem')} className="mt-5 rounded-lg bg-[#E4F2FD] px-4 py-3 text-sm font-semibold text-[#142191] hover:bg-[#87B7FF]">Refazer triagem</button>
          </section>
          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="flex items-center gap-2 font-heading text-2xl font-bold"><ShieldCheck size={22} className="text-[#004AF7]" /> PRIVACIDADE E SEGURANÇA</h2>
            <p className="mt-3 text-sm text-slate-600">A alteração de senha, as configurações de privacidade e o histórico de avaliações dependem das rotas autorizadas pela equipe.</p>
            <div className="mt-5 flex flex-wrap gap-3">
              <button type="button" onClick={() => setMensagem('Configurações de privacidade: aguardando integração.')} className="rounded-lg border border-[#87B7FF] px-4 py-2 text-sm font-semibold">Privacidade</button>
              <button type="button" onClick={() => setMensagem('Alteração de senha: aguardando rota da equipe.')} className="inline-flex items-center gap-2 rounded-lg border border-[#87B7FF] px-4 py-2 text-sm font-semibold"><LockKeyhole size={15} /> Alterar senha</button>
            </div>
          </section>
        </div>
        <button type="button" onClick={logout} className="inline-flex items-center gap-2 rounded-lg border border-[#142191] px-5 py-3 font-semibold hover:bg-white"><LogOut size={18} /> Encerrar sessão</button>
      </div>
    </LayoutAutenticado>
  )
}
function Dado({ icone: Icone, rotulo, valor }) {
  return (
    <div>
      <p className="mb-2 flex items-center gap-2 text-sm font-semibold"><Icone size={16} /> {rotulo}</p>
      <p className="min-h-12 break-words rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-800">{valor || 'Não informado'}</p>
    </div>
  )
}