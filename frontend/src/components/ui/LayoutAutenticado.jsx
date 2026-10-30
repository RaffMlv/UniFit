import { useEffect, useRef, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  Activity, Bell, CalendarCheck, CalendarDays, ChevronDown, CreditCard,
  Dumbbell, HeartPulse, Home, LogOut, Menu, Settings, Stethoscope,
  TrendingUp, User, Users, X, Library, Wrench, UserRound, ClipboardList,
  FileSpreadsheet
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

// rota: null = a página ainda não existe e o item aparece como "Em breve".
const MENU = [
  { nome: 'Página inicial', icone: Home, rota: '/inicio' },
  { nome: 'Meus treinos', icone: Dumbbell, rota: null },
  { nome: 'Exercícios', icone: Activity, rota: '/biblioteca' },
  { nome: 'Progresso', icone: TrendingUp, rota: '/progresso' },
  { nome: 'Aulas', icone: Users, rota: '/aulas' },
  { nome: 'Agendamentos', icone: CalendarCheck, rota: '/agendamentos' },
  { nome: 'Consulta', icone: Stethoscope, rota: null },
  { nome: 'Acompanhamentos', icone: HeartPulse, rota: null },
  { nome: 'Agenda', icone: CalendarDays, rota: '/agenda' },
  { nome: 'Financeiro', icone: CreditCard, rota: '/financeiro' },
]

const MENU_ADMIN = [
  { nome: 'Página inicial', icone: Home, rota: '/inicio-admin' },
  { nome: 'Alunos', icone: Users, rota: '/admin/alunos' },
  { nome: 'Monitores', icone: UserRound, rota: null },
  { nome: 'Gerenciar Treinos', icone: Dumbbell, rota: null },
  { nome: 'Gerenciar Exercícios', icone: Activity, rota: '/admin/exercicios' },
  { nome: 'Gerenciar Equipamentos', icone: Wrench, rota: '/admin/equipamentos' },
  { nome: 'Gerenciar Aulas', icone: Users, rota: null },
  { nome: 'Gerenciar Atendimentos', icone: Stethoscope, rota: null },
  { nome: 'Financeiro', icone: CreditCard, rota: null },
  { nome: 'Relatórios', icone: FileSpreadsheet, rota: null },
  
]

const MENU_USUARIO = [
  { nome: 'Perfil', icone: User, rota: '/perfil' },
  { nome: 'Configurações', icone: Settings, rota: null },
]

const PAPEIS = { aluno: 'Aluno', monitor: 'Monitor', admin: 'Administrador' }
const CHAVE_MENU = 'unifit:menu-oculto'
const MEDIA_DESKTOP = '(min-width: 1024px)'

// "recolhido" = modo automático: o menu fica escondido e aparece ao passar o mouse.
// Sem preferência salva, o padrão é recolhido.
function lerPreferencia() {
  try {
    const salvo = localStorage.getItem(CHAVE_MENU)
    return salvo === null ? true : salvo === '1'
  } catch {
    return true
  }
}

function ItemMenu({ item, recolhido, aoNavegar }) {
  const Icone = item.icone
  const base = `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium ${
    recolhido ? 'lg:justify-center lg:px-0' : ''
  }`
  // Com só os ícones visíveis, o nome vira dica ao passar o mouse.
  const dica = recolhido ? item.nome : undefined
  const rotulo = recolhido ? 'lg:hidden' : ''

  if (!item.rota) {
    return (
      <span
        aria-disabled="true"
        aria-label={`${item.nome} (em breve)`}
        title={dica ? `${item.nome} (em breve)` : undefined}
        className={`${base} cursor-not-allowed text-white/60`}
      >
        <Icone size={20} aria-hidden="true" className="shrink-0" />
        <span className={`flex-1 ${rotulo}`}>{item.nome}</span>
        <span className={`rounded bg-white/10 px-1.5 py-0.5 text-[10px] uppercase tracking-wide ${rotulo}`}>
          Em breve
        </span>
      </span>
    )
  }

  return (
    <NavLink
      to={item.rota}
      onClick={aoNavegar}
      title={dica}
      aria-label={item.nome}
      className={({ isActive }) =>
        `${base} focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#87B7FF] ${
          isActive ? 'bg-[#004AF7] text-white' : 'text-[#E4F2FD] hover:bg-white/10'
        }`
      }
    >
      <Icone size={20} aria-hidden="true" className="shrink-0" />
      <span className={rotulo}>{item.nome}</span>
    </NavLink>
  )
}

export default function LayoutAutenticado({ titulo, children, menu}) {
  const { usuario, logout } = useAuth()
  const menuAtual = menu ?? (usuario?.papel === 'admin' ? MENU_ADMIN : MENU)
  const navigate = useNavigate()
  const [menuAberto, setMenuAberto] = useState(false) // gaveta no celular
  const [recolhido, setRecolhido] = useState(lerPreferencia) // desktop: escondido até o mouse chegar perto
  const [ehDesktop, setEhDesktop] = useState(() => window.matchMedia(MEDIA_DESKTOP).matches)
  const [usuarioAberto, setUsuarioAberto] = useState(false)
  const usuarioRef = useRef(null)

  const nome = usuario?.nome ?? 'Usuário'
  const inicial = nome.charAt(0).toUpperCase()
  const naoLidas = 0 // ligar às notificações quando esse módulo existir

  // Acompanha a largura da tela e fecha a gaveta ao chegar no desktop.
  useEffect(() => {
    const mq = window.matchMedia(MEDIA_DESKTOP)
    const aoMudar = (e) => {
      setEhDesktop(e.matches)
      if (e.matches) setMenuAberto(false)
    }
    mq.addEventListener('change', aoMudar)
    return () => mq.removeEventListener('change', aoMudar)
  }, [])

  // Guarda a preferência do modo do menu.
  useEffect(() => {
    try {
      localStorage.setItem(CHAVE_MENU, recolhido ? '1' : '0')
    } catch {
      // armazenamento indisponível: a preferência só vale nesta sessão
    }
  }, [recolhido])

  useEffect(() => {
    function aoClicarFora(e) {
      if (usuarioRef.current && !usuarioRef.current.contains(e.target)) {
        setUsuarioAberto(false)
      }
    }
    function aoTeclar(e) {
      if (e.key === 'Escape') {
        setUsuarioAberto(false)
        setMenuAberto(false)
      }
    }
    document.addEventListener('mousedown', aoClicarFora)
    document.addEventListener('keydown', aoTeclar)
    return () => {
      document.removeEventListener('mousedown', aoClicarFora)
      document.removeEventListener('keydown', aoTeclar)
    }
  }, [])

  function alternarMenu() {
    if (ehDesktop) setRecolhido((atual) => !atual)
    else setMenuAberto((atual) => !atual)
  }

  async function sair() {
    setUsuarioAberto(false)
    await logout() // a RotaProtegida redireciona para /login
  }

  const rotuloBotaoMenu = ehDesktop
    ? recolhido ? 'Fixar menu aberto' : 'Ocultar menu automaticamente'
    : menuAberto ? 'Fechar menu' : 'Abrir menu'

  return (
    <div className="min-h-screen bg-[#E4F2FD]">
      {menuAberto && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setMenuAberto(false)}
          aria-hidden="true"
        />
      )}

      <aside
        id="menu-lateral"
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-[#142191] text-white transition-[width,transform,visibility,opacity] duration-200 lg:visible lg:translate-x-0 ${
          recolhido
            ? 'lg:w-20 lg:opacity-0 lg:hover:opacity-100 lg:focus-within:opacity-100 [@media(hover:none)]:lg:opacity-100'
            : 'lg:w-64'
        } ${menuAberto ? 'translate-x-0' : 'invisible -translate-x-full'}`}
      >
        <div className={`flex items-center justify-between px-5 py-5 ${recolhido ? 'lg:justify-center lg:px-0' : ''}`}>
          <span className="font-heading text-3xl font-bold">
            <span className={recolhido ? 'lg:hidden' : ''}>
              UNI<span className="text-[#87B7FF]">FIT</span>
            </span>
            <span className={recolhido ? 'hidden lg:inline' : 'hidden'} aria-hidden="true">
              U<span className="text-[#87B7FF]">F</span>
            </span>
          </span>
          <button
            type="button"
            onClick={() => setMenuAberto(false)}
            aria-label="Fechar menu"
            className="rounded-lg p-2 hover:bg-white/10 lg:hidden"
          >
            <X size={22} aria-hidden="true" />
          </button>
        </div>

        <div
          className={`mx-4 mb-4 flex items-center gap-3 rounded-xl bg-white/10 p-3 ${
            recolhido ? 'lg:mx-3 lg:justify-center lg:p-2' : ''
          }`}
          title={recolhido ? nome : undefined}
        >
          <span
            aria-hidden="true"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#87B7FF] font-bold text-[#142191]"
          >
            {inicial}
          </span>
          <div className={`min-w-0 ${recolhido ? 'lg:hidden' : ''}`}>
            <p className="truncate text-sm font-semibold">{nome}</p>
            <p className="text-xs text-[#87B7FF]">{PAPEIS[usuario?.papel] ?? ''}</p>
          </div>
        </div>

        <nav aria-label="Menu principal" className={`flex-1 overflow-y-auto px-3 pb-6 ${recolhido ? 'lg:px-2' : ''}`}>
          <ul className="space-y-1">
            {menuAtual.map((item) => (
              <li key={item.nome}>
                <ItemMenu item={item} recolhido={recolhido} aoNavegar={() => setMenuAberto(false)} />
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* Indicador na borda esquerda: avisa que há um menu escondido. É coberto pelo menu quando ele aparece. */}
      {recolhido && (
        <div
          aria-hidden="true"
          className="pointer-events-none fixed left-0 top-1/2 z-30 hidden h-20 w-1.5 -translate-y-1/2 rounded-r-full bg-[#142191]/60 lg:block"
        />
      )}

      <div className={`transition-[padding] duration-200 ${recolhido ? 'lg:pl-20' : 'lg:pl-64'}`}>
        <header className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={alternarMenu}
              aria-label={rotuloBotaoMenu}
              title={rotuloBotaoMenu}
              aria-expanded={ehDesktop ? !recolhido : menuAberto}
              aria-controls="menu-lateral"
              className="rounded-lg p-2 text-[#142191] hover:bg-[#E4F2FD] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#004AF7]"
            >
              <Menu size={24} aria-hidden="true" />
            </button>
            <h1 className="truncate font-heading text-xl font-bold text-[#142191]">{titulo}</h1>
          </div>

          <div className="flex items-center gap-1 sm:gap-3">
            <button
              type="button"
              aria-label={naoLidas > 0 ? `Notificações, ${naoLidas} não lidas` : 'Notificações'}
              className="relative rounded-lg p-2 text-[#142191] hover:bg-[#E4F2FD] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#004AF7]"
            >
              <Bell size={22} aria-hidden="true" />
              {naoLidas > 0 && (
                <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white">
                  {naoLidas}
                </span>
              )}
            </button>

            <div ref={usuarioRef} className="relative">
              <button
                type="button"
                onClick={() => setUsuarioAberto((aberto) => !aberto)}
                aria-haspopup="menu"
                aria-expanded={usuarioAberto}
                className="flex items-center gap-2 rounded-lg p-1.5 text-[#142191] hover:bg-[#E4F2FD] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#004AF7]"
              >
                <span
                  aria-hidden="true"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-[#004AF7] text-sm font-bold text-white"
                >
                  {inicial}
                </span>
                <span className="hidden max-w-40 truncate text-sm font-semibold sm:inline">{nome}</span>
                <ChevronDown
                  size={16}
                  aria-hidden="true"
                  className={`transition-transform ${usuarioAberto ? 'rotate-180' : ''}`}
                />
              </button>

              {usuarioAberto && (
                <div
                  role="menu"
                  className="absolute right-0 mt-2 w-56 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-lg"
                >
                  {MENU_USUARIO.map(({ nome: rotulo, icone: Icone, rota }) => (
                    <button
                      key={rotulo}
                      type="button"
                      role="menuitem"
                      disabled={!rota}
                      onClick={() => { setUsuarioAberto(false); navigate(rota) }}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-[#142191] hover:bg-[#E4F2FD] disabled:cursor-not-allowed disabled:text-slate-400 disabled:hover:bg-transparent"
                    >
                      <Icone size={18} aria-hidden="true" />
                      <span className="flex-1">{rotulo}</span>
                      {!rota && <span className="text-[10px] uppercase">Em breve</span>}
                    </button>
                  ))}
                  <div className="my-1 border-t border-slate-100" />
                  <button
                    type="button"
                    role="menuitem"
                    onClick={sair}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm font-medium text-red-600 hover:bg-red-50"
                  >
                    <LogOut size={18} aria-hidden="true" />
                    Sair
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">{children}</main>
      </div>
    </div>
  )
}