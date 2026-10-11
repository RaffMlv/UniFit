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
    setErroGeral('')
    const novos = {}
    if (!dados.login.trim()) novos.login = 'Resposta inválida'
    if (!dados.senha) novos.senha = 'Resposta inválida'
    setErros(novos)
    if (Object.keys(novos).length) return

    try {
      setEnviando(true)
      await login(dados.login.trim(), dados.senha)
      navigate('/inicio')
    } catch (err) {
      setErroGeral(err.message)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 text-2xl font-bold">UniFit</div>
          <CardTitle>Acesse sua conta</CardTitle>
          <CardDescription>Use suas credenciais institucionais.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={enviar} className="space-y-4" noValidate>
            <div className="space-y-1.5">
              <Label htmlFor="login">E-mail ou CPF</Label>
              <Input id="login" placeholder="seuemail@unifor.br ou 000.000.000-00"
                value={dados.login} onChange={alterar('login')} aria-invalid={!!erros.login} />
              {erros.login && <p className="text-sm text-red-600">{erros.login}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="senha">Senha</Label>
              <div className="relative">
                <Input id="senha" type={mostrarSenha ? 'text' : 'password'} placeholder="Digite sua senha"
                  value={dados.senha} onChange={alterar('senha')} aria-invalid={!!erros.senha} className="pr-10" />
                <button type="button" onClick={() => setMostrarSenha(!mostrarSenha)}
                  aria-label={mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground">
                  {mostrarSenha ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {erros.senha && <p className="text-sm text-red-600">{erros.senha}</p>}
            </div>

            {erroGeral && <p role="alert" className="text-sm text-red-600">{erroGeral}</p>}

            <Button type="submit" className="w-full" disabled={enviando}>
              {enviando ? 'Entrando...' : 'Entrar'}
            </Button>

            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Esqueci minha senha</span>
              <Link to="/cadastro" className="underline">Criar nova conta</Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}