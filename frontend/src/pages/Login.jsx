import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { useAuth } from '@/contexts/AuthContext'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [dados, setDados] = useState({ login: '', senha: '' })
  const [erros, setErros] = useState({})
  const [erroGeral, setErroGeral] = useState('')
  const [mostrarSenha, setMostrarSenha] = useState(false)
  const [enviando, setEnviando] = useState(false)

  const alterar = (campo) => (e) => setDados({ ...dados, [campo]: e.target.value })

async function enviar(e) {
  e.preventDefault()
  if (enviando) return

  setErroGeral('')

  const novos = {}
  const identificador = dados.login.trim()

  const formatoEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  const formatoCPF = /^(\d{11}|\d{3}\.\d{3}\.\d{3}-\d{2})$/

  if (!identificador) {
    novos.login = 'Informe seu e-mail ou CPF.'
  } else if (
    !formatoEmail.test(identificador) &&
    !formatoCPF.test(identificador)
  ) {
    novos.login =
      'Informe um e-mail válido ou um CPF com 11 números, com ou sem pontuação.'
  }

  if (!dados.senha) {
    novos.senha = 'Informe sua senha.'
  }

  setErros(novos)

  if (Object.keys(novos).length > 0) return

  try {
    setEnviando(true)
    await login(identificador, dados.senha)
    navigate('/inicio')
  } catch (err) {
    setErroGeral(err.message)
  } finally {
    setEnviando(false)
  }
}

  return (<div className="flex min-h-screen bg-[#E4F2FD]">
  <main className="flex w-full items-center justify-center px-5 py-10 md:w-1/2 md:px-10">
    <Card className="w-full max-w-md border-0 bg-white shadow-lg">
      <CardHeader className="px-6 pt-8 text-center sm:px-8">
        <div className="mb-6 font-heading text-4xl font-bold text-[#142191]">
          UNI<span className="text-[#004AF7]">FIT</span>
        </div>
        <CardTitle className="font-heading text-3xl font-bold text-[#142191]">
          Acesse sua conta
        </CardTitle>

        <CardDescription className="mt-2 text-slate-600">
          Use suas credenciais institucionais.
        </CardDescription>
      </CardHeader>
      <CardContent className="px-6 pb-8 sm:px-8">
        <form onSubmit={enviar} className="space-y-5" noValidate>
          <div className="space-y-2">
            <Label htmlFor="login" className="text-[#142191]">
              E-mail ou CPF
            </Label>
            <Input
              id="login"
              name="login"
              autoComplete="username"
              placeholder="Seu e-mail ou CPF"
              value={dados.login}
              onChange={alterar('login')}
              aria-invalid={!!erros.login}
              aria-describedby={erros.login ? 'erro-login' : undefined}
              className="h-12 rounded-lg border-slate-300 bg-white text-slate-900 placeholder:text-slate-500 focus-visible:border-[#004AF7] focus-visible:ring-[#004AF7]/25"
            />
            {erros.login && (
              <p id="erro-login" className="text-sm text-red-600">
                {erros.login}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="senha" className="text-[#142191]">
              Senha
            </Label>
            <div className="relative">
              <Input
                id="senha"
                name="senha"
                type={mostrarSenha ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="Digite sua senha"
                value={dados.senha}
                onChange={alterar('senha')}
                aria-invalid={!!erros.senha}
                aria-describedby={erros.senha ? 'erro-senha' : undefined}
                className="h-12 rounded-lg border-slate-300 bg-white pr-12 text-slate-900 placeholder:text-slate-500 focus-visible:border-[#004AF7] focus-visible:ring-[#004AF7]/25"
              />

              <button
                type="button"
                onClick={() => setMostrarSenha(!mostrarSenha)}
                aria-label={mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'}
                aria-controls="senha"
                className="absolute right-1 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-md text-[#142191] hover:bg-[#E4F2FD] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#004AF7]"
              >
                {mostrarSenha ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {erros.senha && (
              <p id="erro-senha" className="text-sm text-red-600">
                {erros.senha}
              </p>
            )}
          </div>
          <div className="text-right">
            <Link
              to="/esqueci-senha"
              className="text-sm font-medium text-[#004AF7] hover:underline"
            >
              Esqueci minha senha
            </Link>
          </div>
          {erroGeral && (
            <p
              role="alert"
              className="rounded-lg bg-red-50 p-3 text-sm text-red-600"
            >
              {erroGeral}
            </p>
          )}
          <Button
            type="submit"
            disabled={enviando}
            className="h-12 w-full rounded-lg bg-[#004AF7] text-base font-semibold text-white hover:bg-[#142191] disabled:opacity-60"
          >
            {enviando ? 'Entrando...' : 'Entrar'}
          </Button>
          <p className="text-center text-sm text-slate-600">
            Ainda não possui conta?{' '}
            <Link
              to="/cadastro"
              className="font-semibold text-[#004AF7] hover:underline"
            >
              Cadastre-se
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  </main>
  <aside className="hidden w-1/2 flex-col justify-center bg-[#142191] px-10 py-16 text-white md:flex lg:px-16">
    <div className="max-w-lg">
      <p className="mb-5 text-sm font-semibold uppercase tracking-widest text-[#87B7FF]">
        Academia da UNIFOR
      </p>
      <h2 className="font-heading text-5xl font-bold leading-tight lg:text-7xl">
        SEU TREINO COMEÇA AQUI.
      </h2>
      <div className="my-8 h-1 w-20 rounded-full bg-[#87B7FF]" />
      <p className="max-w-sm text-lg leading-relaxed text-[#E4F2FD]">
        Um espaço para cuidar da saúde, organizar seus treinos
        e acompanhar sua evolução.
      </p>
    </div>
  </aside>
</div>
  )
}