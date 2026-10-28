import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Eye, MoreVertical, Search, UserCheck, UserX } from 'lucide-react'
import LayoutAutenticado from '@/components/ui/LayoutAutenticado'
import { api } from '@/services/api'

const LIMITE = 10
const campo = 'w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-[#004AF7] focus:ring-2 focus:ring-[#87B7FF] disabled:bg-slate-50 disabled:text-slate-400'
const botaoPagina = 'inline-flex items-center gap-1 rounded-lg border border-[#87B7FF] bg-white px-3 py-2 text-sm font-semibold text-[#142191] hover:bg-[#E4F2FD] disabled:cursor-not-allowed disabled:opacity-50'

export default function AdminAlunos() {
  const [busca, setBusca] = useState('')
  const [buscaAplicada, setBuscaAplicada] = useState('')
  const [situacao, setSituacao] = useState('todos')
  const [triagem, setTriagem] = useState('todas')
  const [pagina, setPagina] = useState(1)
  const [dados, setDados] = useState({ itens: [], total: 0 })
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')
  const [aviso, setAviso] = useState(null)
  const [menu, setMenu] = useState(null) // { aluno, top, right }
  const menuRef = useRef(null)

  // Espera o usuário parar de digitar antes de consultar o servidor.
  useEffect(() => {
    const t = setTimeout(() => { setBuscaAplicada(busca.trim()); setPagina(1) }, 350)
    return () => clearTimeout(t)
  }, [busca])

  useEffect(() => {
    let cancelado = false
    setCarregando(true)
    setErro('')
    const params = new URLSearchParams({ situacao, triagem, pagina, limite: LIMITE })
    if (buscaAplicada) params.set('busca', buscaAplicada)
    api(`/admin/alunos?${params}`)
      .then((d) => { if (!cancelado) setDados(d) })
      .catch((err) => { if (!cancelado) setErro(err.message) })
      .finally(() => { if (!cancelado) setCarregando(false) })
    return () => { cancelado = true }
  }, [buscaAplicada, situacao, triagem, pagina])

  // Fecha o menu de ações ao clicar fora, apertar Esc, rolar ou redimensionar.
  useEffect(() => {
    if (!menu) return
    const fechar = () => setMenu(null)
    const aoClicar = (e) => {
      if (menuRef.current?.contains(e.target) || e.target.closest('[data-menu-trigger]')) return
      fechar()
    }
    const aoTeclar = (e) => { if (e.key === 'Escape') fechar() }
    document.addEventListener('mousedown', aoClicar)
    document.addEventListener('keydown', aoTeclar)
    window.addEventListener('scroll', fechar, true)
    window.addEventListener('resize', fechar)
    return () => {
      document.removeEventListener('mousedown', aoClicar)
      document.removeEventListener('keydown', aoTeclar)
      window.removeEventListener('scroll', fechar, true)
      window.removeEventListener('resize', fechar)
    }
  }, [menu])

  const mudarFiltro = (setter) => (e) => { setter(e.target.value); setPagina(1) }
  const totalPaginas = Math.max(1, Math.ceil(dados.total / LIMITE))
  const inicio = dados.total ? (pagina - 1) * LIMITE + 1 : 0
  const fim = Math.min(pagina * LIMITE, dados.total)

  function abrirMenu(e, aluno) {
    if (menu?.aluno.id === aluno.id) { setMenu(null); return }
    const r = e.currentTarget.getBoundingClientRect()
    setMenu({ aluno, top: r.bottom + 4, right: window.innerWidth - r.right })
  }

  async function alterarSituacao(aluno) {
    setMenu(null)
    const acao = aluno.ativo ? 'desativar' : 'ativar'
    const alerta = aluno.ativo ? ' O aluno perde o acesso ao sistema.' : ''
    if (!window.confirm(`Deseja ${acao} o acesso de "${aluno.nome}"?${alerta}`)) return
    try {
      await api(`/admin/alunos/${aluno.id}/situacao`, { method: 'PATCH', body: { ativo: !aluno.ativo } })
      setDados((prev) => ({
        ...prev,
        itens: prev.itens.map((a) => (a.id === aluno.id ? { ...a, ativo: !a.ativo } : a)),
      }))
      setAviso({ tipo: 'ok', texto: aluno.ativo ? 'Acesso do aluno desativado.' : 'Acesso do aluno ativado.' })
    } catch (err) {
      setAviso({ tipo: 'erro', texto: err.message })
    }
  }

  return (
    <LayoutAutenticado titulo="Gerenciamento de alunos">
      <div className="space-y-5">
        <p className="text-sm text-slate-600">Consulte os alunos cadastrados e gerencie o acesso deles ao sistema.</p>

        {aviso && (
          <div role={aviso.tipo === 'erro' ? 'alert' : 'status'}
            className={`rounded-lg border p-3 text-sm ${aviso.tipo === 'erro' ? 'border-red-200 bg-red-50 text-red-700' : 'border-[#87B7FF] bg-[#E4F2FD] text-[#142191]'}`}>
            {aviso.texto}
          </div>
        )}

        <div className="grid gap-3 rounded-xl bg-white p-4 shadow-sm md:grid-cols-[1fr_150px_170px_200px]">
          <label className="relative">
            <span className="sr-only">Pesquisar alunos</span>
            <Search size={18} className="absolute left-3 top-3 text-slate-400" aria-hidden="true" />
            <input value={busca} onChange={(e) => setBusca(e.target.value)} type="search"
              placeholder="Pesquisar nome, e-mail ou CPF" className={`${campo} pl-10`} />
          </label>
          <label>
            <span className="sr-only">Filtrar por situação</span>
            <select value={situacao} onChange={mudarFiltro(setSituacao)} className={campo}>
              <option value="todos">Situação: todas</option>
              <option value="ativos">Ativos</option>
              <option value="inativos">Inativos</option>
            </select>
          </label>
          <label>
            <span className="sr-only">Filtrar por triagem</span>
            <select value={triagem} onChange={mudarFiltro(setTriagem)} className={campo}>
              <option value="todas">Triagem: todas</option>
              <option value="concluida">Concluída</option>
              <option value="pendente">Pendente</option>
            </select>
          </label>
          <label>
            <span className="sr-only">Filtrar por acompanhamento</span>
            <select disabled title="Disponível quando houver vínculo entre alunos e monitores" className={campo}>
              <option>Acompanhamento: em breve</option>
            </select>
          </label>
        </div>

        {carregando && <p className="rounded-xl bg-white p-6 text-sm text-[#142191]">Carregando alunos...</p>}
        {erro && <p role="alert" className="rounded-xl bg-red-50 p-6 text-sm text-red-700">{erro}</p>}

        {!carregando && !erro && (
          <div className="overflow-x-auto rounded-xl bg-white shadow-sm">
            <table className="w-full min-w-[860px] text-left text-sm">
              <thead className="bg-[#E4F2FD] text-[#142191]">
                <tr>
                  {['Nome', 'CPF', 'Situação', 'Triagem', 'Frequência', 'Acompanhamento', 'Ações'].map((c) => (
                    <th key={c} scope="col" className="px-4 py-3 font-semibold">{c}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {dados.itens.map((a) => (
                  <tr key={a.id} className="border-t border-slate-100 text-slate-700">
                    <td className="px-4 py-3">
                      <Link to={`/admin/alunos/${a.id}`} className="font-semibold text-[#004AF7] hover:underline">{a.nome}</Link>
                      <p className="text-xs text-slate-500">{a.email}</p>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">{a.cpf}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${a.ativo ? 'bg-[#E4F2FD] text-[#142191]' : 'bg-slate-100 text-slate-600'}`}>
                        {a.ativo ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="px-4 py-3">{a.triagemConcluida ? 'Concluída' : 'Pendente'}</td>
                    <td className="px-4 py-3 text-slate-400" title="Disponível quando houver treinos registrados">—</td>
                    <td className="px-4 py-3 text-slate-400" title="Disponível quando houver monitor vinculado">—</td>
                    <td className="px-4 py-3">
                      <button type="button" data-menu-trigger aria-haspopup="menu"
                        aria-expanded={menu?.aluno.id === a.id}
                        aria-label={`Ações para ${a.nome}`}
                        onClick={(e) => abrirMenu(e, a)}
                        className="rounded p-2 text-[#142191] hover:bg-[#E4F2FD]">
                        <MoreVertical size={18} aria-hidden="true" />
                      </button>
                    </td>
                  </tr>
                ))}
                {dados.itens.length === 0 && (
                  <tr><td colSpan={7} className="p-8 text-center text-slate-500">Nenhum aluno encontrado com esses filtros.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {!carregando && !erro && (
          <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-slate-600">
            <span>Mostrando {inicio}–{fim} de {dados.total} {dados.total === 1 ? 'aluno' : 'alunos'}</span>
            <div className="flex items-center gap-2">
              <button type="button" className={botaoPagina} disabled={pagina <= 1} onClick={() => setPagina((p) => p - 1)}>
                <ChevronLeft size={16} aria-hidden="true" /> Anterior
              </button>
              <span>Página {pagina} de {totalPaginas}</span>
              <button type="button" className={botaoPagina} disabled={pagina >= totalPaginas} onClick={() => setPagina((p) => p + 1)}>
                Próxima <ChevronRight size={16} aria-hidden="true" />
              </button>
            </div>
          </div>
        )}

        <p className="text-xs text-slate-500">
          Frequência e acompanhamento aparecem quando houver treinos registrados e monitores vinculados aos alunos.
        </p>
      </div>

      {menu && (
        <div ref={menuRef} role="menu" style={{ top: menu.top, right: menu.right }}
          className="fixed z-[70] w-52 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-lg">
          <Link role="menuitem" to={`/admin/alunos/${menu.aluno.id}`}
            className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#142191] hover:bg-[#E4F2FD]">
            <Eye size={16} aria-hidden="true" /> Ver aluno
          </Link>
          <button type="button" role="menuitem" onClick={() => alterarSituacao(menu.aluno)}
            className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-[#142191] hover:bg-[#E4F2FD]">
            {menu.aluno.ativo
              ? <><UserX size={16} aria-hidden="true" /> Desativar acesso</>
              : <><UserCheck size={16} aria-hidden="true" /> Ativar acesso</>}
          </button>
        </div>
      )}
    </LayoutAutenticado>
  )
}